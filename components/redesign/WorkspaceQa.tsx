"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle, Database, Flask, Lightning, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
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
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "完整主题更新测试失败");
      if (data.provider?.searchProvider === "tavily") recordUsage("tavily");
      if (data.provider?.summaryProvider === "deepseek") recordUsage("deepseek");
      pushResult({
        label: "完整主题更新流程",
        ok: Boolean((data.itemCount ?? 0) > 0 || (data.reportCount ?? 0) > 0),
        detail: `候选 ${data.candidateCount ?? 0} 条，保存 ${data.itemCount ?? 0} 条，报告 ${data.reportCount ?? 0} 条。`,
        meta: { topic: firstTopic.title, insightHref: data.insightHref, provider: data.provider }
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
            <button type="button" onClick={testSearch} disabled={Boolean(loading)} className="app-button-secondary disabled:cursor-wait disabled:opacity-60"><ShieldCheck size={17} />{loading === "search" ? "测试中" : "测试搜索"}</button>
            <button type="button" onClick={testSummary} disabled={Boolean(loading)} className="app-button-secondary disabled:cursor-wait disabled:opacity-60"><Database size={17} />{loading === "summary" ? "测试中" : "测试摘要"}</button>
            <button type="button" onClick={testTopicRun} disabled={Boolean(loading) || !firstTopic || cooldown > 0} className="app-button disabled:cursor-wait disabled:opacity-60"><Lightning size={17} weight="fill" />{cooldown ? `${cooldown} 秒后可测` : loading === "topic-run" ? "运行中" : "完整更新"}</button>
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
