"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Search, Sparkles } from "lucide-react";

import { categoryLabels, keywordCategories, type KeywordCategory } from "@/lib/types";

type ProviderStatus = {
  search: {
    requestedProvider: "mock" | "tavily";
    activeProvider: "mock" | "tavily";
    hasTavilyApiKey: boolean;
    fallbackWillBeUsed: boolean;
  };
  summary: {
    requestedProvider: "mock" | "deepseek";
    activeProvider: "mock" | "deepseek";
    hasDeepSeekApiKey: boolean;
    model: string;
    fallbackWillBeUsed: boolean;
  };
};

type SearchTestResult = {
  provider: string;
  requestedProvider: string;
  fallbackUsed: boolean;
  usedMock: boolean;
  usedTavily: boolean;
  error?: string | null;
  rawCount: number;
  results: Array<{
    title: string;
    source: string;
    url: string;
    content: string;
    score?: number | null;
    credibility: {
      score: number;
      label: "high" | "medium" | "low" | "unknown";
      reason: string;
    };
  }>;
};

type SummaryTestResult = {
  provider: string;
  requestedProvider: string;
  searchProvider: string;
  fallbackUsed: boolean;
  searchFallbackUsed: boolean;
  summaryFallbackUsed: boolean;
  usedMock: boolean;
  usedTavily: boolean;
  usedDeepSeek: boolean;
  error?: string | null;
  sourceCount: number;
  content: string;
};

