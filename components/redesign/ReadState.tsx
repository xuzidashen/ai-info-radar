"use client";

import { useEffect, useMemo, useState } from "react";

type ReadKind = "article" | "insight";

const READ_KEYS: Record<ReadKind, string> = {
  article: "ai-radar-read-articles",
  insight: "ai-radar-read-insights"
};

function readIds(kind: ReadKind) {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(READ_KEYS[kind]);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function saveIds(kind: ReadKind, ids: string[]) {
  window.localStorage.setItem(READ_KEYS[kind], JSON.stringify(Array.from(new Set(ids))));
  window.dispatchEvent(new CustomEvent("ai-radar-read-state-change"));
}

export function getReadIds(kind: ReadKind) {
  return readIds(kind);
}

export function markAsRead(kind: ReadKind, id: string) {
  if (!id || typeof window === "undefined") return;
  saveIds(kind, [...readIds(kind), id]);
}

export function useReadState(kind: ReadKind, ids: string[]) {
  const normalizedIds = useMemo(() => Array.from(new Set(ids.filter(Boolean))), [ids]);
  const [readSet, setReadSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    function sync() {
      setReadSet(new Set(readIds(kind)));
    }

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("ai-radar-read-state-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ai-radar-read-state-change", sync);
    };
  }, [kind]);

  const unreadIds = normalizedIds.filter((id) => !readSet.has(id));

  return {
    readIds: Array.from(readSet),
    unreadIds,
    unreadCount: unreadIds.length,
    isUnread: (id: string) => Boolean(id) && !readSet.has(id),
    markOneRead: (id: string) => markAsRead(kind, id)
  };
}

export function ReadTracker({ kind, id }: { kind: ReadKind; id: string }) {
  useEffect(() => {
    markAsRead(kind, id);
  }, [kind, id]);

  return null;
}

export function UnreadBadge({ kind, id, className = "" }: { kind: ReadKind; id: string; className?: string }) {
  const { isUnread } = useReadState(kind, [id]);

  if (!isUnread(id)) return null;

  return <span className={`inline-flex items-center rounded-full bg-[#e9543f] px-2 py-0.5 text-[10px] font-black text-white ${className}`}>新</span>;
}

export function UnreadOverview({ articleIds, insightIds }: { articleIds: string[]; insightIds: string[] }) {
  const articleState = useReadState("article", articleIds);
  const insightState = useReadState("insight", insightIds);
  const unreadTotal = articleState.unreadCount + insightState.unreadCount;

  return (
    <section className="rounded-lg border border-[#c7ddff] bg-[#f2f7ff] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-[#1f5fbf]">未读提醒</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#34537a]">
            当前有 {unreadTotal} 条未读，其中内容 {articleState.unreadCount} 条、分析 {insightState.unreadCount} 条。
          </p>
        </div>
        <span className="app-chip shrink-0 text-[var(--app-primary)]">打开详情后自动标记已读</span>
      </div>
    </section>
  );
}