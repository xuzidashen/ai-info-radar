import { prisma } from "@/lib/prisma";
import { serializeZoneReport } from "@/lib/serializers";
import { createNotification } from "@/lib/services/notificationService";
import type { ZoneReportType } from "@/lib/types";

export const researchDisclaimer = "以上内容仅为公开信息整理和辅助研究，不构成投资建议。";

export function withDisclaimer(markdown: string, enabled = false) {
  if (!enabled) {
    return markdown;
  }

  if (markdown.includes(researchDisclaimer)) {
    return markdown;
  }

  return `${markdown.trim()}\n\n【免责声明】\n${researchDisclaimer}\n`;
}

export function buildReportMarkdown(input: {
  title: string;
  summary: string;
  sources?: Array<{
    title: string;
    source: string;
    url: string;
  }>;
  extraSections?: Array<{
    title: string;
    body: string;
  }>;
  disclaimer?: boolean;
}) {
  const sources = input.sources?.length
    ? input.sources.map((source, index) => `${index + 1}. [${source.title}](${source.url}) - ${source.source}`).join("\n")
    : "暂无来源。";
  const extra = input.extraSections?.length
    ? input.extraSections.map((section) => `\n【${section.title}】\n${section.body}`).join("\n")
    : "";

  return withDisclaimer(
    `# ${input.title}

【核心摘要】
${input.summary}
${extra}

【来源列表】
${sources}
`,
    input.disclaimer
  );
}

export async function createZoneReport(input: {
  zoneId: string;
  runLogId?: string | null;
  title: string;
  type: ZoneReportType;
  markdown: string;
  summary?: string | null;
  metadata?: unknown;
}) {
  const report = await prisma.zoneReport.create({
    data: {
      zoneId: input.zoneId,
      runLogId: input.runLogId ?? null,
      title: input.title,
      type: input.type,
      markdown: input.markdown,
      summary: input.summary ?? null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null
    }
  });

  const serialized = serializeZoneReport(report);

  await createNotification({
    type: "report_generated",
    title: "报告已生成",
    message: input.title,
    severity: "success",
    zoneId: input.zoneId,
    runLogId: input.runLogId ?? null,
    reportId: serialized.id
  });

  return serialized;
}

export async function listZoneReports(zoneId: string) {
  const reports = await prisma.zoneReport.findMany({
    where: { zoneId },
    orderBy: { createdAt: "desc" }
  });

  return reports.map(serializeZoneReport);
}

export async function getZoneReport(zoneId: string, reportId: string) {
  const report = await prisma.zoneReport.findFirst({
    where: {
      id: reportId,
      zoneId
    }
  });

  return report ? serializeZoneReport(report) : null;
}
