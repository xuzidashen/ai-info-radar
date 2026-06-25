import type { InfoItem } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { runSearchProvider } from "@/lib/providers/search";
import type { NormalizedSearchResult, SearchProviderName, SearchRunResult } from "@/lib/providers/search/types";
import { runSummaryProvider } from "@/lib/providers/summary";
import { runFactorProvider } from "@/lib/providers/factor";
import { serializeDailySignal, serializeInfoItem, serializeSummary } from "@/lib/serializers";
import { recordProviderSnapshot } from "@/lib/services/providerQualityService";
import { runLinkageAnalysis } from "@/lib/services/linkageService";
import { createNotificationFromLinkageWarnings } from "@/lib/services/notificationService";
import {
  createRunLog,
  markRunFailed,
  markRunFallback,
  markRunSuccess,
  type RunLogMetrics
} from "@/lib/services/runLogService";
import { buildReportMarkdown, createZoneReport } from "@/lib/services/zoneReportService";
import { getDefaultTemplate, getTemplateById } from "@/lib/templates/summaryTemplates";
import type { Importance, KeywordCategory, SearchMode, Sentiment, TopicRunTriggerType, TopicRunType } from "@/lib/types";
import { dedupeResults } from "@/lib/utils/dedupeResults";
import { filterResults } from "@/lib/utils/filterResults";
import { evaluateSearchResultQuality } from "@/lib/utils/infoQuality";
import { buildScoreReason, deriveItemTags, toDisplayScore } from "@/lib/utils/itemScoring";
import { getSourceCredibility } from "@/lib/utils/sourceCredibility";
import { parseStructuredSummary, structuredSummaryToMarkdown, type StructuredSummary } from "@/lib/utils/summaryParser";
import { buildTopicSearchContext } from "@/lib/utils/topicPresetContext";

type EnrichedSearchResult = NormalizedSearchResult & {
  credibility: {
    score: number;
    label: "high" | "medium" | "low" | "unknown";
    reason: string;
  };
  qualityLabels?: string[];
  qualityStatuses?: string[];
  sourceType?: string;
};

type SearchWithQuality = SearchRunResult & {
  processedResults: EnrichedSearchResult[];
  rawResultCount: number;
  filteredCount: number;
  dedupedCount: number;
  latencyMs: number;
};

type RunOptions = {
  triggerType?: TopicRunTriggerType;
  scheduleId?: string;
  retryOfRunLogId?: string;
  retryCount?: number;
};

const importancePool: Importance[] = ["high", "medium", "low"];
const sentimentPool: Sentiment[] = ["positive", "neutral", "negative"];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function mapSearchModeToCategory(searchMode: SearchMode, category: string): KeywordCategory {
  if (searchMode === "finance" || category.includes("财经") || category.includes("股票")) {
    return "finance";
  }

  if (searchMode === "policy" || searchMode === "exam" || category.includes("政策") || category.includes("考公")) {
    return "policy";
  }

  if (searchMode === "tech" || category.includes("科技") || category.includes("AI")) {
    return "ai-tech";
  }

  if (category.includes("比赛") || category.includes("学习")) {
    return "study";
  }

  return "custom";
}

