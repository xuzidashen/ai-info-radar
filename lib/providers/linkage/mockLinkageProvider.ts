import { buildLinkageMarkdown } from "@/lib/templates/linkageTemplates";
import type { LinkageAnalyzeInput, LinkageAnalyzeResult, LinkagePath, LinkageProvider } from "@/lib/providers/linkage/types";

function moduleName(input: LinkageAnalyzeInput, id: string) {
  return input.modules.find((module) => module.id === id)?.name ?? "未知模块";
}

function evidenceFor(input: LinkageAnalyzeInput, moduleId: string) {
  const module = input.modules.find((item) => item.id === moduleId);
  return (module?.searchResults ?? []).slice(0, 2).map((result) => `${result.source}：${result.title}`);
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (valid.length === 0) {
    return 45;
  }
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

export class MockLinkageProvider implements LinkageProvider {
  name = "mock" as const;

  async analyze(input: LinkageAnalyzeInput): Promise<LinkageAnalyzeResult> {
    const keyPaths: LinkagePath[] = input.edges.map((edge) => {
      const from = moduleName(input, edge.from);
      const to = moduleName(input, edge.to);
      const strength = Math.round((edge.strength ?? 0.55) * 100);
      const evidence = [...evidenceFor(input, edge.from), ...evidenceFor(input, edge.to)].slice(0, 4);

      return {
        from,
        to,
        relationType: edge.relationType,
        strength,
        impact: `${from} 的变化可能通过“${edge.relationType}”影响 ${to}，当前强度约 ${strength}。`,
        evidence: evidence.length > 0 ? evidence : ["现有来源不足，需要人工复核。"]
      };
    });

    const moduleOverview = input.modules
      .map((module) => `- ${module.name}（${module.role}）：${module.description || "暂无描述"}`)
      .join("\n");
    const pathText =
      keyPaths.length > 0
        ? keyPaths.map((path) => `- ${path.from} → ${path.to}：${path.impact}`).join("\n")
        : "尚未配置模块关系，无法形成明确联动路径。";
    const assumptions = [
      "搜索结果可能存在延迟，需要结合官方公告和高可信来源复核。",
      "模块间关系强度来自配置和公开信息启发式估算，不代表确定性传导。"
    ];
    const warnings = [
      "缺少明确订单、产能或政策原文时，不能得出强结论。",
      "财经/行业主题仅做辅助研究，不构成投资建议。"
    ];
    const sources = input.modules
      .flatMap((module) => module.searchResults ?? [])
      .slice(0, 8)
      .map((result, index) => `${index + 1}. [${result.title}](${result.url}) - ${result.source}`)
      .join("\n");
    const linkageScore = Math.min(95, Math.max(20, average(keyPaths.map((path) => path.strength))));
    const riskScore = Math.min(90, Math.max(20, 100 - linkageScore + (input.modules.length < 3 ? 18 : 6)));
    const confidence = Math.min(88, Math.max(35, 42 + keyPaths.length * 8 + input.modules.length * 5));
    const title = `${input.topic.name} 联动分析报告`;

    return {
      title,
      markdown: buildLinkageMarkdown({
        title,
        moduleOverview,
        keyPaths: pathText,
        assumptions: assumptions.map((item) => `- ${item}`).join("\n"),
        warnings: warnings.map((item) => `- ${item}`).join("\n"),
        sources
      }),
      linkageScore,
      riskScore,
      confidence,
      keyPaths,
      assumptions,
      warnings,
      provider: this.name,
      fallbackUsed: false
    };
  }
}

