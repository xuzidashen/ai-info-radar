import type { InfoItem, Keyword, WorkspaceZone, ZoneReport, ZoneTopic } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  featuredArticle,
  followTopics,
  getFollowTopic,
  getInsight,
  getRedesignArticle,
  homeFeed,
  insights as mockInsights,
  rankingItems as mockRankingItems,
  redesignArticles,
  savedArticles,
  type FollowTopic,
  type Insight,
  type RedesignArticle
} from "@/lib/mock/redesignData";

type InfoItemWithKeyword = InfoItem & {
  keyword?: Keyword | null;
};

type TopicWithKeyword = ZoneTopic & {
  zone: WorkspaceZone;
  keyword: (Keyword & { _count: { infoItems: number; summaries: number } }) | null;
};

type ReportWithZone = ZoneReport & {
  zone?: WorkspaceZone;
};

type ReportMetadata = {
  topicId?: string;
  keywordId?: string;
  topTags?: string[];
  highScoreItems?: Array<{
    title?: string;
    source?: string;
    url?: string;
    summary?: string;
    tags?: string[];
  }>;
};

const TOPIC_META_PREFIX = "[radar-meta]";

type TopicLifecycle = "active" | "archived" | "deleted";

type TopicMetadata = {
  lifecycle?: TopicLifecycle;
  keywords?: string[];
  userDescription?: string;
  archivedAt?: string;
  deletedAt?: string;
  updatedVia?: string;
};

function parseMetadata(value: string | null): ReportMetadata {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as ReportMetadata;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function parseTopicDescription(value: string | null): { metadata: TopicMetadata; description: string | null } {
  if (!value?.startsWith(TOPIC_META_PREFIX)) {
    return { metadata: {}, description: value };
  }

  const lineBreak = value.indexOf("\n");
  const rawMeta = lineBreak >= 0 ? value.slice(TOPIC_META_PREFIX.length, lineBreak).trim() : value.slice(TOPIC_META_PREFIX.length).trim();
  const description = lineBreak >= 0 ? value.slice(lineBreak + 1).trim() || null : null;

  try {
    const parsed = JSON.parse(rawMeta) as TopicMetadata;
    return { metadata: parsed && typeof parsed === "object" ? parsed : {}, description };
  } catch {
    return { metadata: {}, description: value };
  }
}

function buildTopicDescription(description: string | null | undefined, metadata: TopicMetadata) {
  const cleanDescription = description?.trim() || null;
  const meaningfulMetadata = Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    })
  );

  if (!Object.keys(meaningfulMetadata).length) {
    return cleanDescription;
  }

  return `${TOPIC_META_PREFIX}${JSON.stringify(meaningfulMetadata)}${cleanDescription ? `\n${cleanDescription}` : ""}`;
}

function activeTopicWhere() {
  return {
    NOT: [
      { description: { startsWith: `${TOPIC_META_PREFIX}{"lifecycle":"archived"` } },
      { description: { startsWith: `${TOPIC_META_PREFIX}{"lifecycle":"deleted"` } }
    ]
  };
}

function topicLifecycle(description: string | null): TopicLifecycle {
  return parseTopicDescription(description).metadata.lifecycle ?? "active";
}

export function canUseDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  return Boolean(databaseUrl?.startsWith("postgresql://") || databaseUrl?.startsWith("postgres://"));
}

