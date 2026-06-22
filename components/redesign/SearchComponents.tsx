"use client";

import Link from "next/link";
import { ArrowRight, ArrowSquareOut, BookmarkSimple, FileText, FolderSimple, Globe, Sparkle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { SearchBar } from "@/components/redesign/Navigation";
import { SummaryRenderer } from "@/components/redesign/SummaryRenderer";
import type { AppSearchResults } from "@/lib/services/appSearchService";
import type { StructuredSummary } from "@/lib/utils/summaryParser";

type WebResult = { title: string; source: string; url: string; publishedAt?: string | null; content: string; score?: number | null };

function GroupTitle({ icon: Icon, title, count }: { icon: typeof FolderSimple; title: string; count: number }) {
  return <div className="flex items-center gap-2"><Icon size={19} className="text-[var(--app-primary)]" /><h2 className="text-lg font-black">{title}</h2><span className="app-chip">{count}</span></div>;
}

export function SearchExperience({ results }: { results: AppSearchResults }) {
  const { query } = results;
  const [loading, setLoading] = useState(false);
  const [webResults, setWebResults] = useState<WebResult[]>([]);
  const [webSummary, setWebSummary] = useState<StructuredSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [savedUrls, setSavedUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const total = results.topics.length + results.articles.length + results.insights.length + results.saved.length;

  async function searchWeb() {
    if (!query || loading || cooldown) return;
    const localKey = `radar-web-search-${query.toLocaleLowerCase("zh-CN")}`;
    const last = Number(window.localStorage.getItem(localKey) || 0);
    const remaining = Math.ceil((45_000 - (Date.now() - last)) / 1000);
    if (remaining > 0) {
      setCooldown(remaining);
      setError(`同一关键词 ${remaining} 秒内不会重复调用 Tavily。`);
      return;
    }
    setLoading(true);
    setError("");
    setWebSummary(null);
    try {
      const response = await fetch("/api/search/web", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: query }) });
      const data = await response.json().catch(() => ({})) as { results?: WebResult[]; error?: string; retryAfter?: number };
      if (!response.ok) {
        if (data.results?.length) setWebResults(data.results);
        if (data.retryAfter) setCooldown(data.retryAfter);
        throw new Error(data.error || "全网搜索失败");
      }
      setWebResults(data.results ?? []);
      window.localStorage.setItem(localKey, String(Date.now()));
      setCooldown(45);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "全网搜索失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  async function saveResult(result: WebResult) {
    const response = await fetch("/api/search/web/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, result }) });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setError(data.error || "保存失败");
      return;
    }
    setSavedUrls((current) => current.includes(result.url) ? current : [...current, result.url]);
  }

  async function summarizeWebResults() {
    if (!webResults.length || summaryLoading) return;
    setSummaryLoading(true);
    setError("");
    try {
      const response = await fetch("/api/search/web/summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, results: webResults }) });
      const data = await response.json().catch(() => ({})) as { summary?: StructuredSummary; error?: string };
      if (!response.ok || !data.summary) throw new Error(data.error || "生成摘要失败");
      setWebSummary(data.summary);
    } catch (summaryError) {
      setError(summaryError instanceof Error ? summaryError.message : "生成摘要失败");
    } finally {
      setSummaryLoading(false);
    }
  }

  return (
    <div className="space-y-7">
      <SearchBar initialValue={query} />
      {!query ? <section className="rounded-lg border border-dashed border-[var(--app-line)] bg-[var(--app-surface)] p-8 text-center"><h2 className="text-lg font-black">请输入关键词</h2><p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">可以搜索已创建主题、内容标题与摘要、来源和分析结果。</p></section> : null}

      {query ? <p className="text-sm font-bold text-[var(--app-text-muted)]">App 内搜索“{query}”：{total} 条结果{results.fallbackUsed ? " · 使用本地兜底数据" : ""}</p> : null}

      {results.topics.length ? <section><GroupTitle icon={FolderSimple} title="主题" count={results.topics.length} /><div className="mt-3 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">{results.topics.map((topic) => <Link key={topic.id} href={`/topics/${topic.id}`} className="flex min-h-20 items-center gap-3 py-4 hover:text-[var(--app-primary)]"><span className="min-w-0 flex-1"><span className="app-chip">{topic.category}</span><strong className="mt-2 block font-black">{topic.title}</strong><span className="mt-1 line-clamp-1 block text-xs font-semibold text-[var(--app-text-muted)]">{topic.description}</span></span><ArrowRight size={17} /></Link>)}</div></section> : null}

      {results.articles.length ? <section><GroupTitle icon={FileText} title="内容" count={results.articles.length} /><div className="mt-3 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">{results.articles.map((article) => <Link key={article.id} href={`/articles/${article.id}`} className="block py-4 hover:text-[var(--app-primary)]"><strong className="block font-black leading-6">{article.title}</strong><span className="mt-1 line-clamp-2 block text-sm font-semibold leading-6 text-[var(--app-text-muted)]">{article.excerpt}</span><span className="mt-2 block text-xs font-bold text-[var(--app-text-muted)]">{article.source} · {article.time}</span></Link>)}</div></section> : null}

      {results.insights.length ? <section><GroupTitle icon={Sparkle} title="分析结果" count={results.insights.length} /><div className="mt-3 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">{results.insights.map((insight) => <Link key={insight.id} href={`/insights/${insight.id}`} className="flex min-h-20 items-center gap-3 py-4 hover:text-[var(--app-primary)]"><span className="min-w-0 flex-1"><span className="text-xs font-black text-[var(--app-primary)]">{insight.topicTitle}</span><strong className="mt-1 block font-black leading-6">{insight.title}</strong><span className="mt-1 line-clamp-1 block text-sm font-semibold text-[var(--app-text-muted)]">{insight.summary}</span></span><ArrowRight size={17} /></Link>)}</div></section> : null}

      {results.saved.length ? <section><GroupTitle icon={BookmarkSimple} title="收藏" count={results.saved.length} /><div className="mt-3 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">{results.saved.map((insight) => <Link key={insight.id} href={`/insights/${insight.id}`} className="flex min-h-16 items-center gap-3 py-3 hover:text-[var(--app-primary)]"><BookmarkSimple size={18} weight="fill" className="text-[var(--app-primary)]" /><strong className="min-w-0 flex-1 line-clamp-2">{insight.title}</strong><ArrowRight size={17} /></Link>)}</div></section> : null}

      {query && total === 0 ? <section className="rounded-lg border border-dashed border-[var(--app-line)] p-6 text-center"><h2 className="font-black">没有找到相关内容</h2><p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">可以调整关键词，或明确点击下方按钮搜索全网。</p></section> : null}

      {query ? <section className="rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 text-lg font-black"><Globe size={20} />搜索全网</h2><p className="mt-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">全网搜索会消耗 Tavily 额度。仅点击按钮后调用，最多返回 5 条，同词 45 秒冷却。</p></div><button type="button" onClick={searchWeb} disabled={loading || cooldown > 0} className="app-button shrink-0 disabled:cursor-wait disabled:opacity-60"><Globe size={17} />{loading ? "搜索中" : cooldown ? `${cooldown} 秒后可重试` : "搜索全网"}</button></div>{error ? <p className="mt-3 text-sm font-bold text-[#c24131]">{error}</p> : null}</section> : null}

      {webResults.length ? <section><div className="flex flex-wrap items-center justify-between gap-3"><GroupTitle icon={Globe} title="全网结果" count={webResults.length} /><div className="flex flex-wrap gap-2"><button type="button" onClick={summarizeWebResults} disabled={summaryLoading} className="app-button-secondary min-h-10 px-3 py-2 text-xs"><Sparkle size={16} />{summaryLoading ? "生成中" : "基于结果生成摘要"}</button><Link href={`/topics/new?title=${encodeURIComponent(query)}&keywords=${encodeURIComponent(query)}`} className="app-button-secondary min-h-10 px-3 py-2 text-xs"><FolderSimple size={16} />创建关注主题</Link></div></div><div className="mt-3 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">{webResults.map((result) => <article key={result.url} className="py-4"><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><a href={result.url} target="_blank" rel="noreferrer" className="font-black leading-6 hover:text-[var(--app-primary)]">{result.title} <ArrowSquareOut size={14} className="inline" /></a><p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">{result.content || "暂无摘要"}</p><p className="mt-2 text-xs font-bold text-[var(--app-text-muted)]">{result.source}</p></div><button type="button" onClick={() => saveResult(result)} disabled={savedUrls.includes(result.url)} className="app-button-secondary min-h-9 shrink-0 px-2.5 py-1.5 text-xs"><BookmarkSimple size={15} weight={savedUrls.includes(result.url) ? "fill" : "regular"} />{savedUrls.includes(result.url) ? "已保存" : "保存"}</button></div></article>)}</div></section> : null}

      {webSummary ? <section className="border-t border-[var(--app-line)] pt-7"><SummaryRenderer summary={webSummary} /></section> : null}
    </div>
  );
}
