import { InfoItemCard } from "@/components/InfoItemCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { InfoItemDTO } from "@/lib/types";

export function SourceListCard({ items, title = "核心信源" }: { items: InfoItemDTO[]; title?: string }) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">展示来源、发布时间、provider、score、可信度、重要性和情绪。</p>
      <div className="mt-5">
        {items.length > 0 ? (
          <div className="grid gap-4">
            {items.map((item) => (
              <InfoItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState title="暂无来源" description="运行 Topic 后会显示搜索结果和可信度信息。" />
        )}
      </div>
    </section>
  );
}
