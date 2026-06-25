import Link from "next/link";
import { ArrowLeft, ArrowRight, Database, Flask, Heartbeat, ShieldCheck, Wrench } from "@phosphor-icons/react/dist/ssr";

import { RedesignShell } from "@/components/redesign/RedesignShell";
import { prisma } from "@/lib/prisma";
import { getFactorProviderStatus } from "@/lib/providers/factor";
import { getLinkageProviderStatus } from "@/lib/providers/linkage";
import { getSearchProviderStatus } from "@/lib/providers/search";
import { getSummaryProviderStatus } from "@/lib/providers/summary";
import { canUseDatabase } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

const tools = [
  { title: "旧版专区与主题", description: "查看原有 Zone、Topic 数据结构", href: "/zones", icon: Database },
  { title: "旧版报告与运行记录", description: "面向排查和历史兼容的内部页面", href: "/reports", icon: Wrench },
  { title: "运行日志", description: "查看旧版 Run 记录和重试链路", href: "/runs", icon: Wrench },
  { title: "Provider 测试", description: "检查搜索与总结服务配置", href: "/settings/provider-test", icon: Flask },
  { title: "可信质量 QA", description: "验收搜索、摘要、主题更新和来源质量闭环", href: "/workspace/qa", icon: ShieldCheck },
  { title: "系统健康状态", description: "查看服务连接与运行环境", href: "/system/health", icon: Heartbeat }
];

async function getDatabaseConnectionStatus() {
  if (!canUseDatabase()) {
    return {
      ok: false,
      label: "未连接",
      detail: "DATABASE_URL 未配置为 PostgreSQL，当前只能使用 mock / 本地兜底。"
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      ok: true,
      label: "正常",
      detail: "数据库连接正常，手机和电脑刷新后会读取同一份云端数据。"
    };
  } catch {
    return {
      ok: false,
      label: "异常",
      detail: "数据库连接失败，请检查 DATABASE_URL 和 Neon 连接状态。"
    };
  }
}

export default async function WorkspacePage() {
  const [database, search, summary, factor, linkage] = await Promise.all([
    getDatabaseConnectionStatus(),
    getSearchProviderStatus(),
    getSummaryProviderStatus(),
    getFactorProviderStatus(),
    getLinkageProviderStatus()
  ]);
  const providerRows = [
    { label: "Search", requested: search.requestedProvider, active: search.activeProvider, key: search.hasTavilyApiKey ? "Tavily Key 已配置" : "Tavily Key 未配置" },
    { label: "Summary", requested: summary.requestedProvider, active: summary.activeProvider, key: summary.hasDeepSeekApiKey ? "DeepSeek Key 已配置" : "DeepSeek Key 未配置" },
    { label: "Factor", requested: factor.requestedProvider, active: factor.activeProvider, key: factor.hasDeepSeekApiKey ? "DeepSeek Key 已配置" : "DeepSeek Key 未配置" },
    { label: "Linkage", requested: linkage.requestedProvider, active: linkage.activeProvider, key: linkage.hasDeepSeekApiKey ? "DeepSeek Key 已配置" : "DeepSeek Key 未配置" }
  ];
  const realMode = providerRows.some((row) => row.requested !== "mock");

  return (
    <RedesignShell showBottomNav={false}>
      <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-black text-[var(--app-text-muted)] hover:text-[var(--app-primary)]"><ArrowLeft size={17} />返回我的</Link>
      <header className="mt-6 border-b border-[var(--app-line)] pb-6"><span className="app-chip">高级工具，仅用于管理和调试。</span><h1 className="mt-3 text-3xl font-black">高级工具</h1><p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--app-text-muted)]">这里保留旧版内部能力，仅用于配置、排查和历史数据兼容。普通阅读与主题更新请使用新的主流程。</p></header>
      <section className="mt-6 rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Provider 与数据状态</h2>
            <p className="mt-1 text-xs font-semibold text-[var(--app-text-muted)]">只显示是否配置，不显示完整 API Key 或 DATABASE_URL。</p>
          </div>
          <span className="app-chip">{realMode ? "真实 Provider 模式" : "Mock 模式"}</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--app-line)] p-4">
            <p className="text-xs font-black text-[var(--app-text-muted)]">Database</p>
            <strong className={database.ok ? "mt-2 block text-base text-[var(--app-positive)]" : "mt-2 block text-base text-[#d94a3a]"}>{database.label}</strong>
            <p className="mt-2 text-xs font-semibold leading-5 text-[var(--app-text-muted)]">{database.detail}</p>
          </div>
          {providerRows.map((row) => (
            <div key={row.label} className="rounded-lg border border-[var(--app-line)] p-4">
              <p className="text-xs font-black text-[var(--app-text-muted)]">{row.label}</p>
              <strong className="mt-2 block text-base">active={row.active}</strong>
              <p className="mt-2 text-xs font-semibold leading-5 text-[var(--app-text-muted)]">requested={row.requested} · {row.key}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-6 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">{tools.map((tool) => { const Icon = tool.icon; return <Link key={tool.href} href={tool.href} className="flex min-h-20 items-center gap-4 py-4 hover:text-[var(--app-primary)]"><Icon size={21} className="shrink-0" /><span className="min-w-0 flex-1"><strong className="block font-black">{tool.title}</strong><span className="mt-1 block text-xs font-semibold text-[var(--app-text-muted)]">{tool.description}</span></span><ArrowRight size={17} /></Link>; })}</section>
    </RedesignShell>
  );
}
