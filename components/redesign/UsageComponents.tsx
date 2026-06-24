"use client";

import Link from "next/link";
import { ClockCounterClockwise, Gauge, MagnifyingGlass, Sparkle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import type { FollowTopic } from "@/lib/mock/redesignData";

const USAGE_PREFIX = "ai-radar-usage";
const TOPIC_RUN_PREFIX = "ai-radar-topic-run";
const WEB_SEARCH_PREFIX = "radar-web-search";
const TOPIC_COOLDOWN_MS = 3 * 60 * 1000;

export type UsageEventKind = "tavily" | "deepseek";

type UsageRecord = {
  tavily: number;
  deepseek: number;
  lastSearchAt?: number;
  lastSummaryAt?: number;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

function usageKey(day = todayKey()) {
  return `${USAGE_PREFIX}-${day}`;
}

function readUsage(day = todayKey()): UsageRecord {
  if (typeof window === "undefined") return { tavily: 0, deepseek: 0 };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(usageKey(day)) || "{}") as Partial<UsageRecord>;
    return {
      tavily: Number(parsed.tavily || 0),
      deepseek: Number(parsed.deepseek || 0),
      lastSearchAt: parsed.lastSearchAt,
      lastSummaryAt: parsed.lastSummaryAt
    };
  } catch {
    return { tavily: 0, deepseek: 0 };
  }
}

function saveUsage(record: UsageRecord) {
  window.localStorage.setItem(usageKey(), JSON.stringify(record));
  window.dispatchEvent(new CustomEvent("ai-radar-usage-change"));
}

export function recordUsage(kind: UsageEventKind, amount = 1) {
  if (typeof window === "undefined") return;
  const current = readUsage();
  const now = Date.now();
  saveUsage({
    ...current,
    tavily: kind === "tavily" ? current.tavily + amount : current.tavily,
    deepseek: kind === "deepseek" ? current.deepseek + amount : current.deepseek,
    lastSearchAt: kind === "tavily" ? now : current.lastSearchAt,
    lastSummaryAt: kind === "deepseek" ? now : current.lastSummaryAt
  });
}

export function topicRunKey(topicId: string) {
  return `${TOPIC_RUN_PREFIX}-${topicId}`;
}

export function getTopicCooldown(topicId: string) {
  if (typeof window === "undefined") return 0;
  const last = Number(window.localStorage.getItem(topicRunKey(topicId)) || 0);
  return Math.max(0, Math.ceil((TOPIC_COOLDOWN_MS - (Date.now() - last)) / 1000));
}

export function markTopicRun(topicId: string) {
  if (typeof window === "undefined" || !topicId) return;
  window.localStorage.setItem(topicRunKey(topicId), String(Date.now()));
  window.dispatchEvent(new CustomEvent("ai-radar-usage-change"));
}

function formatTime(timestamp?: number) {
  if (!timestamp) return "暂无";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "暂无";
  return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function readLatestWebSearchAt() {
  if (typeof window === "undefined") return undefined;
  let latest = 0;
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index) || "";
    if (key.startsWith(`${WEB_SEARCH_PREFIX}-`)) {
      latest = Math.max(latest, Number(window.localStorage.getItem(key) || 0));
    }
  }
  return latest || undefined;
}

function monthlyTavilyEstimate() {
  if (typeof window === "undefined") return 0;
  let total = 0;
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index) || "";
    if (key.startsWith(`${USAGE_PREFIX}-${monthKey()}`)) {
      total += readUsage(key.replace(`${USAGE_PREFIX}-`, "")).tavily;
    }
  }
  return total;
}

export function UsageReminder({ topics = [] }: { topics?: FollowTopic[] }) {
  const [usage, setUsage] = useState<UsageRecord>({ tavily: 0, deepseek: 0 });
  const [latestWebSearchAt, setLatestWebSearchAt] = useState<number | undefined>();
  const [monthlyTavily, setMonthlyTavily] = useState(0);
  const [blockedTopics, setBlockedTopics] = useState<Array<{ title: string; remaining: number }>>([]);

  useEffect(() => {
    function sync() {
      setUsage(readUsage());
      setLatestWebSearchAt(readLatestWebSearchAt());
      setMonthlyTavily(monthlyTavilyEstimate());
      setBlockedTopics(
        topics
          .map((topic) => ({ title: topic.title, remaining: getTopicCooldown(topic.id) }))
          .filter((item) => item.remaining > 0)
          .slice(0, 4)
      );
    }

    sync();
    const timer = window.setInterval(sync, 1000);
    window.addEventListener("storage", sync);
    window.addEventListener("ai-radar-usage-change", sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", sync);
      window.removeEventListener("ai-radar-usage-change", sync);
    };
  }, [topics]);

  const stats = [
    { label: "今日 Tavily 搜索", value: usage.tavily, icon: MagnifyingGlass },
    { label: "今日 DeepSeek 调用", value: usage.deepseek, icon: Sparkle },
    { label: "本月 Tavily 估算", value: monthlyTavily, icon: Gauge }
  ];

  return (
    <section className="app-card p-5">
      <div className="flex items-center gap-2">
        <Gauge size={21} className="text-[var(--app-primary)]" />
        <h2 className="text-lg font-black">用量提醒</h2>
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">这里是本机估算，用来防止误点；真实账单以 Tavily 和 DeepSeek 控制台为准。</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-lg bg-[var(--app-surface-muted)] p-3">
              <Icon size={18} className="text-[var(--app-primary)]" />
              <strong className="mt-2 block text-lg font-black">{item.value}</strong>
              <span className="mt-1 block text-[11px] font-bold text-[var(--app-text-muted)]">{item.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-lg border border-[var(--app-line)] p-3 text-xs font-bold leading-5 text-[var(--app-text-muted)]">
        <p>最近一次真实搜索：{formatTime(usage.lastSearchAt || latestWebSearchAt)}</p>
        <p>最近一次摘要生成：{formatTime(usage.lastSummaryAt)}</p>
      </div>
      {blockedTopics.length ? (
        <div className="mt-4 rounded-lg border border-[#f3d6a3] bg-[#fff8ea] p-3">
          <div className="flex items-center gap-2 text-sm font-black text-[#9a5b00]"><ClockCounterClockwise size={17} />暂时不能重复更新</div>
          <div className="mt-2 space-y-1 text-xs font-bold text-[#7a4a08]">
            {blockedTopics.map((topic) => <p key={topic.title}>{topic.title}：约 {topic.remaining} 秒后可再次更新</p>)}
          </div>
        </div>
      ) : null}
      <Link href="/topics" className="mt-4 inline-flex text-sm font-black text-[var(--app-primary)]">管理更新频率</Link>
    </section>
  );
}