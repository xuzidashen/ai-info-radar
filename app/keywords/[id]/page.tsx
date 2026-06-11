"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarClock, Layers3, Loader2, PlugZap, Sparkles } from "lucide-react";

import { FactorPanel } from "@/components/FactorPanel";
import { InfoItemCard } from "@/components/InfoItemCard";
import { SummaryBlock } from "@/components/SummaryBlock";
import { categoryLabels, type DailySignalDTO, type InfoItemDTO, type KeywordDetailDTO, type SummaryDTO } from "@/lib/types";

type DetailResponse = {
  keyword?: KeywordDetailDTO | null;
  error?: string;
};

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
  factor?: {
    requestedProvider: "mock" | "deepseek";
    activeProvider: "mock" | "deepseek";
    hasDeepSeekApiKey: boolean;
    model: string;
    fallbackWillBeUsed: boolean;
  };
};

type GenerateResponse = DetailResponse & {
  infoItems?: InfoItemDTO[];
  summary?: SummaryDTO | null;
  searchProvider?: string;
  summaryProvider?: string;
  fallbackUsed?: boolean;
  error?: string | null;
};

type AnalyzeResponse = DetailResponse & {
  dailySignal?: DailySignalDTO;
  factorProvider?: string;
  requestedProvider?: string;
  fallbackUsed?: boolean;
  error?: string | null;
};

type GenerateResult = {
  searchProvider: string;
  summaryProvider: string;
  fallbackUsed: boolean;
  error?: string | null;
};

