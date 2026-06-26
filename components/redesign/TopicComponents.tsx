"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Check,
  ClockCounterClockwise,
  DotsThree,
  FileText,
  Lightning,
  PencilSimple,
  Plus,
  Sparkle,
  Trash
} from "@phosphor-icons/react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { UnreadBadge, useReadState } from "@/components/redesign/ReadState";
import { getTopicCooldown, markTopicRun, recordUsage } from "@/components/redesign/UsageComponents";
import { useToast } from "@/components/ui/Toast";
import type { FollowTopic, RedesignArticle } from "@/lib/mock/redesignData";

const STORAGE_KEY = "ai-radar-custom-topics";
const directions = ["新闻动态", "政策变化", "公司公告", "财报", "技术文章", "学习资料", "人物动态"];
const preferenceMarker = "[[RADAR_TOPIC_PREFS]]";
const contentDirections = ["新闻", "政策", "公司公告", "财报", "技术文章", "学习资料", "人物动态"];
const sourcePreferences = ["官方优先", "媒体优先", "全网"] as const;
const topicRunCooldownSeconds = 180;

type StoredTopic = FollowTopic & { createdAt: string };
type ConfirmAction = { type: "delete" | "archive" | "bulk-delete" | "bulk-archive"; topic?: FollowTopic };
type RunStatus = "idle" | "searching" | "filtering" | "summarizing" | "reporting" | "saving" | "done" | "empty" | "error";
type TopicPreferences = {
  excludeWords: string[];
  contentDirections: string[];
  sourcePreference: "官方优先" | "媒体优先" | "全网";
  depth: "简短" | "标准" | "深度";
  searchScope: "只搜索已有内容" | "允许全网搜索";
  autoSummary: boolean;
  dailyAutoCheck: boolean;
};

type RunTopicResponse = {
  message?: string;
  insightHref?: string;
  contentHref?: string;
  localFallback?: boolean;
  itemCount?: number;
  reportCount?: number;
  candidateCount?: number;
  overview?: string;
  noChange?: boolean;
  provider?: {
    searchProvider?: string | null;
    summaryProvider?: string | null;
    fallbackUsed?: boolean | null;
  };
  error?: string;
  reason?: string;
};

function readStoredTopics(): StoredTopic[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) as StoredTopic[] : [];
  } catch {
    return [];
  }
}

function saveStoredTopic(topic: StoredTopic) {
  const current = readStoredTopics();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([topic, ...current.filter((item) => item.id !== topic.id)]));
}

function removeStoredTopics(ids: string[]) {
  const idSet = new Set(ids);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readStoredTopics().filter((item) => !idSet.has(item.id))));
}

function insightHrefFor(topic: FollowTopic) {
  return topic.id.startsWith("custom-")
    ? `/insights/generated?topic=${encodeURIComponent(topic.title)}&category=${encodeURIComponent(topic.category)}&topicId=${encodeURIComponent(topic.id)}`
    : `/insights/${topic.insightId}`;
}

function splitKeywords(value: string) {
  return value.split(/[，,\s]+/).map((item) => item.trim()).filter(Boolean).slice(0, 8);
}

function defaultTopicPreferences(): TopicPreferences {
  return {
    excludeWords: [],
    contentDirections: ["新闻"],
    sourcePreference: "官方优先",
    depth: "标准",
    searchScope: "允许全网搜索",
    autoSummary: true,
    dailyAutoCheck: false
  };
}

function parseDescriptionWithPreferences(value: string) {
  const index = value.indexOf(preferenceMarker);
  if (index < 0) return { description: value, preferences: defaultTopicPreferences() };

  const description = value.slice(0, index).trim();
  const raw = value.slice(index + preferenceMarker.length).trim();
  try {
    const parsed = JSON.parse(raw) as Partial<TopicPreferences>;
    const defaults = defaultTopicPreferences();
    return {
      description,
      preferences: {
        excludeWords: Array.isArray(parsed.excludeWords) ? parsed.excludeWords.filter((item): item is string => typeof item === "string") : defaults.excludeWords,
        contentDirections: Array.isArray(parsed.contentDirections) && parsed.contentDirections.length ? parsed.contentDirections.filter((item): item is string => typeof item === "string") : defaults.contentDirections,
        sourcePreference: parsed.sourcePreference === "媒体优先" || parsed.sourcePreference === "全网" ? parsed.sourcePreference : defaults.sourcePreference,
        depth: parsed.depth === "简短" || parsed.depth === "深度" ? parsed.depth : defaults.depth,
        searchScope: parsed.searchScope === "只搜索已有内容" ? parsed.searchScope : defaults.searchScope,
        autoSummary: typeof parsed.autoSummary === "boolean" ? parsed.autoSummary : defaults.autoSummary,
        dailyAutoCheck: typeof parsed.dailyAutoCheck === "boolean" ? parsed.dailyAutoCheck : defaults.dailyAutoCheck
      }
    };
  } catch {
    return { description, preferences: defaultTopicPreferences() };
  }
}

function buildDescriptionWithPreferences(description: string, preferences: TopicPreferences) {
  return [description.trim(), preferenceMarker, JSON.stringify(preferences)].filter(Boolean).join("\n");
}

function topicDisplayDescription(topic: FollowTopic) {
  const parsed = parseDescriptionWithPreferences(topic.description);
  return parsed.description || `持续整理与“${topic.title}”有关的重要变化。`;
}

function isRunningStatus(status: RunStatus) {
  return status === "searching" || status === "filtering" || status === "summarizing" || status === "reporting" || status === "saving";
}

function runStatusText(status: RunStatus, idleText: string, doneText: string, errorText?: string) {
  if (status === "searching") return "正在搜索最新信息";
  if (status === "filtering") return "正在筛选有效内容";
  if (status === "summarizing") return "正在生成事实摘要";
  if (status === "reporting") return "正在生成分析结果";
  if (status === "saving") return "正在保存分析结果";
  if (status === "done") return doneText;
  if (status === "empty") return "未找到足够内容，可调整关键词后重试。";
  if (status === "error") return errorText ? `更新失败：${errorText}` : "更新失败，请稍后再试。";
  return idleText;
}

