import type { SearchMode } from "@/lib/types";

export type SourcePreset = {
  id: string;
  name: string;
  description: string;
  category: "policy" | "tech" | "finance" | "competition" | "local" | "general";
  sourceType: "search_query" | "rss" | "github" | "official_site" | "announcement";
  keywords: string[];
  tags: string[];
  queryTemplates: string[];
  credibilityHint: "high" | "medium" | "low";
  enabledByDefault: boolean;
};

export const sourcePresets: SourcePreset[] = [
  {
    id: "ai-agent-large-models",
    name: "AI / 大模型 / Agent",
    description: "追踪模型产品、Agent 框架、开发者工具、模型发布和应用落地。",
    category: "tech",
    sourceType: "search_query",
    keywords: ["AI Agent", "大模型", "OpenAI", "DeepSeek", "Claude", "Gemini", "模型发布", "智能体框架"],
    tags: ["ai", "agent", "llm", "developer-tools", "model-release"],
    queryTemplates: [
      "{keyword} 最新发布 功能 更新",
      "{keyword} developer docs release notes",
      "{keyword} Agent 框架 实践 案例"
    ],
    credibilityHint: "medium",
    enabledByDefault: true
  },
  {
    id: "semiconductor-chip-supply-chain",
    name: "半导体 / 芯片 / 光模块 / PCB",
    description: "覆盖半导体制造、先进封装、光模块、PCB、设备材料和产业链传导。",
    category: "finance",
    sourceType: "search_query",
    keywords: ["半导体", "芯片", "光模块", "PCB", "先进封装", "算力", "中芯国际", "寒武纪"],
    tags: ["semiconductor", "chip", "optical-module", "pcb", "supply-chain"],
    queryTemplates: [
      "{keyword} 公告 产能 订单",
      "{keyword} 行业动态 产业链",
      "{keyword} 交易所公告 业绩说明"
    ],
    credibilityHint: "medium",
    enabledByDefault: true
  },
  {
    id: "civil-service-policy-announcements",
    name: "考公 / 国企 / 事业单位 / 政策公告",
    description: "关注公务员考试、事业单位招聘、国企招聘和官方政策公告。",
    category: "policy",
    sourceType: "official_site",
    keywords: ["公务员考试", "事业单位", "国企招聘", "政策公告", "报名时间", "职位表", "考试大纲"],
    tags: ["exam", "policy", "official", "recruitment"],
    queryTemplates: [
      "{keyword} 官方公告 报名 时间",
      "{keyword} 职位表 招录 公告",
      "{keyword} 政策解读 官方"
    ],
    credibilityHint: "high",
    enabledByDefault: true
  },
  {
    id: "software-cup-competition-learning",
    name: "软件杯 / 竞赛 / 开源项目",
    description: "适合比赛通知、赛题资料、提交节点、开源样例和学习路线。",
    category: "competition",
    sourceType: "search_query",
    keywords: ["软件杯", "中国软件杯", "竞赛", "赛题", "开源项目", "项目文档", "作品提交"],
    tags: ["competition", "study", "project", "open-source"],
    queryTemplates: [
      "{keyword} 赛题 通知 官方",
      "{keyword} 作品 提交 时间",
      "{keyword} GitHub 示例 项目"
    ],
    credibilityHint: "medium",
    enabledByDefault: true
  },
  {
    id: "finance-company-announcements",
    name: "财经公司 / 公告 / 行业动态",
    description: "用于公司公告、财报、行业政策和公开市场信息整理，不输出交易建议。",
    category: "finance",
    sourceType: "announcement",
    keywords: ["公司公告", "财报", "业绩说明会", "行业动态", "监管公告", "交易所", "风险提示"],
    tags: ["finance", "company", "announcement", "industry"],
    queryTemplates: [
      "{keyword} 公司公告 交易所",
      "{keyword} 财报 业绩 说明会",
      "{keyword} 行业动态 风险提示"
    ],
    credibilityHint: "high",
    enabledByDefault: true
  },
  {
    id: "nanning-guangxi-local-policy",
    name: "本地城市政策 / 南宁 / 广西",
    description: "关注南宁、广西的政务公开、地方政策、考试招聘和民生公告。",
    category: "local",
    sourceType: "official_site",
    keywords: ["南宁", "广西", "本地政策", "政务公开", "人才政策", "招聘公告", "考试公告"],
    tags: ["local", "guangxi", "nanning", "policy", "official"],
    queryTemplates: [
      "{keyword} 南宁 官方 公告",
      "{keyword} 广西 政务公开 政策",
      "{keyword} 本地 招聘 考试 公告"
    ],
    credibilityHint: "high",
    enabledByDefault: true
  },
  {
    id: "learning-materials-skill-growth",
    name: "学习资料 / 技能成长",
    description: "适合课程资料、考试备考、技术学习、论文资料和实践路线。",
    category: "general",
    sourceType: "search_query",
    keywords: ["学习资料", "课程", "备考", "技能成长", "教程", "知识库", "实践路线"],
    tags: ["learning", "course", "study", "skill"],
    queryTemplates: [
      "{keyword} 学习资料 教程",
      "{keyword} roadmap practice",
      "{keyword} 备考 资料 汇总"
    ],
    credibilityHint: "medium",
    enabledByDefault: true
  },
  {
    id: "github-trending-projects",
    name: "GitHub 趋势项目",
    description: "追踪热门仓库、Release、开发工具和可复用项目样例。",
    category: "tech",
    sourceType: "github",
    keywords: ["GitHub Trending", "开源项目", "Release", "开发工具", "TypeScript", "Next.js", "AI 工具"],
    tags: ["github", "trending", "release", "devtools"],
    queryTemplates: [
      "{keyword} GitHub trending",
      "{keyword} release notes GitHub",
      "{keyword} open source project"
    ],
    credibilityHint: "medium",
    enabledByDefault: false
  }
];

