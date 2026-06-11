import { Clock3 } from 'lucide-react';

import type { SearchRun } from '../api/client';
import { formatDateTime } from '../utils/date';

interface HistoryListProps {
  runs: SearchRun[];
  selectedRunId: number | null;
  onSelect: (run: SearchRun) => void;
}

export function HistoryList({ runs, selectedRunId, onSelect }: HistoryListProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock3 size={18} className="text-emerald-700" aria-hidden="true" />
          <h2 className="text-lg font-bold text-stone-950">历史记录</h2>
        </div>
        <span className="text-xs font-semibold text-stone-500">{runs.length}</span>
      </div>

      {runs.length === 0 ? (
        <div className="rounded-md border border-dashed border-stone-300 px-3 py-8 text-center text-sm text-stone-500">
          暂无历史
        </div>
      ) : (
        <div className="max-h-[520px] space-y-2 overflow-auto pr-1">
          {runs.map((run) => {
            const selected = run.id === selectedRunId;
            return (
              <button
                className={`w-full rounded-md border p-3 text-left transition ${
                  selected
                    ? 'border-emerald-700 bg-emerald-50'
                    : 'border-stone-200 bg-[#faf8f1] hover:border-stone-300'
                }`}
                key={run.id}
                onClick={() => onSelect(run)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-stone-950">
                    {run.keyword_text}
                  </span>
                  <span className="shrink-0 text-xs text-stone-500">
                    {run.results.length} 条
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  {formatDateTime(run.created_at)}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
