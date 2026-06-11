import Link from "next/link";
import { Filter, Search } from "lucide-react";

import { CinematicHero } from "@/components/brand/CinematicHero";
import { MarkdownPackageButton } from "@/components/MarkdownPackageButton";
import { ReportFavoriteButton } from "@/components/ReportFavoriteButton";
import { ReportLibraryCard } from "@/components/product/ReportLibraryCard";
import { ActionButton } from "@/components/ui/ActionButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { listAllReports, listReportTags } from "@/lib/services/reportCenterService";
import { listZones } from "@/lib/services/zoneService";
import { zoneReportTypes, type ZoneReportType } from "@/lib/types";

export const dynamic = "force-dynamic";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseDate(value?: string) {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseType(value?: string): ZoneReportType | undefined {
  return value && zoneReportTypes.includes(value as ZoneReportType) ? (value as ZoneReportType) : undefined;
}

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const zoneId = firstParam(params.zoneId);
  const type = firstParam(params.type);
  const query = firstParam(params.query);
  const favorite = firstParam(params.favorite);
  const tagId = firstParam(params.tagId);
  const dateFrom = firstParam(params.dateFrom);
  const dateTo = firstParam(params.dateTo);
  const queryString = new URLSearchParams(
    Object.entries({
      zoneId: zoneId ?? "",
      type: type ?? "",
      query: query ?? "",
      favorite: favorite ?? "",
      tagId: tagId ?? "",
      dateFrom: dateFrom ?? "",
      dateTo: dateTo ?? ""
    }).filter(([, value]) => value)
  ).toString();
  const [zones, reports, tags] = await Promise.all([
    listZones(),
    listAllReports({
      zoneId: zoneId || undefined,
      type: parseType(type),
      query: query || undefined,
      favoriteOnly: favorite === "1",
      tagId: tagId || undefined,
      dateFrom: parseDate(dateFrom),
      dateTo: parseDate(dateTo),
      limit: 100
    }),
    listReportTags()
  ]);

  const activeFilters = [zoneId, type, query, favorite, tagId, dateFrom, dateTo].filter(Boolean).length;

  return (
    <div className="mx-auto w-full max-w-[92rem] space-y-6">
      <CinematicHero
        eyebrow="Report Library"
        title="报告资料库"
        subtitle="沉淀、筛选、复制和归档"
        description="统一查看所有专区报告，按专区、类型、日期、关键词和标签筛选，并导出完整 Markdown 报告包。"
        mood="report"
        compact
        stats={[
          { label: "当前结果", value: String(reports.length), hint: "reports" },
          { label: "标签", value: String(tags.length), hint: "可组合筛选" },
          { label: "筛选", value: String(activeFilters), hint: "active filters" }
        ]}
      />

      <SectionCard
        title="筛选报告"
        description="筛选不会修改数据，只影响当前列表和报告包导出范围。"
        actions={<MarkdownPackageButton queryString={queryString} />}
      >
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-7" action="/reports">
          <label className="block">
            <span className="text-xs font-bold text-slate-500">专区</span>
            <select name="zoneId" defaultValue={zoneId ?? ""} className="radar-input mt-2">
              <option value="">全部专区</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">类型</span>
            <select name="type" defaultValue={type ?? ""} className="radar-input mt-2">
              <option value="">全部类型</option>
              {zoneReportTypes.map((reportType) => (
                <option key={reportType} value={reportType}>
                  {reportType}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">起始日期</span>
            <input name="dateFrom" defaultValue={dateFrom ?? ""} type="date" className="radar-input mt-2" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">结束日期</span>
            <input name="dateTo" defaultValue={dateTo ?? ""} type="date" className="radar-input mt-2" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">关键词</span>
            <input name="query" defaultValue={query ?? ""} className="radar-input mt-2" placeholder="搜索标题/摘要" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">标签</span>
            <select name="tagId" defaultValue={tagId ?? ""} className="radar-input mt-2">
              <option value="">全部标签</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm font-black text-slate-600">
            <input type="checkbox" name="favorite" value="1" defaultChecked={favorite === "1"} />
            收藏
          </label>
          <div className="flex items-end xl:col-start-7">
            <ActionButton type="submit" size="md" className="w-full">
              <Search className="h-4 w-4" />
              筛选
            </ActionButton>
          </div>
        </form>
      </SectionCard>

      <div className="flex flex-wrap items-center gap-2">
        <StatusPill tone="info">
          <Filter className="h-3.5 w-3.5" />
          全部
        </StatusPill>
        <Link href="/reports?favorite=1" className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600 transition hover:text-sky-700">
          收藏
        </Link>
        {tags.slice(0, 6).map((tag) => (
          <Link key={tag.id} href={`/reports?tagId=${tag.id}`} className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600 transition hover:text-sky-700">
            {tag.name}
          </Link>
        ))}
      </div>

      {reports.length > 0 ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {reports.map((report) => (
            <ReportLibraryCard
              key={report.id}
              report={report}
              actions={<ReportFavoriteButton reportId={report.id} favorite={report.favorite} compact />}
            />
          ))}
        </section>
      ) : (
        <EmptyState title="暂无报告" description="运行 Topic 后会在这里汇总所有报告。" />
      )}
    </div>
  );
}
