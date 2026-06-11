import type { KeywordCategory, Importance, Sentiment } from "@/lib/types";

export type MockInfoItemInput = {
  title: string;
  source: string;
  url: string;
  publishedAt: Date;
  summary: string;
  importance: Importance;
  sentiment: Sentiment;
};

const categorySources: Record<KeywordCategory, string[]> = {
  finance: ["交易所公告", "证券时报", "财新产业观察", "公司公告", "产业链快讯"],
  policy: ["政府门户网站", "人社部门公告", "考试院通知", "政策研究室", "地方日报"],
  "ai-tech": ["OpenAI Blog", "TechCrunch", "机器之心", "GitHub Trending", "开发者社区"],
  study: ["赛事官网", "教务通知", "学习资料站", "社群公告", "竞赛组委会"],
  custom: ["信息源快讯", "公开网页", "行业观察", "社区讨论", "资料索引"]
};

const sentimentPool: Sentiment[] = ["positive", "neutral", "negative"];

const titleTemplates: Record<KeywordCategory, string[]> = {
  finance: [
    "{keyword}相关公告披露阶段性进展",
    "{keyword}产业链消息出现新的供需变化",
    "{keyword}所在板块受到市场关注",
    "{keyword}公开信息显示经营节奏调整",
    "{keyword}监管和披露口径出现更新"
  ],
  policy: [
    "{keyword}相关报名与资格要求更新",
    "{keyword}政策文件释放新的执行信号",
    "{keyword}备考节点进入材料准备阶段",
    "{keyword}地方公告补充说明发布",
    "{keyword}申论素材出现可积累案例"
  ],
  "ai-tech": [
    "{keyword}发布新的能力与接口变化",
    "{keyword}生态工具出现开发者更新",
    "{keyword}用户侧体验迎来细节优化",
    "{keyword}模型与产品路线出现新信号",
    "{keyword}社区讨论聚焦落地场景"
  ],
  study: [
    "{keyword}资料包出现新版本",
    "{keyword}任务节点进入提交窗口",
    "{keyword}参考案例与模板更新",
    "{keyword}学习路线需要重新排期",
    "{keyword}组队与评审信息有新提醒"
  ],
  custom: [
    "{keyword}出现新的公开信息",
    "{keyword}相关讨论热度上升",
    "{keyword}资料索引有新补充",
    "{keyword}后续节点值得继续观察",
    "{keyword}信息源出现交叉验证线索"
  ]
};

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildSummary(keyword: string, category: KeywordCategory, index: number): string {
  const common = `围绕“${keyword}”的公开信息显示，本条消息更偏向${
    index % 2 === 0 ? "趋势跟踪" : "节点提醒"
  }，需要结合后续来源继续验证。`;

  if (category === "finance") {
    return `${common} 当前内容仅做公开信息整理，不构成任何投资建议或具体交易判断。`;
  }

  if (category === "policy") {
    return `${common} 可作为政策理解、申论表达或备考素材的初步线索。`;
  }

  if (category === "ai-tech") {
    return `${common} 对产品体验、开发接口和工具链变化都有一定参考价值。`;
  }

  if (category === "study") {
    return `${common} 更适合转化为资料检查、时间排期和任务拆解动作。`;
  }

  return common;
}

export function generateMockInfoItems(keyword: {
  name: string;
  category: KeywordCategory;
}): MockInfoItemInput[] {
  const sources = shuffle(categorySources[keyword.category]);
  const templates = shuffle(titleTemplates[keyword.category]);
  const importances = shuffle<Importance>(["high", "medium", "medium", "low", "low"]);
  const now = Date.now();

  return Array.from({ length: 5 }, (_, index) => {
    const source = sources[index % sources.length];
    const title = templates[index % templates.length].replace("{keyword}", keyword.name);
    const publishedAt = new Date(now - (index + 1) * 1000 * 60 * 60 * (3 + index));
    const encoded = encodeURIComponent(`${keyword.name}-${index + 1}`);

    return {
      title,
      source,
      url: `https://example.com/mock-radar/${encoded}`,
      publishedAt,
      summary: buildSummary(keyword.name, keyword.category, index),
      importance: index === 0 ? "high" : importances[index],
      sentiment: pick(sentimentPool)
    };
  });
}
