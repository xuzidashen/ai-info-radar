import { GitCompareArrows } from "lucide-react";

import { AppContainer } from "@/components/ui/AppContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { getReportById, listAllReports } from "@/lib/services/reportCenterService";
import { diffReports } from "@/lib/utils/reportDiff";

export const dynamic = "force-dynamic";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function ReportComparePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const leftId = firstParam(params.leftId);
  const rightId = firstParam(params.rightId);
  const reports = await listAllReports({ limit: 200 });
  const [leftReport, rightReport] = await Promise.all([leftId ? getReportById(leftId) : null, rightId ? getReportById(rightId) : null]);
  const diff = leftReport && rightReport ? diffReports(leftReport, rightReport) : null;

  return (
    <AppContainer size="xl">
      <PageHeader
        eyebrow="Report Compare"
        title="报告对比"
        subtitle="选择两个报告，先做本地文本结构对比。后续可以接入 DeepSeek 做语义变化解释。"
        meta={
          <>
            <StatusPill tone="info">{reports.length} reports</StatusPill>
            <StatusPill tone="neutral">No AI Compare</StatusPill>
          </>
        }
      />

      <SectionCard title="选择报告" description="建议选择同一个 Topic 的不同时间报告，变化提示更有参考价值。">
        <form action="/reports/compare" className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select name="leftId" defaultValue={leftId ?? ""} className="radar-input">
            <option value="">选择左侧报告</option>
            {reports.map((report) => (
              <option key={report.id} value={report.id}>
                {report.title} / {formatDate(report.createdAt)}
              </option>
            ))}
          </select>
          <select name="rightId" defaultValue={rightId ?? ""} className="radar-input">
            <option value="">选择右侧报告</option>
            {reports.map((report) => (
              <option key={report.id} value={report.id}>
                {report.title} / {formatDate(report.createdAt)}
              </option>
            ))}
          </select>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-sky-950">
            <GitCompareArrows className="h-4 w-4" />
            开始对比
          </button>
        </form>
      </SectionCard>

      {diff && leftReport && rightReport ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="长度变化" value={diff.lengthDiff} trend="chars" status={diff.lengthDiff >= 0 ? "info" : "neutral"} />
            <MetricCard label="共同结构" value={diff.commonHeadings.length} />
            <MetricCard label="新增结构" value={diff.addedHeadings.length} status={diff.addedHeadings.length > 0 ? "success" : "neutral"} />
            <MetricCard label="减少结构" value={diff.removedHeadings.length} status={diff.removedHeadings.length > 0 ? "warning" : "neutral"} />
          </section>

          <SectionCard title="变化摘要" description="这是规则型对比，不会编造未出现的信息。">
            <p className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4 text-sm font-bold leading-7 text-slate-600">{diff.summary}</p>
          </SectionCard>

          <section className="grid gap-5 xl:grid-cols-2">
            <ReportComparePanel title="左侧报告" report={leftReport} />
            <ReportComparePanel title="右侧报告" report={rightReport} />
          </section>

          <SectionCard title="结构差异" description="按 Markdown 标题和【结构块】粗略提取。">
            <div className="grid gap-3 md:grid-cols-3">
              <DiffList title="共同结构" items={diff.commonHeadings} />
              <DiffList title="右侧新增" items={diff.addedHeadings} />
              <DiffList title="右侧减少" items={diff.removedHeadings} />
            </div>
          </SectionCard>
        </>
      ) : (
        <EmptyState title="请选择两个报告" description="选择左侧和右侧报告后即可查看差异。" icon={<GitCompareArrows className="h-5 w-5" />} />
      )}
    </AppContainer>
  );
}

function ReportComparePanel({ title, report }: { title: string; report: NonNullable<Awaited<ReturnType<typeof getReportById>>> }) {
  return (
    <SectionCard title={title} description={`${report.zone.name} / ${report.type} / ${formatDate(report.createdAt)}`}>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-radar-500">Title</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">{report.title}</h2>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-radar-500">Summary</p>
          <p className="mt-2 max-h-44 overflow-auto rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4 text-sm font-bold leading-7 text-slate-600">
            {report.summary ?? "暂无摘要"}
          </p>
        </div>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4 text-xs leading-6 text-slate-600">
          {report.markdown}
        </pre>
      </div>
    </SectionCard>
  );
}

function DiffList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4">
      <h3 className="font-black text-slate-950">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <p key={item} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
              {item}
            </p>
          ))
        ) : (
          <p className="text-sm font-bold text-slate-400">暂无</p>
        )}
      </div>
    </div>
  );
}
