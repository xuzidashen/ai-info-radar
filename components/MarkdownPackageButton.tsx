"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { useToast } from "@/components/ui/Toast";

export function MarkdownPackageButton({ queryString = "" }: { queryString?: string }) {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  async function copyPackage() {
    setCopying(true);
    setCopied(false);
    setError(null);

    try {
      const response = await fetch(`/api/reports/package${queryString ? `?${queryString}` : ""}`, {
        cache: "no-store"
      });
      const data = (await response.json()) as { markdown?: string; error?: string };

      if (!response.ok || !data.markdown) {
        throw new Error(data.error || "生成报告包失败");
      }

      await navigator.clipboard.writeText(data.markdown);
      setCopied(true);
      showToast({ tone: "success", title: "报告包已复制", description: "Markdown 内容已写入剪贴板。" });
      window.setTimeout(() => setCopied(false), 1800);
    } catch (copyError) {
      const message = copyError instanceof Error ? copyError.message : "复制报告包失败";
      setError(message);
      showToast({ tone: "error", title: "复制报告包失败", description: message });
    } finally {
      setCopying(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <ActionButton type="button" variant={copied ? "success" : "secondary"} loading={copying} onClick={() => void copyPackage()}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "已复制报告包" : "复制 Markdown 报告包"}
      </ActionButton>
      {error ? <p className="text-xs font-bold text-rose-700">{error}</p> : null}
    </div>
  );
}
