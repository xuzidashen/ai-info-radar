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
  { href: "/redesign/discover", label: "发现", icon: Compass },
  { href: "/redesign/saved", label: "收藏", icon: BookmarkSimple },
  { href: "/redesign/profile", label: "我的", icon: User }
];

function activePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname === "/redesign";
  }
  return pathname.startsWith(href);
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
    <div className="min-h-screen bg-[#f3f7fc] text-[#10213b]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#dfe8f3] bg-white/95 px-5 py-7 lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2878ff] text-white shadow-[0_10px_24px_rgba(40,120,255,0.24)]">
            <Crosshair size={24} weight="duotone" />
          </span>
          <span>
            <strong className="block text-xl font-black tracking-[0] text-[#10213b]">AI 信息雷达</strong>
            <span className="text-xs font-semibold text-[#73839b]">每天读懂重要变化</span>
          </span>
        </Link>

        <nav className="mt-10 space-y-2" aria-label="资讯主导航">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold transition ${
                  active ? "bg-[#eaf2ff] text-[#1769e8]" : "text-[#607089] hover:bg-[#f4f7fb] hover:text-[#10213b]"
                }`}
              >
                <Icon size={21} weight={active ? "fill" : "regular"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[24px] border border-[#dfe8f3] bg-[#f7faff] p-4">
          <p className="text-sm font-black text-[#10213b]">专注你的关注</p>
          <p className="mt-2 text-xs font-semibold leading-5 text-[#73839b]">新版将 Topic、报告和运行记录收进更自然的阅读流程。</p>
          <Link href="/legacy" className="mt-4 inline-flex text-xs font-black text-[#1769e8]">进入管理工作台</Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <div className={`mx-auto grid w-full max-w-[1440px] gap-7 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:px-8 lg:py-8 ${aside ? "xl:grid-cols-[minmax(0,1fr)_330px]" : ""}`}>
          <main className={showBottomNav ? "min-w-0 pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-8" : "min-w-0 pb-8"}>{children}</main>
          {aside ? <aside className="hidden min-w-0 xl:block">{aside}</aside> : null}
        </div>
      </div>

      {showBottomNav ? (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#dfe8f3] bg-white/96 px-3 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(66,91,130,0.08)] backdrop-blur-xl lg:hidden" aria-label="移动端主导航">
          <div className="mx-auto grid h-[4.75rem] max-w-md grid-cols-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-w-0 flex-col items-center justify-center gap-1 text-[0.7rem] font-bold transition ${active ? "text-[#2878ff]" : "text-[#7d899b]"}`}
                >
                  <Icon size={24} weight={active ? "fill" : "regular"} />
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