function normalizePublishedAt(value?: string | null) {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function inferImportance(index: number, score?: number | null): Importance {
  if (index === 0) {
    return "high";
  }

  if (typeof score === "number") {
    if (score >= 0.75) {
      return "high";
    }

    if (score >= 0.45) {
      return "medium";
    }

    return "low";
  }

  return pick(importancePool);
}

function shouldGenerateReport(topic: {
  summaryTemplate: string | null;
  description?: string | null;
}) {
  return !topic.description?.includes("报告生成 关闭");
}

function getItemDisplayScore(item: InfoItem) {
  return toDisplayScore(item.score, item.importance as Importance | string | null);
}

function averageScore(items: InfoItem[]) {
  if (items.length === 0) {
    return null;
  }

  const total = items.reduce((sum, item) => sum + getItemDisplayScore(item), 0);
  return Math.round((total / items.length) * 10) / 10;
}

function collectTopTags(items: InfoItem[], category: string, searchProvider: string) {
  const tags = new Set<string>();

  if (category.trim()) {
    tags.add(category.trim());
  }

  for (const item of items) {
    for (const tag of deriveItemTags({
      importance: item.importance,
      eventType: item.eventType,
      eventSubtype: item.eventSubtype,
      relatedIndustries: item.relatedIndustries,
      provider: item.provider
    })) {
      tags.add(tag);
      if (tags.size >= 8) {
        return Array.from(tags);
      }
    }
  }

  if (searchProvider) {
    tags.add(searchProvider);
  }

  return Array.from(tags).slice(0, 8);
}

function buildReportSources(items: InfoItem[], category: string) {
  return [...items]
    .sort((a, b) => getItemDisplayScore(b) - getItemDisplayScore(a))
    .map((item) => ({
      title: item.title,
      source: item.source,
      url: item.url,
      score: getItemDisplayScore(item),
      scoreReason: buildScoreReason({
        score: item.score,
        importance: item.importance,
        factorReason: item.factorReason,
        credibilityReason: item.credibilityReason,
        summary: item.summary
      }),
      tags: deriveItemTags(
        {
          importance: item.importance,
          eventType: item.eventType,
          eventSubtype: item.eventSubtype,
          relatedIndustries: item.relatedIndustries,
          provider: item.provider
        },
        category
      ),
      summary: item.summary
    }));
}

function buildReportMetadata(input: {
  topicId: string;
  topicName: string;
  keywordId: string;
  searchProvider: string;
  summaryProvider: string;
  factorProvider?: string | null;
  fallbackUsed: boolean | undefined;
  runLogId: string;
  items: InfoItem[];
  category: string;
  queryText?: string;
  queryTexts?: string[];
  keywords?: string[];
  presetNames?: string[];
  structuredSummary: StructuredSummary;
}) {
  const sources = buildReportSources(input.items, input.category);

  return {
    topicId: input.topicId,
    topicName: input.topicName,
    keywordId: input.keywordId,
    structuredSummary: input.structuredSummary,
    searchProvider: input.searchProvider,
    summaryProvider: input.summaryProvider,
    factorProvider: input.factorProvider ?? undefined,
    fallbackUsed: Boolean(input.fallbackUsed),
    runLogId: input.runLogId,
    itemCount: input.items.length,
    averageScore: averageScore(input.items),
    topTags: collectTopTags(input.items, input.category, input.searchProvider),
    queryText: input.queryText,
    queryTexts: input.queryTexts ?? [],
    keywords: input.keywords ?? [],
    presetNames: input.presetNames ?? [],
    highScoreItems: sources.slice(0, 5).map((source) => ({
      title: source.title,
      source: source.source,
      url: source.url,
      score: source.score,
      scoreReason: source.scoreReason,
      tags: source.tags
    }))
  };
}

function buildPipelineStages(input: {
  rawResultCount: number;
  filteredCount: number;
  dedupedCount: number;
  savedItemCount: number;
  summaryLength?: number;
  reportCount: number;
  factorCount?: number;
}) {
  return [
    {
      stage: "search",
      status: "success",
      inputCount: 1,
      outputCount: input.rawResultCount,
      detail: "SearchProvider 返回原始搜索结果。"
    },
    {
      stage: "dedupe",
      status: "success",
      inputCount: input.filteredCount,
      outputCount: input.dedupedCount,
      detail: "质量过滤和去重后保留高质量来源。"
    },
    {
      stage: "score",
      status: "success",
      inputCount: input.dedupedCount,
      outputCount: input.savedItemCount,
      detail: input.factorCount ? `完成 ${input.factorCount} 条因子评分。` : "完成来源可信度和 0-10 展示评分。"
    },
    {
      stage: "summarize",
      status: "success",
      inputCount: input.savedItemCount,
      outputCount: input.summaryLength ?? 0,
      detail: "SummaryProvider 生成结构化总结。"
    },
    {
      stage: "report",
      status: input.reportCount > 0 ? "success" : "skipped",
      inputCount: input.savedItemCount,
      outputCount: input.reportCount,
      detail: input.reportCount > 0 ? "ZoneReport 已写入报告中心。" : "本 Topic 关闭了报告生成。"
    }
  ];
}

async function reloadItemsByIds(items: InfoItem[]) {
  if (items.length === 0) {
    return items;
  }

  const ids = items.map((item) => item.id);
  return prisma.infoItem.findMany({
    where: { id: { in: ids } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
  });
}

function processSearchWithCounts(results: NormalizedSearchResult[], keywordName: string) {
  const filtered = filterResults(results, {
    keywordName,
    maxResults: 12
  });
  const deduped = dedupeResults(filtered);
  const processedResults = deduped.slice(0, 8).map((result) => {
    const quality = evaluateSearchResultQuality({
      result,
      keywordName
    });
    return {
      ...result,
      credibility: quality.credibility,
      qualityLabels: quality.labels,
      qualityStatuses: quality.statuses,
      sourceType: quality.sourceType
    };
  });

  return {
    processedResults,
    filteredCount: filtered.length,
    dedupedCount: deduped.length
  };
}

function applyExcludeWords(results: EnrichedSearchResult[], excludeWords: string[]) {
  if (!excludeWords.length) {
    return results;
  }

  return results.filter((result) => {
    const text = `${result.title} ${result.source} ${result.content} ${result.rawContent ?? ""}`.toLocaleLowerCase("zh-CN");
    return !excludeWords.some((word) => text.includes(word.toLocaleLowerCase("zh-CN")));
  });
}

async function runSearchWithQualityFallback(input: {
  keywordName: string;
  category: KeywordCategory;
  description?: string | null;
  queryText?: string | null;
  queryTexts?: string[];
}): Promise<SearchWithQuality> {
  const startedAt = Date.now();
  const queries = Array.from(new Set((input.queryTexts?.length ? input.queryTexts : [input.queryText ?? input.keywordName]).map((item) => item.trim()).filter(Boolean))).slice(0, 2);
  const searchRuns = await Promise.all(
    queries.map((queryText) =>
      runSearchProvider({
        ...input,
        queryText,
        maxResults: 5
      }, { allowFallback: true })
    )
  );
  const combinedProvider: SearchProviderName = searchRuns.some((run) => run.provider === "tavily") ? "tavily" : "mock";
  const searchRun = {
    ...searchRuns[0],
    results: searchRuns.flatMap((run) => run.results),
    provider: combinedProvider,
    requestedProvider: searchRuns[0].requestedProvider,
    fallbackUsed: searchRuns.some((run) => run.fallbackUsed),
    error: searchRuns.map((run) => run.error).filter(Boolean).join("；") || undefined
  };
  const processed = processSearchWithCounts(searchRun.results, input.keywordName);

  if (processed.processedResults.length > 0) {
    const latencyMs = Date.now() - startedAt;
    await recordProviderSnapshot({
      providerType: "search",
      providerName: searchRun.provider,
      success: true,
      fallbackUsed: searchRun.fallbackUsed,
      latencyMs,
      resultCount: processed.processedResults.length,
      errorMessage: searchRun.error ?? null
    });

    return {
      ...searchRun,
      processedResults: processed.processedResults,
      rawResultCount: searchRun.results.length,
      filteredCount: processed.filteredCount,
      dedupedCount: processed.dedupedCount,
      latencyMs
    };
  }

  const latencyMs = Date.now() - startedAt;
  const errorMessage =
    searchRun.requestedProvider === "tavily"
      ? "搜索失败：Tavily 返回的结果在筛选后没有可用内容，请调整主题标题、关键词或稍后重试。"
      : "搜索失败：mock 搜索结果在筛选后没有可用内容。";

  await recordProviderSnapshot({
    providerType: "search",
    providerName: searchRun.provider,
    success: false,
    fallbackUsed: searchRun.fallbackUsed,
    latencyMs,
    resultCount: 0,
    errorMessage: searchRun.error ?? errorMessage
  });

  throw new Error(searchRun.error ?? errorMessage);
}

async function ensureTopicKeyword(topic: {
  id: string;
  keywordId: string | null;
  name: string;
  category: string;
  searchMode: string;
  description: string | null;
}) {
  if (topic.keywordId) {
    const existing = await prisma.keyword.findUnique({
      where: { id: topic.keywordId }
    });

    if (existing) {
      return existing;
    }
  }

  const category = mapSearchModeToCategory(topic.searchMode as SearchMode, topic.category);
  const keyword =
    (await prisma.keyword.findUnique({
      where: { name: topic.name }
    })) ??
    (await prisma.keyword.create({
      data: {
        name: topic.name,
        category,
        description: topic.description
      }
    }));

  await prisma.zoneTopic.update({
    where: { id: topic.id },
    data: {
      keywordId: keyword.id
    }
  });

  return keyword;
}

async function saveSearchAndSummary(input: {
  topic: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    searchMode: string;
    summaryTemplate: string | null;
  };
  keywordId: string;
}) {
  const keywordCategory = mapSearchModeToCategory(input.topic.searchMode as SearchMode, input.topic.category);
  const searchContext = buildTopicSearchContext(input.topic);
  const searchRun = await runSearchWithQualityFallback({
    keywordName: searchContext.primaryKeyword,
    category: keywordCategory,
    description: searchContext.description,
    queryText: searchContext.queryText,
    queryTexts: searchContext.queryTexts
  });
  searchRun.processedResults = applyExcludeWords(searchRun.processedResults, searchContext.excludeWords);
  searchRun.dedupedCount = searchRun.processedResults.length;
  if (searchRun.processedResults.length === 0) {
    throw new Error("搜索结果已被排除词过滤为空，请调整主题偏好后重试。");
  }
  const now = new Date();

  const savedItems = await prisma.$transaction(async (tx) => {
    const createdItems = await Promise.all(
      searchRun.processedResults.map((result, index) =>
        tx.infoItem.create({
          data: {
            title: result.title,
            source: result.source,
            url: result.url,
            publishedAt: normalizePublishedAt(result.publishedAt),
            summary: result.content || result.rawContent || "该来源未返回可用摘要。",
            importance: inferImportance(index, result.score),
            sentiment: pick(sentimentPool),
            provider: searchRun.provider,
            score: result.score ?? null,
            rawContent: result.rawContent ?? null,
            fetchedAt: now,
            credibilityScore: result.credibility.score,
            credibilityLabel: result.credibility.label,
            credibilityReason: `${result.qualityLabels?.join("、") || "可参考"}。${result.credibility.reason}`,
            eventType: result.qualityStatuses?.join(",") || "new",
            eventSubtype: result.sourceType || null,
            keywordId: input.keywordId
          }
        })
      )
    );

    await tx.keyword.update({
      where: { id: input.keywordId },
      data: {
        lastSearchedAt: now
      }
    });

    return createdItems;
  });

  const summaryStartedAt = Date.now();
  const summaryRun = await runSummaryProvider(
    {
      keyword: {
        name: input.topic.name,
        category: keywordCategory,
        description: searchContext.description
      },
      infoItems: savedItems.map((item) => ({
        title: item.title,
        source: item.source,
        url: item.url,
        summary: item.summary,
        importance: item.importance as Importance,
        publishedAt: item.publishedAt.toISOString(),
        provider: item.provider,
        score: item.score,
        credibilityLabel: item.credibilityLabel as "high" | "medium" | "low" | "unknown" | null,
        credibilityScore: item.credibilityScore,
        credibilityReason: item.credibilityReason
      }))
    },
    { allowFallback: true }
  );
  await recordProviderSnapshot({
    providerType: "summary",
    providerName: summaryRun.provider,
    success: summaryRun.content.trim().length > 0,
    fallbackUsed: summaryRun.fallbackUsed,
    latencyMs: Date.now() - summaryStartedAt,
    resultCount: summaryRun.content.length,
    errorMessage: summaryRun.error ?? null
  });

  const savedSummary = await prisma.summary.create({
    data: {
      keywordId: input.keywordId,
      content: summaryRun.content,
      provider: summaryRun.provider
    }
  });

  return {
    searchRun,
    summaryRun,
    savedItems,
    savedSummary,
    keywordCategory,
    searchContext
  };
}

async function runFactorAnalysis(input: {
  topic: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    searchMode: string;
  };
  keywordId: string;
  keywordCategory: KeywordCategory;
  savedItems: InfoItem[];
}) {
  const factorStartedAt = Date.now();
  const factorRun = await runFactorProvider(
    {
      keyword: {
        id: input.keywordId,
        name: input.topic.name,
        category: input.keywordCategory,
        description: input.topic.description
      },
      infoItems: input.savedItems.map((item) => ({
        id: item.id,
        title: item.title,
        source: item.source,
        url: item.url,
        publishedAt: item.publishedAt.toISOString(),
        summary: item.summary,
        importance: item.importance as Importance,
        sentiment: item.sentiment as Sentiment,
        provider: item.provider,
        score: item.score,
        credibilityLabel: item.credibilityLabel as "high" | "medium" | "low" | "unknown" | null,
        credibilityScore: item.credibilityScore,
        credibilityReason: item.credibilityReason,
      }))
    },
    { allowFallback: false }
  );
  await recordProviderSnapshot({
    providerType: "factor",
    providerName: factorRun.provider,
    success: factorRun.itemFactors.length > 0 && Boolean(factorRun.dailySignal),
    fallbackUsed: factorRun.fallbackUsed,
    latencyMs: Date.now() - factorStartedAt,
    resultCount: factorRun.itemFactors.length,
    errorMessage: factorRun.error ?? null
  });
  const today = startOfToday();

  const dailySignal = await prisma.$transaction(async (tx) => {
    await Promise.all(
      factorRun.itemFactors.map((factor) =>
        tx.infoItem.update({
          where: { id: factor.infoItemId },
          data: {
            eventType: factor.eventType,
            eventSubtype: factor.eventSubtype,
            sentimentScore: factor.sentimentScore,
            impactScore: factor.impactScore,
            riskScore: factor.riskScore,
            policyScore: factor.policyScore,
            techScore: factor.techScore,
            financialScore: factor.financialScore,
            attentionScore: factor.attentionScore,
            timeHorizon: factor.timeHorizon,
            factorConfidence: factor.factorConfidence,
            factorReason: factor.factorReason,
            relatedCompanies: JSON.stringify(factor.relatedCompanies),
            relatedIndustries: JSON.stringify(factor.relatedIndustries)
          }
        })
      )
    );

    return tx.dailySignal.upsert({
      where: {
        keywordId_date: {
          keywordId: input.keywordId,
          date: today
        }
      },
      update: {
        newsCount: factorRun.dailySignal.newsCount,
        positiveCount: factorRun.dailySignal.positiveCount,
        negativeCount: factorRun.dailySignal.negativeCount,
        neutralCount: factorRun.dailySignal.neutralCount,
        avgSentiment: factorRun.dailySignal.avgSentiment,
        avgImpact: factorRun.dailySignal.avgImpact,
        avgRisk: factorRun.dailySignal.avgRisk,
        avgPolicy: factorRun.dailySignal.avgPolicy,
        avgTech: factorRun.dailySignal.avgTech,
        avgFinancial: factorRun.dailySignal.avgFinancial,
        avgAttention: factorRun.dailySignal.avgAttention,
        avgConfidence: factorRun.dailySignal.avgConfidence,
        signalLevel: factorRun.dailySignal.signalLevel,
        riskLevel: factorRun.dailySignal.riskLevel,
        attentionLevel: factorRun.dailySignal.attentionLevel,
        summary: factorRun.dailySignal.summary,
        factorSnapshot: factorRun.dailySignal.factorSnapshot
      },
      create: {
        keywordId: input.keywordId,
        date: today,
        newsCount: factorRun.dailySignal.newsCount,
        positiveCount: factorRun.dailySignal.positiveCount,
        negativeCount: factorRun.dailySignal.negativeCount,
        neutralCount: factorRun.dailySignal.neutralCount,
        avgSentiment: factorRun.dailySignal.avgSentiment,
        avgImpact: factorRun.dailySignal.avgImpact,
        avgRisk: factorRun.dailySignal.avgRisk,
        avgPolicy: factorRun.dailySignal.avgPolicy,
        avgTech: factorRun.dailySignal.avgTech,
        avgFinancial: factorRun.dailySignal.avgFinancial,
        avgAttention: factorRun.dailySignal.avgAttention,
        avgConfidence: factorRun.dailySignal.avgConfidence,
        signalLevel: factorRun.dailySignal.signalLevel,
        riskLevel: factorRun.dailySignal.riskLevel,
        attentionLevel: factorRun.dailySignal.attentionLevel,
        summary: factorRun.dailySignal.summary,
        factorSnapshot: factorRun.dailySignal.factorSnapshot
      }
    });
  });

  return {
    factorRun,
    dailySignal
  };
}

