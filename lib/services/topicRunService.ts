import type { InfoItem } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { MockSearchProvider } from "@/lib/providers/search/mockSearchProvider";
import { runSearchProvider } from "@/lib/providers/search";
import type { NormalizedSearchResult, SearchRunResult } from "@/lib/providers/search/types";
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
import { buildReportMarkdown, createZoneReport, withDisclaimer } from "@/lib/services/zoneReportService";
import { getDefaultTemplate } from "@/lib/templates/summaryTemplates";
import type { Importance, KeywordCategory, SearchMode, Sentiment, TopicRunTriggerType, TopicRunType } from "@/lib/types";
import { dedupeResults } from "@/lib/utils/dedupeResults";
import { filterResults } from "@/lib/utils/filterResults";
import { getSourceCredibility } from "@/lib/utils/sourceCredibility";

type EnrichedSearchResult = NormalizedSearchResult & {
  credibility: {
    score: number;
    label: "high" | "medium" | "low" | "unknown";
    reason: string;
  };
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

function processSearchWithCounts(results: NormalizedSearchResult[], keywordName: string) {
  const filtered = filterResults(results, {
    keywordName,
    maxResults: 12
  });
  const deduped = dedupeResults(filtered);
  const processedResults = deduped.slice(0, 8).map((result) => ({
    ...result,
    credibility: getSourceCredibility(result.source, result.url)
  }));

  return {
    processedResults,
    filteredCount: filtered.length,
    dedupedCount: deduped.length
  };
}

async function runSearchWithQualityFallback(input: {
  keywordName: string;
  category: KeywordCategory;
  description?: string | null;
}): Promise<SearchWithQuality> {
  const startedAt = Date.now();
  const searchRun = await runSearchProvider({
    ...input,
    maxResults: 8
  });
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

  const mockResult = await new MockSearchProvider().search({
    ...input,
    maxResults: 8
  });
  const mockProcessed = processSearchWithCounts(mockResult.results, input.keywordName);
  const latencyMs = Date.now() - startedAt;

  await recordProviderSnapshot({
    providerType: "search",
    providerName: mockResult.provider,
    success: mockProcessed.processedResults.length > 0,
    fallbackUsed: true,
    latencyMs,
    resultCount: mockProcessed.processedResults.length,
    errorMessage: searchRun.error ?? "Search results were empty after quality filtering"
  });

  return {
    ...mockResult,
    requestedProvider: searchRun.requestedProvider,
    fallbackUsed: true,
    error: searchRun.error ?? "Search results were empty after quality filtering",
    processedResults: mockProcessed.processedResults,
    rawResultCount: searchRun.results.length,
    filteredCount: mockProcessed.filteredCount,
    dedupedCount: mockProcessed.dedupedCount,
    latencyMs
  };
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
  const searchRun = await runSearchWithQualityFallback({
    keywordName: input.topic.name,
    category: keywordCategory,
    description: input.topic.description
  });
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
            credibilityReason: result.credibility.reason,
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
  const summaryRun = await runSummaryProvider({
    keyword: {
      name: input.topic.name,
      category: keywordCategory,
      description: input.topic.description
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
  });
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
    keywordCategory
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
  const factorRun = await runFactorProvider({
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
      rawContent: item.rawContent
    }))
  });
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
    const template = getDefaultTemplate(topic.zone.type as "search" | "analysis", topic.searchMode as SearchMode);
    const reportTitle = `${topic.name} ${topic.zone.type === "analysis" ? "AI 分析报告" : "信息检索简报"}`;

    metrics = {
      searchProvider: commonRun.searchRun.provider,
      summaryProvider: commonRun.summaryRun.provider,
      fallbackUsed: commonRun.searchRun.fallbackUsed || commonRun.summaryRun.fallbackUsed,
      rawResultCount: commonRun.searchRun.rawResultCount,
      filteredCount: commonRun.searchRun.filteredCount,
      dedupedCount: commonRun.searchRun.dedupedCount,
      savedItemCount: commonRun.savedItems.length,
      reportCount: 1,
      metadata: {
        keywordId: keyword.id,
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
      const markdown = buildReportMarkdown({
        title: reportTitle,
        summary: commonRun.summaryRun.content,
        sources: commonRun.savedItems.map((item) => ({
          title: item.title,
          source: item.source,
          url: item.url
        })),
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
        disclaimer: commonRun.keywordCategory === "finance"
      });
      const report = await createZoneReport({
        zoneId: topic.zoneId,
        runLogId: runLog.id,
        title: reportTitle,
        type: "topic",
        markdown,
        summary: commonRun.summaryRun.content.slice(0, 500),
        metadata: {
          topicId: topic.id,
          keywordId: keyword.id,
          searchProvider: commonRun.searchRun.provider,
          summaryProvider: commonRun.summaryRun.provider,
          factorProvider: factor.factorRun.provider,
          fallbackUsed: metrics.fallbackUsed,
          runLogId: runLog.id
        }
      });

      await prisma.zoneTopic.update({
        where: { id: topic.id },
        data: { updatedAt: new Date() }
      });

      const savedRunLog = metrics.fallbackUsed ? await markRunFallback(runLog.id, metrics) : await markRunSuccess(runLog.id, metrics);

      return {
        mode: "analysis" as const,
        report,
        infoItems: commonRun.savedItems.map(serializeInfoItem),
        summary: serializeSummary(commonRun.savedSummary),
        dailySignal: serializeDailySignal(factor.dailySignal),
        fallbackUsed: metrics.fallbackUsed,
        runLog: savedRunLog
      };
    }

    const markdown = withDisclaimer(
      buildReportMarkdown({
        title: reportTitle,
        summary: commonRun.summaryRun.content,
        sources: commonRun.savedItems.map((item) => ({
          title: item.title,
          source: item.source,
          url: item.url
        })),
        extraSections: [
          {
            title: "模板",
            body: template.sections.map((section) => `【${section}】`).join("\n")
          }
        ]
      }),
      false
    );
    const report = await createZoneReport({
      zoneId: topic.zoneId,
      runLogId: runLog.id,
      title: reportTitle,
      type: "topic",
      markdown,
      summary: commonRun.summaryRun.content.slice(0, 500),
      metadata: {
        topicId: topic.id,
        keywordId: keyword.id,
        searchProvider: commonRun.searchRun.provider,
        summaryProvider: commonRun.summaryRun.provider,
        fallbackUsed: metrics.fallbackUsed,
        runLogId: runLog.id
      }
    });

    await prisma.zoneTopic.update({
      where: { id: topic.id },
      data: { updatedAt: new Date() }
    });

    const savedRunLog = metrics.fallbackUsed ? await markRunFallback(runLog.id, metrics) : await markRunSuccess(runLog.id, metrics);

    return {
      mode: "search" as const,
      report,
      infoItems: commonRun.savedItems.map(serializeInfoItem),
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
