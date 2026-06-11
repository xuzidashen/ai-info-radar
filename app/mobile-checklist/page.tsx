import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { CheckCircle2, Smartphone } from "lucide-react";

import { CinematicHero } from "@/components/brand/CinematicHero";
import { CopyTextButton } from "@/components/CopyTextButton";
import { SummaryStatsCard } from "@/components/product/SummaryStatsCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { getEnvHealthCheck } from "@/lib/services/envHealthService";

export const dynamic = "force-dynamic";

const recommendedDomain = "https://aileida.zh.kg";

function boolTone(value: boolean) {
  return value ? "success" as const : "warning" as const;
}

function inferMode(url: string) {
  if (url.includes("10.0.2.2")) {
    return "emulator";
  }
  if (url.startsWith("https://")) {
    return "cloud";
  }
  return "lan";
}

function syncedCapacitorServerUrl() {
  const configPath = join(process.cwd(), "android", "app", "src", "main", "assets", "capacitor.config.json");
  if (!existsSync(configPath)) {
    return "";
  }

  try {
    const parsed = JSON.parse(readFileSync(configPath, "utf8")) as { server?: { url?: string } };
    return parsed.server?.url ?? "";
  } catch {
    return "";
  }
}

export default function MobileChecklistPage() {
  const health = getEnvHealthCheck();
  const mobileUrl = process.env.NEXT_PUBLIC_MOBILE_BASE_URL || process.env.CAPACITOR_SERVER_URL || syncedCapacitorServerUrl() || "http://10.0.2.2:3000";
  const mobileMode = inferMode(mobileUrl);
  const apkPath = join(process.cwd(), "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk");
  const apkExists = existsSync(apkPath);
  const items = [
    { label: "Web 服务可访问", ok: Boolean(process.env.APP_BASE_URL || process.env.APP_ENV === "local"), detail: process.env.APP_BASE_URL || "local dev server" },
    { label: "Mobile URL 已配置", ok: Boolean(process.env.NEXT_PUBLIC_MOBILE_BASE_URL || process.env.CAPACITOR_SERVER_URL), detail: mobileUrl },
    { label: "当前模式", ok: mobileMode === "cloud", detail: `${mobileMode} / ${mobileMode === "cloud" ? "适合多人同步" : "仅适合开发预览"}` },
    { label: "推荐云端域名", ok: mobileUrl === recommendedDomain, detail: recommendedDomain },
    { label: "HTTPS", ok: mobileUrl.startsWith("https://"), detail: mobileUrl.startsWith("https://") ? "适合远程预览/准生产" : "http 仅建议开发预览" },
    { label: "系统健康 API", ok: health.status !== "danger", detail: health.status },
    { label: "Provider 配置", ok: health.items.filter((item) => item.key.includes("provider")).every((item) => item.status !== "danger"), detail: "mock 或真实 provider 均可" },
    { label: "Cron Secret", ok: health.items.find((item) => item.key === "cron_secret")?.status !== "danger", detail: "云端必须配置" },
    { label: "Android 环境", ok: Boolean(process.env.JAVA_HOME), detail: process.env.JAVA_HOME || "运行 npm run android:check" },
    { label: "Debug APK", ok: apkExists, detail: apkExists ? `${apkPath} (${statSync(apkPath).size} bytes)` : apkPath }
  ];
  const command = `$env:NEXT_PUBLIC_MOBILE_BASE_URL="${recommendedDomain}"\n$env:CAPACITOR_SERVER_URL="${recommendedDomain}"\nnpm run mobile:sync\nnpm run mobile:build:debug:win`;

  return (
    <div className="mx-auto w-full max-w-[92rem] space-y-6">
      <CinematicHero
        eyebrow="Mobile Release Checklist"
        title="移动发布检查"
        subtitle="生成 APK 前的可执行清单"
        description="确认 Web 地址、HTTPS、Provider、Cron Secret、Android 环境和 APK 输出路径。APK 是 WebView 入口，稳定性取决于 Web 服务和服务端 provider。"
        mood="mobile"
        compact
        stats={[
          { label: "APK 模式", value: mobileMode, hint: mobileUrl },
          { label: "通过", value: String(items.filter((item) => item.ok).length), hint: "ok" },
          { label: "待处理", value: String(items.filter((item) => !item.ok).length), hint: "check" }
        ]}
      />

      <SummaryStatsCard
        title="检查概览"
        stats={[
          { label: "检查项", value: items.length, icon: <Smartphone className="h-5 w-5" /> },
          { label: "通过", value: items.filter((item) => item.ok).length, status: "success" },
          { label: "待处理", value: items.filter((item) => !item.ok).length, status: items.some((item) => !item.ok) ? "warning" : "success" },
          { label: "APK", value: apkExists ? "已生成" : "未生成", status: apkExists ? "success" : "warning" }
        ]}
      />

      <SectionCard title="发布检查清单" description="逐项确认后再重新同步并构建 APK。">
        <div className="grid gap-3 lg:grid-cols-2">
          {items.map((item) => (
            <article key={item.label} className="rounded-[22px] border border-slate-200/70 bg-slate-50/88 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-black text-slate-950">
                  <CheckCircle2 className={`h-4 w-4 ${item.ok ? "text-emerald-600" : "text-amber-600"}`} />
                  {item.label}
                </div>
                <StatusPill tone={boolTone(item.ok)}>{item.ok ? "ok" : "check"}</StatusPill>
              </div>
              <p className="mt-3 break-all text-sm font-bold leading-6 text-slate-500">{item.detail}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="云端 APK 打包命令" description="Windows 环境下先把 APK 指向 aileida.zh.kg，再同步并构建 debug APK。">
        <div className="flex flex-col gap-3 rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <pre className="whitespace-pre-wrap break-all text-sm font-black leading-7 text-slate-950">{command}</pre>
          <CopyTextButton text={command} label="复制命令" />
        </div>
      </SectionCard>
    </div>
  );
}