function runErrorMessage(data: RunTopicResponse) {
  if (data.reason === "missing_tavily_key") return data.error || "缺少 TAVILY_API_KEY，请在 Vercel 环境变量中配置。";
  if (data.reason === "missing_deepseek_key") return data.error || "缺少 DEEPSEEK_API_KEY，请在 Vercel 环境变量中配置。";
  if (data.reason === "search_failed") return data.error || "搜索服务失败，请检查 Tavily 配置或稍后重试。";
  if (data.reason === "ai_failed") return data.error || "AI 总结失败，请检查 DeepSeek 配置或稍后重试。";
  if (data.reason === "database_failed") return data.error || "数据库保存失败，请稍后重试。";
  if (data.reason === "too_frequent") return data.error || "调用过于频繁，请稍后再试。";
  return data.error || "更新失败，请稍后再试。";
}

function ConfirmDialog({
  action,
  selectedCount,
  busy,
  onCancel,
  onConfirm
}: {
  action: ConfirmAction | null;
  selectedCount: number;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!action) return null;

  const isBulk = action.type === "bulk-delete";
  const isArchive = action.type === "archive" || action.type === "bulk-archive";
  const title = isArchive ? "确认归档这个主题？" : isBulk ? `确认删除 ${selectedCount} 个主题？` : "确认删除这个主题？";
  const dialogTitle = action.type === "bulk-archive" ? `确认归档 ${selectedCount} 个主题？` : title;
  const content = isArchive
    ? "归档后，该主题将不再出现在我的关注中。相关分析结果和内容会继续保留。"
    : "删除后，该主题将不再出现在我的关注中。相关分析结果和内容会按当前数据策略保留或一并删除。本轮采用软删除，只隐藏主题本身。";

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/28 px-4 py-5 sm:items-center">
      <section className="w-full max-w-md rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-5 shadow-[0_24px_80px_rgba(28,46,78,0.2)]">
        <h2 className="text-lg font-black">{dialogTitle}</h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">{content}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={busy} className="app-button-secondary justify-center">取消</button>
          <button type="button" onClick={onConfirm} disabled={busy} className="app-button justify-center bg-[#d94a3a] hover:bg-[#bf3d30]">
            <Trash size={17} />{busy ? "处理中" : isArchive ? "确认归档" : "确认删除"}
          </button>
        </div>
      </section>
    </div>
  );
}

