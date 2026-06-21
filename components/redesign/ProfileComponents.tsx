"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookmarkSimple,
  Broom,
  ClockCounterClockwise,
  DownloadSimple,
  FolderSimple,
  Moon,
  NotePencil,
  SlidersHorizontal,
  Sparkle,
  TextAa,
  Wrench
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export function ProfileIntro() {
  return (
    <section className="app-card p-5">
      <Sparkle size={22} weight="duotone" className="text-[var(--app-primary)]" />
      <h2 className="mt-3 text-lg font-black">让雷达更懂你</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">调整关注方向和阅读偏好，首页会优先展示与你相关的内容。</p>
      <Link href="/topics" className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[var(--app-primary)]">管理关注主题 <ArrowRight size={15} /></Link>
    </section>
  );
}

export function ProfileCard() {
  return (
    <section className="app-card flex items-center gap-4 p-5 sm:p-6">
      <Image src="/redesign-assets/profile-avatar.webp" alt="用户头像" width={64} height={64} className="h-16 w-16 rounded-full object-cover" />
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-black">雷达用户</h2>
        <p className="mt-1 text-sm font-semibold text-[var(--app-text-muted)]">已连续阅读 12 天</p>
        <div className="mt-3 flex flex-wrap gap-2"><span className="app-chip">AI</span><span className="app-chip">科技</span><span className="app-chip">深度内容</span></div>
      </div>
    </section>
  );
}

export function QuickActions() {
  const items = [
    { label: "历史", value: 36, icon: ClockCounterClockwise, href: "/discover" },
    { label: "收藏", value: 23, icon: BookmarkSimple, href: "/saved" },
    { label: "下载", value: 4, icon: DownloadSimple, href: "/saved" },
    { label: "笔记", value: 8, icon: NotePencil, href: "/saved" }
  ];
  return (
    <section className="app-card grid grid-cols-4 divide-x divide-[var(--app-line)] py-4">
      {items.map((item) => {
        const Icon = item.icon;
        return <Link key={item.label} href={item.href} className="flex min-w-0 flex-col items-center gap-1 px-2 py-2 text-center hover:text-[var(--app-primary)]"><Icon size={21} /><strong className="text-lg font-black">{item.value}</strong><span className="text-xs font-bold text-[var(--app-text-muted)]">{item.label}</span></Link>;
      })}
    </section>
  );
}

export function ManagementEntry() {
  const entries = [
    { title: "我的关注主题", description: "管理关键词和更新方向", href: "/topics", icon: FolderSimple },
    { title: "我的分析结果", description: "查看最近生成的深度内容", href: "/insights", icon: Sparkle }
  ];
  return (
    <section className="app-card divide-y divide-[var(--app-line)]">
      {entries.map((entry) => {
        const Icon = entry.icon;
        return <Link key={entry.href} href={entry.href} className="flex min-h-20 items-center gap-4 px-5 py-4 hover:bg-[var(--app-surface-muted)]"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--app-primary-soft)] text-[var(--app-primary)]"><Icon size={21} weight="duotone" /></span><span className="min-w-0 flex-1"><strong className="block font-black">{entry.title}</strong><span className="mt-1 block text-xs font-semibold text-[var(--app-text-muted)]">{entry.description}</span></span><ArrowRight size={18} className="shrink-0 text-[var(--app-text-muted)]" /></Link>;
      })}
    </section>
  );
}

export function PreferencePanel() {
  return (
    <section className="app-card p-5">
      <div className="flex items-center gap-2"><SlidersHorizontal size={21} className="text-[var(--app-primary)]" /><h2 className="text-lg font-black">资讯偏好</h2></div>
      <div className="mt-5 space-y-5">
        <div><p className="text-sm font-black">关键词</p><div className="mt-2 flex flex-wrap gap-2"><span className="app-chip">AI Agent</span><span className="app-chip">半导体</span><span className="app-chip">政策</span><button type="button" className="app-chip text-[var(--app-primary)]">+ 添加</button></div></div>
        <div><p className="text-sm font-black">内容方向</p><div className="mt-2 flex flex-wrap gap-2"><span className="app-chip text-[var(--app-primary)]">科技</span><span className="app-chip text-[var(--app-primary)]">商业</span><span className="app-chip">世界</span><span className="app-chip">深度</span></div></div>
      </div>
    </section>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-label={label} aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-[var(--app-primary)]" : "bg-[var(--app-line)]"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} /></button>;
}

export function SettingList() {
  const [notifications, setNotifications] = useState(true);
  const [dark, setDark] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [cacheMessage, setCacheMessage] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = window.localStorage.getItem("radar-theme");
    const savedFont = window.localStorage.getItem("radar-font-size");
    const isDark = savedTheme === "dark";
    const isLarge = savedFont === "large";
    root.dataset.theme = isDark ? "dark" : "light";
    root.dataset.fontSize = isLarge ? "large" : "normal";
    setDark(isDark);
    setLargeText(isLarge);
  }, []);

  function updateDark(next: boolean) {
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("radar-theme", next ? "dark" : "light");
  }

  function updateFont(next: boolean) {
    setLargeText(next);
    document.documentElement.dataset.fontSize = next ? "large" : "normal";
    window.localStorage.setItem("radar-font-size", next ? "large" : "normal");
  }

  const rows = [
    { label: "通知提醒", description: "主题更新后提醒我", icon: Bell, control: <Switch label="通知提醒" checked={notifications} onChange={setNotifications} /> },
    { label: "深色模式", description: "降低夜间阅读亮度", icon: Moon, control: <Switch label="深色模式" checked={dark} onChange={updateDark} /> },
    { label: "大号字体", description: "放大正文和界面文字", icon: TextAa, control: <Switch label="大号字体" checked={largeText} onChange={updateFont} /> }
  ];

  return (
    <section className="app-card divide-y divide-[var(--app-line)]">
      {rows.map((row) => {
        const Icon = row.icon;
        return <div key={row.label} className="flex min-h-20 items-center gap-4 px-5 py-4"><Icon size={21} className="text-[var(--app-text-muted)]" /><span className="min-w-0 flex-1"><strong className="block text-sm font-black">{row.label}</strong><span className="mt-1 block text-xs font-semibold text-[var(--app-text-muted)]">{row.description}</span></span>{row.control}</div>;
      })}
      <button type="button" onClick={() => { window.localStorage.removeItem("radar-recent-searches"); setCacheMessage("已清理"); }} className="flex min-h-20 w-full items-center gap-4 px-5 py-4 text-left hover:bg-[var(--app-surface-muted)]"><Broom size={21} className="text-[var(--app-text-muted)]" /><span className="min-w-0 flex-1"><strong className="block text-sm font-black">清理缓存</strong><span className="mt-1 block text-xs font-semibold text-[var(--app-text-muted)]">清除本地搜索记录</span></span><span className="text-xs font-black text-[var(--app-positive)]">{cacheMessage}</span></button>
    </section>
  );
}

export function AdvancedToolsEntry() {
  return (
    <Link href="/workspace" className="flex min-h-16 items-center gap-4 border-t border-[var(--app-line)] py-5 text-[var(--app-text-muted)] hover:text-[var(--app-primary)]">
      <Wrench size={20} /><span className="min-w-0 flex-1"><strong className="block text-sm font-black">高级工具</strong><span className="mt-1 block text-xs font-semibold">面向高级用户的旧版内部能力</span></span><ArrowRight size={17} />
    </Link>
  );
}