export const sourcePresetCategoryLabels: Record<SourcePreset["category"], string> = {
  policy: "政策公告",
  tech: "AI/科技",
  finance: "财经公司",
  competition: "比赛学习",
  local: "本地政策",
  general: "通用资料"
};

export const sourcePresetTypeLabels: Record<SourcePreset["sourceType"], string> = {
  search_query: "搜索查询",
  rss: "RSS",
  github: "GitHub",
  official_site: "官方网站",
  announcement: "公告入口"
};

export const credibilityHintLabels: Record<SourcePreset["credibilityHint"], string> = {
  high: "高可信优先",
  medium: "中可信参考",
  low: "低可信谨慎"
};

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenScore(input: string, values: string[], weight: number) {
  const normalizedInput = normalize(input);
  return values.reduce((score, value) => {
    const normalizedValue = normalize(value);
    if (!normalizedValue) {
      return score;
    }
    if (normalizedInput.includes(normalizedValue) || normalizedValue.includes(normalizedInput)) {
      return score + weight;
    }
    return score;
  }, 0);
}

export function matchSourcePresets(input: string, limit = 6) {
  const trimmed = input.trim();

  if (!trimmed) {
    return sourcePresets.filter((preset) => preset.enabledByDefault).slice(0, limit);
  }

  return sourcePresets
    .map((preset) => {
      const score =
        tokenScore(trimmed, preset.keywords, 3) +
        tokenScore(trimmed, preset.tags, 1.5) +
        tokenScore(trimmed, [preset.name, preset.description, sourcePresetCategoryLabels[preset.category]], 1);

      return {
        preset,
        score
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return Number(b.preset.enabledByDefault) - Number(a.preset.enabledByDefault);
    })
    .map((entry) => entry.preset)
    .slice(0, limit);
}

export function collectPresetKeywords(presets: SourcePreset[], max = 10) {
  const seen = new Set<string>();
  const keywords: string[] = [];

  for (const preset of presets) {
    for (const keyword of preset.keywords) {
      if (seen.has(keyword)) {
        continue;
      }
      seen.add(keyword);
      keywords.push(keyword);
      if (keywords.length >= max) {
        return keywords;
      }
    }
  }

  return keywords;
}

export function inferSearchModeFromPresets(presets: SourcePreset[]): SearchMode {
  const primary = presets[0]?.category;

  if (primary === "policy" || primary === "local") {
    return "policy";
  }
  if (primary === "competition") {
    return "custom";
  }
  if (primary === "finance") {
    return "finance";
  }
  if (primary === "tech") {
    return "tech";
  }
  return "general";
}

export function inferCategoryFromPresets(presets: SourcePreset[]) {
  return presets[0] ? sourcePresetCategoryLabels[presets[0].category] : "自定义";
}
