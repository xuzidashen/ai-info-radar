import { ShieldCheck } from "lucide-react";

import { CopyTextButton } from "@/components/CopyTextButton";
import { AppContainer } from "@/components/ui/AppContainer";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill, type StatusTone } from "@/components/ui/StatusPill";
import { getEnvHealthCheck, type EnvHealthStatus } from "@/lib/services/envHealthService";

export const dynamic = "force-dynamic";

function tone(status: EnvHealthStatus): StatusTone {
  if (status === "pass") {
    return "success";
  }
  if (status === "warning") {
    return "warning";
  }
  return "danger";
}

export default function SystemHealthPage() {
  const health = getEnvHealthCheck();
  const passCount = health.items.filter((item) => item.status === "pass").length;
  const warningCount = health.items.filter((item) => item.status === "warning").length;
  const dangerCount = health.items.filter((item) => item.status === "danger").length;
  const fixes = health.items.filter((item) => item.fix).map((item) => `${item.label}: ${item.fix}`).join("\n");

  return (
    <AppContainer size="xl">
      <PageHeader
        eyebrow="System Health"
        title="系统健康检查"
        subtitle="检查部署模式、数据库、Provider、Cron、安全开关和移动端地址。敏感 Key 只显示是否配置或 masked 值。"
        meta={
          <>
            <StatusPill tone={tone(health.status)}>{health.status}</StatusPill>
            <StatusPill tone="neutral">{health.appEnv}</StatusPill>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Pass" value={passCount} status="success" icon={<ShieldCheck className="h-5 w-5" />} />
        <MetricCard label="Warning" value={warningCount} status={warningCount ? "warning" : "neutral"} />
        <MetricCard label="Danger" value={dangerCount} status={dangerCount ? "danger" : "neutral"} />
      </section>

      <SectionCard title="检查项" description="云端部署前优先处理 danger，其次处理 warning。">
        <div className="grid gap-3 lg:grid-cols-2">
          {health.items.map((item) => (
            <article key={item.key} className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-black text-slate-950">{item.label}</h2>
                <StatusPill tone={tone(item.status)}>{item.status}</StatusPill>
              </div>
              <p className="mt-3 text-sm font-bold leading-6 text-slate-600">{item.message}</p>
              {item.maskedValue ? <p className="mt-2 break-all text-xs font-bold text-slate-400">{item.maskedValue}</p> : null}
              {item.fix ? <p className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold leading-5 text-slate-500">修复建议：{item.fix}</p> : null}
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="一键复制修复建议"
        description="用于部署前逐项处理。"
        actions={<CopyTextButton text={fixes || "暂无修复建议。"} />}
      >
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4 text-sm leading-7 text-slate-600">
          {fixes || "暂无修复建议。"}
        </pre>
      </SectionCard>
    </AppContainer>
  );
}
