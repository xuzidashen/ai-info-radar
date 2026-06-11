import type { ZoneType } from "@/lib/types";

export const productCopy = {
  appName: "AI 信息雷达",
  appSubtitle: "Multi-Zone Intelligence Hub",
  homepage: {
    eyebrow: "Multi-Zone Intelligence Hub",
    title: "AI 信息雷达",
    subtitle: "多专区信息工作台",
    description: "洞察信息趋势，掌握关键先机。把检索、分析、联动和报告沉淀放在一个清晰、长期可用的个人工作台里。",
    ctaLabel: "开始探索"
  },
  compliance: "以上内容仅为公开信息整理和辅助研究，不构成投资建议。"
} as const;

export const zoneProductCopy: Record<
  ZoneType,
  {
    eyebrow: string;
    title: string;
    description: string;
    scene: string;
    process: string;
    accent: string;
  }
> = {
  search: {
    eyebrow: "Search Zone",
    title: "信息检索专区",
    description: "适合考公、新闻、政策、比赛、学习资料等信息检索和摘要整理。",
    scene: "整理来源、摘要和 Markdown 报告。",
    process: "检索来源 -> 质量过滤 -> 可信度 -> AI 摘要 -> 报告沉淀",
    accent: "from-sky-500 to-cyan-400"
  },
  analysis: {
    eyebrow: "Analysis Zone",
    title: "AI 分析辅助专区",
    description: "适合财经、公司、行业和科技主题的趋势、风险、关注度辅助分析。",
    scene: "汇总情绪、风险、影响和关注度。",
    process: "搜索 -> 总结 -> 因子评分 -> DailySignal -> 合规报告",
    accent: "from-indigo-500 to-sky-400"
  },
  linkage: {
    eyebrow: "Linkage Zone",
    title: "联合分析专区",
    description: "适合 AI、PCB、光模块、半导体等多模块产业链联动研判。",
    scene: "用模块、关系和路径表达传导。",
    process: "模块 -> 关系 -> 路径 -> 假设 -> 联动报告",
    accent: "from-cyan-500 to-violet-500"
  }
};

export const mobileCopy = {
  previewTitle: "移动端预览",
  previewDescription: "APK 预览版通过 Capacitor WebView 打开当前 Web 工作台。服务端、数据库和真实 provider 仍运行在 Web 服务侧。",
  checklistTitle: "移动发布检查",
  checklistDescription: "生成 APK 前确认 Web 地址、HTTPS、Provider、Cron Secret、Android 环境和 APK 输出。"
} as const;
