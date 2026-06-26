export type RedesignArticle = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  source: string;
  time: string;
  readTime: string;
  image: string;
  score: number;
  body: string[];
  tags: string[];
  url?: string;
  topicId?: string;
  topicTitle?: string;
  publishedAt?: string;
  credibilityLabel?: string | null;
  credibilityReason?: string | null;
  qualityLabels?: string[];
  sourceType?: string | null;
  changeType?: string | null;
  changeReason?: string | null;
};

export type FollowTopic = {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  category: string;
  updatedAt: string;
  resultCount: number;
  articleIds: string[];
  insightId: string;
  status: "fresh" | "scheduled";
  lifecycle?: "active" | "archived" | "deleted";
  todayItemCount?: number;
  unreadCount?: number;
  highTrustCount?: number;
  needsReviewCount?: number;
  lastRunState?: "success" | "failed" | "waiting";
  lastRunAt?: string | null;
  coolingDown?: boolean;
  nextSuggestedUpdateAt?: string | null;
  dailyAutoCheck?: boolean;
};

export type Insight = {
  id: string;
  title: string;
  topicId: string;
  topicTitle: string;
  generatedAt: string;
  summary: string;
  points: string[];
  keyChanges?: Array<{ title: string; detail: string; confidence: "high" | "medium" | "low" }>;
  whyItMatters?: string[];
  risks?: string[];
  sourceNotes?: Array<{ source: string; note: string; url?: string }>;
  tags: string[];
  references: { title: string; source: string; url: string; note?: string }[];
  relatedArticleIds: string[];
};

