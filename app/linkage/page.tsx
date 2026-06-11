import { Network, Route, Workflow } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { AppContainer } from "@/components/ui/AppContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { listLinkageTopics } from "@/lib/services/linkageService";

export const dynamic = "force-dynamic";

function formatDate(value?: string | null) {
  if (!value) {
    return "暂无运行";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function LinkagePage() {
  const topics = await listLinkageTopics();
  const moduleCount = topics.reduce((sum, topic) => sum + (topic.moduleCount ?? 0), 0);
  const edgeCount = topics.reduce((sum, topic) => sum + (topic.edgeCount ?? 0), 0);
  const latestRuns = topics.filter((topic) => topic.latestLinkageAnalysis).length;

  return (
    <AppContainer size="xl">
      <PageHeader
        eyebrow="Linkage Overview"
        title="联合分析专区"
        subtitle="分析多个产业模块之间的上游、中游、下游传导关系，聚合关键路径、风险断点、假设和置信度。"
        meta={
          <>
            <StatusPill tone="danger">产业链路径</StatusPill>
            <StatusPill tone="warning">风险传导</StatusPill>
            <StatusPill tone="info">人工复核</StatusPill>
          </>
        }
        actions={
          <ActionButton href="/zones" variant="secondary">
            <Workflow className="h-4 w-4" />
            去 Linkage Zone 创建
          </ActionButton>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="联动主题" value={topics.length} description="Linkage Zone Topic" icon={<Network className="h-5 w-5" />} trend="topic" status="danger" />
        <MetricCard label="模块数量" value={moduleCount} description="上游/中游/下游模块" icon={<Route className="h-5 w-5" />} trend="modules" status="info" />
        <MetricCard label="关系数量" value={edgeCount} description="模块间传导关系" icon={<Network className="h-5 w-5" />} trend={`${latestRuns} 已运行`} status="warning" />
      </section>

      {topics.length > 0 ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {topics.map((topic) => {
            const analysis = topic.latestLinkageAnalysis;

            return (
              <article key={topic.id} className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <StatusPill tone="danger">联动主题</StatusPill>
                    <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950">{topic.name}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{topic.description || topic.category}</p>
                  </div>
                  <ActionButton href={`/zones/${topic.zoneId}/topics/${topic.id}`} variant="secondary" size="sm">
                    进入详情
                  </ActionButton>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                  <MetricMini label="模块" value={topic.moduleCount ?? 0} />
                  <MetricMini label="关系" value={topic.edgeCount ?? 0} />
                  <MetricMini label="联动分" value={analysis?.linkageScore ?? "未知"} tone="success" />
                  <MetricMini label="风险分" value={analysis?.riskScore ?? "未知"} tone="danger" />
                  <MetricMini label="置信度" value={analysis?.confidence ?? "未知"} tone="info" />
                  <MetricMini label="最近运行" value={formatDate(analysis?.createdAt)} />
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <EmptyState
          title="暂无联动主题"
          description="进入 Linkage Zone 创建主题，添加模块和关系后即可运行产业链联动分析。"
          icon={<Network className="h-5 w-5" />}
          action={<ActionButton href="/zones" variant="secondary">去专区创建</ActionButton>}
        />
      )}
    </AppContainer>
  );
}

function MetricMini({ label, value, tone = "neutral" }: { label: string; value: string | number; tone?: "success" | "danger" | "info" | "neutral" }) {
  const toneClass = {
    success: "text-radar-500",
    danger: "text-danger-500",
    info: "text-cyan-200",
    neutral: "text-slate-950"
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className={`mt-2 text-lg font-black ${toneClass}`}>{value}</p>
    </div>
  );
}
