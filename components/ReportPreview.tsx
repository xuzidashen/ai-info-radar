"use client";

import { useState } from "react";
import { Check, ChevronDown, Copy, FileText } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { useToast } from "@/components/ui/Toast";
import type { ZoneReportDTO } from "@/lib/types";

const reportTypeLabels: Record<ZoneReportDTO["type"], string> = {
  daily: "日报",
  topic: "Topic 报告",
  linkage: "联动报告",
  custom: "自定义"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function ReportPreview({
  report,
  compact = false,
  zoneName
}: {
  report: ZoneReportDTO;
  compact?: boolean;
  zoneName?: string;
}) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(report.markdown);
      setCopied(true);
      showToast({ tone: "success", title: "报告已复制", description: "Markdown 内容已写入剪贴板。" });
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      showToast({ tone: "error", title: "复制失败", description: "请检查浏览器剪贴板权限后重试。" });
    }
  }

  return (
    <article className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={report.type === "linkage" ? "danger" : report.type === "topic" ? "info" : "neutral"}>
              <FileText className="h-3.5 w-3.5" />
              {reportTypeLabels[report.type]}
            </StatusPill>
            {zoneName ? <StatusPill>{zoneName}</StatusPill> : null}
            <time className="text-xs font-bold text-slate-400" dateTime={report.createdAt}>
              {formatDate(report.createdAt)}
            </time>
          </div>
          <h3 className="mt-3 text-lg font-black leading-7 text-slate-950">{report.title}</h3>
          {report.summary ? <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-7 text-slate-600">{report.summary}</p> : null}
        </div>

        <ActionButton type="button" variant={copied ? "success" : "secondary"} size="sm" onClick={() => void copyMarkdown()}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "已复制" : "复制 Markdown"}
        </ActionButton>
      </div>

      {!compact ? (
        <details className="group mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-slate-950">
            <span>查看报告正文</span>
            <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
          </summary>
          <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap text-sm leading-7 text-slate-600">{report.markdown}</pre>
        </details>
      ) : null}
    </article>
  );
}