export const redesignArticles: RedesignArticle[] = [
  {
    id: "ai-plan-2030",
    title: "新一代人工智能发展进入系统化落地阶段",
    excerpt: "从模型能力、算力基础设施到行业应用，AI 正由单点突破转向可持续的系统工程。",
    category: "AI",
    source: "智见研究",
    time: "5 分钟前",
    readTime: "4 分钟阅读",
    image: "/redesign-assets/hero-city.webp",
    score: 9.4,
    tags: ["人工智能", "产业趋势", "深度"],
    body: [
      "新一代人工智能正在从能力竞赛转向真实场景中的稳定交付。企业更关心模型是否可控、成本是否透明，以及能否嵌入已有工作流。",
      "近期公开信息显示，智能体、知识库、代码助手和行业模型仍是落地最集中的方向。与此同时，数据治理、权限边界与结果可追溯性成为产品能否长期使用的关键。",
      "对于普通用户，变化不会只表现为更强的聊天能力，而是信息检索、内容整理和任务执行逐步融合。未来更值得关注的是产品是否真正减少重复操作，而不是单纯增加功能数量。"
    ]
  },
  {
    id: "domestic-ai-chip",
    title: "国产 AI 芯片突破关键技术，算力效率持续提升",
    excerpt: "新一代通用 AI 芯片在算力、能效比与软件适配方面出现阶段性进展。",
    category: "科技",
    source: "36氪",
    time: "18 分钟前",
    readTime: "3 分钟阅读",
    image: "/redesign-assets/ai-chip.webp",
    score: 8.9,
    tags: ["AI 芯片", "算力", "半导体"],
    body: [
      "算力基础设施仍然是人工智能产业的重要底座。近期行业关注点逐步从峰值算力转向能效、互联能力与软件生态。",
      "多家团队正在优化编译工具、算子库和集群调度，使芯片能力更容易被开发者实际使用。",
      "公开进展仍需结合后续产品交付和客户验证进行判断，本内容仅作信息整理。"
    ]
  },
  {
    id: "liquidity-policy",
    title: "政策强调保持流动性合理充裕，支持实体经济发展",
    excerpt: "季度会议部署下一阶段重点任务，强调精准有力实施宏观调控。",
    category: "商业",
    source: "财新网",
    time: "32 分钟前",
    readTime: "5 分钟阅读",
    image: "/redesign-assets/city-economy.webp",
    score: 8.2,
    tags: ["宏观政策", "实体经济", "观察"],
    body: [
      "近期政策信号继续强调稳定预期和支持实体经济，市场更关注后续工具的节奏、覆盖范围与实际传导效果。",
      "从公开表述看，结构性支持仍将围绕重点行业、民营企业和科技创新展开。",
      "相关内容不构成投资建议，具体影响需要结合正式文件与后续数据。"
    ]
  },
  {
    id: "weather-satellite",
    title: "新一代气象卫星完成关键测试并进入应用准备",
    excerpt: "卫星将提升极端天气监测精度，为防灾减灾和气候研究提供数据支持。",
    category: "世界",
    source: "澎湃新闻",
    time: "1 小时前",
    readTime: "4 分钟阅读",
    image: "/redesign-assets/satellite.webp",
    score: 8.6,
    tags: ["航天", "气象", "公共安全"],
    body: [
      "气象卫星可以持续观测大范围天气系统，为台风、暴雨和高温等极端天气提供早期信息。",
      "新一代设备在空间分辨率、观测频次和数据处理速度方面均有提升。",
      "后续重点将转向数据产品开放和跨部门应用。"
    ]
  },
  {
    id: "gene-editing",
    title: "国内团队在基因编辑递送技术上取得新进展",
    excerpt: "新的递送方案在精度和稳定性方面获得改进，仍需进一步临床验证。",
    category: "科技",
    source: "科技日报",
    time: "28 分钟前",
    readTime: "6 分钟阅读",
    image: "/redesign-assets/dna-tech.webp",
    score: 8.7,
    tags: ["生命科学", "科研", "近期更新"],
    body: [
      "基因编辑技术的实际应用不仅取决于编辑工具本身，也高度依赖安全、稳定的递送方式。",
      "本次公开进展提供了新的实验思路，但距离规模化应用仍有多项验证工作。"
    ]
  },
  {
    id: "talent-policy",
    title: "城市人才新政聚焦青年发展与产业协同",
    excerpt: "政策从住房、创业支持和公共服务等方面完善人才保障。",
    category: "商业",
    source: "城市观察",
    time: "45 分钟前",
    readTime: "3 分钟阅读",
    image: "/redesign-assets/talent-city.webp",
    score: 7.9,
    tags: ["人才政策", "城市", "就业"],
    body: [
      "本轮政策更关注青年人才落地后的持续发展，通过公共服务和产业资源降低长期生活成本。",
      "具体申报范围和办理流程应以当地政府正式公告为准。"
    ]
  },
  {
    id: "charging-network",
    title: "公共充电基础设施建设进入提质阶段",
    excerpt: "行业关注点从数量扩张转向覆盖效率、稳定性和运营体验。",
    category: "商业",
    source: "产业快讯",
    time: "1 小时前",
    readTime: "4 分钟阅读",
    image: "/redesign-assets/new-energy.webp",
    score: 7.8,
    tags: ["新能源", "基础设施", "趋势"],
    body: [
      "随着新能源汽车保有量增加，充电网络的布局效率和服务稳定性变得更重要。",
      "运营平台正在通过动态定价、故障监测和站点协同提升使用体验。"
    ]
  }
];

export const followTopics: FollowTopic[] = [
  {
    id: "ai-agents",
    title: "AI Agent 产品进展",
    description: "追踪智能体产品、模型能力和真实落地案例。",
    keywords: ["AI Agent", "智能体", "工作流"],
    category: "科技",
    updatedAt: "12 分钟前",
    resultCount: 18,
    articleIds: ["ai-plan-2030", "domestic-ai-chip", "gene-editing"],
    insightId: "ai-agents-weekly",
    status: "fresh"
  },
  {
    id: "semiconductor",
    title: "半导体产业观察",
    description: "关注芯片设计、先进制造与国内供应链变化。",
    keywords: ["半导体", "AI 芯片", "先进制造"],
    category: "产业",
    updatedAt: "今天 09:20",
    resultCount: 12,
    articleIds: ["domestic-ai-chip", "charging-network"],
    insightId: "semiconductor-brief",
    status: "scheduled"
  },
  {
    id: "policy-watch",
    title: "政策与城市机会",
    description: "汇总宏观政策、人才政策与城市公共服务变化。",
    keywords: ["宏观政策", "人才政策", "城市发展"],
    category: "政策",
    updatedAt: "昨天 18:40",
    resultCount: 9,
    articleIds: ["liquidity-policy", "talent-policy"],
    insightId: "policy-opportunity",
    status: "fresh"
  }
];

