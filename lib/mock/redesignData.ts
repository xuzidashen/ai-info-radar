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
};

export const redesignArticles: RedesignArticle[] = [
  {
    id: "ai-plan-2030",
    title: "新一代人工智能发展进入系统化落地阶段",
    excerpt: "从模型能力、算力基础设施到行业应用，AI 发展开始由单点突破转向可持续的系统工程。",
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
      "近期政策信号继续强调稳定预期和支持实体经济。市场更关注后续工具的节奏、覆盖范围与实际传导效果。",
      "从公开表达看，结构性支持仍将围绕重点行业、民营企业和科技创新展开。",
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
    tags: ["生命科学", "科研", "快速上升"],
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

export const featuredArticle = redesignArticles[0];
export const homeFeed = redesignArticles.slice(1, 4);
export const savedArticles = [redesignArticles[1], redesignArticles[3], redesignArticles[4]];

export const rankingItems = [
  { rank: 1, title: "人工智能应用进入规模化验证期", heat: "98.6 万" },
  { rank: 2, title: "新一代气象卫星完成关键测试", heat: "72.4 万" },
  { rank: 3, title: "多地优化人才政策和公共服务", heat: "54.3 万" },
  { rank: 4, title: "端侧智能带动设备体验升级", heat: "38.7 万" },
  { rank: 5, title: "新能源基础设施加速补齐短板", heat: "29.1 万" }
];

export const featuredTopics = [
  { id: "ai", title: "AI 前沿探索", subtitle: "洞察模型与智能体新进展", count: 128, image: "/redesign-assets/ai-chip.webp" },
  { id: "business", title: "城市与商业", subtitle: "观察政策与产业趋势", count: 96, image: "/redesign-assets/city-economy.webp" },
  { id: "space", title: "太空与未来", subtitle: "关注航天与气候科技", count: 73, image: "/redesign-assets/satellite.webp" }
];

export const growthItems = [
  { article: redesignArticles[4], growth: 126 },
  { article: redesignArticles[5], growth: 98 },
  { article: redesignArticles[6], growth: 73 }
];

export function getRedesignArticle(id: string) {
  return redesignArticles.find((article) => article.id === id) ?? null;
}
