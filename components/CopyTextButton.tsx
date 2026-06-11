"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

import { ActionButton } from "@/components/ui/ActionButton";
import { useToast } from "@/components/ui/Toast";

export function CopyTextButton({ text, label = "复制文本" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast({ tone: "success", title: "已复制", description: "内容已写入剪贴板。" });
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      showToast({ tone: "error", title: "复制失败", description: "请检查浏览器剪贴板权限后重试。" });
    }
  }

  return (
    <ActionButton type="button" variant={copied ? "success" : "secondary"} size="sm" onClick={() => void copy()}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "已复制" : label}
    </ActionButton>
  );
}
