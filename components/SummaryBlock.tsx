"use client";

import { useMemo, useState } from "react";
import { BookOpenText, Check, Clock3, Copy, FileDown } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { useToast } from "@/components/ui/Toast";
import type { InfoItemDTO, SummaryDTO } from "@/lib/types";

type MarkdownContext = {
  keywordName: string;
  categoryLabel: string;
  searchProvider?: string;
  summaryProvider?: string;
  fallbackUsed?: boolean;
  infoItems?: InfoItemDTO[];
};

function parseSections(content: string) {
  const matches = [...content.matchAll(/【([^】]+)】\s*([\s\S]*?)(?=【[^】]+】|$)/g)];

  if (matches.length === 0) {
    return [
      {
        title: "AI 总结",
        body: content
      }
    ];
  }

  return matches.map((match) => ({
    title: match[1],
    body: match[2].trim()
  }));
}

function formatDate(value?: string) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function buildMarkdown(content: string, context?: MarkdownContext, createdAt?: string, provider?: string) {
  const sources = context?.infoItems?.length
    ? context.infoItems
        .map(
          (item, index) =>
            `${index + 1}. [${item.title}](${item.url})\n   - 来源：${item.source}\n   - 搜索 provider：${item.provider}\n   - 可信度：${item.credibilityLabel ?? "unknown"} (${item.credibilityScore ?? "未知"})\n   - 摘要：${item.summary}`
        )
        .join("\n")
    : "暂无来源列表";

  return `# ${context?.keywordName ?? "AI 信息雷达简报"}

- 关键词：${context?.keywordName ?? "未知"}
- 分类：${context?.categoryLabel ?? "未知"}
- 生成时间：${createdAt ?? new Date().toISOString()}
- 搜索 provider：${context?.searchProvider ?? "未知"}
- 总结 provider：${context?.summaryProvider ?? provider ?? "未知"}
- 是否 fallback：${typeof context?.fallbackUsed === "boolean" ? (context.fallbackUsed ? "是" : "否") : "未知"}

## AI 总结

${content}

## 信息来源列表

${sources}
`;
}

export function SummaryBlock({
  summary,
  content,
  provider,
  title = "AI 简报",
  compact = false,
  enableActions = false,
  markdownContext
}: {
  summary?: SummaryDTO;
  content?: string;
  provider?: string;
  title?: string;
  compact?: boolean;
  enableActions?: boolean;
  markdownContext?: MarkdownContext;
}) {
  const source = summary?.content ?? content ?? "";
  const sections = compact ? parseSections(source).slice(0, 3) : parseSections(source);
  const createdAt = formatDate(summary?.createdAt);
  const providerLabel = summary?.provider ?? provider;
  const [copied, setCopied] = useState<"summary" | "markdown" | null>(null);
  const { showToast } = useToast();
  const markdown = useMemo(
    () => buildMarkdown(source, markdownContext, summary?.createdAt, providerLabel),
    [source, markdownContext, summary?.createdAt, providerLabel]
  );

  async function copyText(value: string, type: "summary" | "markdown") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      showToast({
        tone: "success",
        title: type === "summary" ? "简报已复制" : "Markdown 已复制",
        description: "内容已写入剪贴板。"
      });
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      showToast({ tone: "error", title: "复制失败", description: "请检查浏览器剪贴板权限后重试。" });
    }
  }

  return (
    <section className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 border-b border-slate-200/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700">
            <BookOpenText className="h-5 w-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-slate-950">{title}</h2>
              {providerLabel ? (
                <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-black text-sky-700">
                  {providerLabel}
                </span>
              ) : null}
            </div>
            <p className="text-sm text-slate-500">结构化搜索总结</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {createdAt ? (
            <time className="flex items-center gap-1.5 text-sm font-bold text-slate-500" dateTime={summary?.createdAt}>
              <Clock3 className="h-4 w-4" />
              {createdAt}
            </time>
          ) : null}
          {enableActions ? (
            <>
              <ActionButton
                type="button"
                onClick={() => void copyText(source, "summary")}
                variant={copied === "summary" ? "success" : "secondary"}
                size="sm"
              >
                {copied === "summary" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                复制简报
              </ActionButton>
              <ActionButton
                type="button"
                onClick={() => void copyText(markdown, "markdown")}
                variant={copied === "markdown" ? "success" : "secondary"}
                size="sm"
              >
                {copied === "markdown" ? <Check className="h-4 w-4" /> : <FileDown className="h-4 w-4" />}
                导出 Markdown
              </ActionButton>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4">
            <h3 className="text-sm font-black text-sky-700">{section.title}</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{section.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
