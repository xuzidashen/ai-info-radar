import { Loader2 } from "lucide-react";

import { SkeletonCard } from "@/components/ui/SkeletonCard";

export function LoadingState({
  title = "正在加载",
  description = "正在整理页面数据，请稍候。",
  cards = 3
}: {
  title?: string;
  description?: string;
  cards?: number;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 py-8">
      <div className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
          </span>
          <div>
            <h1 className="text-xl font-black text-slate-950">{title}</h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <SkeletonCard key={index} compact={index > 0} />
        ))}
      </div>
    </div>
  );
}
