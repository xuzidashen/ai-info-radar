import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AlertTriangle, MonitorSmartphone, Smartphone, Wifi } from "lucide-react";

import { CinematicHero } from "@/components/brand/CinematicHero";
import { MiniArtworkCard } from "@/components/brand/MiniArtworkCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill } from "@/components/ui/StatusPill";

export const dynamic = "force-dynamic";

const recommendedDomain = "https://aileida.zh.kg";

function inferMode(url: string) {
  if (url.includes("10.0.2.2")) {
    return "emulator";
  }
  if (url === recommendedDomain || url.startsWith("https://")) {
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

function serverUrlInfo() {
  if (process.env.CAPACITOR_SERVER_URL) {
    const url = process.env.CAPACITOR_SERVER_URL;
    return {
      url,
      source: "CAPACITOR_SERVER_URL",
      mode: inferMode(url)
    };
  }

  if (process.env.NEXT_PUBLIC_MOBILE_BASE_URL) {
    const url = process.env.NEXT_PUBLIC_MOBILE_BASE_URL;
    return {
      url,
      source: "NEXT_PUBLIC_MOBILE_BASE_URL",
      mode: inferMode(url)
    };
  }

  const syncedUrl = syncedCapacitorServerUrl();
  if (syncedUrl) {
    return {
      url: syncedUrl,
      source: "synced capacitor.config.json",
      mode: inferMode(syncedUrl)
    };
  }

  return {
    url: "http://10.0.2.2:3000",
    source: "default emulator fallback",
    mode: "emulator"
  };
}

export default function MobilePreviewPage() {
  const server = serverUrlInfo();

  return (
    <div className="mx-auto w-full max-w-[92rem] space-y-6">
      <CinematicHero
        eyebrow="Mobile Preview"
        title="APK 预览版"
        subtitle="把 Web 工作台装进安卓壳"
        description="当前 APK 是 Capacitor WebView 预览壳，负责打开现有 Web 工作台；Next.js API Routes、Prisma、SQLite 和真实 provider 仍由服务端运行。"
        mood="mobile"
        compact
        stats={[
          { label: "模式", value: server.mode, hint: server.source },
          { label: "服务端", value: "Web", hint: "API Key 不进 APK" },
          { label: "推荐", value: "Cloud", hint: "aileida.zh.kg" }
        ]}
      />

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="当前 Server URL" description="APK 会通过 server.url 加载这个地址。页面只显示地址来源，不展示任何 API Key。">
          <div className="rounded-[22px] border border-sky-200 bg-sky-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">{server.source}</p>
            <p className="mt-2 break-all text-lg font-black text-slate-950">{server.url}</p>
            <p className="mt-3 text-sm font-bold leading-6 text-slate-600">
              {server.mode === "cloud"
                ? `当前地址适合真机多人同步。推荐生产域名：${recommendedDomain}。`
                : server.mode === "emulator"
                  ? "当前地址适合 Android Emulator 访问开发电脑 localhost。"
                  : "当前是局域网 http 地址，仅建议开发环境真机预览使用；多人同步必须改为 cloud HTTPS。"}
            </p>
          </div>
        </SectionCard>
        <MiniArtworkCard mood="mobile" label="APK Path" value="android/app/build/outputs/apk/debug/app-debug.apk" />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="本地局域网真机预览">
          <Wifi className="mb-4 h-5 w-5 text-sky-700" />
          <ol className="space-y-3 text-sm font-bold leading-7 text-slate-600">
            <li>1. 开发电脑和手机连接同一个 Wi-Fi。</li>
            <li>2. 开发电脑运行：<code className="rounded bg-slate-100 px-1.5 py-0.5">npm.cmd run dev -- -H 0.0.0.0</code></li>
            <li>3. 设置：<code className="rounded bg-slate-100 px-1.5 py-0.5">$env:CAPACITOR_SERVER_URL="http://电脑局域网IP:3000"</code></li>
            <li>4. 执行 <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run mobile:sync</code> 后用 Android Studio 安装。</li>
          </ol>
        </SectionCard>

        <SectionCard title="Android Emulator">
          <MonitorSmartphone className="mb-4 h-5 w-5 text-sky-700" />
          <div className="space-y-3 text-sm font-bold leading-7 text-slate-600">
            <p>模拟器访问开发电脑 localhost 使用默认地址：</p>
            <code className="block rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-950">http://10.0.2.2:3000</code>
            <p>确保 Next.js dev server 已启动，并且没有被防火墙拦截。</p>
          </div>
        </SectionCard>

        <SectionCard title="远程 HTTPS 预览">
          <Smartphone className="mb-4 h-5 w-5 text-sky-700" />
          <div className="space-y-3 text-sm font-bold leading-7 text-slate-600">
            <p>部署 Web App 后，设置：</p>
            <code className="block rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-950">NEXT_PUBLIC_MOBILE_BASE_URL={recommendedDomain}</code>
            <p>生产环境和多人同步 APK 必须使用 HTTPS，不要把局域网 HTTP 或 10.0.2.2 作为正式入口。</p>
          </div>
        </SectionCard>
      </section>

      <SectionCard title="云端同步目标" description="电脑浏览器和手机 APK 需要打开同一个 HTTPS 服务，数据才会同步。">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["Web", recommendedDomain],
            ["APK server.url", server.url],
            ["同步范围", "Topic / 报告 / 通知 / 运行日志"]
          ].map(([label, value]) => (
            <article key={label} className="rounded-[22px] border border-slate-200/70 bg-slate-50/88 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">{label}</p>
              <p className="mt-2 break-all text-sm font-black leading-6 text-slate-950">{value}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="常见问题" description="APK 预览版的目标是先看手机端真实效果，不是把服务端塞进手机。">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["打开白屏怎么办", "先确认手机可以直接在浏览器打开 server.url，再检查 dev server 是否监听 0.0.0.0。"],
            ["手机访问不了电脑 localhost 怎么办", "真机不能访问电脑 localhost，必须使用电脑局域网 IP。"],
            ["为什么不是离线版", "当前项目依赖 Next.js API Routes、Prisma、SQLite 和服务端 provider，APK 只包 WebView。"],
            ["为什么真实搜索还需要后端", "Tavily、DeepSeek 等密钥不能写入前端或 APK，必须由服务端代理。"]
          ].map(([title, body]) => (
            <article key={title} className="rounded-[22px] border border-slate-200/70 bg-slate-50/88 p-4">
              <div className="flex items-center gap-2 font-black text-slate-950">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                {title}
              </div>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{body}</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
