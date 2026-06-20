"use client";

import Link from "next/link";
import {
  Bell,
  Crosshair,
  MagnifyingGlass
} from "@phosphor-icons/react";
import { useState } from "react";

export function TopNav({
  title = "AI 信息雷达",
  subtitle = "聚合每日重要资讯",
  showBrand = true
}: {
  title?: string;
  subtitle?: string;
  showBrand?: boolean;
}) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {showBrand ? (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2878ff] text-white shadow-[0_10px_24px_rgba(40,120,255,0.22)] lg:hidden">
              <Crosshair size={24} weight="duotone" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h1 className="truncate text-[1.75rem] font-black leading-tight tracking-[0] text-[#10213b] sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm font-semibold text-[#718096]">{subtitle}</p>
          </div>
        </div>
        <NotificationButton />
      </div>
      <SearchBar className="w-full lg:max-w-xl" />
    </header>
  );
}

export function SearchBar({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");

  return (
    <label className={`flex min-h-12 items-center gap-3 rounded-2xl border border-[#dfe8f3] bg-white px-4 shadow-[0_8px_24px_rgba(65,91,130,0.06)] focus-within:border-[#8ab7ff] focus-within:ring-4 focus-within:ring-[#2878ff]/10 ${className}`}>
      <MagnifyingGlass size={21} className="shrink-0 text-[#718096]" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜索新闻、话题或来源"
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#10213b] outline-none placeholder:text-[#9aa7b8]"
      />
      {query ? (
        <button type="button" onClick={() => setQuery("")} className="rounded-full bg-[#edf3fb] px-2.5 py-1 text-xs font-bold text-[#607089]">
          清除
        </button>
      ) : null}
    </label>
  );
}

export function NotificationButton() {
  return (
    <Link href="/redesign/profile" aria-label="查看通知" className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#dfe8f3] bg-white text-[#10213b] shadow-[0_8px_24px_rgba(65,91,130,0.06)] transition hover:border-[#9fc3ff] hover:text-[#2878ff] lg:hidden">
      <Bell size={22} weight="regular" />
      <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ff654d] ring-2 ring-white" />
    </Link>
  );
}

export function CategoryTabs({
  items,
  initialActive
}: {
  items: string[];
  initialActive?: string;
}) {
  const [active, setActive] = useState(initialActive ?? items[0] ?? "");

  return (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <div className="flex min-w-max items-center gap-1 border-b border-[#e1e8f1]">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setActive(item)}
            className={`relative min-h-12 px-4 text-sm font-black transition ${active === item ? "text-[#10213b]" : "text-[#718096] hover:text-[#10213b]"}`}
          >
            {item}
            {active === item ? <span className="absolute inset-x-4 bottom-0 h-1 rounded-full bg-[#2878ff]" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SectionHeader({ title, href, actionLabel = "查看更多" }: { title: string; href?: string; actionLabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-black tracking-[0] text-[#10213b] sm:text-xl">{title}</h2>
      {href ? (
        <Link href={href} className="rounded-full px-2 py-1 text-xs font-bold text-[#718096] transition hover:bg-[#edf3fb] hover:text-[#2878ff]">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
