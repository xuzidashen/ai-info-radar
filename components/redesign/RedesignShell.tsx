"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookmarkSimple,
  Compass,
  Crosshair,
  House,
  User
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

const navigation = [
  { href: "/", label: "首页", icon: House },
  { href: "/discover", label: "发现", icon: Compass },
  { href: "/saved", label: "收藏", icon: BookmarkSimple },
  { href: "/profile", label: "我的", icon: User }
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function RedesignShell({
  children,
  aside,
  showBottomNav = true
}: {
  children: ReactNode;
  aside?: ReactNode;
  showBottomNav?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 border-r border-[var(--app-line)] bg-[var(--app-surface)] px-4 py-6 lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)]">
            <Crosshair size={22} weight="duotone" />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-lg font-black">AI 信息雷达</strong>
            <span className="block truncate text-xs font-semibold text-[var(--app-text-muted)]">每天读懂重要变化</span>
          </span>
        </Link>

        <nav className="mt-9 space-y-1" aria-label="主导航">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition-colors ${
                  active
                    ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                    : "text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                <Icon size={20} weight={active ? "fill" : "regular"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[var(--app-line)] pt-5">
          <p className="text-sm font-black">专注你的关注</p>
          <p className="mt-2 text-xs font-semibold leading-5 text-[var(--app-text-muted)]">创建主题后，雷达会把最新内容和分析结果整理在一起。</p>
          <Link href="/topics" className="mt-3 inline-flex text-xs font-black text-[var(--app-primary)]">查看我的关注</Link>
        </div>
      </aside>

      <div className="lg:pl-56">
        <div className={`mx-auto grid w-full max-w-[1320px] gap-6 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:px-8 lg:py-7 ${aside ? "xl:grid-cols-[minmax(0,820px)_280px] xl:justify-center" : "max-w-[1040px]"}`}>
          <main className={showBottomNav ? "min-w-0 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8" : "min-w-0 pb-8"}>{children}</main>
          {aside ? <aside className="hidden min-w-0 xl:block">{aside}</aside> : null}
        </div>
      </div>

      {showBottomNav ? (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--app-line)] bg-[var(--app-surface)] px-3 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(28,46,78,0.08)] lg:hidden" aria-label="移动端主导航">
          <div className="mx-auto grid h-[4.5rem] max-w-md grid-cols-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-w-0 flex-col items-center justify-center gap-1 text-xs font-bold ${active ? "text-[var(--app-primary)]" : "text-[var(--app-text-muted)]"}`}
                >
                  <Icon size={23} weight={active ? "fill" : "regular"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
