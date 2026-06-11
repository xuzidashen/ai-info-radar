import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { notFound } from "next/navigation";

import { RetryRunButton } from "@/components/RetryRunButton";
import { ZoneReportCard } from "@/components/ZoneReportCard";
import { AppContainer } from "@/components/ui/AppContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { getRunLogDetail } from "@/lib/services/runLogService";
import { getRetryPolicyForRunLog } from "@/lib/services/retryPolicyService";
import { qualityLabelText, topicRunStatusLabels, type TopicRunStatus } from "@/lib/types";

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

function statusTone(status: TopicRunStatus) {
  if (status === "success") {
    return "success" as const;
  }
  if (status === "failed") {
    return "danger" as const;
  }
  if (status === "fallback" || status === "partial_success") {
    return "warning" as const;
  }
  return "info" as const;
}

function metadataText(value: string | null) {
  if (!value) {
    return "暂无 metadata";
  }

  try {
    return JSON.stringify(JSON.parse(value) as unknown, null, 2);
  } catch {
    return value;
  }
}

export default async function RunDetailPage({ params }: PageProps) {
  const { id } = await params;
  const log = await getRunLogDetail(id);

  if (!log) {
    notFound();
  }

  const retryPolicy = await getRetryPolicyForRunLog(log);

  return (
    <AppContainer size="xl">
      <div>
        <Link href="/runs" className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-sky-700">
          <ArrowLeft className="h-4 w-4" />
          返回运行日志
        </Link>
      </div>

      <PageHeader
        eyebrow="Run Detail"
        title={log.topic?.name ?? "运行日志详情"}
        subtitle={`${log.zone?.name ?? "未知专区"} / ${formatDate(log.startedAt)} / ${log.triggerType}`}
        meta={
          <>
            <StatusPill tone={statusTone(log.status)}>{topicRunStatusLabels[log.status]}</StatusPill>
            <StatusPill>{log.runType}</StatusPill>
            {log.qualityLabel ? <StatusPill tone={log.qualityLabel === "poor" ? "danger" : log.qualityLabel === "warning" ? "warning" : "success"}>{qualityLabelText[log.qualityLabel]}</StatusPill> : null}
          </>
        }
        actions={log.topicId && retryPolicy.canRetry ? <RetryRunButton runId={log.id} /> : null}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="质量分" value={log.qualityScore ?? "未知"} description={log.qualityReason ?? "暂无质量说明"} />
        <MetricCard label="耗时" value={log.durationMs ? `${log.durationMs}ms` : "运行中"} />
        <MetricCard label="Raw" value={log.rawResultCount} />
        <MetricCard label="Deduped" value={log.dedupedCount} />
        <MetricCard label="Saved" value={log.savedItemCount} />
      </section>

      <SectionCard title="重试策略" description="失败或 fallback 运行可以手动重试；配置错误和超过次数限制时不建议重试。">
        <div className="grid gap-3 md:grid-cols-4">
          <InfoLine label="是否可重试" value={retryPolicy.canRetry ? "可以" : "不建议"} />
          <InfoLine label="已重试次数" value={`${retryPolicy.retryCount}/${retryPolicy.maxRetries}`} />
          <InfoLine label="触发状态允许" value={retryPolicy.statusAllowsRetry ? "是" : "否"} />
          <InfoLine label="重试建议" value={retryPolicy.recommendedDelay} />
        </div>
        <p className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4 text-sm font-bold leading-6 text-slate-600">{retryPolicy.reason}</p>
      </SectionCard>

      <section className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="Provider 信息" description="本次运行实际使用的 provider 与 fallback 状态。">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoLine label="Search" value={log.searchProvider ?? "未使用"} />
            <InfoLine label="Summary" value={log.summaryProvider ?? "未使用"} />
            <InfoLine label="Factor" value={log.factorProvider ?? "未使用"} />
            <InfoLine label="Linkage" value={log.linkageProvider ?? "未使用"} />
            <InfoLine label="Fallback" value={log.fallbackUsed ? "是" : "否"} />
            <InfoLine label="Report Count" value={String(log.reportCount)} />
          </div>
        </SectionCard>

        <SectionCard title="错误信息" description="失败或 fallback 时优先查看这里。">
          {log.errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold leading-6 text-rose-700">
              {log.errorMessage}
            </div>
          ) : (
            <EmptyState title="暂无错误" description="本次运行没有记录错误信息。" />
          )}
        </SectionCard>
      </section>

      <SectionCard title="Metadata" description="调度 ID、重试来源、keywordId 等扩展追踪字段。">
        <pre className="max-h-[26rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4 text-sm leading-7 text-slate-600">
          {metadataText(log.metadata)}
        </pre>
      </SectionCard>

      <SectionCard title="相关报告" description="本次运行直接生成的报告。">
        {log.reports?.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {log.reports.map((report) => (
              <div key={report.id} className="space-y-3">
                <ZoneReportCard report={report} compact zoneName={log.zone?.name ?? undefined} />
                <Link href={`/reports/${report.id}`} className="inline-flex items-center gap-2 text-sm font-black text-sky-700 hover:text-sky-900">
                  <FileText className="h-4 w-4" />
                  查看报告详情
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="暂无关联报告" description="失败运行或纯调试运行可能不会生成报告。" />
        )}
      </SectionCard>
    </AppContainer>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 break-words font-black text-slate-950">{value}</p>
    </div>
  );
}
