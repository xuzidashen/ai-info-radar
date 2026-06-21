"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClockCounterClockwise,
  FileText,
  Lightning,
  Plus,
  Sparkle
} from "@phosphor-icons/react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import type { FollowTopic, RedesignArticle } from "@/lib/mock/redesignData";

const STORAGE_KEY = "ai-radar-custom-topics";

type StoredTopic = FollowTopic & { createdAt: string };

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

function TopicRow({ topic }: { topic: FollowTopic }) {
  const [status, setStatus] = useState<"idle" | "updating" | "done">("idle");

  function updateNow() {
    if (status === "updating") return;
    setStatus("updating");
    window.setTimeout(() => setStatus("done"), 1200);
  }

  const insightHref = topic.id.startsWith("custom-")
    ? `/insights/generated?topic=${encodeURIComponent(topic.title)}&category=${encodeURIComponent(topic.category)}&topicId=${encodeURIComponent(topic.id)}`
    : `/insights/${topic.insightId}`;

  return (
    <article className="border-t border-[var(--app-line)] px-5 py-5 first:border-t-0 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black">{topic.title}</h2>
            <span className="app-chip">{topic.category}</span>
          </div>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[var(--app-text-muted)]">{topic.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">{topic.keywords.map((keyword) => <span key={keyword} className="app-chip">{keyword}</span>)}</div>
          <p className="mt-3 text-xs font-bold text-[var(--app-text-muted)]">
            {status === "updating" ? "正在整理最新内容…" : status === "done" ? "已完成本次更新，发现 3 条新内容" : `最近更新 ${topic.updatedAt} · ${topic.resultCount} 条结果`}
          </p>
        </div>
        <Link href={`/topics/${topic.id}`} className="app-button shrink-0">查看内容 <ArrowRight size={16} /></Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={updateNow} disabled={status === "updating"} className="app-button-secondary min-h-10 px-3 py-2 text-xs disabled:cursor-wait disabled:opacity-70"><Lightning size={16} weight="fill" />{status === "updating" ? "正在更新" : "立即更新"}</button>
        <Link href={insightHref} className="app-button-secondary min-h-10 px-3 py-2 text-xs"><Sparkle size={16} />查看分析</Link>
      </div>
    </article>
  );
}

export function TopicsView({ topics }: { topics: FollowTopic[] }) {
  const [allTopics, setAllTopics] = useState<FollowTopic[]>(topics);

  useEffect(() => {
    setAllTopics([...readStoredTopics(), ...topics]);
  }, [topics]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-black sm:text-3xl">我的关注</h1><p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">把想持续了解的话题放在这里。</p></div>
        <Link href="/topics/new" className="app-button"><Plus size={18} weight="bold" />创建主题</Link>
      </div>
      <section className="app-card mt-6 overflow-hidden">
        {allTopics.map((topic) => <TopicRow key={topic.id} topic={topic} />)}
      </section>
    </>
  );
}

const directions = ["新闻动态", "政策变化", "公司进展", "学习资料"];

export function TopicCreateWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [direction, setDirection] = useState(directions[0]);
  const [keywords, setKeywords] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const keywordList = useMemo(() => keywords.split(/[，,\s]+/).map((item) => item.trim()).filter(Boolean).slice(0, 5), [keywords]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }
    if (!title.trim()) return;
    setSubmitting(true);
    const id = `custom-${Date.now()}`;
    saveStoredTopic({
      id,
      title: title.trim(),
      description: description.trim() || `持续整理与“${title.trim()}”有关的重要变化。`,
      keywords: keywordList.length ? keywordList : [title.trim()],
      category: direction,
      updatedAt: "刚刚创建",
      resultCount: 0,
      articleIds: ["ai-plan-2030", "domestic-ai-chip"],
      insightId: "generated",
      status: "scheduled",
      createdAt: new Date().toISOString()
    });
    router.push(`/topics/${id}`);
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
            <div className="mt-6 rounded-lg bg-[var(--app-surface-muted)] p-4"><strong className="block text-base font-black">{title || "未填写话题"}</strong><p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">方向：{direction}</p><p className="mt-1 text-sm font-semibold text-[var(--app-text-muted)]">关键词：{keywordList.join("、") || title || "创建后可补充"}</p></div>
          </div>
        ) : null}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-[var(--app-line)] pt-5">
          {step > 1 ? <button type="button" onClick={() => setStep((current) => current - 1)} className="app-button-secondary">上一步</button> : <span />}
          <button type="submit" disabled={submitting || (step === 1 && !title.trim())} className="app-button disabled:cursor-not-allowed disabled:opacity-50">{step === 3 ? (submitting ? "正在创建" : "创建主题") : "下一步"}<ArrowRight size={17} /></button>
        </div>
      </form>
    </div>
  );
}