async function withFallback<T>(promise: Promise<T>, fallback: T, label: string, timeoutMs = 1800): Promise<T> {
  if (!canUseDatabase()) {
    return fallback;
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timeout = setTimeout(() => resolve(fallback), timeoutMs);
      })
    ]);
  } catch (error) {
    console.warn(`Main flow ${label} fallback`, error);
    return fallback;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function formatRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));

  if (minutes < 60) {
    return `${minutes} 分钟前`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} 小时前`;
  }

  const days = Math.round(hours / 24);
  return `${days} 天前`;
}

function categoryLabel(value?: string | null) {
  if (!value) {
    return "资讯";
  }

  if (value.includes("policy")) return "政策";
  if (value.includes("finance")) return "商业";
  if (value.includes("ai") || value.includes("tech")) return "科技";
  if (value.includes("study")) return "学习";
  return value;
}

function imageForText(text: string) {
  if (/芯片|半导体|AI|Agent|智能/.test(text)) return "/redesign-assets/ai-chip.webp";
  if (/政策|城市|商业|经济|考公/.test(text)) return "/redesign-assets/city-economy.webp";
  if (/卫星|世界|气象|航天/.test(text)) return "/redesign-assets/satellite.webp";
  if (/人才|就业/.test(text)) return "/redesign-assets/talent-city.webp";
  if (/新能源|充电/.test(text)) return "/redesign-assets/new-energy.webp";
  return "/redesign-assets/hero-city.webp";
}

function splitBody(item: InfoItemWithKeyword) {
  const raw = item.rawContent?.trim();
  if (raw) {
    const paragraphs = raw.split(/\n{2,}/).map((text) => text.trim()).filter(Boolean);
    if (paragraphs.length > 0) {
      return paragraphs.slice(0, 5);
    }
  }

  return [
    item.summary || "这条内容来自已保存的信息源，当前摘要较短，建议结合来源继续阅读。",
    "雷达会优先保留与关注主题相关、时间较新、来源较清晰的内容。",
    "后续更新会继续合并重复信息，并把重要变化整理到分析结果中。"
  ];
}

function mapInfoItemToArticle(item: InfoItemWithKeyword): RedesignArticle {
  const category = categoryLabel(item.keyword?.category ?? item.eventType ?? item.importance);
  const tags = [
    category,
    item.credibilityLabel ? `可信度 ${item.credibilityLabel}` : null,
    item.importance === "high" ? "重点" : null
  ].filter((tag): tag is string => Boolean(tag));

  return {
    id: item.id,
    title: item.title,
    excerpt: item.summary || item.rawContent?.slice(0, 120) || "暂无摘要",
    category,
    source: item.source,
    time: formatRelativeTime(item.publishedAt ?? item.createdAt),
    readTime: "3 分钟阅读",
    image: imageForText(`${item.title}${item.summary}${category}`),
    score: typeof item.score === "number" ? Math.round(item.score * 10) / 10 : item.importance === "high" ? 8.6 : 7.6,
    body: splitBody(item),
    tags: tags.length ? tags : ["资讯"]
  };
}

function mapTopic(topic: TopicWithKeyword, latestReportId?: string): FollowTopic {
  const { metadata, description } = parseTopicDescription(topic.description);
  const keyword = topic.keyword?.name ?? topic.name;
  const resultCount = (topic.keyword?._count.infoItems ?? 0) + (topic.keyword?._count.summaries ?? 0);
  const keywords = metadata.keywords?.length
    ? metadata.keywords
    : Array.from(new Set([keyword, topic.category, topic.searchMode].filter(Boolean))).slice(0, 4);

  return {
    id: topic.id,
    title: topic.name,
    description: description || `持续整理与“${topic.name}”有关的重要变化。`,
    keywords,
    category: topic.category || categoryLabel(topic.keyword?.category),
    updatedAt: formatRelativeTime(topic.updatedAt),
    resultCount,
    articleIds: [],
    insightId: latestReportId ?? "generated",
    status: resultCount > 0 ? "fresh" : "scheduled",
    lifecycle: metadata.lifecycle ?? "active"
  };
}

function firstSentences(text: string, count = 3) {
  return text
    .replace(/[#>*_\-\[\]()`]/g, "")
    .split(/[。！？.!?\n]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 8)
    .slice(0, count);
}

function mapReportToInsight(report: ReportWithZone, relatedArticleIds: string[] = []): Insight {
  const metadata = parseMetadata(report.metadata);
  const summary = report.summary?.trim() || firstSentences(report.markdown, 1)[0] || "本次分析结果已生成，建议结合来源列表继续阅读。";
  const points = firstSentences(report.markdown, 3);
  const references = metadata.highScoreItems?.length
    ? metadata.highScoreItems.slice(0, 5).map((item, index) => ({
        title: item.title || `参考来源 ${index + 1}`,
        source: item.source || "公开来源",
        url: item.url || "/discover"
      }))
    : [
        {
          title: report.title,
          source: report.zone?.name ?? "雷达分析",
          url: `/insights/${report.id}`
        }
      ];

  return {
    id: report.id,
    title: report.title,
    topicId: metadata.topicId ?? "topics",
    topicTitle: report.zone?.name ?? "关注主题",
    generatedAt: formatRelativeTime(report.createdAt),
    summary,
    points: points.length ? points : ["已整理最新内容。", "已生成分析摘要。", "建议继续关注后续来源更新。"],
    tags: metadata.topTags?.length ? metadata.topTags : [report.type, report.zone?.type ?? "分析"],
    references,
    relatedArticleIds
  };
}

async function recentInfoItems(limit: number, query?: string) {
  return prisma.infoItem.findMany({
    where: query
      ? {
          OR: [
            { title: { contains: query } },
            { summary: { contains: query } },
            { source: { contains: query } },
            { rawContent: { contains: query } }
          ]
        }
      : undefined,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: { keyword: true }
  });
}

