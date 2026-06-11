import type { LinkageModuleDTO } from "@/lib/types";

export const linkageDisclaimer =
  "以上内容仅为公开信息整理和辅助研究，不构成投资建议。联动路径中的推测需要人工复核。";

export function buildIndustryChainMarkdown(modules: LinkageModuleDTO[]) {
  const upstream = modules.filter((module) => module.role === "upstream");
  const midstream = modules.filter((module) => module.role === "midstream" || module.role === "technology");
  const downstream = modules.filter((module) => module.role === "downstream" || module.role === "market");
  const other = modules.filter(
    (module) => !["upstream", "midstream", "technology", "downstream", "market"].includes(module.role)
  );

  return [
    `上游：${upstream.map((module) => module.name).join("、") || "未配置"}`,
    `中游：${midstream.map((module) => module.name).join("、") || "未配置"}`,
    `下游/市场：${downstream.map((module) => module.name).join("、") || "未配置"}`,
    other.length > 0 ? `其他：${other.map((module) => module.name).join("、")}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildLinkageMarkdown(input: {
  title: string;
  moduleOverview: string;
  keyPaths: string;
  assumptions: string;
  warnings: string;
  sources?: string;
}) {
  return `# ${input.title}

【模块概览】
${input.moduleOverview}

【关键联动路径】
${input.keyPaths}

【上游变化】
现有来源用于识别上游变化方向，若证据不足，应标记为需要人工复核。

【中游传导】
中游传导需要结合模块关系、搜索结果和边强度判断。

【下游影响】
下游影响仅作为公开信息线索，不做确定性预测。

【证据支持】
${input.sources || "现有来源不足以形成完整证据链。"}

【假设与不确定性】
${input.assumptions}

【风险断点】
${input.warnings}

【来源列表】
${input.sources || "暂无来源。"}

【免责声明】
${linkageDisclaimer}
`;
}

