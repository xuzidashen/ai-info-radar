import Link from "next/link";
import { ArrowLeft, History, Layers3, Tag } from "lucide-react";
import { notFound } from "next/navigation";

import { ReportPreview } from "@/components/ReportPreview";
import { ReportFavoriteButton } from "@/components/ReportFavoriteButton";
import { ReportTagManager } from "@/components/ReportTagManager";
import { ActionButton } from "@/components/ui/ActionButton";
import { AppContainer } from "@/components/ui/AppContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { getReportDetailContext, listReportTags } from "@/lib/services/reportCenterService";
import { buildScoreReason, deriveItemTags, formatDisplayScore, toDisplayScore } from "@/lib/utils/itemScoring";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatMetadata(value: string | null) {
  if (!value) {
    return "暂无 metadata";
  }

  try {
    return JSON.stringify(JSON.parse(value) as unknown, null, 2);
  } catch {
    return value;
  }
}

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [detail, tags] = await Promise.all([getReportDetailContext(id), listReportTags()]);

  if (!detail) {
    notFound();
  }

  const { report, metadata, topic, keyword, infoItems } = detail;
  const itemCount = metadata.itemCount ?? infoItems.length;
  const averageScore = metadata.averageScore ?? (infoItems.length > 0 ? Number((infoItems.reduce((sum, item) => sum + toDisplayScore(item.score, item.importance), 0) / infoItems.length).toFixed(1)) : null);
  const majorTags = metadata.topTags ?? Array.from(new Set(infoItems.flatMap((item) => deriveItemTags(item, topic?.category ?? keyword?.category ?? report.zone.type)))).slice(0, 6);
  const highScoreItems = [...infoItems]
    .sort((a, b) => toDisplayScore(b.score, b.importance) - toDisplayScore(a.score, a.importance))
    .slice(0, 5);
  const sourceItems = infoItems.slice(0, 8);
  const followUp = report.type === "linkage" ? "继续跟踪关键路径、上游变化和风险断点，避免把假设写成结论。" : "继续跟踪高可信来源、官方公告和后续更新；信息不足时不要扩展出未出现的事实。";

  return (
    <AppContainer size="lg">
      <div>
        <Link href="/reports" className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-sky-700">
          <ArrowLeft className="h-4 w-4" />
          返回报告中心
        </Link>
      </div>

      <PageHeader
        eyebrow="Report Detail"
        title={report.title}
        subtitle={`${report.zone.name} / ${report.type} / ${formatDate(report.createdAt)}`}
        meta={
          <>
            <StatusPill tone="info">{report.type}</StatusPill>
            <StatusPill tone="neutral">{report.zone.name}</StatusPill>
            {topic ? <StatusPill tone="neutral">{topic.name}</StatusPill> : null}
            {report.runLog ? <StatusPill tone={report.runLog.status === "failed" ? "danger" : "success"}>{report.runLog.status}</StatusPill> : null}
          </>
        }
        actions={
          <>
            <ReportFavoriteButton reportId={report.id} favorite={report.favorite} />
            {report.runLog ? (
              <ActionButton href={`/runs/${report.runLog.id}`} variant="secondary">
                <History className="h-4 w-4" />
                查看运行日志
              </ActionButton>
            ) : null}
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SectionCard className="h-full" contentClassName="p-4" title="内容数量">
          <div className="text-3xl font-black text-slate-950">{itemCount}</div>
          <p className="mt-2 text-sm text-slate-500">本次报告共整理的信息项</p>
        </SectionCard>
        <SectionCard className="h-full" contentClassName="p-4" title="平均评分">
          <div className="text-3xl font-black text-slate-950">{typeof averageScore === "number" ? `${averageScore.toFixed(1)}/10` : "暂无"}</div>
          <p className="mt-2 text-sm text-slate-500">综合来源相关度与可信度</p>
        </SectionCard>
        <SectionCard className="h-full" contentClassName="p-4" title="主要标签">
          <div className="flex flex-wrap gap-2">
            {majorTags.length > 0 ? (
              majorTags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">暂无</span>
            )}
          </div>
        </SectionCard>
        <SectionCard className="h-full" contentClassName="p-4" title="生成时间">
          <div className="text-lg font-black text-slate-950">{formatDate(report.createdAt)}</div>
          <p className="mt-2 text-sm text-slate-500">搜索与总结完成后写入</p>
        </SectionCard>
      </section>

      <ReportPreview report={report} zoneName={report.zone.name} />

      <SectionCard title="今日重点" description="沿用报告正文，但顶部更适合快速扫读。">
        <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{report.summary || "暂无摘要"}</p>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <SectionCard title="高分信息" description="按 0-10 评分排序，优先展示高分来源。">
          {highScoreItems.length > 0 ? (
            <div className="grid gap-4">
              {highScoreItems.map((item) => {
                const score = formatDisplayScore(item.score, item.importance);
                const scoreReason = buildScoreReason(item);
                const tags = deriveItemTags(item, topic?.category ?? keyword?.category ?? report.zone.type);

                return (
                  <article key={item.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-base font-black leading-7 text-slate-950">{item.title}</h3>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {item.source} · {formatDate(item.publishedAt)}
                        </p>
                      </div>
                      <StatusPill tone="info">{score}</StatusPill>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.summary}</p>
                    <p className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold leading-6 text-slate-600">
                      <span className="text-slate-950">评分理由：</span>
                      {scoreReason}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-black text-slate-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <a href={item.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-black text-sky-700 transition hover:text-sky-800">
                      打开原文
                    </a>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState title="暂无高分信息" description="本次报告里还没有足够高分的来源。" icon={<Layers3 className="h-5 w-5" />} />
          )}
        </SectionCard>

        <SectionCard title="来源列表" description="按当前报告中整理出的来源与标签快速回看。">
          {sourceItems.length > 0 ? (
            <div className="grid gap-3">
              {sourceItems.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4">
                  <h3 className="text-sm font-black leading-6 text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-xs font-bold text-slate-500">{item.source}</p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{item.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {deriveItemTags(item, topic?.category ?? keyword?.category ?? report.zone.type).slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-black text-slate-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="暂无来源" description="当前报告没有可显示的来源列表。" icon={<Tag className="h-5 w-5" />} />
          )}
        </SectionCard>
      </div>

      <SectionCard title="背景补充" description="保留原始 Markdown 和高层背景，便于复查。">
        <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4 text-sm leading-7 text-slate-600">
          {report.summary ? report.summary : "现有来源不足以形成背景补充。"}
        </pre>
      </SectionCard>

      <SectionCard title="后续关注" description="报告的下一步关注方向。">
        <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{followUp}</p>
      </SectionCard>

      <SectionCard title="收藏与标签" description="用于长期归档、筛选和后续报告包整理。">
        <ReportTagManager reportId={report.id} tags={report.tags} availableTags={tags} />
      </SectionCard>

      <SectionCard title="元数据" description="报告生成时保存的 provider、fallback、topicId 等追踪信息。">
        <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4 text-sm leading-7 text-slate-600">
          {formatMetadata(report.metadata)}
        </pre>
      </SectionCard>
    </AppContainer>
  );
}
