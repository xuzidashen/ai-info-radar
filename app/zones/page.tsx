import { Settings, Workflow } from "lucide-react";

import { CinematicHero } from "@/components/brand/CinematicHero";
import { ZoneEntryCard } from "@/components/product/ZoneEntryCard";
import { ActionButton } from "@/components/ui/ActionButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { listZones } from "@/lib/services/zoneService";

export const dynamic = "force-dynamic";

export default async function ZonesPage() {
  const zones = await listZones();

  return (
    <div className="mx-auto w-full max-w-[92rem] space-y-6">
      <CinematicHero
        eyebrow="Zones"
        title="多专区信息工作台"
        subtitle="检索、分析、联动各自清晰"
        description="每个专区对应不同的信息处理流程：Search 负责检索总结，Analysis 负责辅助分析，Linkage 负责产业链模块关系。"
        ctaLabel="测试 Provider"
        ctaHref="/settings/provider-test"
        mood="search"
        compact
        stats={[
          { label: "专区", value: String(zones.length), hint: "默认三大工作流" },
          { label: "使用方式", value: "Topic", hint: "先建主题再运行" },
          { label: "输出", value: "Report", hint: "沉淀 Markdown" }
        ]}
      />

      {zones.length > 0 ? (
        <section className="grid gap-5 lg:grid-cols-3">
          {zones.map((zone) => (
            <ZoneEntryCard key={zone.id} zone={zone} />
          ))}
        </section>
      ) : (
        <EmptyState title="暂无专区" description="访问 /api/zones 或刷新本页会初始化默认专区。" icon={<Workflow className="h-5 w-5" />} />
      )}

      <SectionCard
        title="推荐使用顺序"
        description="先按场景选择专区，再创建 Topic。Topic 详情页会根据专区类型展示不同的信息结构。"
        actions={
          <ActionButton href="/settings/provider-test" variant="secondary">
            <Settings className="h-4 w-4" />
            Provider 测试
          </ActionButton>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { step: "1", title: "选择专区", body: "资料、政策、比赛信息优先 Search；公司、行业主题优先 Analysis；产业链传导使用 Linkage。", tone: "info" as const },
            { step: "2", title: "创建 Topic", body: "填写主题名称、分类、检索模式和总结模板，让后续报告保持可复盘。", tone: "warning" as const },
            { step: "3", title: "运行与沉淀", body: "一键运行 Topic，生成报告、来源、因子或联动路径，再复制 Markdown 归档。", tone: "success" as const }
          ].map(({ step, title, body, tone }) => (
            <article key={step} className="rounded-[22px] border border-slate-200/70 bg-slate-50/88 p-4">
              <StatusPill tone={tone}>{step}</StatusPill>
              <h3 className="mt-4 font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