export const insights: Insight[] = [
  {
    id: "ai-agents-weekly",
    title: "AI Agent 正从演示能力转向稳定工作流",
    topicId: "ai-agents",
    topicTitle: "AI Agent 产品进展",
    generatedAt: "今天 10:36",
    summary: "本周智能体产品的共同变化，是从通用演示转向任务边界清楚、结果可校验的工作流。企业侧更重视权限、成本和可追溯性，个人产品则在降低配置门槛。",
    points: [
      "智能体产品开始用完成率、人工接管率和单次成本衡量真实价值。",
      "知识库、浏览器操作和代码执行仍是最常见的三类工具能力。",
      "面向普通用户的产品正在隐藏模型、运行和供应商等技术概念。"
    ],
    tags: ["AI Agent", "产品趋势", "工作流"],
    references: [
      { title: "人工智能发展进入系统化落地阶段", source: "智见研究", url: "/articles/ai-plan-2030" },
      { title: "国产 AI 芯片算力效率持续提升", source: "36氪", url: "/articles/domestic-ai-chip" }
    ],
    relatedArticleIds: ["ai-plan-2030", "domestic-ai-chip", "gene-editing"]
  },
  {
    id: "semiconductor-brief",
    title: "算力竞争进入软硬件协同阶段",
    topicId: "semiconductor",
    topicTitle: "半导体产业观察",
    generatedAt: "今天 09:24",
    summary: "芯片性能仍然重要，但开发工具、调度效率和应用迁移成本正在成为采购与落地决策中的关键变量。",
    points: ["软件生态决定峰值性能能否被稳定使用。", "能效与集群互联成为下一阶段重点。", "客户验证周期仍是判断产业进展的重要依据。"],
    tags: ["半导体", "算力", "产业"],
    references: [{ title: "国产 AI 芯片突破关键技术", source: "36氪", url: "/articles/domestic-ai-chip" }],
    relatedArticleIds: ["domestic-ai-chip", "charging-network"]
  },
  {
    id: "policy-opportunity",
    title: "近期政策信号更重视精准支持与长期预期",
    topicId: "policy-watch",
    topicTitle: "政策与城市机会",
    generatedAt: "昨天 18:45",
    summary: "宏观与城市政策都在从普遍覆盖转向更明确的人群和产业目标，后续需要持续观察执行细则与服务可达性。",
    points: ["结构性工具继续支持科技创新和民营企业。", "城市人才政策更关注落地后的公共服务。", "正式文件与执行口径是判断影响的主要依据。"],
    tags: ["政策", "城市", "趋势"],
    references: [
      { title: "政策强调保持流动性合理充裕", source: "财新网", url: "/articles/liquidity-policy" },
      { title: "城市人才新政聚焦青年发展", source: "城市观察", url: "/articles/talent-policy" }
    ],
    relatedArticleIds: ["liquidity-policy", "talent-policy"]
  }
];

export const rankingItems = [
  { rank: 1, title: "人工智能应用进入规模化验证期", heat: "98.6 万", articleId: "ai-plan-2030" },
  { rank: 2, title: "新一代气象卫星完成关键测试", heat: "72.4 万", articleId: "weather-satellite" },
  { rank: 3, title: "多地优化人才政策和公共服务", heat: "54.3 万", articleId: "talent-policy" },
  { rank: 4, title: "国产算力平台加快软件适配", heat: "38.7 万", articleId: "domestic-ai-chip" },
  { rank: 5, title: "新能源基础设施进入提质阶段", heat: "29.1 万", articleId: "charging-network" }
];

export const featuredArticle = redesignArticles[0];
export const homeFeed = redesignArticles.slice(1, 5);
export const savedArticles = [redesignArticles[1], redesignArticles[3], redesignArticles[4]];

export const featuredTopics = followTopics.map((topic, index) => ({
  ...topic,
  image: ["/redesign-assets/ai-chip.webp", "/redesign-assets/dna-tech.webp", "/redesign-assets/talent-city.webp"][index]
}));

export const growthItems = [
  { article: redesignArticles[4], growth: 126 },
  { article: redesignArticles[5], growth: 98 },
  { article: redesignArticles[6], growth: 73 }
];

export function getRedesignArticle(id: string) {
  return redesignArticles.find((article) => article.id === id) ?? null;
}

export function getFollowTopic(id: string) {
  return followTopics.find((topic) => topic.id === id) ?? null;
}

export function getInsight(id: string) {
  return insights.find((insight) => insight.id === id) ?? null;
}
