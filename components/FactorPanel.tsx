import { Activity, AlertTriangle, BarChart3, Loader2, ShieldCheck } from "lucide-react";

import { DailySignalCard } from "@/components/DailySignalCard";
import { SignalLevelBadge } from "@/components/SignalLevelBadge";
import type { DailySignalDTO, KeywordCategory } from "@/lib/types";

type AnalyzeResult = {
  factorProvider: string;
  requestedProvider?: string;
  fallbackUsed: boolean;
  error?: string | null;
};

export function FactorPanel({
  keywordCategory,
  latestSignal,
  analyzing,
  onAnalyze,
  lastAnalyze
}: {
  keywordCategory: KeywordCategory;
  latestSignal?: DailySignalDTO | null;
  analyzing: boolean;
  onAnalyze: () => void;
  lastAnalyze?: AnalyzeResult | null;
}) {
  return (
    <section className="radar-card rounded-2xl p-5">
      <div className="flex flex-col gap-4 border-b border-ink-950/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950 text-radar-500">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-ink-950">信息因子分析</h2>
              <p className="text-sm text-ink-700">对信息卡片做情绪、影响、风险、政策、技术、财经和关注度评分</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={analyzing}
          className="radar-button bg-ink-950 text-white hover:bg-radar-600"
        >
          {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
          {analyzing ? "分析中" : "分析信息因子"}
        </button>
      </div>

      {lastAnalyze ? (
        <div className="mt-4 rounded-xl border border-radar-500/25 bg-radar-500/10 p-3 text-sm font-bold leading-6 text-ink-800">
          本次因子 provider：{lastAnalyze.factorProvider}
          {lastAnalyze.requestedProvider ? `（请求：${lastAnalyze.requestedProvider}）` : ""}；
          {lastAnalyze.fallbackUsed ? "已 fallback 到 mock。" : "未使用 fallback。"}
          {lastAnalyze.error ? <span className="block text-danger-500">提示：{lastAnalyze.error}</span> : null}
        </div>
      ) : null}

      {latestSignal ? (
        <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SignalLevelBadge kind="signal" value={latestSignal.signalLevel} />
            <SignalLevelBadge kind="risk" value={latestSignal.riskLevel} />
            <SignalLevelBadge kind="attention" value={latestSignal.attentionLevel} />
          </div>
          <DailySignalCard signal={latestSignal} />
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-ink-950/10 bg-white/70 p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-radar-600" />
            <div>
              <h3 className="font-black text-ink-950">还没有 DailySignal</h3>
              <p className="mt-2 text-sm leading-7 text-ink-700">
                先生成简报得到信息卡片，然后点击“分析信息因子”。系统会保存今日信号，刷新后仍可查看。
              </p>
            </div>
          </div>
        </div>
      )}

      {keywordCategory === "finance" ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-danger-500/20 bg-danger-500/8 p-3 text-xs font-bold leading-6 text-danger-500">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          以上内容仅为公开信息整理和辅助研究，不构成投资建议。
        </div>
      ) : null}
    </section>
  );
}

