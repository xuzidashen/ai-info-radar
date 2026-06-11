"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, RefreshCw, Workflow } from "lucide-react";

import { TemplatePreview } from "@/components/TemplatePreview";
import { ZoneHero } from "@/components/brand/ZoneHero";
import { ZoneReportCard } from "@/components/ZoneReportCard";
import { ZoneTopicCard } from "@/components/ZoneTopicCard";
import { ActionButton } from "@/components/ui/ActionButton";
import { AppContainer } from "@/components/ui/AppContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionCard } from "@/components/ui/SectionCard";
import { summaryTemplates } from "@/lib/templates/summaryTemplates";
import { searchModeLabels, searchModes, zoneTypeLabels, type SearchMode, type ZoneDetailDTO, type ZoneType } from "@/lib/types";

type ZoneResponse = {
  zone?: ZoneDetailDTO;
  error?: string;
};

const zoneProfiles: Record<
  ZoneType,
  {
    eyebrow: string;
    subtitle: string;
    createTitle: string;
    topicDescription: string;
    emptyTitle: string;
    emptyDescription: string;
    focus: string[];
    tone: "success" | "warning" | "danger";
  }
> = {
  search: {
    eyebrow: "Search Zone",
    subtitle: "用于考公、新闻、政策、比赛、学习资料等信息检索和 AI 总结。重点是来源、摘要、报告和 Markdown。",
    createTitle: "新建检索 Topic",
    topicDescription: "运行后会生成搜索结果、AI 总结和报告历史。",
    emptyTitle: "暂无检索 Topic",
    emptyDescription: "创建一个主题后即可一键运行检索和总结。",
    focus: ["信息检索", "来源列表", "AI 总结", "Markdown"],
    tone: "success"
  },
  analysis: {
    eyebrow: "Analysis Zone",
    subtitle: "用于财经、公司、行业、科技主题的风险、情绪、关注度辅助分析。会展示因子评分和 DailySignal。",
    createTitle: "新建分析 Topic",
    topicDescription: "运行后会生成信息卡片、AI 总结、因子评分和 DailySignal。",
    emptyTitle: "暂无分析 Topic",
    emptyDescription: "创建公司、行业或科技主题后，可运行辅助分析。",
    focus: ["AI 分析", "因子评分", "DailySignal", "风险关注"],
    tone: "warning"
  },
  linkage: {
    eyebrow: "Linkage Zone",
    subtitle: "用于产业链模块之间的上下游传导、关系路径、假设和风险断点分析。",
    createTitle: "新建联动 Topic",
    topicDescription: "创建后进入详情页添加模块、关系，并运行联动分析。",
    emptyTitle: "暂无联动 Topic",
    emptyDescription: "创建主题后添加上游、中游、下游模块和关系。",
    focus: ["模块", "关系", "影响路径", "联动报告"],
    tone: "danger"
  }
};

