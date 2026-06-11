"use client";

import Link from "next/link";
import { Check, Copy, ExternalLink, FileText, Heart } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

import { ActionButton } from "@/components/ui/ActionButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { useToast } from "@/components/ui/Toast";
import type { ReportTagDTO, ZoneReportDTO, ZoneType } from "@/lib/types";

export type ReportLibraryItem = ZoneReportDTO & {
  zone?: {
    id: string;
    name: string;
    type: ZoneType | string;
  };
  tags?: ReportTagDTO[];
};

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

export function ReportLibraryCard({
  report,
  compact = false,
  actions
}: {
  report: ReportLibraryItem;
  compact?: boolean;
  actions?: ReactNode;
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
    <article className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.07)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={report.type === "linkage" ? "danger" : report.type === "topic" ? "info" : "neutral"}>
              <FileText className="h-3.5 w-3.5" />
              {reportTypeLabels[report.type]}
            </StatusPill>
            {report.zone ? <StatusPill tone="neutral">{report.zone.name}</StatusPill> : null}
            {report.favorite ? (
              <StatusPill tone="warning">
                <Heart className="h-3.5 w-3.5 fill-current" />
                收藏
              </StatusPill>
            ) : null}
          </div>
          <h3 className="mt-3 text-lg font-black leading-7 text-slate-950">{report.title}</h3>
          {report.summary ? <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-7 text-slate-600">{report.summary}</p> : null}
          <time className="mt-3 block text-xs font-bold text-slate-400" dateTime={report.createdAt}>
            {formatDate(report.createdAt)}
          </time>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton type="button" variant={copied ? "success" : "secondary"} size="sm" onClick={() => void copyMarkdown()}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "已复制" : "复制"}
          </ActionButton>
          <ActionButton href={`/reports/${report.id}`} variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
            详情
          </ActionButton>
        </div>
      </div>
      {report.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {report.tags.map((tag) => (
            <StatusPill key={tag.id} tone="neutral">{tag.name}</StatusPill>
          ))}
        </div>
      ) : null}
      {!compact && actions ? <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200/70 pt-4">{actions}</div> : null}
      {!compact ? (
        <Link href={`/reports/${report.id}`} className="mt-4 inline-flex text-sm font-black text-sky-700 hover:text-sky-900">
          查看完整 Markdown
        </Link>
      ) : null}
    </article>
  );
}
