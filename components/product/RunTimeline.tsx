import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, RefreshCw } from "lucide-react";

import { RetryRunButton } from "@/components/RetryRunButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { runStatusTone } from "@/lib/design/status";
import { qualityLabelText, topicRunStatusLabels, type TopicRunLogDTO } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function pipelineLabels(metadata: string | null) {
  if (!metadata) {
    return [];
  }

  try {
    const parsed = JSON.parse(metadata) as { pipelineStages?: Array<{ stage?: unknown; status?: unknown }> };
    return Array.isArray(parsed.pipelineStages)
      ? parsed.pipelineStages
          .map((stage) => ({
            stage: typeof stage.stage === "string" ? stage.stage : "",
            status: typeof stage.status === "string" ? stage.status : ""
          }))
          .filter((stage) => stage.stage)
      : [];
  } catch {
    return [];
  }
}

export function RunTimeline({ logs }: { logs: TopicRunLogDTO[] }) {
  if (!logs.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-8 text-center">
        <Clock3 className="mx-auto h-6 w-6 text-sky-700" />
        <h3 className="mt-3 text-lg font-black text-slate-950">暂无运行记录</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">运行任意 Topic 后，这里会形成时间线。</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-slate-200">
      {logs.map((log) => (
        <article key={log.id} className="relative pl-12">
          <div className="absolute left-0 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
            {log.status === "success" ? <CheckCircle2 className="h-4 w-4" /> : log.status === "failed" ? <AlertTriangle className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
          </div>
          <div className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.07)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={runStatusTone(log.status)}>{topicRunStatusLabels[log.status]}</StatusPill>
                  <StatusPill>{log.runType}</StatusPill>
                  <StatusPill>{log.triggerType}</StatusPill>
                  {log.fallbackUsed ? <StatusPill tone="warning">fallback</StatusPill> : null}
                  {log.qualityLabel ? <StatusPill tone={log.qualityLabel === "poor" ? "danger" : log.qualityLabel === "warning" ? "warning" : "success"}>{qualityLabelText[log.qualityLabel]}</StatusPill> : null}
                </div>
                <h3 className="mt-3 text-lg font-black text-slate-950">{log.topic?.name ?? "未知 Topic"}</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">{log.zone?.name ?? "未知专区"} / {formatDate(log.startedAt)}</p>
                {pipelineLabels(log.metadata).length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pipelineLabels(log.metadata).map((stage) => (
                      <span
                        key={`${log.id}-${stage.stage}`}
                        className={`rounded-full border px-2 py-1 text-[11px] font-black ${
                          stage.status === "skipped" ? "border-slate-200 bg-slate-50 text-slate-500" : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {stage.stage}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-4 xl:w-[34rem]">
                <Metric label="耗时" value={log.durationMs ? `${log.durationMs}ms` : "运行中"} />
                <Metric label="raw" value={log.rawResultCount} />
                <Metric label="saved" value={log.savedItemCount} />
                <Metric label="报告" value={log.reportCount} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/runs/${log.id}`} className="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-sky-200 hover:text-sky-700">
                  详情
                </Link>
                {log.topicId ? <RetryRunButton runId={log.id} compact /> : null}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-2">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 font-black text-slate-950">{value}</p>
    </div>
  );
}
