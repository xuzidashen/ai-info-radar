import { prisma } from "@/lib/prisma";
import type { TopicRunLogDTO } from "@/lib/types";

const transientPatterns = ["network", "timeout", "timed out", "rate limit", "429", "fetch failed", "ECONNRESET", "ETIMEDOUT"];
const configPatterns = ["api key", "apikey", "key missing", "missing key", "未配置", "invalid key", "unauthorized", "401", "403"];

function includesAny(value: string | null | undefined, patterns: string[]) {
  const text = (value ?? "").toLowerCase();
  return patterns.some((pattern) => text.includes(pattern.toLowerCase()));
}

export function classifyRetryReason(errorMessage: string | null | undefined) {
  if (includesAny(errorMessage, configPatterns)) {
    return {
      retryable: false,
      recommendedDelay: "修复配置后再手动重试",
      reason: "错误看起来与 provider 配置或 API Key 有关，不建议自动重试。"
    };
  }

  if (includesAny(errorMessage, transientPatterns)) {
    return {
      retryable: true,
      recommendedDelay: "建议稍后重试",
      reason: "错误看起来与网络、超时或频率限制有关。"
    };
  }

  return {
    retryable: true,
    recommendedDelay: "可手动重试",
    reason: "没有识别到明确配置错误。"
  };
}

export async function getRetryPolicyForRunLog(log: TopicRunLogDTO) {
  const retryCount = await prisma.topicRunLog.count({
    where: {
      parentRunLogId: log.id
    }
  });
  const statusAllowsRetry = log.status === "failed" || log.status === "fallback" || log.fallbackUsed;
  const classification = classifyRetryReason(log.errorMessage);
  const maxRetryReached = retryCount >= 3 || log.retryCount >= 3;
  const canRetry = Boolean(log.topicId && statusAllowsRetry && classification.retryable && !maxRetryReached);

  return {
    canRetry,
    retryCount,
    maxRetries: 3,
    statusAllowsRetry,
    maxRetryReached,
    recommendedDelay: classification.recommendedDelay,
    reason: maxRetryReached ? "该运行日志已达到最多 3 次手动重试限制。" : classification.reason
  };
}
