import { Trash2 } from 'lucide-react';

import type { Keyword } from '../api/client';
import { AddKeywordForm } from './AddKeywordForm';

interface KeywordPanelProps {
  keywords: Keyword[];
  selectedKeywordId: number | null;
  onSelect: (keywordId: number) => void;
  onAdd: (text: string) => Promise<void>;
  onDelete: (keywordId: number) => Promise<void>;
}

export function KeywordPanel({
  keywords,
  selectedKeywordId,
  onSelect,
  onAdd,
  onDelete,
}: KeywordPanelProps) {
  return (
    <section className="space-y-4 rounded-lg border border-stone-200 bg-[#faf8f1] p-4 shadow-soft">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-emerald-800">Radar</p>
          <h2 className="text-xl font-bold text-stone-950">关键词</h2>
        </div>
        <span className="rounded-full bg-stone-950 px-2.5 py-1 text-xs font-semibold text-white">
          {keywords.length}
        </span>
      </div>

      <AddKeywordForm onAdd={onAdd} />

      <div className="space-y-2">
        {keywords.length === 0 ? (
          <div className="rounded-md border border-dashed border-stone-300 px-3 py-5 text-center text-sm text-stone-500">
            暂无关键词
          </div>
        ) : (
          keywords.map((keyword) => {
            const selected = keyword.id === selectedKeywordId;
            return (
              <div
                className={`flex items-center gap-2 rounded-md border p-2 transition ${
                  selected
                    ? 'border-emerald-700 bg-emerald-50'
                    : 'border-stone-200 bg-white'
                }`}
                key={keyword.id}
              >
                <button
                  className="min-w-0 flex-1 truncate px-1 text-left text-[15px] font-semibold text-stone-950"
                  onClick={() => onSelect(keyword.id)}
                  type="button"
                >
                  {keyword.text}
                </button>
                <button
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-stone-500 transition hover:bg-rose-50 hover:text-rose-700 active:scale-95"
                  onClick={() => onDelete(keyword.id)}
                  type="button"
                  title="删除关键词"
                  aria-label={`删除 ${keyword.text}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

