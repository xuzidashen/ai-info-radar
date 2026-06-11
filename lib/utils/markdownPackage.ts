import { researchDisclaimer } from "@/lib/services/zoneReportService";
import type { ZoneReportDTO } from "@/lib/types";

type ReportPackageInput = {
  reports: ZoneReportDTO[];
  generatedAt?: Date;
  rangeLabel?: string;
  zoneName?: string | null;
  topicName?: string | null;
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function buildMarkdownPackage({
  reports,
  generatedAt = new Date(),
  rangeLabel = "自定义范围",
  zoneName,
  topicName
}: ReportPackageInput) {
  const toc = reports.length
    ? reports.map((report, index) => `${index + 1}. ${report.title}（${formatDate(report.createdAt)}）`).join("\n")
    : "暂无报告。";

  const body = reports.length
    ? reports
        .map(
          (report, index) => `### 报告 ${index + 1}：${report.title}

- 类型：${report.type}
- 创建时间：${formatDate(report.createdAt)}

${report.markdown.trim()}`
        )
        .join("\n\n---\n\n")
    : "暂无报告正文。";

  return `# AI 信息雷达报告包

生成时间：${formatDate(generatedAt)}
范围：${rangeLabel}
专区：${zoneName ?? "全部"}
Topic：${topicName ?? "全部"}

## 一、报告目录

${toc}

## 二、报告正文

${body}

## 三、来源与说明

本报告包由 AI 信息雷达按筛选条件汇总生成。请结合原始来源、生成时间和上下文人工复核。

## 四、免责声明

${researchDisclaimer}
`;
}
