import { FileText } from "lucide-react";

import { ReportLibraryCard, type ReportLibraryItem } from "@/components/product/ReportLibraryCard";
import { EmptyState } from "@/components/ui/EmptyState";

export function RecentReportList({ reports }: { reports: ReportLibraryItem[] }) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-950">最近报告</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">最新沉淀的 Markdown 资料和分析结果。</p>
        </div>
        <FileText className="h-5 w-5 text-sky-700" />
      </div>
      <div className="mt-5">
        {reports.length > 0 ? (
          <div className="grid gap-4">
            {reports.slice(0, 4).map((report) => (
              <ReportLibraryCard key={report.id} report={report} compact />
            ))}
          </div>
        ) : (
          <EmptyState title="暂无报告" description="运行任意 Topic 后，最近报告会显示在这里。" />
        )}
      </div>
    </section>
  );
}
