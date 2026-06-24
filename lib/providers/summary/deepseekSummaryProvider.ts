import OpenAI from "openai";

import { categoryLabels } from "@/lib/types";
import type { GeneratedSummary, SummaryProvider, SummaryProviderInput } from "@/lib/providers/summary/types";
import { parseStructuredSummary, serializeStructuredSummary } from "@/lib/utils/summaryParser";

const MAX_SOURCES = 5;
const MAX_SUMMARY_LENGTH = 520;
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
  const prompt = `请基于给定来源，为用户关注主题生成简洁中文情报卡。

主题：${truncate(input.keyword.name, 120)}
分类：${categoryLabels[input.keyword.category]}
用户备注：${truncate(input.keyword.description, 400) || "无"}
来源数据：${JSON.stringify(sources)}

只输出合法 JSON，不要输出 Markdown、代码块或额外解释。JSON 结构必须是：
{
  "overview": "不超过 80 个汉字的一句话结论",
  "keyChanges": [{"title":"重要变化","detail":"不超过 60 个汉字的说明","confidence":"high | medium | low"}],
  "whyItMatters": ["为什么值得关注，不超过 60 个汉字"],
  "risks": ["风险或不确定性，不超过 60 个汉字"],
  "sourceNotes": [{"source":"来源名称","note":"该来源提供了什么信息","url":"来源 URL"}]
}

规则：
1. 只使用给定来源，不编造事实、数字、来源或链接。
2. keyChanges 最多 3 条，whyItMatters 最多 3 条，risks 最多 3 条，sourceNotes 最多 5 条。
3. 不要输出“好的，这是”等开场白，不要使用 Markdown、###、**、项目符号原始符号。
4. 不要长篇作文，每条都要短，像产品里的情报卡文案。
5. 信息不足时明确写“信息不足，需要人工复核”。
6. 财经主题只做公开信息整理，risks 中必须包含“不构成投资建议”。
7. sourceNotes 单独说明来源贡献，正文不要出现“来源4、来源6”等引用编号。
8. 每个重要判断尽量对应来源标题，但不要编造未出现的标题。`;

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
          content: "你是严谨的中文信息分析助手。输出必须是合法 JSON，只基于给定来源，写成简短情报卡，不提供投资交易建议。"
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
