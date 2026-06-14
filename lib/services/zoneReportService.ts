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
    score?: number | null;
    scoreReason?: string | null;
    tags?: string[];
    summary?: string | null;
  }>;
  extraSections?: Array<{
    title: string;
    body: string;
  }>;
  followUp?: string;
  disclaimer?: boolean;
}) {
  const highScoreItems = input.sources?.filter((source) => typeof source.score === "number" && source.score >= 7.5) ?? [];
  const highScoreText = highScoreItems.length
    ? highScoreItems
        .map((source, index) => {
          const tags = source.tags?.length ? `\n   标签：${source.tags.join("、")}` : "";
          const reason = source.scoreReason ? `\n   评分理由：${source.scoreReason}` : "";
          const summary = source.summary ? `\n   摘要：${source.summary}` : "";
          return `${index + 1}. [${source.title}](${source.url}) - ${source.source}｜评分 ${source.score?.toFixed(1)}/10${tags}${reason}${summary}`;
        })
        .join("\n")
    : "暂无 7.5 分以上信息，建议继续积累来源。";
  const sources = input.sources?.length
    ? input.sources
        .map((source, index) => {
          const score = typeof source.score === "number" ? `｜评分 ${source.score.toFixed(1)}/10` : "";
          return `${index + 1}. [${source.title}](${source.url}) - ${source.source}${score}`;
        })
        .join("\n")
    : "暂无来源。";
  const extra = input.extraSections?.length
    ? input.extraSections.map((section) => `\n### ${section.title}\n${section.body}`).join("\n")
    : "现有来源暂无额外背景。";

  return withDisclaimer(
    `# ${input.title}

## 1. 今日重点
${input.summary}

## 2. 高分信息
${highScoreText}

## 3. 背景补充
${extra}

## 4. 来源列表
${sources}

## 5. 后续关注
${input.followUp ?? "继续跟踪高可信来源、官方公告和后续更新；信息不足时不要扩展出未出现的事实。"}
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
