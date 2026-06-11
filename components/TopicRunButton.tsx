"use client";

import { useState } from "react";
import { Check, Play } from "lucide-react";

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
  const { showToast } = useToast();

  async function runTopic() {
    setRunning(true);
    setDone(false);
    setError(null);

    try {
      const response = await fetch(`/api/zones/${zoneId}/topics/${topicId}/run`, {
        method: "POST"
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "运行 Topic 失败");
      }

      setDone(true);
      showToast({ tone: "success", title: "运行已完成", description: "报告、来源或分析结果已刷新。" });
      onDone?.();
      window.setTimeout(() => setDone(false), 1800);
    } catch (runError) {
      const message = runError instanceof Error ? runError.message : "运行 Topic 失败";
      setError(message);
      showToast({ tone: "error", title: "Topic 运行失败", description: message });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <ActionButton
        type="button"
        disabled={running}
        loading={running}
        onClick={() => void runTopic()}
        variant={done ? "success" : "primary"}
        size={compact ? "sm" : "md"}
      >
        {done ? <Check className="h-4 w-4" /> : running ? null : <Play className="h-4 w-4" />}
        {running ? "运行中" : done ? "已完成" : label ?? (compact ? "运行" : "一键运行 Topic")}
      </ActionButton>
      {error ? <p className="max-w-72 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold leading-5 text-rose-700">{error}</p> : null}
    </div>
  );
}