export default function ProviderTestPage() {
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [keywordName, setKeywordName] = useState("OpenAI");
  const [category, setCategory] = useState<KeywordCategory>("ai-tech");
  const [description, setDescription] = useState("");
  const [searchResult, setSearchResult] = useState<SearchTestResult | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummaryTestResult | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [testingSearch, setTestingSearch] = useState(false);
  const [testingSummary, setTestingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadStatus() {
    setLoadingStatus(true);

    try {
      const response = await fetch("/api/providers/status", {
        cache: "no-store"
      });
      setStatus((await response.json()) as ProviderStatus);
    } catch {
      setStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function postTest<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        keywordName,
        category,
        description
      })
    });
    const data = (await response.json()) as T & { error?: string };

    if (!response.ok) {
      throw new Error(data.error || "测试失败");
    }

    return data;
  }

  async function handleSearch(event?: FormEvent) {
    event?.preventDefault();
    setTestingSearch(true);
    setError(null);
    setSearchResult(null);

    try {
      setSearchResult(await postTest<SearchTestResult>("/api/providers/test-search"));
      await loadStatus();
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : "搜索测试失败");
    } finally {
      setTestingSearch(false);
    }
  }

  async function handleSummary() {
    setTestingSummary(true);
    setError(null);
    setSummaryResult(null);

    try {
      setSummaryResult(await postTest<SummaryTestResult>("/api/providers/test-summary"));
      await loadStatus();
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : "总结测试失败");
    } finally {
      setTestingSummary(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <Link href="/settings" className="radar-button border-ink-950/10 bg-white px-3 py-2 text-sm text-ink-900 hover:text-radar-600">
        <ArrowLeft className="h-4 w-4" />
        返回设置
      </Link>

      <section className="radar-card rounded-3xl p-6 sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-radar-600">Provider Test</p>
        <h1 className="mt-2 text-3xl font-black text-ink-950 sm:text-4xl">真实 API 验证</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-700">
          这个页面只用于开发调试。它只显示 Key 是否已配置，不会展示 API Key 原文。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="radar-card rounded-2xl p-4">
          <p className="text-sm font-bold text-ink-700">SEARCH_PROVIDER</p>
          <p className="mt-2 text-xl font-black text-ink-950">{status?.search.requestedProvider ?? "mock"}</p>
        </div>
        <div className="radar-card rounded-2xl p-4">
          <p className="text-sm font-bold text-ink-700">SUMMARY_PROVIDER</p>
          <p className="mt-2 text-xl font-black text-ink-950">{status?.summary.requestedProvider ?? "mock"}</p>
        </div>
        <div className="radar-card rounded-2xl p-4">
          <p className="text-sm font-bold text-ink-700">TAVILY_API_KEY</p>
          <p className="mt-2 text-xl font-black text-ink-950">{status?.search.hasTavilyApiKey ? "已配置" : "未配置"}</p>
        </div>
        <div className="radar-card rounded-2xl p-4">
          <p className="text-sm font-bold text-ink-700">DEEPSEEK_API_KEY</p>
          <p className="mt-2 text-xl font-black text-ink-950">{status?.summary.hasDeepSeekApiKey ? "已配置" : "未配置"}</p>
        </div>
      </section>

      <form onSubmit={handleSearch} className="radar-card rounded-2xl p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <label className="block">
            <span className="text-sm font-bold text-ink-700">测试关键词</span>
            <input
              className="radar-input mt-2"
              value={keywordName}
              onChange={(event) => setKeywordName(event.target.value)}
              placeholder="例如：OpenAI / 中芯国际 / 广西公务员考试"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-ink-700">分类</span>
            <select
              className="radar-input mt-2"
              value={category}
              onChange={(event) => setCategory(event.target.value as KeywordCategory)}
            >
              {keywordCategories.map((item) => (
                <option key={item} value={item}>
                  {categoryLabels[item]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-bold text-ink-700">补充描述</span>
          <textarea
            className="radar-input mt-2 min-h-24 resize-y"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="可选，用于给搜索和总结更多上下文"
          />
        </label>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={testingSearch || loadingStatus || !keywordName.trim()}
            className="radar-button bg-ink-950 text-white hover:bg-ink-800"
          >
            {testingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            测试真实搜索
          </button>
          <button
            type="button"
            onClick={() => void handleSummary()}
            disabled={testingSummary || loadingStatus || !keywordName.trim()}
            className="radar-button bg-radar-500 text-ink-950 hover:bg-radar-600 hover:text-white"
          >
            {testingSummary ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            测试真实总结
          </button>
        </div>
      </form>

      {error ? (
        <div className="rounded-2xl border border-danger-500/25 bg-danger-500/10 p-4 text-sm font-bold text-danger-500">
          {error}
        </div>
      ) : null}

      {searchResult ? (
        <section className="radar-card rounded-2xl p-5">
          <div className="flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full bg-ink-950 px-3 py-1 text-white">搜索：{searchResult.provider}</span>
            <span className="rounded-full bg-white px-3 py-1 text-ink-800">请求：{searchResult.requestedProvider}</span>
            <span className={`rounded-full px-3 py-1 ${searchResult.fallbackUsed ? "bg-danger-500/10 text-danger-500" : "bg-radar-500/10 text-radar-600"}`}>
              fallback：{searchResult.fallbackUsed ? "是" : "否"}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-ink-800">
              mock：{searchResult.usedMock ? "是" : "否"}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-ink-800">
              tavily：{searchResult.usedTavily ? "是" : "否"}
            </span>
          </div>
          {searchResult.error ? <p className="mt-3 text-sm font-bold text-danger-500">{searchResult.error}</p> : null}
          <div className="mt-5 grid gap-3">
            {searchResult.results.map((item) => (
              <article key={`${item.url}-${item.title}`} className="rounded-xl border border-ink-950/10 bg-white/70 p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-black">
                  <span className="rounded-full bg-radar-500/10 px-2.5 py-1 text-radar-600">{item.credibility.label}</span>
                  <span className="rounded-full bg-ink-950/6 px-2.5 py-1 text-ink-700">score {Math.round((item.score ?? 0) * 100)}%</span>
                </div>
                <h2 className="mt-3 font-black text-ink-950">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-700">{item.content}</p>
                <p className="mt-2 text-xs font-bold text-ink-700">{item.source} · {item.credibility.reason}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {summaryResult ? (
        <section className="radar-card rounded-2xl p-5">
          <div className="flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full bg-ink-950 px-3 py-1 text-white">总结：{summaryResult.provider}</span>
            <span className="rounded-full bg-white px-3 py-1 text-ink-800">搜索上下文：{summaryResult.searchProvider}</span>
            <span className={`rounded-full px-3 py-1 ${summaryResult.fallbackUsed ? "bg-danger-500/10 text-danger-500" : "bg-radar-500/10 text-radar-600"}`}>
              fallback：{summaryResult.fallbackUsed ? "是" : "否"}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-ink-800">
              mock：{summaryResult.usedMock ? "是" : "否"}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-ink-800">
              tavily：{summaryResult.usedTavily ? "是" : "否"}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-ink-800">
              deepseek：{summaryResult.usedDeepSeek ? "是" : "否"}
            </span>
          </div>
          {summaryResult.error ? <p className="mt-3 text-sm font-bold text-danger-500">{summaryResult.error}</p> : null}
          <pre className="mt-5 whitespace-pre-wrap rounded-xl border border-ink-950/10 bg-white/70 p-4 text-sm leading-7 text-ink-800">
            {summaryResult.content}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
