import Link from "next/link";
import { ArrowRight, Clock3, Edit3, FileText, Trash2 } from "lucide-react";

import { categoryHints, categoryLabels, type KeywordDTO } from "@/lib/types";

function formatDate(value: string | null) {
  if (!value) {
    return "尚未生成";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function KeywordCard({
  keyword,
  onDelete,
  onEdit,
  deleting = false
}: {
  keyword: KeywordDTO;
  onDelete?: (id: string) => void;
  onEdit?: (keyword: KeywordDTO) => void;
  deleting?: boolean;
}) {
  return (
    <article className="radar-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-radar-500/45">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-ink-950">{keyword.name}</h3>
            <span className="rounded-full border border-radar-500/25 bg-radar-500/10 px-2.5 py-1 text-xs font-bold text-radar-600">
              {categoryLabels[keyword.category]}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-700">
            {keyword.description || categoryHints[keyword.category]}
          </p>
        </div>

        <div className="flex gap-2">
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(keyword)}
              className="radar-button border-ink-950/10 bg-white px-3 py-2 text-ink-800 hover:border-radar-500/30 hover:text-radar-600"
              title="编辑关键词"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              disabled={deleting}
              onClick={() => onDelete(keyword.id)}
              className="radar-button border-danger-500/20 bg-danger-500/8 px-3 py-2 text-danger-500 hover:bg-danger-500/14"
              title="删除关键词"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-xl border border-ink-950/8 bg-white/60 p-3">
          <p className="text-ink-700">信息卡片</p>
          <p className="mt-1 font-black text-ink-950">{keyword.infoItemCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-ink-950/8 bg-white/60 p-3">
          <p className="text-ink-700">历史简报</p>
          <p className="mt-1 font-black text-ink-950">{keyword.summaryCount ?? 0}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-ink-950/8 bg-white/60 p-3 sm:col-span-1">
          <p className="flex items-center gap-1.5 text-ink-700">
            <Clock3 className="h-3.5 w-3.5" />
            最近搜索
          </p>
          <p className="mt-1 font-black text-ink-950">{formatDate(keyword.lastSearchedAt)}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-ink-950/8 pt-4">
        <span className="flex items-center gap-2 text-sm font-bold text-ink-700">
          <FileText className="h-4 w-4 text-signal-500" />
          进入详情生成简报
        </span>
        <Link
          href={`/keywords/${keyword.id}`}
          className="radar-button bg-ink-950 px-3 py-2 text-white hover:bg-ink-800"
        >
          查看
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

