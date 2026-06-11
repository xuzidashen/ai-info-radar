import { BrainCircuit } from 'lucide-react';

import type { SearchRun } from '../api/client';
import { formatDateTime } from '../utils/date';

interface SummaryCardProps {
  run: SearchRun | null;
}

export function SummaryCard({ run }: SummaryCardProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 text-amber-800">
            <BrainCircuit size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-stone-950">AI 摘要</h2>
            <p className="text-xs text-stone-500">
              {run ? formatDateTime(run.created_at) : '等待搜索'}
            </p>
          </div>
        </div>
      </div>

      {run ? (
        <div className="space-y-3">
          {run.provider_info && (
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                {run.provider_info.search_provider} search
              </span>
              <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                {run.provider_info.summary_provider} summary
              </span>
            </div>
          )}
          {run.warnings.length > 0 && (
            <div className="space-y-2">
              {run.warnings.map((warning) => (
                <p
                  className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-900"
                  key={warning}
                >
                  {warning}
                </p>
              ))}
            </div>
          )}
          <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words rounded-md bg-stone-950 p-4 text-[13px] leading-6 text-stone-50">
            {run.summary}
          </pre>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-stone-300 px-3 py-8 text-center text-sm text-stone-500">
          暂无摘要
        </div>
      )}
    </section>
  );
}