async function recentReports(limit: number) {
  return prisma.zoneReport.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { zone: true }
  });
}

async function topicsWithReports(limit = 20) {
  const [topics, reports] = await Promise.all([
    prisma.zoneTopic.findMany({
      where: activeTopicWhere(),
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        zone: true,
        keyword: {
          include: {
            _count: {
              select: { infoItems: true, summaries: true }
            }
          }
        }
      }
    }),
    recentReports(24)
  ]);
  const latestReportByTopic = new Map<string, string>();

  for (const report of reports) {
    const topicId = parseMetadata(report.metadata).topicId;
    if (topicId && !latestReportByTopic.has(topicId)) {
      latestReportByTopic.set(topicId, report.id);
    }
  }

  return topics.map((topic) => mapTopic(topic, latestReportByTopic.get(topic.id)));
}

export async function getMainFlowHomeView() {
  const fallback = {
    featuredArticle,
    homeFeed,
    rankingItems: mockRankingItems,
    stats: { articleCount: 12, hotCount: 8, topicCount: followTopics.length }
  };

  if (!canUseDatabase()) {
    return fallback;
  }

  return withFallback((async () => {
    const [items, reports, topicCount] = await Promise.all([
      recentInfoItems(5),
      recentReports(2),
      prisma.zoneTopic.count({ where: activeTopicWhere() })
    ]);
    const articles = items.map(mapInfoItemToArticle);

    if (!articles.length && !reports.length) {
      return fallback;
    }

    const rankingItems = articles.slice(0, 5).map((article, index) => ({
      rank: index + 1,
      title: article.title,
      heat: `${Math.max(12, Math.round(article.score * 9))}.0 万`,
      articleId: article.id
    }));

    return {
      featuredArticle: articles[0] ?? featuredArticle,
      homeFeed: articles.slice(1, 5).length ? articles.slice(1, 5) : homeFeed,
      rankingItems: rankingItems.length ? rankingItems : mockRankingItems,
      stats: {
        articleCount: articles.length || 12,
        hotCount: rankingItems.length || 8,
        topicCount: topicCount || followTopics.length
      }
    };
  })(), fallback, "home", 1500);
}

export async function getMainFlowDiscoverView(query?: string) {
  const normalized = query?.trim();

  if (!canUseDatabase()) {
    return {
      articles: normalized
        ? redesignArticles.filter((article) => `${article.title}${article.excerpt}${article.source}${article.tags.join("")}`.toLowerCase().includes(normalized.toLowerCase()))
        : redesignArticles.slice(0, 4),
      topics: followTopics,
      rankingItems: mockRankingItems
    };
  }

  const fallback = {
    articles: normalized
      ? redesignArticles.filter((article) => `${article.title}${article.excerpt}${article.source}${article.tags.join("")}`.toLowerCase().includes(normalized.toLowerCase()))
      : redesignArticles.slice(0, 4),
    topics: followTopics,
    rankingItems: mockRankingItems
  };

  return withFallback((async () => {
    const [items, topics] = await Promise.all([recentInfoItems(8, normalized), topicsWithReports(3)]);
    const articles = items.map(mapInfoItemToArticle);
    const filteredMocks = normalized
      ? redesignArticles.filter((article) => `${article.title}${article.excerpt}${article.source}${article.tags.join("")}`.toLowerCase().includes(normalized.toLowerCase()))
      : redesignArticles.slice(0, 4);

    return {
      articles: articles.length ? articles : filteredMocks,
      topics: topics.length ? topics : followTopics,
      rankingItems: articles.length
        ? articles.slice(0, 5).map((article, index) => ({ rank: index + 1, title: article.title, heat: `${Math.round(article.score * 8)}.4 万`, articleId: article.id }))
        : mockRankingItems
    };
  })(), fallback, "discover", 1800);
}

export async function getMainFlowTopics() {
  if (!canUseDatabase()) {
    return followTopics;
  }

  return withFallback((async () => {
    const topics = await topicsWithReports(12);
    return topics.length ? topics : followTopics;
  })(), followTopics, "topics", 1800);
}

