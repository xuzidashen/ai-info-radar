"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Boxes, GitBranch, Pencil, Plus, RefreshCw, Route, Save } from "lucide-react";

import { DailySignalCard } from "@/components/DailySignalCard";
import { LinkageEdgeList } from "@/components/LinkageEdgeList";
import { LinkageModuleCard } from "@/components/LinkageModuleCard";
import { LinkagePathView } from "@/components/LinkagePathView";
import { SummaryBlock } from "@/components/SummaryBlock";
import { TemplatePreview } from "@/components/TemplatePreview";
import { TopicRunButton } from "@/components/TopicRunButton";
import { ZoneReportCard } from "@/components/ZoneReportCard";
import { IndustryFlowCard } from "@/components/product/IndustryFlowCard";
import { SignalMetricStrip } from "@/components/product/SignalMetricStrip";
import { SourceListCard } from "@/components/product/SourceListCard";
import { TopicHeroCard } from "@/components/product/TopicHeroCard";
import { ActionButton } from "@/components/ui/ActionButton";
import { AppContainer } from "@/components/ui/AppContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { summaryTemplates } from "@/lib/templates/summaryTemplates";
import {
  linkageModuleRoleLabels,
  linkageModuleRoles,
  linkageRelationTypeLabels,
  linkageRelationTypes,
  searchModeLabels,
  searchModes,
  zoneTypeLabels,
  type SearchMode,
  type LinkageModuleRole,
  type LinkageRelationType,
  type ZoneTopicDetailDTO,
  type ZoneType
} from "@/lib/types";

type TopicResponse = {
  topic?: ZoneTopicDetailDTO;
  error?: string;
};

const complianceText = "以上内容仅为公开信息整理和辅助研究，不构成投资建议。";

const topicProfiles: Record<
  ZoneType,
  {
    eyebrow: string;
    mode: string;
    summaryTitle: string;
    sourceTitle: string;
    tone: "success" | "warning" | "danger";
  }
> = {
  search: {
    eyebrow: "Search Topic",
    mode: "检索模式",
    summaryTitle: "AI 总结",
    sourceTitle: "来源列表",
    tone: "success"
  },
  analysis: {
    eyebrow: "Analysis Topic",
    mode: "分析模式",
    summaryTitle: "AI 分析总结",
    sourceTitle: "信息卡片与因子",
    tone: "warning"
  },
  linkage: {
    eyebrow: "Linkage Topic",
    mode: "联动分析状态",
    summaryTitle: "联动分析报告",
    sourceTitle: "产业链模块",
    tone: "danger"
  }
};

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