export function TopicDetailClient({ id, topic, articles }: { id: string; topic: FollowTopic | null; articles: RedesignArticle[] }) {
  const [resolvedTopic, setResolvedTopic] = useState<FollowTopic | null>(topic);
  const [status, setStatus] = useState<"idle" | "updating" | "done">("idle");

  useEffect(() => {
    if (!topic) setResolvedTopic(readStoredTopics().find((item) => item.id === id) ?? null);
  }, [id, topic]);

  if (!resolvedTopic) {
    return <section className="app-card p-8 text-center"><h1 className="text-xl font-black">没有找到这个主题</h1><p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">它可能已被删除，或者只保存在另一台设备上。</p><Link href="/topics" className="app-button mt-5">返回我的关注</Link></section>;
  }

  const insightHref = resolvedTopic.id.startsWith("custom-")
    ? `/insights/generated?topic=${encodeURIComponent(resolvedTopic.title)}&category=${encodeURIComponent(resolvedTopic.category)}&topicId=${encodeURIComponent(resolvedTopic.id)}`
    : `/insights/${resolvedTopic.insightId}`;

  function updateNow() {
    if (status === "updating") return;
    setStatus("updating");
    window.setTimeout(() => setStatus("done"), 1400);
  }

  return (
    <div>
      <Link href="/topics" className="inline-flex items-center gap-2 text-sm font-black text-[var(--app-text-muted)] hover:text-[var(--app-primary)]"><ArrowLeft size={17} />返回我的关注</Link>
      <header className="mt-6 border-b border-[var(--app-line)] pb-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0"><span className="app-chip text-[var(--app-primary)]">{resolvedTopic.category}</span><h1 className="mt-3 text-3xl font-black leading-tight">{resolvedTopic.title}</h1><p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[var(--app-text-muted)]">{resolvedTopic.description}</p><div className="mt-4 flex flex-wrap gap-2">{resolvedTopic.keywords.map((keyword) => <span key={keyword} className="app-chip">{keyword}</span>)}</div></div>
          <button type="button" onClick={updateNow} disabled={status === "updating"} className="app-button shrink-0 disabled:cursor-wait disabled:opacity-70"><Lightning size={18} weight="fill" />{status === "updating" ? "正在更新" : "立即更新"}</button>
        </div>
        <p className={`mt-5 text-sm font-bold ${status === "done" ? "text-[var(--app-positive)]" : "text-[var(--app-text-muted)]"}`}>{status === "updating" ? "正在整理最新内容，请稍候…" : status === "done" ? "已完成本次更新：发现 3 条新内容，生成 1 条分析结果。" : `最近更新 ${resolvedTopic.updatedAt}`}</p>
      </header>

      <section className="py-7">
        <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-black">最近内容</h2><Link href="/discover" className="text-sm font-black text-[var(--app-primary)]">发现更多</Link></div>
        <div className="mt-4 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">{articles.map((article) => <Link key={article.id} href={`/articles/${article.id}`} className="flex min-h-20 items-center justify-between gap-4 py-4 hover:text-[var(--app-primary)]"><span className="min-w-0"><strong className="line-clamp-2 text-base font-black">{article.title}</strong><span className="mt-1 block text-xs font-bold text-[var(--app-text-muted)]">{article.source} · {article.time}</span></span><ArrowRight size={17} className="shrink-0" /></Link>)}</div>
      </section>

      <section className="app-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e7f7f1] text-[#0f9f6e]"><FileText size={21} weight="duotone" /></span><span><span className="text-xs font-black text-[#0f8b62]">最新分析</span><strong className="mt-1 block text-base font-black">{resolvedTopic.resultCount ? "查看本主题的重要变化" : "更新后会在这里生成结果"}</strong></span></div>
        <Link href={insightHref} className="app-button-secondary shrink-0"><Sparkle size={17} />查看最新结果</Link>
      </section>

      <details className="mt-6 border-y border-[var(--app-line)] py-4 text-sm text-[var(--app-text-muted)]">
        <summary className="cursor-pointer font-black text-[var(--app-text)]">高级信息</summary>
        <div className="mt-4 flex items-start gap-3"><ClockCounterClockwise size={18} className="mt-0.5 shrink-0" /><p className="font-semibold leading-6">更新记录默认收起。最近一次整理状态正常，下一次自动更新将在明天上午进行。</p></div>
      </details>
    </div>
  );
}
