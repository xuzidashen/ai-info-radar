import { ExternalLink } from 'lucide-react';

import type { SearchRun } from '../api/client';
import { formatDateTime } from '../utils/date';

interface ResultListProps {
  run: SearchRun | null;
}

export function ResultList({ run }: ResultListProps) {
  function sourceTypeLabel(type: string): string {
    return {
      official: '官方',
      media: '媒体',
      forum: '社区',
      research: '研究',
      technical: '技术',
      unknown: '未知',
    }[type] || type;
  }

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-stone-950">来源链接</h2>
        <span className="text-xs font-semibold text-stone-500">
          {run ? `${run.results.length} 条` : '0 条'}
        </span>
      </div>

      {run && run.results.length > 0 ? (
        <div className="space-y-3">
          {run.results.map((result) => (
            <article
              className="overflow-hidden rounded-md border border-stone-200 bg-[#faf8f1] p-3"
              key={result.source_url}
            >
              <a
                className="group flex items-start gap-2 text-[15px] font-bold leading-5 text-stone-950"
                href={result.source_url}
                rel="noreferrer"
                target="_blank"
              >
                <span className="min-w-0 flex-1">{result.title}</span>
                <ExternalLink
                  className="mt-0.5 shrink-0 text-emerald-700 transition group-hover:translate-x-0.5"
                  size={15}
                  aria-hidden="true"
                />
              </a>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.source_domain && (
                  <span className="max-w-full break-all rounded-md bg-white px-2 py-1 text-xs font-semibold text-stone-700">
                    {result.source_domain}
                  </span>
                )}
                <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                  {sourceTypeLabel(result.source_type)}
                </span>
                <span className="rounded-md bg-stone-950 px-2 py-1 text-xs font-semibold text-white">
                  {result.credibility_score}/5
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-600">{result.snippet}</p>
              <p className="mt-2 break-all text-xs leading-5 text-stone-500">
                {result.source_url}
              </p>
              {result.published_at && (
                <p className="mt-2 text-xs text-stone-500">
                  {formatDateTime(result.published_at)}
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-stone-300 px-3 py-8 text-center text-sm text-stone-500">
          暂无来源
        </div>
      )}
    </section>
  );
}
