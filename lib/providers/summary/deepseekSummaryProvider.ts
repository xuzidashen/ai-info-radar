import OpenAI from "openai";

import { categoryLabels } from "@/lib/types";
import type { GeneratedSummary, SummaryProvider, SummaryProviderInput } from "@/lib/providers/summary/types";
import { parseStructuredSummary, serializeStructuredSummary } from "@/lib/utils/summaryParser";

const MAX_SOURCES = 5;
const MAX_SUMMARY_LENGTH = 700;
const MAX_PROMPT_LENGTH = 12000;

function truncate(value: string | null | undefined, limit: number) {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "未知";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "未知" : date.toISOString();
}

function buildPrompt(input: SummaryProviderInput) {
  const sources = input.infoItems.slice(0, MAX_SOURCES).map((item, index) => ({
    index: index + 1,
    title: truncate(item.title, 180),
    source: truncate(item.source, 120),
    publishedAt: formatDate(item.publishedAt),
    summary: truncate(item.summary, MAX_SUMMARY_LENGTH),
    url: truncate(item.url, 800)
  }));
  const prompt = `请基于给定来源，为用户关注主题生成简洁中文情报摘要。

主题：${truncate(input.keyword.name, 120)}
分类：${categoryLabels[input.keyword.category]}
用户备注：${truncate(input.keyword.description, 400) || "无"}
来源数据：${JSON.stringify(sources)}

只输出合法 JSON，不要输出 Markdown、代码块或额外解释。JSON 结构必须是：
{
  "overview": "不超过 80 个汉字的一句话总览",
  "keyChanges": [{"title":"变化标题","detail":"1-2 句话说明","confidence":"high | medium | low"}],
  "whyItMatters": ["为什么值得关注"],
  "risks": ["风险或不确定性"],
  "sourceNotes": [{"source":"来源名称","note":"该来源提供了什么信息","url":"来源 URL"}]
}

规则：
1. 只使用给定来源，不编造事实、数字、来源或链接。
2. keyChanges 最多 5 条，每条独立表达，不把来源编号混入正文。
3. whyItMatters 最多 4 条，risks 最多 4 条，sourceNotes 最多 5 条。
4. 信息不足时明确写“现有来源不足以判断”。
5. 财经主题只做公开信息整理，risks 中必须包含“不构成投资建议”。
6. sourceNotes 单独说明来源贡献，正文不要出现“来源4、来源6”等引用编号。`;

  return prompt.slice(0, MAX_PROMPT_LENGTH);
}

export class DeepSeekSummaryProvider implements SummaryProvider {
  name = "deepseek" as const;

  async generate(input: SummaryProviderInput): Promise<GeneratedSummary> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not configured");

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
          content: "你是严谨的中文信息分析助手。输出必须是合法 JSON，只基于给定来源，不提供投资交易建议。"
        },
        { role: "user", content: buildPrompt(input) }
      ],
      temperature: 0.15,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) throw new Error("DeepSeek returned empty summary");

    return {
      provider: this.name,
      content: serializeStructuredSummary(parseStructuredSummary(content))
    };
  }
}