type AnalyzeResult = {
  factorProvider: string;
  requestedProvider?: string;
  fallbackUsed: boolean;
  error?: string | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return "尚未生成";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default function KeywordDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const id = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params.id]);

  const [keyword, setKeyword] = useState<KeywordDetailDTO | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [lastGenerate, setLastGenerate] = useState<GenerateResult | null>(null);
  const [lastAnalyze, setLastAnalyze] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProviderStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/providers/status", {
        cache: "no-store"
      });

      if (response.ok) {
        setProviderStatus((await response.json()) as ProviderStatus);
      }
    } catch {
      setProviderStatus(null);
    }
  }, []);

  const loadDetail = useCallback(async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/keywords/${id}`, {
        cache: "no-store"
      });
      const data = (await response.json()) as DetailResponse;

      if (!response.ok || !data.keyword) {
        throw new Error(data.error || "获取关键词详情失败");
      }

      setKeyword(data.keyword);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "获取关键词详情失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadProviderStatus();
    void loadDetail();
  }, [loadDetail, loadProviderStatus]);

  async function handleGenerate() {
    if (!id) {
      return;
    }

    setGenerating(true);
    setError(null);
    setLastGenerate(null);

    try {
      const response = await fetch(`/api/keywords/${id}/generate`, {
        method: "POST"
      });
      const data = (await response.json()) as GenerateResponse;

      if (!response.ok || !data.keyword) {
        throw new Error(data.error || "生成简报失败");
      }

      setKeyword(data.keyword);
      setLastGenerate({
        searchProvider: data.searchProvider ?? "mock",
        summaryProvider: data.summaryProvider ?? "mock",
        fallbackUsed: Boolean(data.fallbackUsed),
        error: data.error
      });
      await loadProviderStatus();
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "生成简报失败");
    } finally {
      setGenerating(false);
    }
  }

  async function handleAnalyze() {
    if (!id) {
      return;
    }

    setAnalyzing(true);
    setError(null);
    setLastAnalyze(null);

    try {
      const response = await fetch(`/api/keywords/${id}/analyze-factors`, {
        method: "POST"
      });
      const data = (await response.json()) as AnalyzeResponse;

      if (!response.ok || !data.keyword) {
        throw new Error(data.error || "信息因子分析失败");
      }

      setKeyword(data.keyword);
      setLastAnalyze({
        factorProvider: data.factorProvider ?? "mock",
        requestedProvider: data.requestedProvider,
        fallbackUsed: Boolean(data.fallbackUsed),
        error: data.error
      });
      await loadProviderStatus();
    } catch (analyzeError) {
      setError(analyzeError instanceof Error ? analyzeError.message : "信息因子分析失败");
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-5xl items-center justify-center">
        <div className="radar-card flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold text-ink-700">
          <Loader2 className="h-5 w-5 animate-spin text-radar-600" />
          正在读取关键词详情
        </div>
      </div>
    );
  }

  if (!keyword) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href="/keywords" className="radar-button border-ink-950/10 bg-white text-ink-900">
          <ArrowLeft className="h-4 w-4" />
          返回关键词
        </Link>
        <div className="radar-card mt-6 rounded-2xl p-8">
          <h1 className="text-2xl font-black text-ink-950">关键词不可用</h1>
          <p className="mt-3 text-sm leading-7 text-danger-500">{error || "未找到该关键词"}</p>
        </div>
      </div>
    );
  }

  const latestSummary = keyword.summaries[0];
  const latestSignal = keyword.dailySignals?.[0] ?? null;
  const latestSearchProvider = keyword.infoItems[0]?.provider;
  const markdownContext = {
    keywordName: keyword.name,
    categoryLabel: categoryLabels[keyword.category],
    searchProvider: lastGenerate?.searchProvider ?? latestSearchProvider,
    summaryProvider: latestSummary?.provider,
    fallbackUsed: lastGenerate?.fallbackUsed,
    infoItems: keyword.infoItems.slice(0, 8)
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <Link href="/keywords" className="radar-button border-ink-950/10 bg-white px-3 py-2 text-sm text-ink-900 hover:text-radar-600">
        <ArrowLeft className="h-4 w-4" />
        返回关键词
      </Link>

      <section className="radar-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-radar-500/25 bg-radar-500/10 px-3 py-1 text-sm font-black text-radar-600">
                {categoryLabels[keyword.category]}
              </span>
              <span className="rounded-full border border-ink-950/10 bg-white/70 px-3 py-1 text-sm font-bold text-ink-700">
                {keyword.infoItems.length} 条信息
              </span>
              {latestSignal ? (
                <span className="rounded-full border border-signal-500/30 bg-signal-500/12 px-3 py-1 text-sm font-bold text-amber-700">
                  已生成 DailySignal
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-4xl font-black text-ink-950">{keyword.name}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-700">
              {keyword.description || "暂无描述。可以在关键词管理页编辑追踪目标和重点信息源。"}
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:min-w-72">
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={generating}
              className="radar-button bg-ink-950 text-white hover:bg-radar-600"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "生成中" : "生成简报"}
            </button>
            <div className="rounded-2xl border border-ink-950/10 bg-white/70 p-3 text-xs font-bold leading-6 text-ink-700">
              <p className="flex items-center gap-2 text-ink-950">
                <PlugZap className="h-4 w-4 text-radar-600" />
                当前模式
              </p>
              <p>搜索：{providerStatus?.search.activeProvider ?? "mock"}</p>
              <p>总结：{providerStatus?.summary.activeProvider ?? "mock"}</p>
              <p>因子：{providerStatus?.factor?.activeProvider ?? "mock"}</p>
              {providerStatus?.search.fallbackWillBeUsed ||
              providerStatus?.summary.fallbackWillBeUsed ||
              providerStatus?.factor?.fallbackWillBeUsed ? (
                <p className="text-danger-500">缺少 Key，将自动回退 mock</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-ink-950/8 bg-white/65 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-ink-700">
              <CalendarClock className="h-4 w-4 text-radar-600" />
              最近一次搜索
            </p>
            <p className="mt-2 font-black text-ink-950">{formatDate(keyword.lastSearchedAt)}</p>
          </div>
          <div className="rounded-2xl border border-ink-950/8 bg-white/65 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-ink-700">
              <Layers3 className="h-4 w-4 text-signal-500" />
              总结历史
            </p>
            <p className="mt-2 font-black text-ink-950">{keyword.summaries.length} 条</p>
          </div>
          <div className="rounded-2xl border border-ink-950/8 bg-white/65 p-4">
            <p className="text-sm font-bold text-ink-700">最近数据来源</p>
            <p className="mt-2 font-black text-ink-950">{latestSearchProvider ?? "尚未生成"}</p>
          </div>
        </div>
      </section>

      {lastGenerate ? (
        <div className="rounded-2xl border border-radar-500/25 bg-radar-500/10 p-4 text-sm font-bold leading-7 text-ink-800">
          本次搜索来源：{lastGenerate.searchProvider}；本次总结模型：{lastGenerate.summaryProvider}；
          {lastGenerate.fallbackUsed ? " 已使用 fallback mock。" : " 未使用 fallback。"}
          {lastGenerate.error ? <span className="block text-danger-500">提示：{lastGenerate.error}</span> : null}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-danger-500/25 bg-danger-500/10 p-4 text-sm font-bold text-danger-500">
          {error}
        </div>
      ) : null}

      <FactorPanel
        keywordCategory={keyword.category}
        latestSignal={latestSignal}
        analyzing={analyzing}
        onAnalyze={() => void handleAnalyze()}
        lastAnalyze={lastAnalyze}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-radar-600">Info Cards</p>
            <h2 className="mt-1 text-2xl font-black text-ink-950">信息卡片列表</h2>
          </div>

          {keyword.infoItems.length > 0 ? (
            <div className="grid gap-4">
              {keyword.infoItems.map((item) => (
                <InfoItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="radar-card rounded-2xl p-8 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-radar-600" />
              <h3 className="mt-4 text-xl font-black text-ink-950">还没有信息卡片</h3>
              <p className="mt-2 text-sm leading-7 text-ink-700">
                点击“生成简报”，系统会根据环境变量选择真实搜索或 mock 搜索。
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-radar-600">AI Summary</p>
            <h2 className="mt-1 text-2xl font-black text-ink-950">AI 总结区域</h2>
          </div>

          {latestSummary ? (
            <SummaryBlock title="最新 AI 简报" summary={latestSummary} enableActions markdownContext={markdownContext} />
          ) : (
            <div className="radar-card rounded-2xl p-8">
              <h3 className="text-xl font-black text-ink-950">暂无总结</h3>
              <p className="mt-2 text-sm leading-7 text-ink-700">生成后会按照关键词类型输出不同的结构化模板。</p>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-xl font-black text-ink-950">历史总结列表</h2>
            {keyword.summaries.length > 0 ? (
              keyword.summaries.map((summary, index) => (
                <SummaryBlock
                  key={summary.id}
                  title={`历史简报 #${keyword.summaries.length - index}`}
                  summary={summary}
                  compact
                  enableActions
                  markdownContext={{
                    ...markdownContext,
                    summaryProvider: summary.provider
                  }}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-ink-950/10 bg-white/70 p-5 text-sm leading-7 text-ink-700">
                暂无历史总结。每次点击“生成简报”都会保存一条 Summary 记录。
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}

