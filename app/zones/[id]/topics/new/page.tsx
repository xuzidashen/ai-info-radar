"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  RadioTower,
  Save,
  Search,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { AppContainer } from "@/components/ui/AppContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  collectPresetKeywords,
  credibilityHintLabels,
  inferCategoryFromPresets,
  inferSearchModeFromPresets,
  matchSourcePresets,
  sourcePresetCategoryLabels,
  sourcePresetTypeLabels
} from "@/lib/sourcePresets";
import { summaryTemplates } from "@/lib/templates/summaryTemplates";
import { searchModeLabels, searchModes, zoneTypeLabels, type SearchMode, type ZoneDetailDTO } from "@/lib/types";
import { buildTopicDescription } from "@/lib/utils/topicPresetContext";

type ZoneResponse = {
  zone?: ZoneDetailDTO;
  error?: string;
};

type CreateTopicResponse = {
  topic?: {
    id: string;
  };
  error?: string;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function defaultTemplateId(zoneType?: ZoneDetailDTO["type"], searchMode?: SearchMode) {
  return (
    summaryTemplates.find((template) => template.zoneType === zoneType && template.searchMode === searchMode)?.id ??
    summaryTemplates.find((template) => template.zoneType === zoneType)?.id ??
    "news"
  );
}

export default function NewTopicWizardPage() {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const zoneId = first(params.id);
  const [zone, setZone] = useState<ZoneDetailDTO | null>(null);
  const [interest, setInterest] = useState("AI Agent、半导体、考公政策、软件杯、南宁本地政策");
  const [topicName, setTopicName] = useState("");
  const [category, setCategory] = useState("自定义");
  const [description, setDescription] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("general");
  const [summaryTemplate, setSummaryTemplate] = useState("news");
  const [aiScoring, setAiScoring] = useState(true);
  const [reportEnabled, setReportEnabled] = useState(true);
  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchedPresets = useMemo(() => matchSourcePresets(interest, 8), [interest]);
  const selectedPresets = useMemo(
    () => matchedPresets.filter((preset) => selectedPresetIds.includes(preset.id)),
    [matchedPresets, selectedPresetIds]
  );
  const recommendedKeywords = useMemo(() => collectPresetKeywords(selectedPresets.length ? selectedPresets : matchedPresets, 12), [matchedPresets, selectedPresets]);
  const availableTemplates = useMemo(
    () => summaryTemplates.filter((template) => !zone || template.zoneType === zone.type),
    [zone]
  );

  useEffect(() => {
    async function loadZone() {
      if (!zoneId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/zones/${zoneId}`, { cache: "no-store" });
        const data = (await response.json()) as ZoneResponse;

        if (!response.ok || !data.zone) {
          throw new Error(data.error || "获取专区详情失败");
        }

        setZone(data.zone);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "获取专区详情失败");
      } finally {
        setLoading(false);
      }
    }

    void loadZone();
  }, [zoneId]);

  useEffect(() => {
    const defaults = matchedPresets.filter((preset) => preset.enabledByDefault).map((preset) => preset.id);
    const nextSelectedIds = defaults.length ? defaults : matchedPresets.slice(0, 4).map((preset) => preset.id);
    const nextSelectedPresets = matchedPresets.filter((preset) => nextSelectedIds.includes(preset.id));
    const nextSearchMode = inferSearchModeFromPresets(nextSelectedPresets);
    const nextKeywords = collectPresetKeywords(nextSelectedPresets, 8);

    setSelectedPresetIds(nextSelectedIds);
    setSelectedKeywords(nextKeywords);
    setCategory(inferCategoryFromPresets(nextSelectedPresets));
    setSearchMode(nextSearchMode);
    setSummaryTemplate(defaultTemplateId(zone?.type, nextSearchMode));
    setTopicName(nextKeywords[0] ?? interest.split(/[、,，\s]+/).find(Boolean) ?? "");
  }, [interest, matchedPresets, zone?.type]);

  function togglePreset(id: string) {
    setSelectedPresetIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleKeyword(keyword: string) {
    setSelectedKeywords((current) => (current.includes(keyword) ? current.filter((item) => item !== keyword) : [...current, keyword]));
  }

  async function saveTopic() {
    if (!zoneId || !zone) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const bodyDescription = buildTopicDescription({
        base: description,
        interest,
        keywords: selectedKeywords,
        presets: selectedPresets,
        aiScoring,
        reportEnabled
      });

      const response = await fetch(`/api/zones/${zoneId}/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: topicName.trim() || selectedKeywords[0] || "新建 Topic",
          category,
          description: bodyDescription,
          searchMode,
          summaryTemplate: reportEnabled ? summaryTemplate : null,
          analysisEnabled: zone.type === "analysis" ? aiScoring : false,
          factorEnabled: zone.type === "analysis" ? aiScoring : false,
          linkageEnabled: zone.type === "linkage"
        })
      });
      const data = (await response.json().catch(() => ({}))) as CreateTopicResponse;

      if (!response.ok || !data.topic) {
        throw new Error(data.error || "创建 Topic 失败");
      }

      router.push(`/zones/${zoneId}/topics/${data.topic.id}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "创建 Topic 失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppContainer size="lg">
        <EmptyState title="正在打开 Topic 向导" description="正在读取专区信息和推荐模板。" icon={<Loader2 className="h-5 w-5 animate-spin" />} />
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
        <EmptyState title="无法打开向导" description={error || "没有找到当前专区。"} />
      </AppContainer>
    );
  }

  return (
    <AppContainer size="xl">
      <div>
        <Link href={`/zones/${zone.id}`} className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-sky-700">
          <ArrowLeft className="h-4 w-4" />
          返回 {zone.name}
        </Link>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-white/80 bg-slate-950 text-white shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.72fr] lg:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/70">Horizon Fusion V1</p>
            <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Topic 创建向导</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              输入兴趣描述，系统会基于内置信息源预设推荐关键词、查询模板、分类和可信度提示。确认后再保存为 Topic。
            </p>
          </div>
          <div className="grid gap-3 rounded-[24px] border border-white/10 bg-white/8 p-4">
            <StatusPill tone="info">{zoneTypeLabels[zone.type]}</StatusPill>
            <p className="text-sm font-bold leading-6 text-slate-300">{zone.description}</p>
            <p className="text-xs font-bold text-slate-400">本轮不接外部社区 API，不保存 API Key。</p>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div> : null}

      <section className="grid gap-5 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="space-y-5">
          <SectionCard title="1. 兴趣输入" description="支持中文、英文和混合表达。">
            <label className="block">
              <span className="text-sm font-bold text-slate-500">我关注</span>
              <textarea
                className="radar-input mt-2 min-h-28 resize-y"
                value={interest}
                onChange={(event) => setInterest(event.target.value)}
                placeholder="例如：AI Agent、半导体、考公政策、软件杯、南宁本地政策"
              />
            </label>
          </SectionCard>

          <SectionCard title="2. Topic 设置" description="推荐值可以直接改，保存前不会写入数据库。">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-500">Topic 名称</span>
                <input className="radar-input mt-2" value={topicName} onChange={(event) => setTopicName(event.target.value)} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-500">推荐分类</span>
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
              </div>
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
                <span className="text-sm font-bold text-slate-500">补充描述</span>
                <textarea
                  className="radar-input mt-2 min-h-24 resize-y"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="可补充重点信息源、排除范围、报告关注角度"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700">
                  <input type="checkbox" checked={aiScoring} onChange={(event) => setAiScoring(event.target.checked)} />
                  启用 AI 评分
                </label>
                <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700">
                  <input type="checkbox" checked={reportEnabled} onChange={(event) => setReportEnabled(event.target.checked)} />
                  启用报告生成
                </label>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="3. 推荐信息源" description="勾选后会写入 Topic 描述，后续运行仍由当前 SearchProvider 执行。">
            {matchedPresets.length > 0 ? (
              <div className="grid gap-3">
                {matchedPresets.map((preset) => {
                  const checked = selectedPresetIds.includes(preset.id);

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => togglePreset(preset.id)}
                      className={`min-h-28 rounded-[22px] border p-4 text-left transition ${
                        checked ? "border-sky-200 bg-sky-50/90" : "border-slate-200 bg-white hover:border-sky-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusPill tone={checked ? "info" : "neutral"}>{sourcePresetCategoryLabels[preset.category]}</StatusPill>
                            <StatusPill tone="neutral">{sourcePresetTypeLabels[preset.sourceType]}</StatusPill>
                            <StatusPill tone={preset.credibilityHint === "high" ? "success" : preset.credibilityHint === "medium" ? "warning" : "danger"}>
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {credibilityHintLabels[preset.credibilityHint]}
                            </StatusPill>
                          </div>
                          <h3 className="mt-3 text-base font-black text-slate-950">{preset.name}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-500">{preset.description}</p>
                        </div>
                        {checked ? <CheckCircle2 className="h-5 w-5 shrink-0 text-sky-700" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="没有匹配到预设" description="换一组更具体的兴趣词，例如“南宁 政策 公告”或“AI Agent GitHub”。" icon={<Search className="h-5 w-5" />} />
            )}
          </SectionCard>

          <SectionCard title="4. 推荐关键词与查询模板" description="关键词可逐个启用；查询模板用于提示后续真实搜索优化方向。">
            <div>
              <h3 className="text-sm font-black text-slate-950">推荐关键词</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {recommendedKeywords.map((keyword) => {
                  const checked = selectedKeywords.includes(keyword);
                  return (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => toggleKeyword(keyword)}
                      className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                        checked ? "border-sky-200 bg-sky-50 text-sky-800" : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {keyword}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <h3 className="text-sm font-black text-slate-950">查询模板</h3>
              {selectedPresets.flatMap((preset) => preset.queryTemplates.map((template) => ({ preset, template }))).slice(0, 8).map(({ preset, template }) => (
                <div key={`${preset.id}-${template}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold leading-6 text-slate-600">
                  <span className="text-slate-950">{preset.name}：</span>
                  {template}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="确认保存"
            description="保存后会创建 Topic，并跳转到详情页。关闭报告生成时仍会保存来源和 AI 总结。"
            actions={
              <ActionButton type="button" loading={saving} disabled={!topicName.trim() && selectedKeywords.length === 0} onClick={() => void saveTopic()}>
                <Save className="h-4 w-4" />
                保存 Topic
              </ActionButton>
            }
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <RadioTower className="h-4 w-4 text-sky-700" />
                <p className="mt-2 text-xs font-bold text-slate-500">信息源</p>
                <p className="mt-1 text-xl font-black text-slate-950">{selectedPresets.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <p className="mt-2 text-xs font-bold text-slate-500">关键词</p>
                <p className="mt-1 text-xl font-black text-slate-950">{selectedKeywords.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <FileText className="h-4 w-4 text-emerald-600" />
                <p className="mt-2 text-xs font-bold text-slate-500">报告</p>
                <p className="mt-1 text-xl font-black text-slate-950">{reportEnabled ? "启用" : "关闭"}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </section>
    </AppContainer>
  );
}
