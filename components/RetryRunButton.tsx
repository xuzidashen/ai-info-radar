"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { useToast } from "@/components/ui/Toast";

export function RetryRunButton({ runId, compact = false }: { runId: string; compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { showToast } = useToast();

  async function retry() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/runs/${runId}/retry`, {
        method: "POST"
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "重试失败");
      }

      setMessage("重试已完成");
      showToast({ tone: "success", title: "重试已完成", description: "运行结果已刷新。" });
      router.refresh();
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "重试失败";
      setMessage(nextMessage);
      showToast({ tone: "error", title: "重试失败", description: nextMessage });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <ActionButton type="button" variant="secondary" size={compact ? "sm" : "md"} loading={loading} onClick={() => void retry()}>
        <RotateCcw className="h-4 w-4" />
        重试
      </ActionButton>
      {message ? <p className="text-xs font-bold text-slate-500">{message}</p> : null}
    </div>
  );
}
