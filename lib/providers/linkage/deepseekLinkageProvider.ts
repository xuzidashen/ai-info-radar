import OpenAI from "openai";

import { buildLinkageMarkdown } from "@/lib/templates/linkageTemplates";
import type { LinkageAnalyzeInput, LinkageAnalyzeResult, LinkagePath, LinkageProvider } from "@/lib/providers/linkage/types";

function extractJson(content: string) {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fenced ? fenced[1] : trimmed;
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

function buildPrompt(input: LinkageAnalyzeInput) {
  return `主题：
${JSON.stringify(input.topic, null, 2)}

模块：
${JSON.stringify(input.modules, null, 2)}

模块关系：
${JSON.stringify(input.edges, null, 2)}

你是产业链联动分析助手。你只能根据输入的模块、关系和搜索结果做联动分析。
不能编造不存在的公司、订单、政策或结论。

需要分析：
1. 上游发生了什么。
2. 中游可能受到什么影响。
3. 下游可能受到什么影响。
4. 哪些影响路径有证据支持。
5. 哪些只是推测，需要人工复核。
6. 联动强度。
7. 风险断点。
8. 不确定性。

必须避免：
- 具体交易方向
- 具体价格预测
- 确定性涨跌结论
- 交易执行指令

只输出 JSON，不要 Markdown，不要额外解释。结构：
{
  "title": "中文标题",
  "linkageScore": 0-100,
  "riskScore": 0-100,
  "confidence": 0-100,
  "keyPaths": [
    {
      "from": "模块名",
      "to": "模块名",
      "relationType": "关系类型",
      "impact": "中文影响说明",
      "strength": 0-100,
      "evidence": ["来源标题或明确证据"]
    }
  ],
  "assumptions": ["需要人工复核的假设"],
  "warnings": ["风险断点或不确定性"],
  "moduleOverview": "中文模块概览",
  "sources": "Markdown 来源列表"
}`;
}

function normalizePath(raw: Record<string, unknown>): LinkagePath {
  return {
    from: typeof raw.from === "string" ? raw.from : "未知模块",
    to: typeof raw.to === "string" ? raw.to : "未知模块",
    relationType: typeof raw.relationType === "string" ? raw.relationType : "other",
    impact: typeof raw.impact === "string" ? raw.impact : "现有来源不足以判断。",
    strength: clamp(raw.strength),
    evidence: toStringArray(raw.evidence)
  };
}

export class DeepSeekLinkageProvider implements LinkageProvider {
  name = "deepseek" as const;

  async analyze(input: LinkageAnalyzeInput): Promise<LinkageAnalyzeResult> {
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
          content:
            "你是中文产业链联动分析助手。只基于输入材料分析，不提供投资建议、价格预测、买卖指令或交易执行结论。必须输出严格 JSON。"
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
      throw new Error("DeepSeek returned empty linkage analysis");
    }

    const parsed = JSON.parse(extractJson(content)) as Record<string, unknown>;
    const keyPaths = Array.isArray(parsed.keyPaths)
      ? parsed.keyPaths.map((item) => normalizePath(item as Record<string, unknown>))
      : [];
    const title = typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : `${input.topic.name} 联动分析报告`;
    const assumptions = toStringArray(parsed.assumptions);
    const warnings = toStringArray(parsed.warnings);
    const moduleOverview = typeof parsed.moduleOverview === "string" ? parsed.moduleOverview : "现有来源不足以形成完整模块概览。";
    const sources = typeof parsed.sources === "string" ? parsed.sources : "";

    return {
      title,
      markdown: buildLinkageMarkdown({
        title,
        moduleOverview,
        keyPaths: keyPaths.map((path) => `- ${path.from} → ${path.to}：${path.impact}`).join("\n") || "暂无明确路径。",
        assumptions: assumptions.map((item) => `- ${item}`).join("\n") || "- 现有来源不足以判断。",
        warnings: warnings.map((item) => `- ${item}`).join("\n") || "- 需要人工复核。",
        sources
      }),
      linkageScore: clamp(parsed.linkageScore),
      riskScore: clamp(parsed.riskScore),
      confidence: clamp(parsed.confidence),
      keyPaths,
      assumptions,
      warnings,
      provider: this.name,
      fallbackUsed: false
    };
  }
}
