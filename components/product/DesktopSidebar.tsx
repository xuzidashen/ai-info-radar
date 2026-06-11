"use client";

import Link from "next/link";
import { Radar } from "lucide-react";
import { usePathname } from "next/navigation";

import { desktopNavigationGroups, isNavActive } from "@/lib/design/navigation";
import { productCopy } from "@/lib/design/copy";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 overflow-y-auto border-r border-white/80 bg-white/72 px-5 py-6 shadow-[18px_0_55px_rgba(15,23,42,0.07)] backdrop-blur-2xl lg:block">
      <ProductMark />
      <nav className="mt-8 space-y-6">
        {desktopNavigationGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[0.68rem] font-black uppercase tracking-[0.24em] text-slate-400">{group.title}</p>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(pathname, item.href);

                return (
                  <Link
                    key={`${group.title}-${item.href}-${item.label}`}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "group flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-black transition",
                      active
                        ? "border-sky-200 bg-sky-50 text-sky-800 shadow-[0_12px_28px_rgba(14,165,233,0.12)]"
                        : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-white/80 hover:text-slate-950"
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-8 rounded-[22px] border border-slate-200/70 bg-slate-950 p-4 text-white shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
        <p className="text-sm font-black">Local Intelligence Stack</p>
        <p className="mt-2 text-xs font-bold leading-6 text-white/54">本地数据库保存主题、报告、运行记录和质量快照。真实 Provider 只在服务端读取密钥。</p>
      </div>
    </aside>
  );
}

export function ProductMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-slate-950 text-cyan-100 shadow-[0_14px_30px_rgba(15,23,42,0.16)]">
        <Radar className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-black tracking-[0] text-slate-950">{productCopy.appName}</span>
        {!compact ? <span className="block truncate text-xs font-bold text-slate-500">{productCopy.appSubtitle}</span> : null}
      </span>
    </Link>
  );
}