function topicTypeToRunType(type: string): TopicRunType {
  if (type === "analysis" || type === "linkage") {
    return type;
  }

  return "search";
}

export async function runZoneTopic(topicId: string, options: RunOptions = {}) {
  const topic = await prisma.zoneTopic.findUnique({
    where: { id: topicId },
    include: {
      zone: true,
      moduleLinks: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!topic) {
    throw new Error("Topic 不存在");
  }

  const runLog = await createRunLog({
    topicId: topic.id,
    zoneId: topic.zoneId,
    runType: topicTypeToRunType(topic.zone.type),
    triggerType: options.triggerType ?? "manual",
    parentRunLogId: options.retryOfRunLogId ?? null,
    retryCount: options.retryCount ?? 0,
    metadata: {
      scheduleId: options.scheduleId,
      retryOfRunLogId: options.retryOfRunLogId
    }
  });
  let metrics: RunLogMetrics = {};

  try {
    if (topic.zone.type === "linkage") {
      const moduleSearchResults: Record<
        string,
        Array<{
          title: string;
          source: string;
          url: string;
          summary: string;
          publishedAt?: string | Date | null;
        }>
      > = {};
      const searchRuns = await Promise.all(
        topic.moduleLinks.map(async (module) => {
          const searchRun = await runSearchWithQualityFallback({
            keywordName: module.name,
            category: "custom",
            description: module.description
          });
          moduleSearchResults[module.id] = searchRun.processedResults.map((result) => ({
            title: result.title,
            source: result.source,
            url: result.url,
            summary: result.content || result.rawContent || "该来源未返回可用摘要。",
            publishedAt: result.publishedAt
          }));
          return searchRun;
        })
      );

      const linkageStartedAt = Date.now();
      const linkageResult = await runLinkageAnalysis(topic.id, moduleSearchResults, {
        runLogId: runLog.id
      });
      await recordProviderSnapshot({
        providerType: "linkage",
        providerName: linkageResult.provider,
        success: Boolean(linkageResult.analysis.keyPaths),
        fallbackUsed: linkageResult.fallbackUsed,
        latencyMs: Date.now() - linkageStartedAt,
        resultCount: linkageResult.analysis.keyPaths ? 1 : 0,
        errorMessage: null
      });
      await createNotificationFromLinkageWarnings({
        topicId: topic.id,
        zoneId: topic.zoneId,
        runLogId: runLog.id,
        warnings: linkageResult.analysis.warnings
      });

      metrics = {
        searchProvider: Array.from(new Set(searchRuns.map((run) => run.provider))).join(",") || null,
        linkageProvider: linkageResult.provider,
        fallbackUsed: linkageResult.fallbackUsed || searchRuns.some((run) => run.fallbackUsed),
        rawResultCount: searchRuns.reduce((sum, run) => sum + run.rawResultCount, 0),
        filteredCount: searchRuns.reduce((sum, run) => sum + run.filteredCount, 0),
        dedupedCount: searchRuns.reduce((sum, run) => sum + run.dedupedCount, 0),
        savedItemCount: 0,
        reportCount: 1,
        metadata: {
          moduleCount: topic.moduleLinks.length,
          scheduleId: options.scheduleId,
          retryOfRunLogId: options.retryOfRunLogId
        }
      };
      const savedRunLog = metrics.fallbackUsed ? await markRunFallback(runLog.id, metrics) : await markRunSuccess(runLog.id, metrics);

      return {
        mode: "linkage" as const,
        linkageAnalysis: linkageResult.analysis,
        report: linkageResult.report,
        provider: linkageResult.provider,
        fallbackUsed: linkageResult.fallbackUsed,
        runLog: savedRunLog
      };
    }

    const keyword = await ensureTopicKeyword(topic);
    const commonRun = await saveSearchAndSummary({
      topic,
      keywordId: keyword.id
    });
    const structuredSummary = parseStructuredSummary(commonRun.summaryRun.content);
    const summaryMarkdown = structuredSummaryToMarkdown(structuredSummary);
    const selectedTemplate = getTemplateById(topic.summaryTemplate);
    const template =
      selectedTemplate?.zoneType === topic.zone.type
        ? selectedTemplate
        : getDefaultTemplate(topic.zone.type as "search" | "analysis", topic.searchMode as SearchMode);
    const reportTitle = `${topic.name} ${topic.zone.type === "analysis" ? "AI 分析报告" : "信息检索简报"}`;
    const reportEnabled = shouldGenerateReport(topic);

    metrics = {
      searchProvider: commonRun.searchRun.provider,
      summaryProvider: commonRun.summaryRun.provider,
      fallbackUsed: commonRun.searchRun.fallbackUsed || commonRun.summaryRun.fallbackUsed,
      rawResultCount: commonRun.searchRun.rawResultCount,
      filteredCount: commonRun.searchRun.filteredCount,
      dedupedCount: commonRun.searchRun.dedupedCount,
      savedItemCount: commonRun.savedItems.length,
      reportCount: reportEnabled ? 1 : 0,
      metadata: {
        topicId: topic.id,
        keywordId: keyword.id,
        reportEnabled,
        queryText: commonRun.searchContext.queryText,
        queryTexts: commonRun.searchContext.queryTexts,
        keywords: commonRun.searchContext.keywords,
        presetNames: commonRun.searchContext.presetNames,
        scheduleId: options.scheduleId,
        retryOfRunLogId: options.retryOfRunLogId
      }
    };

    if (topic.zone.type === "analysis") {
      const factor = await runFactorAnalysis({
        topic,
        keywordId: keyword.id,
        keywordCategory: commonRun.keywordCategory,
        savedItems: commonRun.savedItems
      });
      metrics = {
        ...metrics,
        factorProvider: factor.factorRun.provider,
        fallbackUsed: Boolean(metrics.fallbackUsed || factor.factorRun.fallbackUsed)
      };
      const reportItems = await reloadItemsByIds(commonRun.savedItems);
      const reportSources = buildReportSources(reportItems, topic.category);
      const pipelineStages = buildPipelineStages({
        rawResultCount: commonRun.searchRun.rawResultCount,
        filteredCount: commonRun.searchRun.filteredCount,
        dedupedCount: commonRun.searchRun.dedupedCount,
        savedItemCount: reportItems.length,
        summaryLength: commonRun.summaryRun.content.length,
        factorCount: factor.factorRun.itemFactors.length,
        reportCount: reportEnabled ? 1 : 0
      });
      const reportMetadata = buildReportMetadata({
        topicId: topic.id,
        topicName: topic.name,
        keywordId: keyword.id,
        searchProvider: commonRun.searchRun.provider,
        summaryProvider: commonRun.summaryRun.provider,
        factorProvider: factor.factorRun.provider,
        fallbackUsed: metrics.fallbackUsed,
        runLogId: runLog.id,
        items: reportItems,
        category: topic.category,
        queryText: commonRun.searchContext.queryText,
        queryTexts: commonRun.searchContext.queryTexts,
        keywords: commonRun.searchContext.keywords,
        presetNames: commonRun.searchContext.presetNames,
        structuredSummary
      });
      metrics = {
        ...metrics,
        metadata: {
          ...(reportMetadata as Record<string, unknown>),
          reportEnabled,
          pipelineStages,
          scheduleId: options.scheduleId,
          retryOfRunLogId: options.retryOfRunLogId
        }
      };
      const report = reportEnabled
        ? await createZoneReport({
            zoneId: topic.zoneId,
            runLogId: runLog.id,
            title: reportTitle,
            type: "topic",
            markdown: buildReportMarkdown({
              title: reportTitle,
              summary: summaryMarkdown,
              sources: reportSources,
              extraSections: [
                {
                  title: "因子信号",
                  body: factor.dailySignal.summary ?? "现有来源不足以形成因子信号。"
                },
                {
                  title: "模板",
                  body: template.sections.map((section) => `【${section}】`).join("\n")
                }
              ],
              followUp: "继续观察高分信息对应的官方公告、产业链反馈和风险信号；财经主题仅做公开信息整理。",
              disclaimer: commonRun.keywordCategory === "finance"
            }),
            summary: structuredSummary.overview,
            metadata: {
              ...reportMetadata,
              reportEnabled,
              pipelineStages
            }
          })
        : null;

      await prisma.zoneTopic.update({
        where: { id: topic.id },
        data: { updatedAt: new Date() }
      });

      const savedRunLog = metrics.fallbackUsed ? await markRunFallback(runLog.id, metrics) : await markRunSuccess(runLog.id, metrics);

      return {
        mode: "analysis" as const,
        report,
        infoItems: reportItems.map(serializeInfoItem),
        summary: serializeSummary(commonRun.savedSummary),
        dailySignal: serializeDailySignal(factor.dailySignal),
        fallbackUsed: metrics.fallbackUsed,
        runLog: savedRunLog
      };
    }

    const reportItems = await reloadItemsByIds(commonRun.savedItems);
    const reportSources = buildReportSources(reportItems, topic.category);
    const pipelineStages = buildPipelineStages({
      rawResultCount: commonRun.searchRun.rawResultCount,
      filteredCount: commonRun.searchRun.filteredCount,
      dedupedCount: commonRun.searchRun.dedupedCount,
      savedItemCount: reportItems.length,
      summaryLength: commonRun.summaryRun.content.length,
      reportCount: reportEnabled ? 1 : 0
    });
    const reportMetadata = buildReportMetadata({
      topicId: topic.id,
      topicName: topic.name,
      keywordId: keyword.id,
      searchProvider: commonRun.searchRun.provider,
      summaryProvider: commonRun.summaryRun.provider,
      fallbackUsed: metrics.fallbackUsed,
      runLogId: runLog.id,
      items: reportItems,
      category: topic.category,
      queryText: commonRun.searchContext.queryText,
      queryTexts: commonRun.searchContext.queryTexts,
      keywords: commonRun.searchContext.keywords,
      presetNames: commonRun.searchContext.presetNames,
      structuredSummary
    });
    metrics = {
      ...metrics,
      metadata: {
        ...(reportMetadata as Record<string, unknown>),
        reportEnabled,
        pipelineStages,
        scheduleId: options.scheduleId,
        retryOfRunLogId: options.retryOfRunLogId
      }
    };
    const report = reportEnabled
      ? await createZoneReport({
          zoneId: topic.zoneId,
          runLogId: runLog.id,
          title: reportTitle,
          type: "topic",
          markdown: buildReportMarkdown({
            title: reportTitle,
            summary: summaryMarkdown,
            sources: reportSources,
            extraSections: [
              {
                title: "模板",
                body: template.sections.map((section) => `【${section}】`).join("\n")
              }
            ],
            followUp: "继续跟踪高可信来源、发布时间较新的内容和后续官方更新。"
          }),
          summary: structuredSummary.overview,
          metadata: {
            ...reportMetadata,
            reportEnabled,
            pipelineStages
          }
        })
      : null;

    await prisma.zoneTopic.update({
      where: { id: topic.id },
      data: { updatedAt: new Date() }
    });

    const savedRunLog = metrics.fallbackUsed ? await markRunFallback(runLog.id, metrics) : await markRunSuccess(runLog.id, metrics);

    return {
      mode: "search" as const,
      report,
      infoItems: reportItems.map(serializeInfoItem),
      summary: serializeSummary(commonRun.savedSummary),
      fallbackUsed: metrics.fallbackUsed,
      runLog: savedRunLog
    };
  } catch (error) {
    await markRunFailed(runLog.id, {
      ...metrics,
      errorMessage: error instanceof Error ? error.message : "运行 Topic 失败"
    });
    throw error;
  }
}