export async function getMainFlowTopicDetail(id: string) {
  if (!canUseDatabase()) {
    const mockTopic = getFollowTopic(id);
    const articleIds = mockTopic?.articleIds ?? ["ai-plan-2030", "domestic-ai-chip", "gene-editing"];
    return {
      topic: mockTopic,
      articles: redesignArticles.filter((article) => articleIds.includes(article.id))
    };
  }

  try {
    const topic = await prisma.zoneTopic.findUnique({
      where: { id },
      include: {
        zone: true,
        keyword: {
          include: {
            infoItems: {
              orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
              take: 6
            },
            summaries: {
              orderBy: { createdAt: "desc" },
              take: 1
            },
            _count: {
              select: { infoItems: true, summaries: true }
            }
          }
        }
      }
    });

    if (topic) {
      if (topicLifecycle(topic.description) !== "active") {
        return {
          topic: null,
          articles: []
        };
      }

      const report = await prisma.zoneReport.findFirst({
        where: { metadata: { contains: `"topicId":"${topic.id}"` } },
        orderBy: { createdAt: "desc" },
        include: { zone: true }
      });
      const articles = topic.keyword?.infoItems.map((item) => mapInfoItemToArticle({ ...item, keyword: topic.keyword })) ?? [];

      return {
        topic: mapTopic(topic, report?.id),
        articles: articles.length ? articles : homeFeed
      };
    }
  } catch (error) {
    console.warn("Main flow topic detail fallback", error);
  }

  const mockTopic = getFollowTopic(id);
  const articleIds = mockTopic?.articleIds ?? ["ai-plan-2030", "domestic-ai-chip", "gene-editing"];
  return {
    topic: mockTopic,
    articles: redesignArticles.filter((article) => articleIds.includes(article.id))
  };
}

export async function getMainFlowInsights() {
  if (!canUseDatabase()) {
    return mockInsights;
  }

  return withFallback((async () => {
    const reports = await recentReports(8);
    const mapped = reports.map((report) => mapReportToInsight(report));
    return mapped.length ? mapped : mockInsights;
  })(), mockInsights, "insights", 1800);
}

export function buildGeneratedInsight(query: { topic?: string; category?: string; topicId?: string }): Insight {
  const topic = query.topic?.trim() || "新关注主题";
  const category = query.category?.trim() || "综合资讯";

  return {
    id: "generated",
    title: `${topic}：本次更新的重要变化`,
    topicId: query.topicId?.trim() || "custom",
    topicTitle: topic,
    generatedAt: "刚刚",
    summary: `本次更新围绕“${topic}”整理了最新公开信息。当前变化主要集中在产品进展、行业应用和后续验证三个方向，建议继续关注正式发布与真实使用反馈。`,
    points: [`${category}方向出现新的公开进展。`, "后续判断应优先参考正式来源和可验证结果。", "雷达会继续合并重复信息并保留重要变化。"],
    tags: [topic, category, "最新更新"],
    references: [
      { title: "人工智能发展进入系统化落地阶段", source: "智见研究", url: "/articles/ai-plan-2030" },
      { title: "国产 AI 芯片算力效率持续提升", source: "36氪", url: "/articles/domestic-ai-chip" }
    ],
    relatedArticleIds: ["ai-plan-2030", "domestic-ai-chip"]
  };
}

export async function getMainFlowInsightDetail(id: string, query?: { topic?: string; category?: string; topicId?: string }) {
  if (id === "generated") {
    const insight = buildGeneratedInsight(query ?? {});
    return {
      insight,
      related: redesignArticles.filter((article) => insight.relatedArticleIds.includes(article.id))
    };
  }

  if (!canUseDatabase()) {
    const insight = getInsight(id);
    return insight
      ? {
          insight,
          related: redesignArticles.filter((article) => insight.relatedArticleIds.includes(article.id))
        }
      : null;
  }

  try {
    const report = await prisma.zoneReport.findUnique({
      where: { id },
      include: { zone: true }
    });

    if (report) {
      const metadata = parseMetadata(report.metadata);
      const infoItems = metadata.keywordId
        ? await prisma.infoItem.findMany({
            where: { keywordId: metadata.keywordId },
            orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
            take: 6,
            include: { keyword: true }
          })
        : [];
      const related = infoItems.map(mapInfoItemToArticle);

      return {
        insight: mapReportToInsight(report, related.map((article) => article.id)),
        related: related.length ? related : homeFeed
      };
    }
  } catch (error) {
    console.warn("Main flow insight detail fallback", error);
  }

  const insight = getInsight(id);
  return insight
    ? {
        insight,
        related: redesignArticles.filter((article) => insight.relatedArticleIds.includes(article.id))
      }
    : null;
}