function TopicRow({
  topic,
  management,
  selected,
  onSelect,
  onRemove,
  onArchive
}: {
  topic: FollowTopic;
  management: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
  onRemove: (topic: FollowTopic) => void;
  onArchive: (topic: FollowTopic) => void;
}) {
  const initialInsightHref = insightHrefFor(topic);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [resultHref, setResultHref] = useState(initialInsightHref);
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const sync = () => setCooldown(getTopicCooldown(topic.id));
    sync();
    const timer = window.setInterval(sync, 1000);
    window.addEventListener("ai-radar-usage-change", sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("ai-radar-usage-change", sync);
    };
  }, [topic.id]);

  async function updateNow() {
    if (isRunningStatus(status)) return;
    const remaining = getTopicCooldown(topic.id);
    if (remaining > 0) {
      setCooldown(remaining);
      setErrorMessage(`刚刚更新过，约 ${remaining} 秒后可再次更新。`);
      setStatus("error");
      return;
    }
    markTopicRun(topic.id);
    setCooldown(topicRunCooldownSeconds);
    setStatus("searching");
    setErrorMessage("");
    window.setTimeout(() => setStatus((current) => (current === "searching" ? "filtering" : current)), 500);
    window.setTimeout(() => setStatus((current) => (current === "filtering" ? "summarizing" : current)), 1100);
    window.setTimeout(() => setStatus((current) => (current === "summarizing" ? "reporting" : current)), 1700);

    try {
      const response = await fetch(`/api/main-flow/topics/${topic.id}/run`, { method: "POST" });
      const data = await response.json().catch(() => ({})) as RunTopicResponse;
      if (!response.ok) throw new Error(runErrorMessage(data));

      setResultHref(data.localFallback ? initialInsightHref : data.insightHref ?? resultHref);
      if (data.provider?.searchProvider === "tavily") recordUsage("tavily");
      if (data.provider?.summaryProvider === "deepseek") recordUsage("deepseek");
      setStatus("done");
    } catch (error) {
      const message = error instanceof Error ? error.message : "更新失败，请稍后再试。";
      if (topic.id.startsWith("custom-")) {
        setResultHref(initialInsightHref);
        setStatus("done");
      } else {
        setErrorMessage(message);
        setStatus("error");
      }
    }
  }

  return (
    <article className={`border-t border-[var(--app-line)] px-5 py-5 first:border-t-0 sm:px-6 ${management ? "bg-[var(--app-surface-muted)]/45" : ""}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          {management ? (
            <label className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center">
              <input type="checkbox" checked={selected} onChange={() => onSelect(topic.id)} aria-label={`选择${topic.title}`} className="h-5 w-5 accent-[#2563eb]" />
            </label>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black">{topic.title}</h2>
              <span className="app-chip">{topic.category}</span>
              {topic.resultCount > 0 ? <span className="app-chip text-[#e9543f]">新增 {topic.resultCount} 条</span> : null}
            </div>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[var(--app-text-muted)]">{topicDisplayDescription(topic)}</p>
            <div className="mt-3 flex flex-wrap gap-2">{topic.keywords.map((keyword) => <span key={keyword} className="app-chip">{keyword}</span>)}</div>
            <p className="mt-3 text-xs font-bold text-[var(--app-text-muted)]">
              {cooldown > 0 && status !== "done" && !isRunningStatus(status) ? `刚刚更新过，${cooldown} 秒后可再次更新` : runStatusText(status, `最近更新 ${topic.updatedAt} · ${topic.resultCount} 条结果`, "已完成本次更新，已生成分析结果", errorMessage)}
            </p>
          </div>
        </div>
        {!management ? <Link href={`/topics/${topic.id}`} className="app-button shrink-0">查看内容 <ArrowRight size={16} /></Link> : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {!management ? (
          <>
            <button type="button" onClick={updateNow} disabled={isRunningStatus(status) || cooldown > 0} className="app-button-secondary min-h-10 px-3 py-2 text-xs disabled:cursor-wait disabled:opacity-70"><Lightning size={16} weight="fill" />{isRunningStatus(status) ? "正在更新" : cooldown > 0 ? `${cooldown} 秒后更新` : status === "error" ? "重试更新" : "立即更新"}</button>
            <Link href={resultHref} className="app-button-secondary min-h-10 px-3 py-2 text-xs"><Sparkle size={16} />查看分析</Link>
          </>
        ) : (
          <>
            <Link href={`/topics/${topic.id}/edit`} className="app-button-secondary min-h-10 px-3 py-2 text-xs"><PencilSimple size={16} />编辑</Link>
            <button type="button" onClick={() => onArchive(topic)} className="app-button-secondary min-h-10 px-3 py-2 text-xs"><Archive size={16} />归档</button>
            <button type="button" onClick={() => onRemove(topic)} className="app-button-secondary min-h-10 px-3 py-2 text-xs text-[#d94a3a]"><Trash size={16} />删除</button>
          </>
        )}
      </div>
    </article>
  );
}

export function TopicsView({ topics }: { topics: FollowTopic[] }) {
  const { showToast } = useToast();
  const [allTopics, setAllTopics] = useState<FollowTopic[]>(topics);
  const [management, setManagement] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setAllTopics([...readStoredTopics(), ...topics].filter((topic) => topic.lifecycle !== "deleted" && topic.lifecycle !== "archived"));
  }, [topics]);

  const selectedCount = selected.length;

  function toggleSelect(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function applyDelete(ids: string[]) {
    setBusy(true);
    try {
      const localIds = ids.filter((id) => id.startsWith("custom-"));
      const remoteIds = ids.filter((id) => !id.startsWith("custom-"));

      if (localIds.length) removeStoredTopics(localIds);
      if (remoteIds.length) {
        const response = await fetch("/api/main-flow/topics/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: remoteIds })
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({})) as { error?: string };
          throw new Error(data.error || "批量删除失败");
        }
      }

      setAllTopics((current) => current.filter((topic) => !ids.includes(topic.id)));
      setSelected([]);
      setConfirmAction(null);
      showToast({ tone: "success", title: `成功删除 ${ids.length} 个主题`, description: "采用软删除策略，相关内容和分析结果继续保留。" });
    } catch (error) {
      showToast({ tone: "error", title: "删除失败", description: error instanceof Error ? error.message : "请稍后重试。" });
    } finally {
      setBusy(false);
    }
  }

  async function applyArchive(topic: FollowTopic) {
    setBusy(true);
    try {
      if (topic.id.startsWith("custom-")) {
        removeStoredTopics([topic.id]);
      } else {
        const response = await fetch(`/api/main-flow/topics/${topic.id}/archive`, { method: "POST" });
        if (!response.ok) {
          const data = await response.json().catch(() => ({})) as { error?: string };
          throw new Error(data.error || "归档失败");
        }
      }
      setAllTopics((current) => current.filter((item) => item.id !== topic.id));
      setSelected((current) => current.filter((id) => id !== topic.id));
      setConfirmAction(null);
      showToast({ tone: "success", title: "已归档主题", description: "它会从主流程隐藏，历史内容继续保留。" });
    } catch (error) {
      showToast({ tone: "error", title: "归档失败", description: error instanceof Error ? error.message : "请稍后重试。" });
    } finally {
      setBusy(false);
    }
  }

  async function applyBulkArchive(ids: string[]) {
    setBusy(true);
    try {
      const localIds = ids.filter((id) => id.startsWith("custom-"));
      const remoteIds = ids.filter((id) => !id.startsWith("custom-"));

      if (localIds.length) removeStoredTopics(localIds);
      if (remoteIds.length) {
        const response = await fetch("/api/main-flow/topics/bulk-archive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: remoteIds })
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({})) as { error?: string };
          throw new Error(data.error || "批量归档失败");
        }
      }

      setAllTopics((current) => current.filter((topic) => !ids.includes(topic.id)));
      setSelected([]);
      setConfirmAction(null);
      showToast({ tone: "success", title: `成功归档 ${ids.length} 个主题`, description: "它们会从主流程隐藏，历史内容继续保留。" });
    } catch (error) {
      showToast({ tone: "error", title: "归档失败", description: error instanceof Error ? error.message : "请稍后重试。" });
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!confirmAction) return;
    if (confirmAction.type === "archive" && confirmAction.topic) await applyArchive(confirmAction.topic);
    if (confirmAction.type === "delete" && confirmAction.topic) await applyDelete([confirmAction.topic.id]);
    if (confirmAction.type === "bulk-delete") await applyDelete(selected);
    if (confirmAction.type === "bulk-archive") await applyBulkArchive(selected);
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-black sm:text-3xl">我的关注</h1><p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">把想持续了解的话题放在这里。</p></div>
        <div className="flex flex-wrap gap-2">
          <Link href="/topics/new" className="app-button"><Plus size={18} weight="bold" />创建主题</Link>
          <button type="button" onClick={() => { setManagement((current) => !current); setSelected([]); }} className="app-button-secondary">{management ? "退出管理" : "管理"}</button>
        </div>
      </div>

      {management ? (
        <section className="sticky top-3 z-20 mt-5 flex flex-col gap-3 rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-3 shadow-[0_12px_28px_rgba(28,46,78,0.08)] sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-black">已选择 {selectedCount} 个</span>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setSelected(allTopics.map((topic) => topic.id))} className="app-button-secondary min-h-10 px-3 py-2 text-xs">全选</button>
            <button type="button" onClick={() => setConfirmAction({ type: "bulk-archive" })} disabled={!selectedCount} className="app-button-secondary min-h-10 px-3 py-2 text-xs disabled:opacity-50"><Archive size={16} />批量归档</button>
            <button type="button" onClick={() => setConfirmAction({ type: "bulk-delete" })} disabled={!selectedCount} className="app-button-secondary min-h-10 px-3 py-2 text-xs text-[#d94a3a] disabled:opacity-50"><Trash size={16} />批量删除</button>
          </div>
        </section>
      ) : null}

      <section className="app-card mt-6 overflow-hidden">
        {allTopics.length ? allTopics.map((topic) => (
          <TopicRow key={topic.id} topic={topic} management={management} selected={selected.includes(topic.id)} onSelect={toggleSelect} onRemove={(item) => setConfirmAction({ type: "delete", topic: item })} onArchive={(item) => setConfirmAction({ type: "archive", topic: item })} />
        )) : (
          <div className="p-8 text-center"><p className="font-black">还没有关注主题</p><p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">先创建一个你关心的话题，之后更新和分析会出现在这里。</p><Link href="/topics/new" className="app-button mt-5">创建主题</Link></div>
        )}
      </section>

      <ConfirmDialog action={confirmAction} selectedCount={selectedCount} busy={busy} onCancel={() => setConfirmAction(null)} onConfirm={confirm} />
    </>
  );
}

export function TopicCreateWizard({ initialTitle = "", initialCategory, initialKeywords = [] }: { initialTitle?: string; initialCategory?: string; initialKeywords?: string[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState("");
  const [direction, setDirection] = useState(() => {
    if (initialCategory === "政策") return "政策变化";
    if (initialCategory === "财经") return "公司进展";
    if (initialCategory === "学习") return "学习资料";
    return directions[0];
  });
  const [keywords, setKeywords] = useState(initialKeywords.join("，"));
  const [excludeWords, setExcludeWords] = useState("");
  const [sourcePreference, setSourcePreference] = useState<TopicPreferences["sourcePreference"]>("官方优先");
  const [depth, setDepth] = useState<TopicPreferences["depth"]>("标准");
  const [searchScope, setSearchScope] = useState<TopicPreferences["searchScope"]>("允许全网搜索");
  const [autoSummary, setAutoSummary] = useState(true);
  const [dailyAutoCheck, setDailyAutoCheck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const keywordList = useMemo(() => splitKeywords(keywords).slice(0, 5), [keywords]);
  const excludeWordList = useMemo(() => splitKeywords(excludeWords).slice(0, 8), [excludeWords]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/main-flow/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          direction,
          keywords: keywordList.length ? keywordList : [title.trim()],
          excludeWords: excludeWordList,
          sourcePreference,
          depth,
          searchScope,
          autoSummary,
          dailyAutoCheck
        })
      });

      if (!response.ok) throw new Error("创建失败");
      const data = await response.json() as { topic?: { id: string }; localFallback?: boolean };
      if (!data.topic?.id) throw new Error("创建失败");

      if (data.localFallback || data.topic.id.startsWith("custom-")) {
        saveStoredTopic({
          id: data.topic.id,
          title: title.trim(),
          description: buildDescriptionWithPreferences(description.trim() || `持续整理与“${title.trim()}”有关的重要变化。`, {
            excludeWords: excludeWordList,
            contentDirections: [direction],
            sourcePreference,
            depth,
            searchScope,
            autoSummary,
            dailyAutoCheck
          }),
          keywords: keywordList.length ? keywordList : [title.trim()],
          category: direction,
          updatedAt: "刚刚创建",
          resultCount: 0,
          articleIds: ["ai-plan-2030", "domestic-ai-chip"],
          insightId: "generated",
          status: "scheduled",
          lifecycle: "active",
          dailyAutoCheck,
          createdAt: new Date().toISOString()
        });
      }

      router.push(`/topics/${data.topic.id}`);
    } catch {
      const id = `custom-${Date.now()}`;
      saveStoredTopic({
        id,
        title: title.trim(),
        description: buildDescriptionWithPreferences(description.trim() || `持续整理与“${title.trim()}”有关的重要变化。`, {
          excludeWords: excludeWordList,
          contentDirections: [direction],
          sourcePreference,
          depth,
          searchScope,
          autoSummary,
          dailyAutoCheck
        }),
        keywords: keywordList.length ? keywordList : [title.trim()],
        category: direction,
        updatedAt: "刚刚创建",
        resultCount: 0,
        articleIds: ["ai-plan-2030", "domestic-ai-chip"],
        insightId: "generated",
        status: "scheduled",
        lifecycle: "active",
        dailyAutoCheck,
        createdAt: new Date().toISOString()
      });
      setError("已使用本地兜底保存，联网后可再次同步。");
      router.push(`/topics/${id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/topics" className="inline-flex items-center gap-2 text-sm font-black text-[var(--app-text-muted)] hover:text-[var(--app-primary)]"><ArrowLeft size={17} />返回我的关注</Link>
      <div className="mt-6 flex items-center gap-2" aria-label={`第 ${step} 步，共 3 步`}>
        {[1, 2, 3].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? "bg-[var(--app-primary)]" : "bg-[var(--app-line)]"}`} />)}
      </div>
      <form onSubmit={submit} className="app-card mt-5 p-5 sm:p-8">
        {step === 1 ? (
          <div>
            <span className="text-sm font-black text-[var(--app-primary)]">第 1 步</span>
            <h1 className="mt-2 text-2xl font-black">你想持续关注什么？</h1>
            <p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">输入一个清楚的话题，例如 AI Agent、考公政策或半导体。</p>
            <label className="mt-7 block text-sm font-black" htmlFor="topic-title">话题名称</label>
            <input id="topic-title" value={title} onChange={(event) => setTitle(event.target.value)} required autoFocus placeholder="例如：AI Agent 产品进展" className="app-input mt-2" />
            <label className="mt-5 block text-sm font-black" htmlFor="topic-description">补充说明 <span className="font-semibold text-[var(--app-text-muted)]">（可选）</span></label>
            <textarea id="topic-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="你更关心哪些变化？" className="app-input mt-2 resize-none" />
          </div>
        ) : null}
        {step === 2 ? (
          <div>
            <span className="text-sm font-black text-[var(--app-primary)]">第 2 步</span>
            <h1 className="mt-2 text-2xl font-black">选择内容方向</h1>
            <p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">雷达会优先整理这个方向的内容。</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">{directions.map((item) => <button key={item} type="button" onClick={() => setDirection(item)} className={`flex min-h-14 items-center justify-between rounded-lg border px-4 text-left text-sm font-black ${direction === item ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "border-[var(--app-line)] bg-[var(--app-surface)]"}`}>{item}{direction === item ? <Check size={18} weight="bold" /> : null}</button>)}</div>
          </div>
        ) : null}
        {step === 3 ? (
          <div>
            <span className="text-sm font-black text-[var(--app-primary)]">第 3 步</span>
            <h1 className="mt-2 text-2xl font-black">确认关注主题</h1>
            <p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">可添加关键词，帮助雷达减少无关内容。</p>
            <label className="mt-7 block text-sm font-black" htmlFor="topic-keywords">关键词 <span className="font-semibold text-[var(--app-text-muted)]">（可选）</span></label>
            <input id="topic-keywords" value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="用逗号分隔，例如：智能体，工作流" className="app-input mt-2" />
            <label className="mt-5 block text-sm font-black" htmlFor="topic-exclude">排除词 <span className="font-semibold text-[var(--app-text-muted)]">（可选）</span></label>
            <input id="topic-exclude" value={excludeWords} onChange={(event) => setExcludeWords(event.target.value)} placeholder="用逗号分隔，例如：广告，旧闻" className="app-input mt-2" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-black" htmlFor="topic-source">来源偏好
                <select id="topic-source" value={sourcePreference} onChange={(event) => setSourcePreference(event.target.value as TopicPreferences["sourcePreference"])} className="app-input mt-2">
                  {sourcePreferences.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block text-sm font-black" htmlFor="topic-depth">内容深度
                <select id="topic-depth" value={depth} onChange={(event) => setDepth(event.target.value as TopicPreferences["depth"])} className="app-input mt-2">
                  <option value="简短">简短</option>
                  <option value="标准">标准</option>
                  <option value="深度">深度</option>
                </select>
              </label>
              <label className="block text-sm font-black" htmlFor="topic-scope">搜索范围
                <select id="topic-scope" value={searchScope} onChange={(event) => setSearchScope(event.target.value as TopicPreferences["searchScope"])} className="app-input mt-2">
                  <option value="只搜索已有内容">只搜索已有内容</option>
                  <option value="允许全网搜索">允许全网搜索</option>
                </select>
              </label>
              <label className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 text-sm font-black">
                <span>自动总结</span>
                <input type="checkbox" checked={autoSummary} onChange={(event) => setAutoSummary(event.target.checked)} className="h-5 w-5 accent-[#2563eb]" />
              </label>
              <label className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-[#f0d9a9] bg-[#fff8ea] px-4 text-sm font-black text-[#8a5b08]">
                <span>每日自动检查 <em className="block text-[11px] not-italic font-bold text-[#9a6a18]">默认关闭，会消耗搜索额度</em></span>
                <input type="checkbox" checked={dailyAutoCheck} onChange={(event) => setDailyAutoCheck(event.target.checked)} className="h-5 w-5 accent-[#2563eb]" />
              </label>
            </div>
            <div className="mt-6 rounded-lg bg-[var(--app-surface-muted)] p-4">
              <strong className="block text-base font-black">{title || "未填写话题"}</strong>
              <p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">方向：{direction} · 来源：{sourcePreference} · 深度：{depth}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--app-text-muted)]">关键词：{keywordList.join("、") || title || "创建后可补充"}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--app-text-muted)]">排除词：{excludeWordList.join("、") || "未设置"}</p>
            </div>
          </div>
        ) : null}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-[var(--app-line)] pt-5">
          {step > 1 ? <button type="button" onClick={() => setStep((current) => current - 1)} className="app-button-secondary">上一步</button> : <span />}
          <button type="submit" disabled={submitting || (step === 1 && !title.trim())} className="app-button disabled:cursor-not-allowed disabled:opacity-50">{step === 3 ? (submitting ? "创建中" : "创建主题") : "下一步"}<ArrowRight size={17} /></button>
        </div>
        {error ? <p className="mt-4 text-sm font-bold text-[var(--app-text-muted)]">{error}</p> : null}
      </form>
    </div>
  );
}

export function TopicEditForm({ topic }: { topic: FollowTopic }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [title, setTitle] = useState(topic.title);
  const parsedTopic = parseDescriptionWithPreferences(topic.description);
  const [description, setDescription] = useState(parsedTopic.description);
  const [category, setCategory] = useState(topic.category);
  const [keywords, setKeywords] = useState(topic.keywords.join("，"));
  const [excludeWords, setExcludeWords] = useState(parsedTopic.preferences.excludeWords.join("，"));
  const [selectedDirections, setSelectedDirections] = useState<string[]>(parsedTopic.preferences.contentDirections);
  const [sourcePreference, setSourcePreference] = useState<TopicPreferences["sourcePreference"]>(parsedTopic.preferences.sourcePreference);
  const [depth, setDepth] = useState<TopicPreferences["depth"]>(parsedTopic.preferences.depth);
  const [searchScope, setSearchScope] = useState<TopicPreferences["searchScope"]>(parsedTopic.preferences.searchScope);
  const [autoSummary, setAutoSummary] = useState(parsedTopic.preferences.autoSummary);
  const [dailyAutoCheck, setDailyAutoCheck] = useState(parsedTopic.preferences.dailyAutoCheck);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    try {
      const preferences: TopicPreferences = {
        excludeWords: splitKeywords(excludeWords),
        contentDirections: selectedDirections.length ? selectedDirections : [category],
        sourcePreference,
        depth,
        searchScope,
        autoSummary,
        dailyAutoCheck
      };
      const input = {
        title: title.trim(),
        description: buildDescriptionWithPreferences(description.trim(), preferences),
        category,
        keywords: splitKeywords(keywords),
        excludeWords: preferences.excludeWords,
        contentDirections: preferences.contentDirections,
        sourcePreference: preferences.sourcePreference,
        depth: preferences.depth,
        searchScope: preferences.searchScope,
        autoSummary: preferences.autoSummary,
        dailyAutoCheck: preferences.dailyAutoCheck
      };
      if (topic.id.startsWith("custom-")) {
        saveStoredTopic({ ...topic, ...input, updatedAt: "刚刚保存", createdAt: new Date().toISOString() });
      } else {
        const response = await fetch(`/api/main-flow/topics/${topic.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input)
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({})) as { error?: string };
          throw new Error(data.error || "保存失败");
        }
      }
      showToast({ tone: "success", title: "主题已保存", description: "新的关键词和描述会用于后续更新。" });
      router.push(`/topics/${topic.id}`);
    } catch (error) {
      showToast({ tone: "error", title: "保存失败", description: error instanceof Error ? error.message : "请稍后再试。" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/topics/${topic.id}`} className="inline-flex items-center gap-2 text-sm font-black text-[var(--app-text-muted)] hover:text-[var(--app-primary)]"><ArrowLeft size={17} />返回主题</Link>
      <form onSubmit={submit} className="app-card mt-6 p-5 sm:p-8">
        <span className="text-sm font-black text-[var(--app-primary)]">编辑主题</span>
        <h1 className="mt-2 text-2xl font-black">调整关注内容</h1>
        <label className="mt-7 block text-sm font-black" htmlFor="edit-topic-title">主题名称</label>
        <input id="edit-topic-title" value={title} onChange={(event) => setTitle(event.target.value)} required className="app-input mt-2" />
        <label className="mt-5 block text-sm font-black" htmlFor="edit-topic-description">描述</label>
        <textarea id="edit-topic-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="app-input mt-2 resize-none" />
        <label className="mt-5 block text-sm font-black" htmlFor="edit-topic-category">分类</label>
        <select id="edit-topic-category" value={category} onChange={(event) => setCategory(event.target.value)} className="app-input mt-2">
          {Array.from(new Set([...directions, topic.category])).map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <label className="mt-5 block text-sm font-black" htmlFor="edit-topic-keywords">关键词</label>
        <input id="edit-topic-keywords" value={keywords} onChange={(event) => setKeywords(event.target.value)} className="app-input mt-2" />
        <label className="mt-5 block text-sm font-black" htmlFor="edit-topic-exclude">排除词</label>
        <input id="edit-topic-exclude" value={excludeWords} onChange={(event) => setExcludeWords(event.target.value)} placeholder="用逗号分隔，例如：广告，旧闻" className="app-input mt-2" />
        <div className="mt-6">
          <p className="text-sm font-black">内容方向</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {contentDirections.map((item) => {
              const selected = selectedDirections.includes(item);
              return <button key={item} type="button" onClick={() => setSelectedDirections((current) => selected ? current.filter((value) => value !== item) : [...current, item])} className={`min-h-11 rounded-lg border px-3 text-sm font-black ${selected ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "border-[var(--app-line)] bg-[var(--app-surface)] text-[var(--app-text)]"}`}>{item}</button>;
            })}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-black" htmlFor="edit-topic-source">来源偏好
            <select id="edit-topic-source" value={sourcePreference} onChange={(event) => setSourcePreference(event.target.value as TopicPreferences["sourcePreference"])} className="app-input mt-2">
              {sourcePreferences.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="block text-sm font-black" htmlFor="edit-topic-depth">内容深度
            <select id="edit-topic-depth" value={depth} onChange={(event) => setDepth(event.target.value as TopicPreferences["depth"])} className="app-input mt-2">
              <option value="简短">简短</option>
              <option value="标准">标准</option>
              <option value="深度">深度</option>
            </select>
          </label>
          <label className="block text-sm font-black" htmlFor="edit-topic-scope">搜索范围
            <select id="edit-topic-scope" value={searchScope} onChange={(event) => setSearchScope(event.target.value as TopicPreferences["searchScope"])} className="app-input mt-2">
              <option value="只搜索已有内容">只搜索已有内容</option>
              <option value="允许全网搜索">允许全网搜索</option>
            </select>
          </label>
        </div>
        <label className="mt-5 flex min-h-12 items-center justify-between gap-3 rounded-lg border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 text-sm font-black">
          <span>自动总结</span>
          <input type="checkbox" checked={autoSummary} onChange={(event) => setAutoSummary(event.target.checked)} className="h-5 w-5 accent-[#2563eb]" />
        </label>
        <label className="mt-3 flex min-h-12 items-center justify-between gap-3 rounded-lg border border-[#f0d9a9] bg-[#fff8ea] px-4 text-sm font-black text-[#8a5b08]">
          <span>每日自动检查 <em className="block text-[11px] not-italic font-bold text-[#9a6a18]">默认关闭，每个主题每天最多自动更新 1 次</em></span>
          <input type="checkbox" checked={dailyAutoCheck} onChange={(event) => setDailyAutoCheck(event.target.checked)} className="h-5 w-5 accent-[#2563eb]" />
        </label>
        <div className="mt-8 flex flex-col gap-2 border-t border-[var(--app-line)] pt-5 sm:flex-row sm:justify-end">
          <Link href={`/topics/${topic.id}`} className="app-button-secondary justify-center">取消</Link>
          <button type="submit" disabled={saving || !title.trim()} className="app-button justify-center disabled:opacity-60">{saving ? "保存中" : "保存修改"}</button>
        </div>
      </form>
    </div>
  );
}

export function TopicEditClient({ id, topic }: { id: string; topic: FollowTopic | null }) {
  const [resolvedTopic, setResolvedTopic] = useState<FollowTopic | null>(topic);

  useEffect(() => {
    if (!topic) setResolvedTopic(readStoredTopics().find((item) => item.id === id) ?? null);
  }, [id, topic]);


  if (!resolvedTopic) {
    return <section className="app-card p-8 text-center"><h1 className="text-xl font-black">这个主题已被删除或归档</h1><p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">它不会再出现在我的关注中。</p><Link href="/topics" className="app-button mt-5">返回我的关注</Link></section>;
  }

  return <TopicEditForm topic={resolvedTopic} />;
}

export function TopicDetailClient({ id, topic, articles }: { id: string; topic: FollowTopic | null; articles: RedesignArticle[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [resolvedTopic, setResolvedTopic] = useState<FollowTopic | null>(topic);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [resultHref, setResultHref] = useState<string | null>(null);
  const [contentHref, setContentHref] = useState<string | null>(null);
  const [runMessage, setRunMessage] = useState("");
  const [runResult, setRunResult] = useState<{ itemCount: number; reportCount: number; candidateCount: number; overview: string; fallbackUsed: boolean; noChange?: boolean; searchProvider?: string | null; summaryProvider?: string | null } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [busy, setBusy] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const articleReadState = useReadState("article", articles.map((article) => article.id));

  useEffect(() => {
    if (!topic) setResolvedTopic(readStoredTopics().find((item) => item.id === id) ?? null);
  }, [id, topic]);

  useEffect(() => {
    if (!resolvedTopic) return;
    const sync = () => setCooldown(getTopicCooldown(resolvedTopic.id));
    sync();
    const timer = window.setInterval(sync, 1000);
    window.addEventListener("ai-radar-usage-change", sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("ai-radar-usage-change", sync);
    };
  }, [resolvedTopic]);

  if (!resolvedTopic) {
    return <section className="app-card p-8 text-center"><h1 className="text-xl font-black">这个主题已被删除或归档</h1><p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">它不会再出现在我的关注中。相关内容和分析结果会按当前数据策略保留。</p><Link href="/topics" className="app-button mt-5">返回我的关注</Link></section>;
  }

  const insightHref = insightHrefFor(resolvedTopic);
  const parsedDescription = parseDescriptionWithPreferences(resolvedTopic.description);
  const visibleArticles = onlyUnread ? articles.filter((article) => articleReadState.isUnread(article.id)) : articles;

  async function updateNow() {
    if (isRunningStatus(status)) return;
    const currentTopic = resolvedTopic;
    if (!currentTopic) return;

    const remaining = getTopicCooldown(currentTopic.id);
    if (remaining > 0) {
      setCooldown(remaining);
      setErrorMessage(`刚刚更新过，约 ${remaining} 秒后可再次更新。`);
      setStatus("error");
      return;
    }
    markTopicRun(currentTopic.id);
    setCooldown(topicRunCooldownSeconds);

    setStatus("searching");
    setRunMessage("");
    setRunResult(null);
    setErrorMessage("");
    window.setTimeout(() => setStatus((current) => (current === "searching" ? "filtering" : current)), 500);
    window.setTimeout(() => setStatus((current) => (current === "filtering" ? "summarizing" : current)), 1100);
    window.setTimeout(() => setStatus((current) => (current === "summarizing" ? "reporting" : current)), 1700);
    window.setTimeout(() => setStatus((current) => (current === "reporting" ? "saving" : current)), 2400);

    try {
      const response = await fetch(`/api/main-flow/topics/${currentTopic.id}/run`, { method: "POST" });
      const data = await response.json().catch(() => ({})) as RunTopicResponse;
      if (!response.ok) throw new Error(runErrorMessage(data));

      setResultHref(data.localFallback ? insightHref : data.insightHref ?? insightHref);
      setContentHref(data.contentHref ?? `/topics/${currentTopic.id}`);
      setRunMessage(data.message || "已完成本次更新");
      if (data.provider?.searchProvider === "tavily") recordUsage("tavily");
      if (data.provider?.summaryProvider === "deepseek") recordUsage("deepseek");
      setRunResult({
        itemCount: data.itemCount ?? 0,
        reportCount: data.reportCount ?? 0,
        candidateCount: data.candidateCount ?? data.itemCount ?? 0,
        overview: data.overview || "本次更新已完成，请查看完整分析结果。",
        fallbackUsed: Boolean(data.localFallback || data.provider?.fallbackUsed),
        noChange: Boolean(data.noChange),
        searchProvider: data.provider?.searchProvider,
        summaryProvider: data.provider?.summaryProvider
      });
      setStatus("done");
    } catch (error) {
      const message = error instanceof Error ? error.message : "更新失败，请稍后再试。";
      if (currentTopic.id.startsWith("custom-")) {
        setResultHref(insightHref);
        setContentHref(`/topics/${currentTopic.id}`);
        setRunMessage("已完成本次更新：当前为本地演示模式，可查看临时分析结果。");
        setStatus("done");
      } else {
        setErrorMessage(message);
        setStatus("error");
      }
    }
  }

  async function removeTopic(topicToRemove: FollowTopic) {
    setBusy(true);
    try {
      if (topicToRemove.id.startsWith("custom-")) {
        removeStoredTopics([topicToRemove.id]);
      } else {
        const response = await fetch(`/api/main-flow/topics/${topicToRemove.id}`, { method: "DELETE" });
        if (!response.ok) {
          const data = await response.json().catch(() => ({})) as { error?: string };
          throw new Error(data.error || "删除失败");
        }
      }
      showToast({ tone: "success", title: "主题已删除", description: "采用软删除策略，相关内容和分析结果继续保留。" });
      router.push("/topics");
    } catch (error) {
      showToast({ tone: "error", title: "删除失败", description: error instanceof Error ? error.message : "请稍后重试。" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Link href="/topics" className="inline-flex items-center gap-2 text-sm font-black text-[var(--app-text-muted)] hover:text-[var(--app-primary)]"><ArrowLeft size={17} />返回我的关注</Link>
      <header className="mt-6 border-b border-[var(--app-line)] pb-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0"><span className="app-chip text-[var(--app-primary)]">{resolvedTopic.category}</span><h1 className="mt-3 text-3xl font-black leading-tight">{resolvedTopic.title}</h1><p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[var(--app-text-muted)]">{parsedDescription.description}</p><div className="mt-4 flex flex-wrap gap-2">{resolvedTopic.keywords.map((keyword) => <span key={keyword} className="app-chip">{keyword}</span>)}{articleReadState.unreadCount ? <span className="app-chip text-[#e9543f]">新增 {articleReadState.unreadCount} 条</span> : null}</div></div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" onClick={updateNow} disabled={isRunningStatus(status) || cooldown > 0} className="app-button disabled:cursor-wait disabled:opacity-70"><Lightning size={18} weight="fill" />{isRunningStatus(status) ? "正在更新" : cooldown > 0 ? `${cooldown} 秒后更新` : status === "error" ? "重试更新" : "立即更新"}</button>
            <div className="relative">
              <button type="button" onClick={() => setMoreOpen((current) => !current)} className="app-button-secondary"><DotsThree size={18} weight="bold" />更多</button>
              {moreOpen ? (
              <div className="absolute right-0 top-12 z-30 w-44 overflow-hidden rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-1 shadow-[0_18px_50px_rgba(28,46,78,0.16)]">
                <Link href={`/topics/${resolvedTopic.id}/edit`} className="flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold hover:bg-[var(--app-surface-muted)]"><PencilSimple size={16} />编辑主题</Link>
                <a href="#update-records" className="flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold hover:bg-[var(--app-surface-muted)]"><ClockCounterClockwise size={16} />查看更新记录</a>
                <a href="#advanced-info" className="flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold hover:bg-[var(--app-surface-muted)]"><FileText size={16} />进入高级信息</a>
                <button type="button" onClick={() => setConfirmAction({ type: "delete", topic: resolvedTopic })} className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-bold text-[#d94a3a] hover:bg-[var(--app-surface-muted)]"><Trash size={16} />删除主题</button>
              </div>
              ) : null}
            </div>
          </div>
        </div>
        <p className={`mt-5 text-sm font-bold ${status === "done" ? "text-[var(--app-positive)]" : status === "error" || status === "empty" ? "text-[#e9543f]" : "text-[var(--app-text-muted)]"}`}>
          {cooldown > 0 && status !== "done" && !isRunningStatus(status) ? `刚刚更新过，${cooldown} 秒后可再次更新` : runStatusText(status, `最近更新 ${resolvedTopic.updatedAt}`, runMessage || "已完成本次更新", errorMessage)}
        </p>
        {status === "done" && runResult ? <section className="mt-4 rounded-lg border border-[#b8ddcf] bg-[#eefaf5] p-4"><div className="flex flex-wrap gap-2 text-xs font-black text-[#0f7f5b]"><span className="app-chip">候选 {runResult.candidateCount} 条</span><span className="app-chip">新增 {runResult.itemCount} 条</span><span className="app-chip">分析 {runResult.reportCount} 条</span>{runResult.searchProvider ? <span className="app-chip">搜索 {runResult.searchProvider}</span> : null}{runResult.summaryProvider ? <span className="app-chip">总结 {runResult.summaryProvider}</span> : null}{runResult.fallbackUsed ? <span className="app-chip text-[#b45309]">已临时使用模拟结果</span> : null}</div><p className="mt-3 text-sm font-bold leading-6 text-[#155f48]">{runResult.overview}</p></section> : null}
        {status === "done" || status === "error" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {status === "done" ? <Link href={resultHref ?? insightHref} className="app-button"><Sparkle size={17} />查看分析结果</Link> : null}
            {status === "done" ? <Link href={contentHref ?? `/topics/${resolvedTopic.id}`} className="app-button-secondary"><FileText size={17} />查看相关内容</Link> : null}
            {status === "error" ? <button type="button" onClick={updateNow} className="app-button-secondary"><Lightning size={17} weight="fill" />重试</button> : null}
          </div>
        ) : null}
      </header>

      <section className="py-7">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">最近内容</h2><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setOnlyUnread((current) => !current)} className={`app-button-secondary min-h-10 px-3 py-2 text-xs ${onlyUnread ? "border-[var(--app-primary)] text-[var(--app-primary)]" : ""}`}>只看新增内容</button><Link href="/search" className="text-sm font-black text-[var(--app-primary)]">搜索已有内容</Link></div></div>
        <div className="mt-4 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">{visibleArticles.length ? visibleArticles.map((article) => <Link key={article.id} href={`/articles/${article.id}`} className="flex min-h-20 items-center justify-between gap-4 py-4 hover:text-[var(--app-primary)]"><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><strong className="line-clamp-2 text-base font-black">{article.title}</strong><UnreadBadge kind="article" id={article.id} /></span><span className="mt-1 block text-xs font-bold text-[var(--app-text-muted)]">{article.source} · {article.time}</span></span><ArrowRight size={17} className="shrink-0" /></Link>) : <p className="py-5 text-sm font-semibold text-[var(--app-text-muted)]">当前没有未读内容。</p>}</div>
      </section>

      <section className="app-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e7f7f1] text-[#0f9f6e]"><FileText size={21} weight="duotone" /></span><span><span className="text-xs font-black text-[#0f8b62]">最新分析</span><strong className="mt-1 block text-base font-black">{resolvedTopic.resultCount ? "查看本主题的重要变化" : "更新后会在这里生成结果"}</strong></span></div>
        <Link href={insightHref} className="app-button-secondary shrink-0"><Sparkle size={17} />查看最新结果</Link>
      </section>

      <details id="advanced-info" className="mt-6 border-y border-[var(--app-line)] py-4 text-sm text-[var(--app-text-muted)]">
        <summary className="cursor-pointer font-black text-[var(--app-text)]">高级信息</summary>
        <div id="update-records" className="mt-4 flex items-start gap-3"><ClockCounterClockwise size={18} className="mt-0.5 shrink-0" /><p className="font-semibold leading-6">更新记录默认收起。最近一次整理状态正常，下一次自动更新将在明天上午进行。</p></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <p className="font-semibold leading-6">排除词：{parsedDescription.preferences.excludeWords.join("、") || "未设置"}</p>
          <p className="font-semibold leading-6">内容方向：{parsedDescription.preferences.contentDirections.join("、")}</p>
          <p className="font-semibold leading-6">来源偏好：{parsedDescription.preferences.sourcePreference}</p>
          <p className="font-semibold leading-6">内容深度：{parsedDescription.preferences.depth}</p>
          <p className="font-semibold leading-6">搜索范围：{parsedDescription.preferences.searchScope}</p>
          <p className="font-semibold leading-6">自动总结：{parsedDescription.preferences.autoSummary ? "开启" : "关闭"}</p>
          <p className="font-semibold leading-6">每日自动检查：{parsedDescription.preferences.dailyAutoCheck ? "开启" : "关闭"}</p>
        </div>
      </details>

      <ConfirmDialog action={confirmAction} selectedCount={1} busy={busy} onCancel={() => setConfirmAction(null)} onConfirm={() => resolvedTopic ? removeTopic(resolvedTopic) : undefined} />
    </div>
  );
}
