import type { SearchMode, ZoneType } from "@/lib/types";

export type DefaultZoneTopic = {
  name: string;
  category: string;
  description: string;
  searchMode: SearchMode;
  summaryTemplate?: string;
  analysisEnabled?: boolean;
  factorEnabled?: boolean;
  linkageEnabled?: boolean;
};

export type DefaultZoneDefinition = {
  name: string;
  type: ZoneType;
  description: string;
  icon: string;
  color: string;
  topics: DefaultZoneTopic[];
};

export const defaultZoneDefinitions: DefaultZoneDefinition[] = [
  {
    name: "信息检索专区",
    type: "search",
    icon: "search",
    color: "radar",
    description: "考公、新闻、政策、比赛、学习资料等通用信息检索与总结。",
    topics: [
      {
        name: "考公信息",
        category: "考公/政策",
        description: "追踪报名公告、资格要求、考试时间和备考素材。",
        searchMode: "exam",
        summaryTemplate: "exam"
      },
      {
        name: "新闻资讯",
        category: "新闻资讯",
        description: "追踪公开新闻事件和后续关注点。",
        searchMode: "news",
        summaryTemplate: "news"
      },
      {
        name: "政策文件",
        category: "政策文件",
        description: "整理政策背景、核心条款和影响对象。",
        searchMode: "policy",
        summaryTemplate: "policy"
      },
      {
        name: "比赛资料",
        category: "比赛/学习",
        description: "跟踪比赛通知、提交节点和任务要求。",
        searchMode: "custom",
        summaryTemplate: "competition"
      },
      {
        name: "学习资料",
        category: "学习资料",
        description: "收集课程、资料包、模板和学习路线。",
        searchMode: "general",
        summaryTemplate: "news"
      }
    ]
  },
  {
    name: "AI 分析辅助专区",
    type: "analysis",
    icon: "activity",
    color: "amber",
    description: "财经、股票、公司、行业热点等需要趋势、风险和因子分析的主题。",
    topics: [
      {
        name: "财经公司",
        category: "公司/财经",
        description: "追踪公司公告、财报、监管和产业链变化。",
        searchMode: "finance",
        summaryTemplate: "finance-company",
        analysisEnabled: true,
        factorEnabled: true
      },
      {
        name: "股票观察",
        category: "股票观察",
        description: "只做公开信息整理和辅助研究，不做投资建议。",
        searchMode: "finance",
        summaryTemplate: "finance-company",
        analysisEnabled: true,
        factorEnabled: true
      },
      {
        name: "行业热点",
        category: "行业分析",
        description: "追踪行业新增信息、供需变化和风险断点。",
        searchMode: "industry",
        summaryTemplate: "industry",
        analysisEnabled: true,
        factorEnabled: true
      },
      {
        name: "科技公司",
        category: "AI/科技",
        description: "追踪科技产品、模型、开发者生态和公司动态。",
        searchMode: "tech",
        summaryTemplate: "industry",
        analysisEnabled: true,
        factorEnabled: true
      },
      {
        name: "风险追踪",
        category: "风险追踪",
        description: "聚合处罚、诉讼、监管、供应链等风险线索。",
        searchMode: "industry",
        summaryTemplate: "industry",
        analysisEnabled: true,
        factorEnabled: true
      }
    ]
  },
  {
    name: "多模块联合分析专区",
    type: "linkage",
    icon: "network",
    color: "danger",
    description: "用于分析多个产业模块、上下游关系和行业联动。",
    topics: [
      {
        name: "AI + PCB + 光模块",
        category: "产业链联动",
        description: "分析 AI 算力需求对光模块、PCB、CPO 和数据中心链条的影响。",
        searchMode: "industry",
        summaryTemplate: "linkage",
        linkageEnabled: true
      },
      {
        name: "AI 算力 + 液冷 + 电力",
        category: "产业链联动",
        description: "分析算力扩张对液冷、电力、数据中心和基础设施的传导。",
        searchMode: "industry",
        summaryTemplate: "linkage",
        linkageEnabled: true
      },
      {
        name: "半导体 + 设备 + 材料",
        category: "产业链联动",
        description: "分析设备、材料、制造和下游需求之间的联动关系。",
        searchMode: "industry",
        summaryTemplate: "linkage",
        linkageEnabled: true
      },
      {
        name: "科创板 + 产业链",
        category: "产业链联动",
        description: "整理科创板相关公司热度与产业链模块关系。",
        searchMode: "industry",
        summaryTemplate: "linkage",
        linkageEnabled: true
      }
    ]
  }
];

