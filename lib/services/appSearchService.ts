import { prisma } from "@/lib/prisma";
import { followTopics, insights as mockInsights, redesignArticles, savedArticles, type FollowTopic, type Insight, type RedesignArticle } from "@/lib/mock/redesignData";
import { canUseDatabase, getMainFlowTopics, mapInfoItemToArticle, mapReportToInsight } from "@/lib/services/mainFlowService";

export type AppSearchResults = {
  query: string;
  topics: FollowTopic[];
  articles: RedesignArticle[];
  insights: Insight[];
  saved: Insight[];
  fallbackUsed: boolean;
};

function includes(value: string, query: string) {
  return value.toLocaleLowerCase("zh-CN").includes(query.toLocaleLowerCase("zh-CN"));
}

function filterMock(query: string): Omit<AppSearchResults, "query" | "fallbackUsed"> {
  const topics = followTopics.filter((topic) => includes(`${topic.title} ${topic.description} ${topic.category} ${topic.keywords.join(" ")}`, query));
  const articles = redesignArticles.filter((article) => includes(`${article.title} ${article.excerpt} ${article.source} ${article.tags.join(" ")}`, query));
  const insights = mockInsights.filter((insight) => includes(`${insight.title} ${insight.summary} ${insight.topicTitle} ${insight.tags.join(" ")}`, query));
  const savedIds = new Set(savedArticles.map((article) => article.id));
  const saved = insights.filter((insight) => insight.relatedArticleIds.some((id) => savedIds.has(id)));
  return { topics, articles, insights, saved };
}

export async function searchAppContent(rawQuery?: string): Promise<AppSearchResults> {
  const query = rawQuery?.trim().slice(0, 80) ?? "";
  if (!query) return { query, topics: [], articles: [], insights: [], saved: [], fallbackUsed: false };

  if (!canUseDatabase()) {
    return { query, ...filterMock(query), fallbackUsed: true };
  }

  try {
    const [allTopics, items, reports, favoriteReports] = await Promise.all([
      getMainFlowTopics(),
      prisma.infoItem.findMany({
        where: { OR: [
          { title: { contains: query, mode: "insensitive" } },
          { summary: { contains: query, mode: "insensitive" } },
          { source: { contains: query, mode: "insensitive" } },
          { rawContent: { contains: query, mode: "insensitive" } }
        ] },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 12,
        include: { keyword: true }
      }),
      prisma.zoneReport.findMany({
        where: { OR: [
          { title: { contains: query, mode: "insensitive" } },
          { summary: { contains: query, mode: "insensitive" } },
          { markdown: { contains: query, mode: "insensitive" } },
          { metadata: { contains: query, mode: "insensitive" } }
        ] },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { zone: true }
      }),
      prisma.zoneReport.findMany({
        where: {
          favorite: { isNot: null },
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
            { markdown: { contains: query, mode: "insensitive" } },
            { metadata: { contains: query, mode: "insensitive" } }
          ]
        },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { zone: true }
      })
    ]);
    const topics = allTopics.filter((topic) => includes(`${topic.title} ${topic.description} ${topic.category} ${topic.keywords.join(" ")}`, query));
    const result = {
      topics,
      articles: items.map(mapInfoItemToArticle),
      insights: reports.map((report) => mapReportToInsight(report)),
      saved: favoriteReports.map((report) => mapReportToInsight(report))
    };
    const hasResults = result.topics.length || result.articles.length || result.insights.length || result.saved.length;
    return hasResults
      ? { query, ...result, fallbackUsed: false }
      : { query, ...filterMock(query), fallbackUsed: true };
  } catch (error) {
    console.warn("App search fallback", error);
    return { query, ...filterMock(query), fallbackUsed: true };
  }
}