export async function getMainFlowArticleDetail(id: string) {
  if (!canUseDatabase()) {
    const article = getRedesignArticle(id);
    return article
      ? {
          article,
          related: redesignArticles.filter((item) => item.id !== article.id).slice(0, 3)
        }
      : null;
  }

  try {
    const item = await prisma.infoItem.findUnique({
      where: { id },
      include: { keyword: true }
    });

    if (item) {
      const article = mapInfoItemToArticle(item);
      const relatedItems = await recentInfoItems(4);
      return {
        article,
        related: relatedItems.filter((related) => related.id !== item.id).map(mapInfoItemToArticle).slice(0, 3)
      };
    }
  } catch (error) {
    console.warn("Main flow article detail fallback", error);
  }

  const article = getRedesignArticle(id);
  return article
    ? {
        article,
        related: redesignArticles.filter((item) => item.id !== article.id).slice(0, 3)
      }
    : null;
}

export async function getMainFlowSavedView() {
  const fallback = {
    articles: savedArticles,
    insights: mockInsights.slice(0, 2)
  };

  if (!canUseDatabase()) {
    return fallback;
  }

  return withFallback((async () => {
    const [items, reports] = await Promise.all([
      prisma.infoItem.findMany({
        orderBy: [{ createdAt: "desc" }],
        take: 3,
        include: { keyword: true }
      }),
      prisma.zoneReport.findMany({
        where: { favorite: { isNot: null } },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { zone: true }
      })
    ]);
    const articles = items.map(mapInfoItemToArticle);
    const mappedInsights = reports.map((report) => mapReportToInsight(report));

    return {
      articles: articles.length ? articles : savedArticles,
      insights: mappedInsights.length ? mappedInsights : mockInsights.slice(0, 2)
    };
  })(), fallback, "saved", 1800);
}

export type TopicEditInput = {
  title: string;
  description?: string;
  category: string;
  keywords: string[];
};

export async function updateMainFlowTopic(id: string, input: TopicEditInput) {
  if (!canUseDatabase()) {
    return null;
  }

  const existing = await prisma.zoneTopic.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  const parsed = parseTopicDescription(existing.description);
  const topic = await prisma.zoneTopic.update({
    where: { id },
    data: {
      name: input.title,
      category: input.category,
      description: buildTopicDescription(input.description || `持续整理与“${input.title}”有关的重要变化。`, {
        ...parsed.metadata,
        lifecycle: parsed.metadata.lifecycle ?? "active",
        keywords: input.keywords,
        updatedVia: "main-flow"
      })
    },
    include: {
      zone: true,
      keyword: {
        include: {
          _count: {
            select: { infoItems: true, summaries: true }
          }
        }
      }
    }
  });

  return mapTopic(topic);
}

export async function markMainFlowTopicLifecycle(id: string, lifecycle: Exclude<TopicLifecycle, "active">) {
  if (!canUseDatabase()) {
    return null;
  }

  const existing = await prisma.zoneTopic.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  const parsed = parseTopicDescription(existing.description);
  const now = new Date().toISOString();
  const topic = await prisma.zoneTopic.update({
    where: { id },
    data: {
      description: buildTopicDescription(parsed.description, {
        ...parsed.metadata,
        lifecycle,
        archivedAt: lifecycle === "archived" ? now : parsed.metadata.archivedAt,
        deletedAt: lifecycle === "deleted" ? now : parsed.metadata.deletedAt,
        updatedVia: "main-flow"
      })
    },
    include: {
      zone: true,
      keyword: {
        include: {
          _count: {
            select: { infoItems: true, summaries: true }
          }
        }
      }
    }
  });

  return mapTopic(topic);
}

export async function bulkMarkMainFlowTopics(ids: string[], lifecycle: Exclude<TopicLifecycle, "active">) {
  if (!canUseDatabase()) {
    return {
      updated: ids.length,
      failed: 0,
      localFallback: true
    };
  }

  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  const results = await Promise.allSettled(uniqueIds.map((id) => markMainFlowTopicLifecycle(id, lifecycle)));
  const updated = results.filter((result) => result.status === "fulfilled" && result.value).length;

  return {
    updated,
    failed: uniqueIds.length - updated,
    localFallback: false
  };
}

export async function getEditableMainFlowTopic(id: string) {
  if (!canUseDatabase()) {
    return getFollowTopic(id);
  }

  const topic = await prisma.zoneTopic.findUnique({
    where: { id },
    include: {
      zone: true,
      keyword: {
        include: {
          _count: {
            select: { infoItems: true, summaries: true }
          }
        }
      }
    }
  });

  if (!topic || topicLifecycle(topic.description) !== "active") {
    return null;
  }

  return mapTopic(topic);
}
