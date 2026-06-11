"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  CalendarClock,
  FileText,
  FlaskConical,
  Gauge,
  GitCompareArrows,
  History,
  Network,
  Radar,
  Settings,
  ShieldCheck,
  Smartphone,
  Tags,
  Workflow
} from "lucide-react";

const navGroups = [
  {
    title: "工作台",
    items: [
      { href: "/", label: "首页", icon: Gauge },
      { href: "/zones", label: "专区", icon: Workflow },
      { href: "/linkage", label: "联合分析", icon: Network }
    ]
  },
  {
    title: "信息管理",
    items: [
      { href: "/reports", label: "报告中心", icon: FileText },
      { href: "/reports/compare", label: "报告对比", icon: GitCompareArrows },
      { href: "/keywords", label: "关键词", icon: Tags }
    ]
  },
  {
    title: "自动化",
    items: [
      { href: "/schedules", label: "定时刷新", icon: CalendarClock },
      { href: "/runs", label: "运行日志", icon: History },
      { href: "/notifications", label: "通知中心", icon: Bell }
    ]
  },
  {
    title: "系统",
    items: [
      { href: "/quality", label: "质量监控", icon: Activity },
      { href: "/system/health", label: "系统健康", icon: ShieldCheck },
      { href: "/provider-lab", label: "Provider Lab", icon: FlaskConical },
      { href: "/mobile-preview", label: "移动预览", icon: Smartphone },
      { href: "/mobile-checklist", label: "移动检查", icon: Smartphone },
      { href: "/settings", label: "设置", icon: Settings }
    ]
  }
];

const navItems = navGroups.flatMap((group) => group.items);

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function MainNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav className="flex items-center gap-2 overflow-x-auto px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={[
                "flex h-12 min-w-12 items-center justify-center rounded-2xl border text-sm transition",
                active ? "border-radar-500/40 bg-radar-500 text-ink-950" : "border-slate-200 bg-white text-slate-500 hover:border-sky-200 hover:text-sky-700"
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="space-y-5">
      {navGroups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 px-3 text-[0.68rem] font-black uppercase tracking-[0.24em] text-slate-400">{group.title}</p>
          <div className="space-y-1.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "group flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-black transition",
                    active
                      ? "border-radar-500/40 bg-radar-500 text-ink-950 shadow-[0_12px_30px_rgba(18,165,148,0.18)]"
                      : "border-transparent text-slate-500 hover:border-sky-200 hover:bg-white hover:text-sky-700"
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
  );
}

export function ProductMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-radar-500/30 bg-radar-500 text-ink-950 shadow-[0_16px_34px_rgba(18,165,148,0.22)]">
        <Radar className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-black tracking-wide text-slate-950">AI 信息雷达</span>
        {!compact ? <span className="block truncate text-xs font-bold text-slate-500">Multi-Zone Intelligence Hub</span> : null}
      </span>
    </Link>
  );
}
