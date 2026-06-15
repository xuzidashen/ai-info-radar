"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, FileText, History, Play } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { useToast } from "@/components/ui/Toast";

export function TopicRunButton({
  zoneId,
  topicId,
  compact = false,
  label,
  onDone
}: {
  zoneId: string;
  topicId: string;
  compact?: boolean;
  label?: string;
  onDone?: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    infoItemCount: number;
    reportCount: number;
    reportId?: string;
    runLogId?: string;
  } | null>(null);
  const { showToast } = useToast();

  async function runTopic() {
    setRunning(true);
    setDone(false);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/zones/${zoneId}/topics/${topicId}/run`, {
        method: "POST"
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        infoItems?: unknown[];
        report?: { id?: string } | null;
        runLog?: {
          id?: string;
          savedItemCount?: number;
          reportCount?: number;
          status?: string;
        };
      };

      if (!response.ok) {
        throw new Error(data.error || "运行 Topic 失败");
      }

      setDone(true);
      const infoItemCount = data.runLog?.savedItemCount ?? data.infoItems?.length ?? 0;
      const reportCount = data.runLog?.reportCount ?? (data.report ? 1 : 0);
      setResult({
        infoItemCount,
        reportCount,
        reportId: data.report?.id,
        runLogId: data.runLog?.id
      });
      showToast({ tone: "success", title: "运行已完成", description: `新增 ${infoItemCount} 条信息，生成 ${reportCount} 份报告。` });
      onDone?.();
      window.setTimeout(() => setDone(false), 2200);
    } catch (runError) {
      const message = runError instanceof Error ? runError.message : "运行 Topic 失败";
      setError(message);
      showToast({ tone: "error", title: "Topic 运行失败", description: message });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex w-full max-w-full flex-col items-start gap-2">
      <ActionButton
        type="button"
        disabled={running}
        loading={running}
        onClick={() => void runTopic()}
        variant={done ? "success" : "primary"}
        size={compact ? "sm" : "lg"}
        className={compact ? "" : "w-full sm:w-auto"}
      >
        {done ? <Check className="h-4 w-4" /> : running ? null : <Play className="h-4 w-4" />}
        {running ? "运行中" : done ? "已完成" : label ?? (compact ? "运行" : "运行一次")}
      </ActionButton>
      {running ? (
        <div className="w-full max-w-sm rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold leading-5 text-sky-800">
          正在执行 search / dedupe / score / summarize / report，请稍等。
        </div>
      ) : null}
      {result ? (
        <div className="w-full max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-800">
          <p>已生成 {result.infoItemCount} 条信息，{result.reportCount} 份报告。</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.reportId ? (
              <Link href={`/reports/${result.reportId}`} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-emerald-700">
                <FileText className="h-3.5 w-3.5" />
                查看报告
              </Link>
            ) : null}
            {result.runLogId ? (
              <Link href={`/runs/${result.runLogId}`} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-emerald-700">
                <History className="h-3.5 w-3.5" />
                查看日志
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
      {error ? <p className="max-w-72 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold leading-5 text-rose-700">{error}</p> : null}
    </div>
  );
}
