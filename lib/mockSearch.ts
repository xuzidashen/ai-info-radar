import type { KeywordCategory, Importance, Sentiment } from "@/lib/types";
import { parseTopicPresetContext } from "@/lib/utils/topicPresetContext";

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

const thematicTemplates: Array<{
  match: string[];
  sources: string[];
  titles: string[];
  summaries: string[];
}> = [
  {
    match: ["ai agent", "agent", "智能体", "大模型", "openai", "deepseek", "多智能体"],
    sources: ["OpenAI Blog", "GitHub Trending", "开发者社区", "AI 产品观察", "模型文档更新"],
    titles: [
      "{keyword}开源框架发布工作流更新",
      "企业级{keyword}编排能力出现新进展",
      "多智能体协作平台围绕{keyword}增加工具调用能力",
      "{keyword}开发者生态更新了任务规划示例",
      "{keyword}落地场景聚焦知识库、自动化和代码助手"
    ],
    summaries: [
      "本条信息聚焦 Agent 工具调用、任务规划和工作流编排，适合评估近期产品能力变化。",
      "开发者社区对企业级 Agent 的稳定性、权限边界和成本控制讨论升温。",
      "相关来源强调多智能体协作、长期记忆和执行链路可观测性，适合作为后续跟踪方向。"
    ]
  },
  {
    match: ["考公", "公务员", "事业单位", "国考", "省考", "政策公告", "招聘"],
    sources: ["人社部门公告", "考试院通知", "政府门户网站", "地方日报", "招录专题"],
    titles: [
      "{keyword}报名条件和资格审核提醒更新",
      "事业单位招聘公告围绕{keyword}补充岗位信息",
      "国考相关政策对{keyword}备考节奏提出新要求",
      "基层岗位公告汇总：{keyword}材料准备进入关键节点",
      "{keyword}申论素材可积累表达出现新案例"
    ],
    summaries: [
      "本条信息适合用于报名时间、资格条件和材料清单检查。",
      "公告内容更偏节点提醒，建议核对官方原文和当地考试院通知。",
      "政策表达可沉淀为申论素材，但具体报考条件仍以官方公告为准。"
    ]
  },
  {
    match: ["软件杯", "竞赛", "比赛", "开源项目", "学习资料", "赛题"],
    sources: ["赛事官网", "竞赛组委会", "GitHub Trending", "学习资料站", "项目文档"],
    titles: [
      "{keyword}赛题资料和提交节点出现更新",
      "{keyword}参考开源项目增加新的实现样例",
      "竞赛团队围绕{keyword}整理任务拆解清单",
      "{keyword}作品提交要求和评审关注点补充说明",
      "学习路线更新：{keyword}进入原型验证阶段"
    ],
    summaries: [
      "本条信息适合转化为资料检查、任务拆解和提交计划。",
      "来源更偏学习和竞赛执行，应结合赛题官方文件确认最终要求。",
      "可将相关样例沉淀为项目结构、技术选型和演示材料参考。"
    ]
  },
  {
    match: ["半导体", "芯片", "光模块", "pcb", "先进封装", "中芯国际", "算力"],
    sources: ["交易所公告", "公司公告", "产业链快讯", "财新产业观察", "行业研究摘编"],
    titles: [
      "{keyword}产业链订单和供需节奏出现新线索",
      "{keyword}相关公司公告披露阶段性进展",
      "先进封装与算力需求带动{keyword}关注度上升",
      "{keyword}上游材料和设备环节出现交叉验证信息",
      "{keyword}行业动态提示产能、价格和交付节奏变化"
    ],
    summaries: [
      "本条内容仅做公开信息整理，适合用于产业链观察，不构成投资建议。",
      "信息更偏供需和公告跟踪，需要结合公司公告、交易所披露和产业链后续反馈。",
      "建议重点关注高可信来源中的时间、主体和影响范围。"
    ]
  },
  {
    match: ["南宁", "广西", "本地政策", "政务公开", "人才政策"],
    sources: ["南宁政务公开", "广西政府门户", "人社部门公告", "地方日报", "政策服务平台"],
    titles: [
      "{keyword}政务公开信息更新了办理和申报口径",
      "广西本地政策围绕{keyword}发布新的执行提醒",
      "南宁相关公告补充{keyword}时间节点和适用范围",
      "{keyword}人才、招聘或民生政策出现可跟踪变化",
      "地方部门对{keyword}材料和流程作出补充说明"
    ],
    summaries: [
      "本条信息适合用于本地政策跟踪和办事节点提醒。",
      "建议优先核对政务公开、部门公告和原始政策文件。",
      "可将适用对象、办理材料和时间节点拆成后续行动清单。"
    ]
  }
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildSummary(keyword: string, category: KeywordCategory, index: number, themedSummary?: string): string {
  if (themedSummary) {
    return `围绕“${keyword}”的模拟来源显示，${themedSummary}`;
  }

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
  description?: string | null;
}): MockInfoItemInput[] {
  const context = parseTopicPresetContext(keyword.description);
  const haystack = `${keyword.name} ${keyword.description ?? ""} ${context?.keywords.join(" ") ?? ""} ${context?.presets.map((preset) => preset.name).join(" ") ?? ""}`.toLowerCase();
  const themed = thematicTemplates.find((template) => template.match.some((token) => haystack.includes(token.toLowerCase())));
  const presetSources = context?.presets.map((preset) => preset.name).filter(Boolean) ?? [];
  const sources = shuffle(unique([...presetSources, ...(themed?.sources ?? []), ...categorySources[keyword.category]]));
  const templates = shuffle(themed?.titles ?? titleTemplates[keyword.category]);
  const summaryTemplates = themed?.summaries ?? [];
  const importances = shuffle<Importance>(["high", "medium", "medium", "low", "low"]);
  const now = Date.now();
  const keywordPool = unique([keyword.name, ...(context?.keywords ?? [])]).slice(0, 8);

  return Array.from({ length: 5 }, (_, index) => {
    const source = sources[index % sources.length];
    const currentKeyword = keywordPool[index % keywordPool.length] ?? keyword.name;
    const title = templates[index % templates.length].replace("{keyword}", currentKeyword);
    const publishedAt = new Date(now - (index + 1) * 1000 * 60 * 60 * (3 + index));
    const encoded = encodeURIComponent(`${currentKeyword}-${index + 1}`);

    return {
      title,
      source,
      url: `https://example.com/mock-radar/${encoded}`,
      publishedAt,
      summary: buildSummary(currentKeyword, keyword.category, index, summaryTemplates[index % summaryTemplates.length]),
      importance: index === 0 ? "high" : importances[index],
      sentiment: pick(sentimentPool)
    };
  });
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}
