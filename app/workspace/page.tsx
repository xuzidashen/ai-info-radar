import Link from "next/link";
import { ArrowLeft, ArrowRight, Database, Flask, Heartbeat, Wrench } from "@phosphor-icons/react/dist/ssr";

import { RedesignShell } from "@/components/redesign/RedesignShell";

const tools = [
  { title: "旧版专区与主题", description: "查看原有 Zone、Topic 数据结构", href: "/zones", icon: Database },
  { title: "旧版报告与运行记录", description: "面向排查和历史兼容的内部页面", href: "/reports", icon: Wrench },
  { title: "运行日志", description: "查看旧版 Run 记录和重试链路", href: "/runs", icon: Wrench },
  { title: "Provider 测试", description: "检查搜索与总结服务配置", href: "/settings/provider-test", icon: Flask },
  { title: "系统健康状态", description: "查看服务连接与运行环境", href: "/system/health", icon: Heartbeat }
];

export default function WorkspacePage() {
  return (
    <RedesignShell showBottomNav={false}>
      <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-black text-[var(--app-text-muted)] hover:text-[var(--app-primary)]"><ArrowLeft size={17} />返回我的</Link>
      <header className="mt-6 border-b border-[var(--app-line)] pb-6"><span className="app-chip">高级工具，仅用于管理和调试。</span><h1 className="mt-3 text-3xl font-black">高级工具</h1><p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--app-text-muted)]">这里保留旧版内部能力，仅用于配置、排查和历史数据兼容。普通阅读与主题更新请使用新的主流程。</p></header>
      <section className="mt-6 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">{tools.map((tool) => { const Icon = tool.icon; return <Link key={tool.href} href={tool.href} className="flex min-h-20 items-center gap-4 py-4 hover:text-[var(--app-primary)]"><Icon size={21} className="shrink-0" /><span className="min-w-0 flex-1"><strong className="block font-black">{tool.title}</strong><span className="mt-1 block text-xs font-semibold text-[var(--app-text-muted)]">{tool.description}</span></span><ArrowRight size={17} /></Link>; })}</section>
    </RedesignShell>
  );
}
