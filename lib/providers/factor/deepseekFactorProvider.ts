import OpenAI from "openai";

import { categoryLabels } from "@/lib/types";
import { buildDailySignal } from "@/lib/providers/factor/aggregation";
import type {
  FactorAnalyzeInput,
  FactorAnalyzeResult,
  FactorInfoItemInput,
  FactorProvider,
  ItemFactorResult
} from "@/lib/providers/factor/types";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "未知";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "未知" : date.toISOString();
}

function clamp(value: unknown, min = 0, max = 100) {
  const number = typeof value === "number" && Number.isFinite(value) ? value : Number(value);
  return Math.max(min, Math.min(max, Math.round(Number.isFinite(number) ? number : min)));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function extractJson(content: string) {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fenced ? fenced[1] : trimmed;
}

function buildPrompt(input: FactorAnalyzeInput) {
  const sources = input.infoItems
    .map(
      (item, index) => `${index + 1}. ID：${item.id}
   标题：${item.title}
   来源：${item.source}
   可信度：${item.credibilityLabel ?? "unknown"} (${item.credibilityScore ?? "未知"})，${item.credibilityReason ?? "无说明"}
   发布时间：${formatDate(item.publishedAt)}
   重要级别：${item.importance}
   情绪标签：${item.sentiment}
   搜索 provider：${item.provider}
   搜索分数：${item.score ?? "未知"}
   摘要：${item.summary}
   URL：${item.url}`
    )
    .join("\n\n");

  return `关键词：${input.keyword.name}
分类：${categoryLabels[input.keyword.category]}
用户备注：${input.keyword.description || "无"}
搜索结果数量：${input.infoItems.length}

搜索结果列表：
${sources}

请对每条搜索结果做公开信息因子评分。只基于给定搜索结果，不要编造没有出现的事实，不要编造来源。
如果信息不足，请在 factorReason 中明确写“现有来源不足以判断”。
财经类不能给具体交易方向，不能做具体价格预测，不能输出交易执行指令。

只输出 JSON，不要 Markdown，不要解释文字。JSON 结构必须是：
{
  "itemFactors": [
    {
      "infoItemId": "必须等于搜索结果 ID",
      "eventType": "事件类型或 null",
      "eventSubtype": "事件子类型或 null",
      "sentimentScore": -100 到 100 的数字,
      "impactScore": 0 到 100 的数字,
      "riskScore": 0 到 100 的数字,
      "policyScore": 0 到 100 的数字,
      "techScore": 0 到 100 的数字,
      "financialScore": 0 到 100 的数字,
      "attentionScore": 0 到 100 的数字,
      "timeHorizon": "short | medium | long | null",
      "factorConfidence": 0 到 100 的数字,
      "factorReason": "中文理由，重要判断尽量对应来源标题",
      "relatedCompanies": ["公司名"],
      "relatedIndustries": ["行业名"]
    }
  ]
}`;
}

function normalizeFactor(raw: Record<string, unknown>, item: FactorInfoItemInput): ItemFactorResult {
  return {
    infoItemId: item.id,
    eventType: typeof raw.eventType === "string" && raw.eventType.trim() ? raw.eventType.trim() : null,
    eventSubtype: typeof raw.eventSubtype === "string" && raw.eventSubtype.trim() ? raw.eventSubtype.trim() : null,
    sentimentScore: clamp(raw.sentimentScore, -100, 100),
    impactScore: clamp(raw.impactScore),
    riskScore: clamp(raw.riskScore),
    policyScore: clamp(raw.policyScore),
    techScore: clamp(raw.techScore),
    financialScore: clamp(raw.financialScore),
    attentionScore: clamp(raw.attentionScore),
    timeHorizon: typeof raw.timeHorizon === "string" && raw.timeHorizon.trim() ? raw.timeHorizon.trim() : null,
    factorConfidence: clamp(raw.factorConfidence),
    factorReason:
      typeof raw.factorReason === "string" && raw.factorReason.trim()
        ? raw.factorReason.trim()
        : "现有来源不足以判断。",
    relatedCompanies: toStringArray(raw.relatedCompanies),
    relatedIndustries: toStringArray(raw.relatedIndustries)
  };
}

export class DeepSeekFactorProvider implements FactorProvider {
  name = "deepseek" as const;

  async analyze(input: FactorAnalyzeInput): Promise<FactorAnalyzeResult> {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com",
      timeout: Number(process.env.DEEPSEEK_TIMEOUT_MS || 30000),
      maxRetries: 1
    });

    const completion = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages: [
        {
          role: "system",
          content:
            "你是中文公开信息因子分析助手。你只做结构化研究辅助，不提供投资建议、价格预测或交易执行结论。必须严格输出 JSON。"
        },
        {
          role: "user",
          content: buildPrompt(input)
        }
      ],
      temperature: 0,
      response_format: {
        type: "json_object"
      }
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("DeepSeek returned empty factor analysis");
    }

    const parsed = JSON.parse(extractJson(content)) as { itemFactors?: Array<Record<string, unknown>> };

    if (!Array.isArray(parsed.itemFactors) || parsed.itemFactors.length === 0) {
      throw new Error("DeepSeek factor analysis returned invalid JSON shape");
    }

    const itemFactors = input.infoItems.map((item) => {
      const raw = parsed.itemFactors?.find((factor) => factor.infoItemId === item.id);

      if (!raw) {
        throw new Error(`DeepSeek factor analysis missed item ${item.id}`);
      }

      return normalizeFactor(raw, item);
    });

    return {
      provider: this.name,
      itemFactors,
      dailySignal: buildDailySignal(input, itemFactors)
    };
  }
}
