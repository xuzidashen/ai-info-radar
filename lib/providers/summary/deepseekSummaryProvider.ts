import OpenAI from "openai";

import { categoryLabels } from "@/lib/types";
import type { GeneratedSummary, SummaryProvider, SummaryProviderInput } from "@/lib/providers/summary/types";

const sectionRules = {
  finance: "【今日新增信息】\n【核心变化】\n【短期影响】\n【长期影响】\n【风险提示】\n【来源摘要】\n【免责声明】",
  policy: "【事件背景】\n【政策要点】\n【申论可用角度】\n【官方表达】\n【可积累素材】\n【来源摘要】",
  "ai-tech": "【最新更新】\n【功能变化】\n【对普通用户的影响】\n【对开发者的影响】\n【是否值得关注】\n【来源摘要】",
  study: "【资料变化】\n【任务提醒】\n【可执行动作】\n【风险点】\n【下一步建议】",
  custom: "【信息概览】\n【重要变化】\n【可能影响】\n【风险点】\n【下一步建议】\n【来源摘要】"
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "未知";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "未知" : date.toISOString();
}

function buildPrompt(input: SummaryProviderInput) {
  const { keyword, infoItems } = input;
  const sources = infoItems
    .map(
      (item, index) => `${index + 1}. 标题：${item.title}
   来源：${item.source}
   可信度：${item.credibilityLabel ?? "unknown"} (${item.credibilityScore ?? "未知"})，${item.credibilityReason ?? "无说明"}
   发布时间：${formatDate(item.publishedAt)}
   摘要：${item.summary}
   URL：${item.url}`
    )
    .join("\n\n");

  return `关键词：${keyword.name}
分类：${categoryLabels[keyword.category]}
搜索结果数量：${infoItems.length}
用户备注：${keyword.description || "无"}

搜索结果列表：
${sources}

请基于上面的搜索结果生成中文结构化总结。
必须使用以下小节，且小节标题必须原样保留：
${sectionRules[keyword.category]}

要求：
1. 只基于给定搜索结果总结。
2. 不要编造没有出现的事实。
3. 不要编造来源。
4. 如果信息不足，要明确写“现有来源不足以判断”。
5. 财经类不能给具体交易方向、价格预测或交易执行指令；最后必须写“以上内容仅为公开信息整理和辅助研究，不构成投资建议。”
6. 输出中文结构化总结。
7. 每个重要判断尽量对应来源标题。`;
}

export class DeepSeekSummaryProvider implements SummaryProvider {
  name = "deepseek" as const;

  async generate(input: SummaryProviderInput): Promise<GeneratedSummary> {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com"
    });

    const completion = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages: [
        {
          role: "system",
          content: "你是中文信息分析助手。你只基于用户提供的搜索结果总结，不输出投资买卖建议。"
        },
        {
          role: "user",
          content: buildPrompt(input)
        }
      ],
      temperature: 0.25
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("DeepSeek returned empty summary");
    }

    return {
      provider: this.name,
      content
    };
  }
}
