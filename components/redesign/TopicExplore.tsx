"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Buildings, Cpu, Lightbulb, Plus } from "@phosphor-icons/react";
import { useState } from "react";

import type { FollowTopic } from "@/lib/mock/redesignData";

type TemplateCategory = "全部" | "AI" | "科技" | "财经" | "政策" | "学习";

const templates = [
  { title: "AI Agent", category: "AI" as const, description: "追踪智能体产品、工具调用、工作流和真实落地案例。", keywords: ["AI Agent", "智能体", "工作流"], icon: Lightbulb },
  { title: "半导体产业链", category: "科技" as const, description: "关注芯片设计、先进制造、设备材料和供应链变化。", keywords: ["半导体", "芯片", "先进制造"], icon: Cpu },
  { title: "考公政策", category: "政策" as const, description: "整理招考公告、职位变化、报名时间和政策解读。", keywords: ["公务员考试", "招考公告", "报名"], icon: BookOpen },
  { title: "低空经济", category: "财经" as const, description: "关注政策、基础设施、商业化进展和产业链公司公告。", keywords: ["低空经济", "通航", "eVTOL"], icon: Buildings },
  { title: "软件杯竞赛", category: "学习" as const, description: "跟踪赛题、报名节点、资料更新和获奖动态。", keywords: ["软件杯", "竞赛", "赛题"], icon: BookOpen },
  { title: "财经公司公告", category: "财经" as const, description: "只整理公开公司公告和关键变化，不构成投资建议。", keywords: ["公司公告", "业绩", "重大事项"], icon: Buildings }
];

const categories: TemplateCategory[] = ["全部", "AI", "科技", "财经", "政策", "学习"];

function createHref(template: typeof templates[number]) {
  const params = new URLSearchParams({ title: template.title, category: template.category, keywords: template.keywords.join(",") });
  return `/topics/new?${params.toString()}`;
}

export function TopicTemplateExplorer({ recentTopics }: { recentTopics: FollowTopic[] }) {
  const [category, setCategory] = useState<TemplateCategory>("全部");
  const filtered = category === "全部" ? templates : templates.filter((item) => item.category === category);

  return (
    <div className="space-y-8">
      <section>
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <div className="flex min-w-max gap-2" role="tablist" aria-label="主题模板分类">{categories.map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} onClick={() => setCategory(item)} className={`min-h-10 rounded-lg px-4 text-sm font-black ${category === item ? "bg-[var(--app-primary)] text-white" : "border border-[var(--app-line)] bg-[var(--app-surface)] text-[var(--app-text-muted)]"}`}>{item}</button>)}</div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-3"><div><h2 className="text-xl font-black">推荐关注方向</h2><p className="mt-1 text-sm font-semibold text-[var(--app-text-muted)]">选择模板后仍可修改标题、关键词和分类。</p></div><Link href="/topics/new" className="app-button-secondary hidden sm:inline-flex"><Plus size={17} />自定义主题</Link></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => {
            const Icon = template.icon;
            return <Link key={template.title} href={createHref(template)} className="group rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-5 transition-colors hover:border-[var(--app-primary)]"><div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--app-primary-soft)] text-[var(--app-primary)]"><Icon size={21} weight="duotone" /></span><span className="app-chip">{template.category}</span></div><h3 className="mt-4 text-base font-black">{template.title}</h3><p className="mt-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">{template.description}</p><div className="mt-3 flex flex-wrap gap-1.5">{template.keywords.slice(0, 3).map((keyword) => <span key={keyword} className="app-chip">{keyword}</span>)}</div><span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[var(--app-primary)]">创建关注 <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span></Link>;
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">最近更新的主题</h2><Link href="/topics" className="text-sm font-black text-[var(--app-primary)]">我的全部主题</Link></div>
        {recentTopics.length ? <div className="mt-4 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">{recentTopics.slice(0, 6).map((topic) => <Link key={topic.id} href={`/topics/${topic.id}`} className="flex min-h-20 items-center gap-3 py-4 hover:text-[var(--app-primary)]"><span className="min-w-0 flex-1"><span className="app-chip">{topic.category}</span><strong className="mt-2 block font-black">{topic.title}</strong><span className="mt-1 block text-xs font-bold text-[var(--app-text-muted)]">{topic.updatedAt} · {topic.resultCount} 条结果</span></span><ArrowRight size={17} className="shrink-0" /></Link>)}</div> : <p className="mt-4 rounded-lg border border-dashed border-[var(--app-line)] p-6 text-sm font-semibold text-[var(--app-text-muted)]">还没有自己的主题，可以先从上面的模板开始创建。</p>}
      </section>
    </div>
  );
}
