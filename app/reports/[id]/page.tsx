import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";
import { notFound } from "next/navigation";

import { ReportPreview } from "@/components/ReportPreview";
import { ReportFavoriteButton } from "@/components/ReportFavoriteButton";
import { ReportTagManager } from "@/components/ReportTagManager";
import { ActionButton } from "@/components/ui/ActionButton";
import { AppContainer } from "@/components/ui/AppContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { getReportById, listReportTags } from "@/lib/services/reportCenterService";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatMetadata(value: string | null) {
  if (!value) {
    return "暂无 metadata";
  }

  try {
    return JSON.stringify(JSON.parse(value) as unknown, null, 2);
  } catch {
    return value;
  }
}

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [report, tags] = await Promise.all([getReportById(id), listReportTags()]);

  if (!report) {
    notFound();
  }

  return (
    <AppContainer size="lg">
      <div>
        <Link href="/reports" className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-sky-700">
          <ArrowLeft className="h-4 w-4" />
          返回报告中心
        </Link>
      </div>

      <PageHeader
        eyebrow="Report Detail"
        title={report.title}
        subtitle={`${report.zone.name} / ${report.type} / ${formatDate(report.createdAt)}`}
        meta={
          <>
            <StatusPill tone="info">{report.type}</StatusPill>
            <StatusPill tone="neutral">{report.zone.name}</StatusPill>
            {report.runLog ? <StatusPill tone={report.runLog.status === "failed" ? "danger" : "success"}>{report.runLog.status}</StatusPill> : null}
          </>
        }
        actions={
          <>
            <ReportFavoriteButton reportId={report.id} favorite={report.favorite} />
            {report.runLog ? (
              <ActionButton href={`/runs/${report.runLog.id}`} variant="secondary">
                <History className="h-4 w-4" />
                查看运行日志
              </ActionButton>
            ) : null}
          </>
        }
      />

      <ReportPreview report={report} zoneName={report.zone.name} />

      <SectionCard title="收藏与标签" description="用于长期归档、筛选和后续报告包整理。">
        <ReportTagManager reportId={report.id} tags={report.tags} availableTags={tags} />
      </SectionCard>

      <SectionCard title="元数据" description="报告生成时保存的 provider、fallback、topicId 等追踪信息。">
        <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4 text-sm leading-7 text-slate-600">
          {formatMetadata(report.metadata)}
        </pre>
      </SectionCard>
    </AppContainer>
  );
}
