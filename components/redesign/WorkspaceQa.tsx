"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle, ClockCounterClockwise, Database, FileText, Flask, Lightning, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

import { getTopicCooldown, markTopicRun, recordUsage } from "@/components/redesign/UsageComponents";
import type { FollowTopic } from "@/lib/mock/redesignData";

type ProviderStatus = {
  search: { requestedProvider: string; activeProvider: string; hasTavilyApiKey: boolean; fallbackWillBeUsed: boolean };
  summary: { requestedProvider: string; activeProvider: string; hasDeepSeekApiKey: boolean; fallbackWillBeUsed: boolean };
};

type QaResult = {
  label: string;
  ok: boolean;
  detail: string;
  meta?: Record<string, unknown>;
};

function ResultCard({ result }: { result: QaResult }) {
  const Icon = result.ok ? CheckCircle : WarningCircle;
  return (
    <article className={`rounded-lg border p-4 ${result.ok ? "border-[#b8ddcf] bg-[#eefaf5]" : "border-[#f2d4a4] bg-[#fff8ea]"}`}>
      <div className="flex items-start gap-3">
        <Icon size={20} weight="fill" className={result.ok ? "text-[#0f8b62]" : "text-[#b45309]"} />
        <div className="min-w-0">
          <h3 className="font-black">{result.label}</h3>
          <p className={`mt-1 text-sm font-semibold leading-6 ${result.ok ? "text-[#155f48]" : "text-[#79521c]"}`}>{result.detail}</p>
          {result.meta ? (
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-black/5 bg-white/65 p-3 text-xs leading-5 text-[var(--app-text-muted)]">
              {JSON.stringify(result.meta, null, 2)}
            </pre>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function parseSummaryJson(content?: string) {
  if (!content) return { ok: false, detail: "没有摘要内容。" };
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    const required = ["title", "overview", "coreFacts", "sources"];
    const missing = required.filter((key) => !(key in parsed));
    return missing.length
      ? { ok: false, detail: `摘要 JSON 缺少字段：${missing.join("、")}` }
      : { ok: true, detail: "摘要 JSON 结构正常。" };
  } catch {
    return { ok: false, detail: "摘要不是可解析 JSON，前端会走兼容解析，但建议检查 prompt/provider。" };
  }
}

export function WorkspaceQa({
  topics,
  database
}: {
  topics: FollowTopic[];
  database: { ok: boolean; label: string; detail: string };
}) {
  const firstTopic = topics[0] ?? null;
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [results, setResults] = useState<QaResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [qaCooldown, setQaCooldown] = useState(0);

  useEffect(() => {
    async function loadStatus() {
      const response = await fetch("/api/providers/status", { cache: "no-store" });
      if (response.ok) setProviderStatus(await response.json() as ProviderStatus);
    }

    void loadStatus();
  }, []);

  useEffect(() => {
    if (!firstTopic) return;
    const sync = () => setCooldown(getTopicCooldown(firstTopic.id));
    sync();
    const timer = window.setInterval(sync, 1000);
    window.addEventListener("ai-radar-usage-change", sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("ai-radar-usage-change", sync);
    };
  }, [firstTopic]);

  useEffect(() => {
    if (qaCooldown <= 0) return;
    const timer = window.setInterval(() => setQaCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [qaCooldown]);

  const providerRows = useMemo(() => {
    if (!providerStatus) return [];
    return [
      {
        label: "Tavily 搜索",
        ok: providerStatus.search.activeProvider === "tavily" || providerStatus.search.requestedProvider === "mock",
        detail: `requested=${providerStatus.search.requestedProvider}，active=${providerStatus.search.activeProvider}，Key ${providerStatus.search.hasTavilyApiKey ? "已配置" : "未配置"}`
      },
      {
        label: "DeepSeek 摘要",
        ok: providerStatus.summary.activeProvider === "deepseek" || providerStatus.summary.requestedProvider === "mock",
        detail: `requested=${providerStatus.summary.requestedProvider}，active=${providerStatus.summary.activeProvider}，Key ${providerStatus.summary.hasDeepSeekApiKey ? "已配置" : "未配置"}`
      }
    ];
  }, [providerStatus]);

  function pushResult(result: QaResult) {
    setResults((current) => [result, ...current].slice(0, 12));
  }

  async function testSearch() {
    setLoading("search");
    try {
      const response = await fetch("/api/providers/test-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywordName: "低空经济政策", category: "policy", description: "官方优先，关注政策公告和申报信息" })
      });
      const data = await response.json().catch(() => ({})) as { provider?: string; results?: Array<{ url?: string }>; fallbackUsed?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error || "搜索测试失败");
      if (data.provider === "tavily") recordUsage("tavily");
      pushResult({
        label: "Tavily / SearchProvider 测试",
        ok: Boolean(data.results?.length),
        detail: `返回 ${data.results?.length ?? 0} 条，provider=${data.provider ?? "unknown"}${data.fallbackUsed ? "，已 fallback" : ""}`,
        meta: { provider: data.provider, fallbackUsed: data.fallbackUsed, hasOriginalLinks: data.results?.some((item) => Boolean(item.url)) }
      });
    } catch (error) {
      pushResult({ label: "Tavily / SearchProvider 测试", ok: false, detail: error instanceof Error ? error.message : "搜索测试失败" });
    } finally {
      setLoading(null);
    }
  }

  async function testSummary() {
    setLoading("summary");
    try {
      const response = await fetch("/api/providers/test-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywordName: "低空经济政策", category: "policy", description: "检查事实型情报卡 JSON 结构" })
      });
      const data = await response.json().catch(() => ({})) as { provider?: string; content?: string; fallbackUsed?: boolean; error?: string; sourceCount?: number };
      if (!response.ok) throw new Error(data.error || "摘要测试失败");
      if (data.provider === "deepseek") recordUsage("deepseek");
      const jsonCheck = parseSummaryJson(data.content);
      pushResult({
        label: "DeepSeek / SummaryProvider 测试",
        ok: jsonCheck.ok,
        detail: `${jsonCheck.detail} provider=${data.provider ?? "unknown"}，来源 ${data.sourceCount ?? 0} 条${data.fallbackUsed ? "，已 fallback" : ""}`,
        meta: { provider: data.provider, fallbackUsed: data.fallbackUsed, sourceCount: data.sourceCount }
      });
    } catch (error) {
      pushResult({ label: "DeepSeek / SummaryProvider 测试", ok: false, detail: error instanceof Error ? error.message : "摘要测试失败" });
    } finally {
      setLoading(null);
    }
  }

  function testLocalDailyBriefing() {
    const updatedTopics = topics.filter((topic) => (topic.todayItemCount ?? 0) > 0 || topic.lastRunState === "success");
    const needsReviewTopics = topics.filter((topic) => (topic.needsReviewCount ?? 0) > 0);
    pushResult({
      label: "\u4eca\u65e5\u60c5\u62a5\u7b80\u62a5 / \u79fb\u52a8\u5165\u53e3\u68c0\u67e5",
      ok: true,
      detail: `\u5173\u6ce8\u4e3b\u9898 ${topics.length} \u4e2a\uff0c\u6709\u66f4\u65b0 ${updatedTopics.length} \u4e2a\uff0c\u9700\u590d\u6838\u4e3b\u9898 ${needsReviewTopics.length} \u4e2a\u3002`,
      meta: {
        updatedTopics: updatedTopics.slice(0, 5).map((topic) => ({ title: topic.title, todayItemCount: topic.todayItemCount, unreadCount: topic.unreadCount, lastRunState: topic.lastRunState })),
        mobileLinks: ["/", "/topics", "/search", "/profile", "/workspace/qa"]
      }
    });
  }

  function testChangeLabels() {
    const labels = ["new", "update", "duplicate", "stale", "important_change", "low_signal", "needs_review"];
    const topicHasStatus = topics.some((topic) => typeof topic.highTrustCount === "number" || typeof topic.needsReviewCount === "number");
    pushResult({
      label: "\u53d8\u5316\u68c0\u6d4b\u6807\u7b7e\u68c0\u67e5",
      ok: topicHasStatus,
      detail: topicHasStatus ? "\u4e3b\u9898\u72b6\u6001\u5df2\u5305\u542b\u9ad8\u53ef\u4fe1\u548c\u9700\u590d\u6838\u8ba1\u6570\uff1b\u8fd0\u884c\u540e\u5185\u5bb9\u4f1a\u6807\u8bb0\u65b0\u3001\u8865\u5145\u3001\u65e7\u95fb\u3001\u9ad8\u4ef7\u503c\u3001\u9700\u590d\u6838\u7b49\u7c7b\u578b\u3002" : "\u5f53\u524d\u4e3b\u9898\u8fd8\u6ca1\u6709\u72b6\u6001\u7edf\u8ba1\uff0c\u5148\u8fd0\u884c\u4e00\u6b21\u4e3b\u9898\u66f4\u65b0\u3002",
      meta: { labels, topicStatusReady: topicHasStatus }
    });
  }

  async function testDailyRefresh() {
    if (qaCooldown > 0) return;
    setLoading("daily-refresh");
    setQaCooldown(60);
    try {
      const response = await fetch("/api/main-flow/daily-refresh", { method: "POST" });
      const data = await response.json().catch(() => ({})) as { total?: number; ran?: number; skipped?: number; successCount?: number; failedCount?: number; error?: string; warning?: string; results?: unknown[] };
      if (!response.ok) throw new Error(data.error || "\u6bcf\u65e5\u81ea\u52a8\u68c0\u67e5 API \u6d4b\u8bd5\u5931\u8d25\u3002\u8bf7\u786e\u8ba4\u5185\u90e8 secret \u8bf7\u6c42\u5934\u7b56\u7565\uff0c\u5207\u52ff\u5728\u524d\u7aef\u66b4\u9732\u771f\u5b9e secret\u3002");
      pushResult({
        label: "\u6bcf\u65e5\u81ea\u52a8\u68c0\u67e5 API",
        ok: true,
        detail: `\u81ea\u52a8\u68c0\u67e5\u4e3b\u9898 ${data.total ?? 0} \u4e2a\uff0c\u6267\u884c ${data.ran ?? 0} \u4e2a\uff0c\u8df3\u8fc7 ${data.skipped ?? 0} \u4e2a\u3002`,
        meta: { total: data.total, ran: data.ran, skipped: data.skipped, successCount: data.successCount, failedCount: data.failedCount, warning: data.warning, results: data.results }
      });
    } catch (error) {
      pushResult({ label: "\u6bcf\u65e5\u81ea\u52a8\u68c0\u67e5 API", ok: false, detail: error instanceof Error ? error.message : "\u6bcf\u65e5\u81ea\u52a8\u68c0\u67e5 API \u6d4b\u8bd5\u5931\u8d25" });
    } finally {
      setLoading(null);
    }
  }

  async function testTopicRun() {
    if (!firstTopic || cooldown > 0) return;
    setLoading("topic-run");
    markTopicRun(firstTopic.id);
    try {
      const response = await fetch(`/api/main-flow/topics/${firstTopic.id}/run`, { method: "POST" });
      const data = await response.json().catch(() => ({})) as {
        itemCount?: number;
        reportCount?: number;
        candidateCount?: number;
        insightHref?: string;
        provider?: { searchProvider?: string; summaryProvider?: string; fallbackUsed?: boolean };
        noChange?: boolean;
        overview?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "完整主题更新测试失败");
      if (data.provider?.searchProvider === "tavily") recordUsage("tavily");
      if (data.provider?.summaryProvider === "deepseek") recordUsage("deepseek");
      pushResult({
        label: "完整主题更新流程",
        ok: Boolean(data.noChange || (data.itemCount ?? 0) > 0 || (data.reportCount ?? 0) > 0),
        detail: data.noChange ? `\u5019\u9009 ${data.candidateCount ?? 0} \u6761\uff0c\u672c\u6b21\u672a\u53d1\u73b0\u660e\u663e\u65b0\u53d8\u5316\uff0c\u5df2\u8df3\u8fc7\u6458\u8981\u3002` : `\u5019\u9009 ${data.candidateCount ?? 0} \u6761\uff0c\u4fdd\u5b58 ${data.itemCount ?? 0} \u6761\uff0c\u62a5\u544a ${data.reportCount ?? 0} \u6761\u3002`,
        meta: { topic: firstTopic.title, insightHref: data.insightHref, provider: data.provider, noChange: data.noChange, overview: data.overview }
      });
    } catch (error) {
      pushResult({ label: "完整主题更新流程", ok: false, detail: error instanceof Error ? error.message : "完整主题更新测试失败" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <Link href="/workspace" className="inline-flex items-center gap-2 text-sm font-black text-[var(--app-text-muted)] hover:text-[var(--app-primary)]"><ArrowLeft size={17} />返回高级工具</Link>
      <header className="mt-6 border-b border-[var(--app-line)] pb-6">
        <span className="app-chip">高级验收工具，不进入普通主流程</span>
        <h1 className="mt-3 text-3xl font-black">可信质量 QA</h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--app-text-muted)]">用于检查真实搜索、事实摘要、数据库保存和完整主题更新链路。不会显示任何 API Key 原文。</p>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <ResultCard result={{ label: "数据库连接", ok: database.ok, detail: `${database.label}：${database.detail}` }} />
        {providerRows.map((row) => <ResultCard key={row.label} result={row} />)}
      </section>

      <section className="mt-6 rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black"><Flask size={20} />真实流程测试</h2>
            <p className="mt-1 text-xs font-semibold text-[var(--app-text-muted)]">搜索和摘要测试可能消耗 Tavily / DeepSeek 额度；主题更新有 3 分钟本机冷却。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={testLocalDailyBriefing} disabled={Boolean(loading)} className="app-button-secondary disabled:cursor-wait disabled:opacity-60"><FileText size={17} />{"\u7b80\u62a5\u68c0\u67e5"}</button>
            <button type="button" onClick={testChangeLabels} disabled={Boolean(loading)} className="app-button-secondary disabled:cursor-wait disabled:opacity-60"><ShieldCheck size={17} />{"\u53d8\u5316\u6807\u7b7e"}</button>
            <button type="button" onClick={testSearch} disabled={Boolean(loading)} className="app-button-secondary disabled:cursor-wait disabled:opacity-60"><ShieldCheck size={17} />{loading === "search" ? "\u6d4b\u8bd5\u4e2d" : "\u6d4b\u8bd5\u641c\u7d22"}</button>
            <button type="button" onClick={testSummary} disabled={Boolean(loading)} className="app-button-secondary disabled:cursor-wait disabled:opacity-60"><Database size={17} />{loading === "summary" ? "\u6d4b\u8bd5\u4e2d" : "\u6d4b\u8bd5\u6458\u8981"}</button>
            <button type="button" onClick={testDailyRefresh} disabled={Boolean(loading) || qaCooldown > 0} className="app-button-secondary disabled:cursor-wait disabled:opacity-60"><ClockCounterClockwise size={17} />{qaCooldown ? `${qaCooldown} \u79d2\u540e\u53ef\u6d4b` : loading === "daily-refresh" ? "\u68c0\u67e5\u4e2d" : "\u6bcf\u65e5\u68c0\u67e5"}</button>
            <button type="button" onClick={testTopicRun} disabled={Boolean(loading) || !firstTopic || cooldown > 0} className="app-button disabled:cursor-wait disabled:opacity-60"><Lightning size={17} weight="fill" />{cooldown ? `${cooldown} \u79d2\u540e\u53ef\u6d4b` : loading === "topic-run" ? "\u8fd0\u884c\u4e2d" : "\u5b8c\u6574\u66f4\u65b0"}</button>
          </div>
        </div>
        <p className="mt-3 text-xs font-bold text-[var(--app-text-muted)]">当前测试主题：{firstTopic?.title ?? "暂无主题，请先创建一个关注主题。"}</p>
      </section>

      <section className="mt-6 grid gap-3">
        {results.length ? results.map((result, index) => <ResultCard key={`${result.label}-${index}`} result={result} />) : (
          <div className="rounded-lg border border-dashed border-[var(--app-line)] p-8 text-center">
            <p className="font-black">还没有 QA 结果</p>
            <p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">点击上方按钮后，测试结果会显示在这里。</p>
          </div>
        )}
      </section>
    </div>
  );
}
