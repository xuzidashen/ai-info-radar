import { ArrowRight, Cloud, Laptop, Smartphone } from "lucide-react";
import type { ReactNode } from "react";

import { CopyTextButton } from "@/components/CopyTextButton";
import { ActionButton } from "@/components/ui/ActionButton";
import { AppContainer } from "@/components/ui/AppContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill } from "@/components/ui/StatusPill";

const envExample = `APP_ENV="local"
APP_BASE_URL="http://localhost:3000"
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:../data/dev.db"
SEARCH_PROVIDER="mock"
SUMMARY_PROVIDER="mock"
FACTOR_PROVIDER="mock"
LINKAGE_PROVIDER="mock"
ENABLE_PUBLIC_ACCESS="false"
ENABLE_SETUP_WIZARD="true"`;

export default function SetupPage() {
  return (
    <AppContainer size="xl">
      <PageHeader
        eyebrow="Setup Wizard"
        title="欢迎使用 AI 信息雷达"
        subtitle="选择本地自用、云端部署或 APK 预览路径。这个页面只做引导，不保存密钥，不修改 .env。"
        meta={
          <>
            <StatusPill tone="info">local / cloud / apk</StatusPill>
            <StatusPill tone="neutral">no secrets in client</StatusPill>
          </>
        }
      />

      <section className="grid gap-5 lg:grid-cols-3">
        <GuideCard
          icon={<Laptop className="h-5 w-5" />}
          title="本地自用"
          steps={["npm install", "npx prisma migrate dev", "npm run dev", "打开 http://localhost:3000"]}
        />
        <GuideCard
          icon={<Cloud className="h-5 w-5" />}
          title="云端部署"
          steps={["准备 PostgreSQL", "配置 HTTPS 域名", "配置 Tavily / DeepSeek Key", "配置 Cron Secret", "运行 Prisma migrate"]}
        />
        <GuideCard
          icon={<Smartphone className="h-5 w-5" />}
          title="APK 预览"
          steps={["安装 Android Studio", "设置 JAVA_HOME", "配置 CAPACITOR_SERVER_URL 或 HTTPS 域名", "npm run mobile:sync", "npm run mobile:build:debug:win"]}
        />
      </section>

      <SectionCard title=".env 本地示例" description="真实 API Key 只放服务端 .env，不写入前端或 Android 工程。" actions={<CopyTextButton text={envExample} />}>
        <pre className="overflow-auto rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4 text-sm leading-7 text-slate-600">{envExample}</pre>
      </SectionCard>

      <SectionCard title="下一步" description="按你的目标进入对应检查页面。">
        <div className="flex flex-wrap gap-2">
          <ActionButton href="/system/health">
            系统健康检查
            <ArrowRight className="h-4 w-4" />
          </ActionButton>
          <ActionButton href="/settings/provider-test" variant="secondary">
            Provider 测试页
          </ActionButton>
          <ActionButton href="/zones" variant="ghost">
            去专区首页
          </ActionButton>
        </div>
      </SectionCard>
    </AppContainer>
  );
}

function GuideCard({ icon, title, steps }: { icon: ReactNode; title: string; steps: string[] }) {
  return (
    <SectionCard title={title}>
      <div className="mb-4 text-radar-500">{icon}</div>
      <ol className="space-y-3 text-sm font-bold leading-6 text-slate-600">
        {steps.map((step, index) => (
          <li key={step} className="rounded-xl border border-slate-200/70 bg-slate-50/88 px-3 py-2">
            {index + 1}. {step}
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}
