"use client";

import { CheckCircle, ChatCircleText } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/Toast";

type FeedbackType = "useful" | "inaccurate" | "too_long" | "source_weak";

type FeedbackRecord = {
  targetId: string;
  targetType: "article" | "insight" | "summary" | "report";
  feedbackType: FeedbackType;
  createdAt: string;
};

const STORAGE_KEY = "ai-radar-summary-feedback";

const labels: Record<FeedbackType, string> = {
  useful: "有用",
  inaccurate: "不准确",
  too_long: "太啰嗦",
  source_weak: "来源不足"
};

function readRecords(): FeedbackRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is FeedbackRecord =>
          Boolean(item) &&
          typeof item === "object" &&
          typeof (item as FeedbackRecord).targetId === "string" &&
          typeof (item as FeedbackRecord).feedbackType === "string"
        )
      : [];
  } catch {
    return [];
  }
}

function saveRecord(record: FeedbackRecord) {
  const next = [record, ...readRecords().filter((item) => !(item.targetId === record.targetId && item.targetType === record.targetType))].slice(0, 200);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("ai-radar-summary-feedback-change"));
}

export function SummaryFeedback({
  targetId,
  targetType,
  compact = false
}: {
  targetId: string;
  targetType: FeedbackRecord["targetType"];
  compact?: boolean;
}) {
  const { showToast } = useToast();
  const [selected, setSelected] = useState<FeedbackType | null>(null);

  useEffect(() => {
    function sync() {
      const record = readRecords().find((item) => item.targetId === targetId && item.targetType === targetType);
      setSelected(record?.feedbackType ?? null);
    }

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("ai-radar-summary-feedback-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ai-radar-summary-feedback-change", sync);
    };
  }, [targetId, targetType]);

  function choose(feedbackType: FeedbackType) {
    saveRecord({
      targetId,
      targetType,
      feedbackType,
      createdAt: new Date().toISOString()
    });
    setSelected(feedbackType);
    showToast({ tone: "success", title: "已记录反馈", description: "会用于优化后续摘要。" });
  }

  return (
    <section className={`rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] ${compact ? "p-3" : "p-4"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <ChatCircleText size={18} className="mt-0.5 shrink-0 text-[var(--app-primary)]" />
          <div>
            <p className="text-sm font-black">这份摘要对你有帮助吗？</p>
            <p className="mt-1 text-xs font-semibold text-[var(--app-text-muted)]">反馈只保存在本机，不影响主流程和数据保存。</p>
          </div>
        </div>
        {selected ? (
          <span className="inline-flex items-center gap-1 text-xs font-black text-[#0f8b62]">
            <CheckCircle size={16} weight="fill" />
            已记录：{labels[selected]}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(labels) as FeedbackType[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => choose(key)}
            className={`min-h-9 rounded-lg border px-3 text-xs font-black transition ${
              selected === key
                ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                : "border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-text)] hover:border-[var(--app-primary)]"
            }`}
          >
            {labels[key]}
          </button>
        ))}
      </div>
    </section>
  );
}