function parseStringList(value: string | null): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export default function ZoneTopicDetailPage() {
  const params = useParams<{ id: string | string[]; topicId: string | string[] }>();
  const zoneId = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params.id]);
  const topicId = useMemo(() => {
    const raw = params.topicId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params.topicId]);
  const [topic, setTopic] = useState<ZoneTopicDetailDTO | null>(null);
  const [moduleName, setModuleName] = useState("");
  const [moduleRole, setModuleRole] = useState<LinkageModuleRole>("upstream");
  const [moduleDescription, setModuleDescription] = useState("");
  const [edgeFrom, setEdgeFrom] = useState("");
  const [edgeTo, setEdgeTo] = useState("");
  const [relationType, setRelationType] = useState<LinkageRelationType>("demand_pull");
  const [edgeReason, setEdgeReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingTopic, setEditingTopic] = useState(false);
  const [savingTopic, setSavingTopic] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSearchMode, setEditSearchMode] = useState<SearchMode>("general");
  const [editSummaryTemplate, setEditSummaryTemplate] = useState("");
  const [editAnalysisEnabled, setEditAnalysisEnabled] = useState(false);
  const [editFactorEnabled, setEditFactorEnabled] = useState(false);
  const [editLinkageEnabled, setEditLinkageEnabled] = useState(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTopic = useCallback(async () => {
    if (!zoneId || !topicId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/zones/${zoneId}/topics/${topicId}`, {
        cache: "no-store"
      });
      const data = (await response.json()) as TopicResponse;

      if (!response.ok || !data.topic) {
        throw new Error(data.error || "获取 Topic 详情失败");
      }

      setTopic(data.topic);
      setEditName(data.topic.name);
      setEditCategory(data.topic.category);
      setEditDescription(data.topic.description ?? "");
      setEditSearchMode(data.topic.searchMode);
      setEditSummaryTemplate(data.topic.summaryTemplate ?? "");
      setEditAnalysisEnabled(data.topic.analysisEnabled);
      setEditFactorEnabled(data.topic.factorEnabled);
      setEditLinkageEnabled(data.topic.linkageEnabled);
      setEdgeFrom(data.topic.modules[0]?.id ?? "");
      setEdgeTo(data.topic.modules[1]?.id ?? "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "获取 Topic 详情失败");
    } finally {
      setLoading(false);
    }
  }, [topicId, zoneId]);

  useEffect(() => {
    void loadTopic();
  }, [loadTopic]);

  async function addModule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!topicId) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/linkage/topics/${topicId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: moduleName,
          role: moduleRole,
          description: moduleDescription,
          weight: 1
        })
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "创建模块失败");
      }

      setModuleName("");
      setModuleDescription("");
      await loadTopic();
    } catch (moduleError) {
      setError(moduleError instanceof Error ? moduleError.message : "创建模块失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function addEdge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!topicId) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/linkage/topics/${topicId}/edges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromModuleId: edgeFrom,
          toModuleId: edgeTo,
          relationType,
          strength: 0.65,
          reason: edgeReason
        })
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "创建关系失败");
      }

      setEdgeReason("");
      await loadTopic();
    } catch (edgeError) {
      setError(edgeError instanceof Error ? edgeError.message : "创建关系失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLatestReport(markdown: string) {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedReport(true);
      window.setTimeout(() => setCopiedReport(false), 1600);
    } catch {
      setError("复制 Markdown 失败，请稍后重试。");
    }
  }

  function openEditPanel() {
    if (!topic) {
      return;
    }

    setEditName(topic.name);
    setEditCategory(topic.category);
    setEditDescription(topic.description ?? "");
    setEditSearchMode(topic.searchMode);
    setEditSummaryTemplate(topic.summaryTemplate ?? "");
    setEditAnalysisEnabled(topic.analysisEnabled);
    setEditFactorEnabled(topic.factorEnabled);
    setEditLinkageEnabled(topic.linkageEnabled);
    setEditMessage(null);
    setEditingTopic(true);
  }

  async function saveTopicEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!zoneId || !topicId) {
      return;
    }

    setSavingTopic(true);
    setEditMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/zones/${zoneId}/topics/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          category: editCategory,
          description: editDescription,
          searchMode: editSearchMode,
          summaryTemplate: editSummaryTemplate,
          analysisEnabled: editAnalysisEnabled,
          factorEnabled: editFactorEnabled,
          linkageEnabled: editLinkageEnabled
        })
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "保存 Topic 失败");
      }

      setEditMessage("Topic 已更新");
      await loadTopic();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存 Topic 失败");
    } finally {
      setSavingTopic(false);
    }
  }

  if (loading) {
    return (
      <AppContainer>
        <EmptyState title="正在读取 Topic" description="正在加载报告、信息卡片、模块和联动分析。" icon={<RefreshCw className="h-5 w-5 animate-spin" />} />
      </AppContainer>
    );
  }

  if (!topic) {
    return (
      <AppContainer size="md">
        <ActionButton href="/zones" variant="ghost">
          <ArrowLeft className="h-4 w-4" />
          返回专区
        </ActionButton>
        <EmptyState title="Topic 不可用" description={error || "未找到该 Topic"} />
      </AppContainer>
    );
  }

  const profile = topicProfiles[topic.zone.type];
  const latestSummary = topic.summaries[0];
  const latestSignal = topic.dailySignals[0];
  const latestAnalysis = topic.linkageAnalyses[0];
  const latestReport = topic.reports[0];
  const assumptions = parseStringList(latestAnalysis?.assumptions ?? null);
  const warnings = parseStringList(latestAnalysis?.warnings ?? null);

  return (
    <AppContainer size="xl">
      <div>
        <Link href={`/zones/${topic.zone.id}`} className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-sky-700">
          <ArrowLeft className="h-4 w-4" />
          返回 {topic.zone.name}
        </Link>
      </div>

      <TopicHeroCard
        topic={topic}
        zoneType={topic.zone.type}
        zoneName={topic.zone.name}
        lastRunLabel={formatDate(latestReport?.createdAt ?? latestAnalysis?.createdAt)}
        actions={
          <>
            <TopicRunButton zoneId={topic.zone.id} topicId={topic.id} label={topic.zone.type === "linkage" ? "运行联动分析" : topic.zone.type === "analysis" ? "运行分析" : "运行 Topic"} onDone={() => void loadTopic()} />
            <ActionButton type="button" variant="ghost" onClick={openEditPanel}>
              <Pencil className="h-4 w-4" />
              编辑 Topic
            </ActionButton>
            {latestReport ? (
              <ActionButton type="button" variant={copiedReport ? "success" : "secondary"} onClick={() => void copyLatestReport(latestReport.markdown)}>
                {copiedReport ? "已复制" : "复制 Markdown"}
              </ActionButton>
            ) : null}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusPill tone={profile.tone}>{profile.mode}</StatusPill>
        <StatusPill>{searchModeLabels[topic.searchMode]}</StatusPill>
        <StatusPill tone="neutral">{zoneTypeLabels[topic.zone.type]} / {topic.category}</StatusPill>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div> : null}

      <TemplatePreview templateId={topic.summaryTemplate} />

      {editingTopic ? (
        <SectionCard
          title="编辑 Topic"
          description="修改名称、分类、描述、检索模式、总结模板和专区能力开关。保存后会刷新当前页面。"
          actions={
            <ActionButton type="button" variant="ghost" size="sm" onClick={() => setEditingTopic(false)}>
              收起
            </ActionButton>
          }
        >
          <form onSubmit={saveTopicEdit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-500">Topic 名称</span>
                <input className="radar-input mt-2" value={editName} onChange={(event) => setEditName(event.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-500">分类</span>
                <input className="radar-input mt-2" value={editCategory} onChange={(event) => setEditCategory(event.target.value)} />
              </label>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-500">检索模式</span>
                <select className="radar-input mt-2" value={editSearchMode} onChange={(event) => setEditSearchMode(event.target.value as SearchMode)}>
                  {searchModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {searchModeLabels[mode]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-500">总结模板</span>
                <select className="radar-input mt-2" value={editSummaryTemplate} onChange={(event) => setEditSummaryTemplate(event.target.value)}>
                  <option value="">默认模板</option>
                  {summaryTemplates
                    .filter((template) => template.zoneType === topic.zone.type)
                    .map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-bold text-slate-500">描述</span>
              <textarea className="radar-input mt-2 min-h-24 resize-y" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} />
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-sm font-bold text-slate-600">
                <input type="checkbox" checked={editAnalysisEnabled} onChange={(event) => setEditAnalysisEnabled(event.target.checked)} />
                Analysis Enabled
              </label>
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-sm font-bold text-slate-600">
                <input type="checkbox" checked={editFactorEnabled} onChange={(event) => setEditFactorEnabled(event.target.checked)} />
                Factor Enabled
              </label>
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-sm font-bold text-slate-600">
                <input type="checkbox" checked={editLinkageEnabled} onChange={(event) => setEditLinkageEnabled(event.target.checked)} />
                Linkage Enabled
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ActionButton type="submit" loading={savingTopic} disabled={!editName.trim()}>
                <Save className="h-4 w-4" />
                保存 Topic
              </ActionButton>
              {editMessage ? <span className="text-sm font-bold text-radar-500">{editMessage}</span> : null}
            </div>
          </form>
        </SectionCard>
      ) : null}

      {topic.zone.type === "search" ? (
        <SearchTopicLayout topic={topic} latestSummary={latestSummary} />
      ) : topic.zone.type === "analysis" ? (
        <AnalysisTopicLayout topic={topic} latestSummary={latestSummary} latestSignal={latestSignal} />
      ) : (
        <section className="space-y-6">
          <SignalMetricStrip linkage={latestAnalysis} />
          <IndustryFlowCard modules={topic.modules} edges={topic.edges} />

          <section className="grid gap-5 xl:grid-cols-2">
            <SectionCard title="添加模块" description="先建立上游、中游、下游、政策、市场等模块，再配置关系。">
              <form onSubmit={addModule} className="space-y-3">
                <input className="radar-input" value={moduleName} onChange={(event) => setModuleName(event.target.value)} placeholder="模块名称，例如：光模块" />
                <select className="radar-input" value={moduleRole} onChange={(event) => setModuleRole(event.target.value as LinkageModuleRole)}>
                  {linkageModuleRoles.map((role) => (
                    <option key={role} value={role}>
                      {linkageModuleRoleLabels[role]}
                    </option>
                  ))}
                </select>
                <textarea className="radar-input min-h-20 resize-y" value={moduleDescription} onChange={(event) => setModuleDescription(event.target.value)} placeholder="模块描述" />
                <ActionButton type="submit" loading={submitting} disabled={!moduleName.trim()} className="w-full">
                  <Plus className="h-4 w-4" />
                  添加模块
                </ActionButton>
              </form>
            </SectionCard>

            <SectionCard title="添加模块关系" description={topic.modules.length < 2 ? "该主题暂无足够模块，请先添加至少两个模块再创建关系。" : "关系会用于生成产业链影响路径和联动分析。"}>
              <form onSubmit={addEdge} className="space-y-3">
                <select className="radar-input" value={edgeFrom} onChange={(event) => setEdgeFrom(event.target.value)}>
                  <option value="">选择起点模块</option>
                  {topic.modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </select>
                <select className="radar-input" value={edgeTo} onChange={(event) => setEdgeTo(event.target.value)}>
                  <option value="">选择终点模块</option>
                  {topic.modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </select>
                <select className="radar-input" value={relationType} onChange={(event) => setRelationType(event.target.value as LinkageRelationType)}>
                  {linkageRelationTypes.map((type) => (
                    <option key={type} value={type}>
                      {linkageRelationTypeLabels[type]}
                    </option>
                  ))}
                </select>
                <textarea className="radar-input min-h-20 resize-y" value={edgeReason} onChange={(event) => setEdgeReason(event.target.value)} placeholder="关系原因或假设" />
                <ActionButton type="submit" loading={submitting} disabled={!edgeFrom || !edgeTo || edgeFrom === edgeTo} className="w-full">
                  <Plus className="h-4 w-4" />
                  添加关系
                </ActionButton>
              </form>
            </SectionCard>
          </section>

          <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <SectionCard title="模块列表" description="每个模块代表产业链中的一个观察点。">
              {topic.modules.length > 0 ? (
                <div className="grid gap-3">
                  {topic.modules.map((module) => (
                    <LinkageModuleCard key={module.id} module={module} />
                  ))}
                </div>
              ) : (
                <EmptyState title="暂无模块" description="先添加模块，再运行联动分析。" icon={<Boxes className="h-5 w-5" />} />
              )}
            </SectionCard>
            <SectionCard title="模块关系" description="关系描述模块之间的需求、供给、成本、政策或情绪传导。">
              <LinkageEdgeList edges={topic.edges} />
            </SectionCard>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <SectionCard title={profile.summaryTitle} description="联动分析会输出路径、假设、warnings 和可复盘报告。">
              {latestAnalysis ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone="danger">联动分 {latestAnalysis.linkageScore ?? "未知"}</StatusPill>
                      <StatusPill tone="warning">风险分 {latestAnalysis.riskScore ?? "未知"}</StatusPill>
                      <StatusPill>置信度 {latestAnalysis.confidence ?? "未知"}</StatusPill>
                    </div>
                    <h3 className="mt-4 text-xl font-black text-slate-950">{latestAnalysis.title}</h3>
                    <pre className="mt-4 max-h-[34rem] overflow-auto whitespace-pre-wrap text-sm leading-7 text-slate-600">{latestAnalysis.markdown}</pre>
                  </div>
                  <InsightList title="Assumptions" items={assumptions} tone="info" empty="暂无 assumptions。" />
                  <InsightList title="Warnings" items={warnings} tone="danger" empty="暂无 warnings。" />
                </div>
              ) : (
                <EmptyState title="暂无联动分析报告" description="配置模块和关系后，点击“运行联动分析”。" icon={<Route className="h-5 w-5" />} />
              )}
            </SectionCard>
            <SectionCard title="影响路径" description="用卡片和强度条展示关键传导路径。">
              <LinkagePathView keyPaths={latestAnalysis?.keyPaths ?? null} />
            </SectionCard>
          </section>

          <ReportHistory reports={topic.reports} zoneName={topic.zone.name} />
        </section>
      )}
    </AppContainer>
  );
}

function SearchTopicLayout({ topic, latestSummary }: { topic: ZoneTopicDetailDTO; latestSummary: ZoneTopicDetailDTO["summaries"][number] | undefined }) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="space-y-5">
        <SectionCard title="AI 总结" description="只基于当前来源列表生成结构化检索总结。">
          {latestSummary ? (
            <SummaryBlock summary={latestSummary} enableActions markdownContext={{ keywordName: topic.name, categoryLabel: topic.category, infoItems: topic.infoItems }} />
          ) : (
            <EmptyState title="暂无 AI 总结" description="运行 Topic 后会显示结构化总结。" />
          )}
        </SectionCard>

        <SourceListCard items={topic.infoItems} title="核心信源" />
      </div>

      <ReportHistory reports={topic.reports} zoneName={topic.zone.name} />
    </section>
  );
}

function AnalysisTopicLayout({
  topic,
  latestSummary,
  latestSignal
}: {
  topic: ZoneTopicDetailDTO;
  latestSummary: ZoneTopicDetailDTO["summaries"][number] | undefined;
  latestSignal: ZoneTopicDetailDTO["dailySignals"][number] | undefined;
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold leading-6 text-rose-700">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        {complianceText}
      </div>

      <SignalMetricStrip signal={latestSignal} />

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-5">
          <SectionCard title="AI 总结" description="对搜索结果做结构化分析，不输出投资结论。">
            {latestSummary ? (
              <SummaryBlock summary={latestSummary} enableActions markdownContext={{ keywordName: topic.name, categoryLabel: topic.category, infoItems: topic.infoItems }} />
            ) : (
              <EmptyState title="暂无 AI 总结" description="运行 Topic 后会显示分析总结。" />
            )}
          </SectionCard>
          <SectionCard title="DailySignal" description="汇总情绪、影响、风险和关注度等辅助信号。">
            {latestSignal ? <DailySignalCard signal={latestSignal} /> : <EmptyState title="暂无 DailySignal" description="运行分析 Topic 后会生成或更新今日信号。" />}
          </SectionCard>
        </div>

        <SourceListCard items={topic.infoItems} title="信息卡片与因子评分" />
      </section>

      <ReportHistory reports={topic.reports} zoneName={topic.zone.name} />
    </section>
  );
}

function InsightList({
  title,
  items,
  tone,
  empty
}: {
  title: string;
  items: string[];
  tone: "info" | "danger";
  empty: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4">
      <div className="flex items-center gap-2">
        {tone === "danger" ? <AlertTriangle className="h-4 w-4 text-danger-500" /> : <GitBranch className="h-4 w-4 text-radar-500" />}
        <h3 className="font-black text-slate-950">{title}</h3>
      </div>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
          {items.map((item) => (
            <li key={item} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm font-bold text-slate-400">{empty}</p>
      )}
    </div>
  );
}

function ReportHistory({ reports, zoneName }: { reports: ZoneTopicDetailDTO["reports"]; zoneName: string }) {
  return (
    <SectionCard title="历史报告" description="每次运行都会保留报告，方便复制 Markdown 和复盘。">
      {reports.length > 0 ? (
        <div className="grid gap-4">
          {reports.map((report) => (
            <ZoneReportCard key={report.id} report={report} compact zoneName={zoneName} />
          ))}
        </div>
      ) : (
        <EmptyState title="暂无报告" description="暂无报告，运行 Topic 后会在这里显示。" />
      )}
    </SectionCard>
  );
}