export default function ZoneDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const id = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params.id]);
  const [zone, setZone] = useState<ZoneDetailDTO | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("general");
  const [summaryTemplate, setSummaryTemplate] = useState("news");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadZone = useCallback(async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/zones/${id}`, {
        cache: "no-store"
      });
      const data = (await response.json()) as ZoneResponse;

      if (!response.ok || !data.zone) {
        throw new Error(data.error || "获取专区详情失败");
      }

      setZone(data.zone);
      setCategory(data.zone.type === "analysis" ? "行业分析" : data.zone.type === "linkage" ? "产业链联动" : "资料检索");
      setSearchMode(data.zone.type === "analysis" ? "industry" : data.zone.type === "linkage" ? "industry" : "general");
      setSummaryTemplate(data.zone.type === "analysis" ? "industry" : data.zone.type === "linkage" ? "linkage" : "news");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "获取专区详情失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadZone();
  }, [loadZone]);

  async function handleCreateTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/zones/${id}/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          category,
          description,
          searchMode,
          summaryTemplate
        })
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "创建 Topic 失败");
      }

      setName("");
      setDescription("");
      await loadZone();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "创建 Topic 失败");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppContainer>
        <EmptyState title="正在读取专区" description="正在加载 Topic、报告和专区配置。" icon={<RefreshCw className="h-5 w-5 animate-spin" />} />
      </AppContainer>
    );
  }

  if (!zone) {
    return (
      <AppContainer size="md">
        <ActionButton href="/zones" variant="ghost">
          <ArrowLeft className="h-4 w-4" />
          返回专区
        </ActionButton>
        <EmptyState title="专区不可用" description={error || "未找到该专区"} icon={<Workflow className="h-5 w-5" />} />
      </AppContainer>
    );
  }

  const profile = zoneProfiles[zone.type];
  const availableTemplates = summaryTemplates.filter((template) => template.zoneType === zone.type);

  return (
    <AppContainer size="xl">
      <div>
        <Link href="/zones" className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-sky-700">
          <ArrowLeft className="h-4 w-4" />
          返回专区
        </Link>
      </div>

      <ZoneHero zone={zone} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/80 bg-white/88 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.07)] backdrop-blur-xl">
        <p className="text-sm font-bold leading-6 text-slate-500">{profile.subtitle}</p>
        <ActionButton type="button" variant="secondary" onClick={() => void loadZone()}>
          <RefreshCw className="h-4 w-4" />
          刷新
        </ActionButton>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div> : null}

      {zone.type === "analysis" ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold leading-6 text-rose-700">
          以上内容仅为公开信息整理和辅助研究，不构成投资建议。
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[0.86fr_1.14fr]">
        <SectionCard title={profile.createTitle} description={profile.topicDescription}>
          <form onSubmit={handleCreateTopic} className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-500">Topic 名称</span>
              <input className="radar-input mt-2" value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：AI 算力 + 液冷 + 电力" />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-500">分类</span>
              <input className="radar-input mt-2" value={category} onChange={(event) => setCategory(event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-500">检索模式</span>
              <select className="radar-input mt-2" value={searchMode} onChange={(event) => setSearchMode(event.target.value as SearchMode)}>
                {searchModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {searchModeLabels[mode]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-500">总结模板</span>
              <select className="radar-input mt-2" value={summaryTemplate} onChange={(event) => setSummaryTemplate(event.target.value)}>
                {availableTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-500">描述</span>
              <textarea className="radar-input mt-2 min-h-24 resize-y" value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            <ActionButton type="submit" loading={submitting} disabled={!name.trim()} className="w-full">
              <Plus className="h-4 w-4" />
              创建 Topic
            </ActionButton>
          </form>
        </SectionCard>

        <div className="space-y-5">
          <TemplatePreview templateId={summaryTemplate} />
          <SectionCard title="Topic 列表" description={zone.type === "linkage" ? "进入 Topic 后添加模块和关系，再运行联动分析。" : "可在卡片上直接运行，也可进入详情页查看结果。"}>
            {zone.topics.length > 0 ? (
              <div className="grid gap-4">
                {zone.topics.map((topic) => (
                  <ZoneTopicCard key={topic.id} zone={zone} topic={topic} onRunDone={() => void loadZone()} />
                ))}
              </div>
            ) : (
              <EmptyState title={profile.emptyTitle} description={profile.emptyDescription} />
            )}
          </SectionCard>
        </div>
      </section>

      <SectionCard title="专区报告历史" description="运行 Topic 后会沉淀为 ZoneReport，可复制 Markdown 到外部笔记。">
        {zone.reports.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {zone.reports.map((report) => (
              <ZoneReportCard key={report.id} report={report} compact zoneName={zone.name} />
            ))}
          </div>
        ) : (
          <EmptyState title="暂无报告" description="暂无报告，运行 Topic 后会在这里显示。" />
        )}
      </SectionCard>
    </AppContainer>
  );
}
