import { buildDailySignal } from "@/lib/providers/factor/aggregation";
import type {
  FactorAnalyzeInput,
  FactorAnalyzeResult,
  FactorInfoItemInput,
  FactorProvider,
  ItemFactorResult
} from "@/lib/providers/factor/types";

const financialWords = ["财报", "业绩", "收入", "利润", "公告", "订单", "营收", "融资", "股东", "交易所", "上市"];
const policyWords = ["政策", "监管", "政府", "国产替代", "通知", "办法", "条例", "部门", "考试", "公告", "报名"];
const techWords = ["技术", "芯片", "模型", "AI", "人工智能", "研发", "开源", "算力", "算法", "产品", "版本"];
const riskWords = ["风险", "处罚", "诉讼", "下滑", "亏损", "限制", "制裁", "调查", "延期", "泄露", "整改"];
const positiveWords = ["增长", "突破", "发布", "获批", "升级", "合作", "中标", "改善", "新增", "领先"];
const negativeWords = ["下降", "亏损", "处罚", "限制", "取消", "延期", "下架", "调查", "风险", "制裁"];

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function countHits(text: string, words: string[]) {
  return words.reduce((count, word) => (text.toLowerCase().includes(word.toLowerCase()) ? count + 1 : count), 0);
}

function importanceBase(item: FactorInfoItemInput) {
  if (item.importance === "high") {
    return 76;
  }

  if (item.importance === "medium") {
    return 55;
  }

  return 34;
}

function sentimentBase(item: FactorInfoItemInput) {
  if (item.sentiment === "positive") {
    return 38;
  }

  if (item.sentiment === "negative") {
    return -42;
  }

  return 0;
}

function credibilityBoost(item: FactorInfoItemInput) {
  if (typeof item.credibilityScore === "number") {
    return item.credibilityScore * 30;
  }

  if (item.credibilityLabel === "high") {
    return 24;
  }

  if (item.credibilityLabel === "medium") {
    return 14;
  }

  if (item.credibilityLabel === "low") {
    return 4;
  }

  return 8;
}

function inferEventType(text: string, input: FactorAnalyzeInput) {
  const financeHits = countHits(text, financialWords);
  const policyHits = countHits(text, policyWords);
  const techHits = countHits(text, techWords);
  const riskHits = countHits(text, riskWords);

  if (riskHits >= 2) {
    return { eventType: "风险事件", eventSubtype: "负面/不确定性" };
  }

  if (financeHits > policyHits && financeHits >= techHits) {
    return { eventType: "经营/财经", eventSubtype: "财务与公告" };
  }

  if (policyHits > financeHits && policyHits >= techHits) {
    return { eventType: "政策/监管", eventSubtype: input.keyword.category === "policy" ? "考试政策" : "监管政策" };
  }

  if (techHits > 0) {
    return { eventType: "技术/产品", eventSubtype: "技术进展" };
  }

  if (input.keyword.category === "study") {
    return { eventType: "学习/比赛", eventSubtype: "任务资料" };
  }

  return { eventType: "一般信息", eventSubtype: "公开动态" };
}

function inferTimeHorizon(text: string) {
  if (text.includes("长期") || text.includes("规划") || text.includes("战略")) {
    return "long";
  }

  if (text.includes("本周") || text.includes("今日") || text.includes("短期") || text.includes("报名")) {
    return "short";
  }

  return "medium";
}

function inferRelatedIndustries(text: string, category: FactorAnalyzeInput["keyword"]["category"]) {
  const industries = new Set<string>();

  if (category === "finance") {
    industries.add("财经/公司研究");
  }

  if (category === "policy") {
    industries.add("公共政策/考试");
  }

  if (category === "ai-tech") {
    industries.add("AI/科技");
  }

  if (text.includes("芯片") || text.includes("半导体")) {
    industries.add("半导体");
  }

  if (text.includes("模型") || text.includes("AI") || text.includes("人工智能")) {
    industries.add("人工智能");
  }

  if (text.includes("教育") || text.includes("考试") || text.includes("报名")) {
    industries.add("教育考试");
  }

  return [...industries];
}

function analyzeItem(input: FactorAnalyzeInput, item: FactorInfoItemInput): ItemFactorResult {
  const text = `${item.title}\n${item.summary}\n${item.rawContent ?? ""}`;
  const financeHits = countHits(text, financialWords);
  const policyHits = countHits(text, policyWords);
  const techHits = countHits(text, techWords);
  const riskHits = countHits(text, riskWords);
  const positiveHits = countHits(text, positiveWords);
  const negativeHits = countHits(text, negativeWords);
  const base = importanceBase(item);
  const searchScore = typeof item.score === "number" ? item.score * 18 : 6;
  const contentLengthBoost = Math.min(text.length / 60, 18);
  const { eventType, eventSubtype } = inferEventType(text, input);

  const sentimentScore = clamp(sentimentBase(item) + positiveHits * 18 - negativeHits * 20, -100, 100);
  const impactScore = clamp(base + searchScore + financeHits * 5 + policyHits * 4 + techHits * 4);
  const riskScore = clamp(18 + riskHits * 22 + negativeHits * 10 + (item.sentiment === "negative" ? 18 : 0));
  const policyScore = clamp((input.keyword.category === "policy" ? 42 : 12) + policyHits * 18);
  const techScore = clamp((input.keyword.category === "ai-tech" ? 42 : 10) + techHits * 18);
  const financialScore = clamp((input.keyword.category === "finance" ? 42 : 8) + financeHits * 18);
  const attentionScore = clamp(base * 0.48 + impactScore * 0.34 + credibilityBoost(item) + contentLengthBoost);
  const factorConfidence = clamp(44 + credibilityBoost(item) + contentLengthBoost + (item.url ? 8 : 0));
  const relatedIndustries = inferRelatedIndustries(text, input.keyword.category);
  const relatedCompanies =
    input.keyword.category === "finance" || input.keyword.category === "ai-tech" ? [input.keyword.name] : [];

  return {
    infoItemId: item.id,
    eventType,
    eventSubtype,
    sentimentScore,
    impactScore,
    riskScore,
    policyScore,
    techScore,
    financialScore,
    attentionScore,
    timeHorizon: inferTimeHorizon(text),
    factorConfidence,
    factorReason: `基于标题/摘要关键词、原始重要级别、搜索分数和来源可信度综合估算。命中：财经 ${financeHits}，政策 ${policyHits}，技术 ${techHits}，风险 ${riskHits}。`,
    relatedCompanies,
    relatedIndustries
  };
}

export class MockFactorProvider implements FactorProvider {
  name = "mock" as const;

  async analyze(input: FactorAnalyzeInput): Promise<FactorAnalyzeResult> {
    const itemFactors = input.infoItems.map((item) => analyzeItem(input, item));

    return {
      provider: this.name,
      itemFactors,
      dailySignal: buildDailySignal(input, itemFactors)
    };
  }
}

