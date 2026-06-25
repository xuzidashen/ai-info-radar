import OpenAI from "openai";

import type { GeneratedSummary, SummaryProvider, SummaryProviderInput } from "@/lib/providers/summary/types";
import { buildFactSummaryPrompt } from "@/lib/providers/summary/prompts";
import { parseStructuredSummary, serializeStructuredSummary } from "@/lib/utils/summaryParser";

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
          content: "你是严谨的中文事实情报编辑。输出必须是合法 JSON，只基于给定来源，优先提取可验证事实、关键数字和来源说明；不编造，不给投资交易建议。"
        },
        { role: "user", content: buildFactSummaryPrompt(input) }
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
