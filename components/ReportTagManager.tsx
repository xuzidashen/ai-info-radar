"use client";

import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { FormEvent, useState } from "react";

import { ActionButton } from "@/components/ui/ActionButton";
import { StatusPill } from "@/components/ui/StatusPill";
import type { ReportTagDTO } from "@/lib/types";

const tagColors = ["#12a594", "#f2b84b", "#dc5f57", "#6ea8fe", "#b18cff"];

export function ReportTagManager({ reportId, tags = [], availableTags = [] }: { reportId: string; tags?: ReportTagDTO[]; availableTags?: ReportTagDTO[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tagId, setTagId] = useState("");
  const [color, setColor] = useState(tagColors[0]);
  const [loading, setLoading] = useState(false);

  async function addTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/reports/${reportId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tagId ? { tagId } : { name, color })
      });
      setName("");
      setTagId("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function removeTag(targetTagId: string) {
    setLoading(true);
    try {
      await fetch(`/api/reports/${reportId}/tags/${targetTagId}`, {
        method: "DELETE"
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: tag.color ?? "#12a594" }} />
              {tag.name}
              <button
                type="button"
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-950"
                aria-label={`移除标签 ${tag.name}`}
                onClick={() => void removeTag(tag.id)}
                disabled={loading}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        ) : (
          <StatusPill tone="neutral">暂无标签</StatusPill>
        )}
      </div>

      <form onSubmit={addTag} className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
        <select className="radar-input" value={tagId} onChange={(event) => setTagId(event.target.value)}>
          <option value="">新建标签</option>
          {availableTags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
        <input
          className="radar-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="新标签名称"
          disabled={Boolean(tagId)}
        />
        <select className="radar-input min-w-28" value={color} onChange={(event) => setColor(event.target.value)} disabled={Boolean(tagId)}>
          {tagColors.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <ActionButton type="submit" loading={loading} disabled={!tagId && !name.trim()}>
          <Plus className="h-4 w-4" />
          添加
        </ActionButton>
      </form>
    </div>
  );
}
