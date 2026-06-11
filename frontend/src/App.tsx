import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCcw } from 'lucide-react';

import {
  type Health,
  type Keyword,
  type ProviderStatus,
  type SearchRun,
  createKeyword,
  deleteKeyword,
  getHealth,
  getProviders,
  getStoredApiBaseUrl,
  listKeywords,
  listRuns,
  normalizeBaseUrl,
  runKeyword,
  saveApiBaseUrl,
} from './api/client';
import { HistoryList } from './components/HistoryList';
import { KeywordPanel } from './components/KeywordPanel';
import { ResultList } from './components/ResultList';
import { SearchRunButton } from './components/SearchRunButton';
import { SettingsCard } from './components/SettingsCard';
import { SummaryCard } from './components/SummaryCard';

function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(getStoredApiBaseUrl);
  const [health, setHealth] = useState<Health | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywordId, setSelectedKeywordId] = useState<number | null>(null);
  const [runs, setRuns] = useState<SearchRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<SearchRun | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedKeyword = useMemo(
    () => keywords.find((keyword) => keyword.id === selectedKeywordId) || null,
    [keywords, selectedKeywordId],
  );

  const refreshKeywords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [healthResult, keywordResult] = await Promise.all([
        getHealth(apiBaseUrl),
        listKeywords(apiBaseUrl),
      ]);
      const providerResult = await getProviders(apiBaseUrl);
      setHealth(healthResult);
      setProviderStatus(providerResult);
      setKeywords(keywordResult);
      setSelectedKeywordId((currentId) => {
        if (currentId && keywordResult.some((keyword) => keyword.id === currentId)) {
          return currentId;
        }
        return keywordResult[0]?.id || null;
      });
    } catch (caught) {
      setHealth(null);
      setProviderStatus(null);
      setError(caught instanceof Error ? caught.message : '连接后端失败');
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl]);

  const refreshRuns = useCallback(
    async (keywordId: number) => {
      setError(null);
      try {
        const runResult = await listRuns(apiBaseUrl, keywordId);
        setRuns(runResult);
        setSelectedRun(runResult[0] || null);
      } catch (caught) {
        setRuns([]);
        setSelectedRun(null);
        setError(caught instanceof Error ? caught.message : '读取历史失败');
      }
    },
    [apiBaseUrl],
  );

  useEffect(() => {
    void refreshKeywords();
  }, [refreshKeywords]);

  useEffect(() => {
    if (selectedKeywordId) {
      void refreshRuns(selectedKeywordId);
    } else {
      setRuns([]);
      setSelectedRun(null);
    }
  }, [refreshRuns, selectedKeywordId]);

  async function handleAddKeyword(text: string) {
    setError(null);
    try {
      const keyword = await createKeyword(apiBaseUrl, text);
      setKeywords((current) => [keyword, ...current]);
      setSelectedKeywordId(keyword.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '添加失败');
    }
  }

  async function handleDeleteKeyword(keywordId: number) {
    setError(null);
    try {
      await deleteKeyword(apiBaseUrl, keywordId);
      setKeywords((current) => current.filter((keyword) => keyword.id !== keywordId));
      if (selectedKeywordId === keywordId) {
        setSelectedKeywordId(null);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '删除失败');
    }
  }

  async function handleRunSearch() {
    if (!selectedKeywordId) {
      return;
    }
    setIsRunning(true);
    setError(null);
    try {
      const run = await runKeyword(apiBaseUrl, selectedKeywordId);
      setSelectedRun(run);
      setRuns((current) => [run, ...current]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '搜索失败');
    } finally {
      setIsRunning(false);
    }
  }

  function handleSaveApiBaseUrl(url: string) {
    const normalized = normalizeBaseUrl(url);
    saveApiBaseUrl(normalized);
    setApiBaseUrl(normalized);
  }

  return (
    <main className="min-h-screen bg-[#ece7da] text-stone-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-8 pt-[env(safe-area-inset-top)] sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-emerald-800">Personal MVP</p>
            <h1 className="mt-1 text-3xl font-black leading-tight text-stone-950 sm:text-4xl">
              AI Information Radar
            </h1>
          </div>
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 text-sm font-bold text-stone-900 transition active:scale-[0.99] sm:w-auto"
            onClick={() => void refreshKeywords()}
            type="button"
            title="刷新"
            aria-label="刷新"
          >
            <RefreshCcw size={16} aria-hidden="true" />
            刷新
          </button>
        </header>

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <KeywordPanel
              keywords={keywords}
              selectedKeywordId={selectedKeywordId}
              onSelect={setSelectedKeywordId}
              onAdd={handleAddKeyword}
              onDelete={handleDeleteKeyword}
            />
            <SettingsCard
              apiBaseUrl={apiBaseUrl}
              providerStatus={providerStatus}
              onSave={handleSaveApiBaseUrl}
            />
          </aside>

          <section className="space-y-4">
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-stone-500">Selected</p>
                  <h2 className="mt-1 truncate text-2xl font-black text-stone-950">
                    {selectedKeyword ? selectedKeyword.text : '未选择关键词'}
                  </h2>
                </div>
                <SearchRunButton
                  disabled={!selectedKeyword || isLoading}
                  isRunning={isRunning}
                  onRun={handleRunSearch}
                />
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 ${
                    health?.status === 'ok'
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {health?.status === 'ok' ? (
                    <CheckCircle2 size={16} aria-hidden="true" />
                  ) : (
                    <AlertTriangle size={16} aria-hidden="true" />
                  )}
                  <span className="font-semibold">
                    {health?.status === 'ok' ? 'Backend online' : 'Backend unknown'}
                  </span>
                </div>
                {health && (
                  <p className="break-words text-xs text-stone-500">
                    {providerStatus
                      ? `${providerStatus.search_provider} search / ${providerStatus.summary_provider} summary / max ${providerStatus.search_max_results}`
                      : `${health.search_provider} search / ${health.summary_provider} summary`}
                  </p>
                )}
              </div>

              {error && (
                <div className="mt-4 break-words rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold leading-6 text-rose-800">
                  {error}
                </div>
              )}
              {providerStatus?.warnings.map((warning) => (
                <div
                  className="mt-3 break-words rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold leading-6 text-amber-800"
                  key={warning}
                >
                  {warning}
                </div>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <div className="space-y-4">
                <SummaryCard run={selectedRun} />
                <ResultList run={selectedRun} />
              </div>
              <HistoryList
                runs={runs}
                selectedRunId={selectedRun?.id || null}
                onSelect={setSelectedRun}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
