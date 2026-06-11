import { categoryLabels } from "@/lib/types";
import type {
  DailySignalResult,
  FactorAnalyzeInput,
  FactorInfoItemInput,
  ItemFactorResult
} from "@/lib/providers/factor/types";

function roundScore(value: number | null): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value * 10) / 10 : null;
}

function average(values: number[]): number | null {
  const valid = values.filter((value) => Number.isFinite(value));

  if (valid.length === 0) {
    return null;
  }

  return roundScore(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function getItemTitle(items: FactorInfoItemInput[], id: string) {
  return items.find((item) => item.id === id)?.title ?? "未命名信息";
}

export function buildDailySignal(input: FactorAnalyzeInput, itemFactors: ItemFactorResult[]): DailySignalResult {
  const newsCount = itemFactors.length;
  const positiveCount = itemFactors.filter((item) => item.sentimentScore > 20).length;
  const negativeCount = itemFactors.filter((item) => item.sentimentScore < -20).length;
  const neutralCount = Math.max(newsCount - positiveCount - negativeCount, 0);
  const avgSentiment = average(itemFactors.map((item) => item.sentimentScore));
  const avgImpact = average(itemFactors.map((item) => item.impactScore));
  const avgRisk = average(itemFactors.map((item) => item.riskScore));
  const avgPolicy = average(itemFactors.map((item) => item.policyScore));
  const avgTech = average(itemFactors.map((item) => item.techScore));
  const avgFinancial = average(itemFactors.map((item) => item.financialScore));
  const avgAttention = average(itemFactors.map((item) => item.attentionScore));
  const avgConfidence = average(itemFactors.map((item) => item.factorConfidence));

  let signalLevel: DailySignalResult["signalLevel"] = "neutral";

  if (newsCount < 2 || (avgConfidence ?? 0) < 45) {
    signalLevel = "insufficient_info";
  } else if ((avgRisk ?? 0) >= 75) {
    signalLevel = "high_risk";
  } else if ((avgSentiment ?? 0) > 60 && (avgImpact ?? 0) > 70 && (avgRisk ?? 0) < 50) {
    signalLevel = "strong_positive";
  } else if ((avgSentiment ?? 0) > 35 && (avgRisk ?? 0) < 60) {
    signalLevel = "positive";
  } else if ((avgSentiment ?? 0) < -35) {
    signalLevel = "negative";
  }

  const riskLevel: DailySignalResult["riskLevel"] =
    signalLevel === "insufficient_info"
      ? "unknown"
      : (avgRisk ?? 0) >= 70
        ? "high"
        : (avgRisk ?? 0) >= 40
          ? "medium"
          : "low";

  const attentionLevel: DailySignalResult["attentionLevel"] =
    (avgAttention ?? 0) >= 70 ? "high" : (avgAttention ?? 0) >= 40 ? "medium" : "low";

  const topAttention = [...itemFactors].sort((a, b) => b.attentionScore - a.attentionScore).slice(0, 3);
  const topRisk = [...itemFactors].sort((a, b) => b.riskScore - a.riskScore)[0];
  const topPositive = [...itemFactors].sort((a, b) => b.sentimentScore - a.sentimentScore)[0];

  const lines = [
    `${input.keyword.name} 今日纳入 ${newsCount} 条信息，分类为${categoryLabels[input.keyword.category]}。`,
    `平均情绪 ${avgSentiment ?? "未知"}，平均影响 ${avgImpact ?? "未知"}，平均风险 ${avgRisk ?? "未知"}，平均关注度 ${avgAttention ?? "未知"}。`,
    topAttention.length > 0
      ? `高关注来源主要来自：${topAttention.map((item) => `《${getItemTitle(input.infoItems, item.infoItemId)}》`).join("、")}。`
      : "现有来源不足以形成高关注来源列表。",
    topRisk ? `最高风险项为《${getItemTitle(input.infoItems, topRisk.infoItemId)}》，原因：${topRisk.factorReason}` : "",
    topPositive && topPositive.sentimentScore > 20
      ? `相对正面项为《${getItemTitle(input.infoItems, topPositive.infoItemId)}》。`
      : "现有来源不足以判断明确正面变化。"
  ].filter(Boolean);

  if (input.keyword.category === "finance") {
    lines.push("以上内容仅为公开信息整理和辅助研究，不构成投资建议。");
  }

  return {
    newsCount,
    positiveCount,
    negativeCount,
    neutralCount,
    avgSentiment,
    avgImpact,
    avgRisk,
    avgPolicy,
    avgTech,
    avgFinancial,
    avgAttention,
    avgConfidence,
    signalLevel,
    riskLevel,
    attentionLevel,
    summary: lines.join("\n"),
    factorSnapshot: JSON.stringify({
      keyword: input.keyword.name,
      category: input.keyword.category,
      generatedAt: new Date().toISOString(),
      itemFactors
    })
  };
}

