"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Crosshair, MagnifyingGlass, X } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";

export function TopNav({
  title = "AI 信息雷达",
  subtitle = "聚合每天与你有关的重要资讯",
  showBrand = true,
  showSearch = true
}: {
  title?: string;
  subtitle?: string;
  showBrand?: boolean;
  showSearch?: boolean;
}) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {showBrand ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-white shadow-[0_8px_18px_rgba(37,99,235,0.2)] lg:hidden">
              <Crosshair size={22} weight="duotone" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-2xl font-black leading-tight sm:text-[1.8rem]">{title}</h1>
            <p className="mt-1 text-sm font-semibold text-[var(--app-text-muted)]">{subtitle}</p>
          </div>
        </div>
        <Link href="/profile" aria-label="查看通知设置" className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] text-[var(--app-text)] lg:hidden">
          <Bell size={21} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ef5f4c] ring-2 ring-[var(--app-surface)]" />
        </Link>
      </div>
      {showSearch ? <SearchBar className="w-full lg:max-w-lg" /> : null}
    </header>
  );
}

export function SearchBar({ className = "", initialValue = "" }: { className?: string; initialValue?: string }) {
  const [query, setQuery] = useState(initialValue);
  const router = useRouter();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/discover?q=${encodeURIComponent(value)}` : "/discover");
  }

  return (
    <form onSubmit={submit} role="search" className={`flex min-h-12 items-center gap-3 rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] px-4 shadow-[0_6px_18px_rgba(28,46,78,0.05)] focus-within:border-[var(--app-primary)] ${className}`}>
      <MagnifyingGlass size={20} className="shrink-0 text-[var(--app-text-muted)]" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜索新闻、主题或来源"
        aria-label="搜索新闻、主题或来源"
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)]"
      />
      {query ? (
        <button type="button" onClick={() => setQuery("")} aria-label="清空搜索" className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)]">
          <X size={16} />
        </button>
      ) : null}
    </form>
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
      <div className="flex min-w-max items-center gap-1 border-b border-[var(--app-line)]" role="tablist" aria-label="内容分类">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={active === item}
            onClick={() => setActive(item)}
            className={`relative min-h-11 px-4 text-sm font-black transition-colors ${active === item ? "text-[var(--app-text)]" : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"}`}
          >
            {item}
            {active === item ? <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[var(--app-primary)]" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SectionHeader({ title, href, actionLabel = "查看更多" }: { title: string; href?: string; actionLabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-black sm:text-xl">{title}</h2>
      {href ? (
        <Link href={href} className="text-sm font-bold text-[var(--app-text-muted)] hover:text-[var(--app-primary)]">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
