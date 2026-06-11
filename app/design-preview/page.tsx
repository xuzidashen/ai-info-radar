import { Activity, AlertTriangle, Bell, FileText, Gauge, Home, Search, Settings, Smartphone, Workflow } from "lucide-react";

import { CinematicHero } from "@/components/brand/CinematicHero";
import { MiniArtworkCard } from "@/components/brand/MiniArtworkCard";
import { IndustryFlowCard } from "@/components/product/IndustryFlowCard";
import { NotificationDigest } from "@/components/product/NotificationDigest";
import { ReportLibraryCard } from "@/components/product/ReportLibraryCard";
import { SignalMetricStrip } from "@/components/product/SignalMetricStrip";
import { SourceListCard } from "@/components/product/SourceListCard";
import { SummaryStatsCard } from "@/components/product/SummaryStatsCard";
import { TopicHeroCard } from "@/components/product/TopicHeroCard";
import { ZoneEntryCard } from "@/components/product/ZoneEntryCard";
import { ActionButton } from "@/components/ui/ActionButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { StatusPill } from "@/components/ui/StatusPill";
import type { AppNotificationDTO, DailySignalDTO, InfoItemDTO, LinkageEdgeDTO, LinkageModuleDTO, WorkspaceZoneDTO, ZoneTopicDetailDTO } from "@/lib/types";

const mockZones: WorkspaceZoneDTO[] = [
  {
    id: "search-zone",
    name: "信息检索专区",
    type: "search",
    description: "资料、政策、比赛和学习信息检索。",
    icon: null,
    color: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    topicCount: 8,
    reportCount: 26,
    todayReportCount: 3,
    lastReportAt: new Date().toISOString()
  },
  {
    id: "analysis-zone",
    name: "AI 分析辅助专区",
    type: "analysis",
    description: "公司、行业和科技主题辅助分析。",
    icon: null,
    color: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    topicCount: 5,
    reportCount: 18,
    todayReportCount: 2,
    lastReportAt: new Date().toISOString()
  },
  {
    id: "linkage-zone",
    name: "联合分析专区",
    type: "linkage",
    description: "产业链模块关系与联动路径。",
    icon: null,
    color: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    topicCount: 4,
    reportCount: 11,
    todayReportCount: 1,
    lastReportAt: new Date().toISOString()
  }
];

const mockTopic: ZoneTopicDetailDTO = {
  id: "topic-preview",
  zoneId: "analysis-zone",
  keywordId: "keyword-preview",
  name: "AI 算力基础设施",
  category: "行业分析",
  description: "观察算力、液冷、电力和光模块的公开信息变化。",
  searchMode: "industry",
  summaryTemplate: "industry",
  analysisEnabled: true,
  factorEnabled: true,
  linkageEnabled: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  zone: mockZones[1],
  reports: [],
  infoItems: [],
  summaries: [],
  dailySignals: [],
  modules: [],
  edges: [],
  linkageAnalyses: []
};

const mockSearchTopic: ZoneTopicDetailDTO = {
  ...mockTopic,
  id: "topic-search-preview",
  zoneId: "search-zone",
  name: "广西公务员考试公告",
  category: "考公/政策",
  description: "跟踪公告、报名、岗位表和备考材料。",
  searchMode: "policy",
  summaryTemplate: "policy",
  analysisEnabled: false,
  factorEnabled: false,
  linkageEnabled: false,
  zone: mockZones[0]
};

const mockLinkageTopic: ZoneTopicDetailDTO = {
  ...mockTopic,
  id: "topic-linkage-preview",
  zoneId: "linkage-zone",
  name: "AI 服务器产业链",
  category: "产业链联动",
  description: "观察上游供给、中游模块、下游需求之间的传导。",
  searchMode: "industry",
  summaryTemplate: "linkage",
  analysisEnabled: true,
  factorEnabled: true,
  linkageEnabled: true,
  zone: mockZones[2],
  modules: [],
  edges: []
};

const mockSignal: DailySignalDTO = {
  id: "signal-preview",
  keywordId: "keyword-preview",
  date: new Date().toISOString(),
  newsCount: 12,
  positiveCount: 5,
  negativeCount: 2,
  neutralCount: 5,
  avgSentiment: 64,
  avgImpact: 72,
  avgRisk: 38,
  avgPolicy: 41,
  avgTech: 76,
  avgFinancial: 58,
  avgAttention: 81,
  avgConfidence: 73,
  signalLevel: "positive",
  riskLevel: "medium",
  attentionLevel: "high",
  summary: "公开信息显示关注度提升，但仍需核验来源和上下游影响路径。",
  factorSnapshot: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const modules: LinkageModuleDTO[] = [
  { id: "m1", topicId: "topic-preview", name: "先进封装", role: "upstream", description: "供给与产能约束观察点", weight: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "m2", topicId: "topic-preview", name: "光模块", role: "midstream", description: "传输环节关键模块", weight: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "m3", topicId: "topic-preview", name: "云厂商需求", role: "downstream", description: "需求侧观察点", weight: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const edges: LinkageEdgeDTO[] = [
  { id: "e1", fromModuleId: "m1", toModuleId: "m2", relationType: "supply_constraint", strength: 0.72, direction: null, reason: "供给变化可能影响中游交付节奏。", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), fromModule: modules[0], toModule: modules[1] },
  { id: "e2", fromModuleId: "m2", toModuleId: "m3", relationType: "demand_pull", strength: 0.66, direction: null, reason: "下游需求变化会牵引中游关注度。", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), fromModule: modules[1], toModule: modules[2] }
];

const mockInfoItems: InfoItemDTO[] = [
  {
    id: "source-1",
    title: "算力基础设施公开信息关注度提升",
    source: "官方公告",
    url: "https://example.com/source-1",
    publishedAt: new Date().toISOString(),
    summary: "来源显示算力、液冷和供电配套信息被密集提及，仍需继续核验具体项目进度。",
    importance: "high",
    sentiment: "neutral",
    provider: "mock",
    score: 0.86,
    rawContent: null,
    fetchedAt: new Date().toISOString(),
    credibilityScore: 0.82,
    credibilityLabel: "high",
    credibilityReason: "来源明确，内容偏公告类。",
    eventType: "infrastructure",
    eventSubtype: null,
    sentimentScore: 58,
    impactScore: 72,
    riskScore: 36,
    policyScore: 42,
    techScore: 76,
    financialScore: 52,
    attentionScore: 81,
    timeHorizon: "short",
    factorConfidence: 73,
    factorReason: "公开信息一致性较高。",
    relatedCompanies: [],
    relatedIndustries: ["AI 基础设施"],
    keywordId: "keyword-preview",
    createdAt: new Date().toISOString()
  },
  {
    id: "source-2",
    title: "光模块与电力配套成为交叉关注点",
    source: "行业媒体",
    url: "https://example.com/source-2",
    publishedAt: new Date().toISOString(),
    summary: "行业报道提到中游模块和下游需求的联动，但部分判断仍需要更多来源交叉验证。",
    importance: "medium",
    sentiment: "positive",
    provider: "mock",
    score: 0.71,
    rawContent: null,
    fetchedAt: new Date().toISOString(),
    credibilityScore: 0.58,
    credibilityLabel: "medium",
    credibilityReason: "行业媒体，可作为线索参考。",
    eventType: "industry",
    eventSubtype: null,
    sentimentScore: 64,
    impactScore: 66,
    riskScore: 41,
    policyScore: 30,
    techScore: 70,
    financialScore: 48,
    attentionScore: 68,
    timeHorizon: "medium",
    factorConfidence: 62,
    factorReason: "需要更多官方来源补充。",
    relatedCompanies: [],
    relatedIndustries: ["光模块", "电力"],
    keywordId: "keyword-preview",
    createdAt: new Date().toISOString()
  }
];

const mockNotifications: AppNotificationDTO[] = [
  {
    id: "notification-1",
    type: "report_generated",
    title: "AI 算力基础设施报告已生成",
    message: "报告已进入报告中心，可复制 Markdown 到外部笔记。",
    severity: "success",
    read: false,
    zoneId: "analysis-zone",
    topicId: "topic-preview",
    runLogId: null,
    reportId: "report-preview",
    createdAt: new Date().toISOString()
  },
  {
    id: "notification-2",
    type: "fallback_used",
    title: "Provider 已回退到 mock",
    message: "DeepSeek Key 未配置，当前总结使用本地 mock provider。",
    severity: "warning",
    read: false,
    zoneId: "analysis-zone",
    topicId: "topic-preview",
    runLogId: null,
    reportId: null,
    createdAt: new Date().toISOString()
  }
];

export default function DesignPreviewPage() {
  return (
    <div className="mx-auto w-full max-w-[92rem] space-y-8 overflow-x-hidden">
      <CinematicHero
        eyebrow="Design Preview"
        title="Design QA"
        subtitle="Release Polish Preview"
        description="本页使用静态数据，用于检查桌面、移动和状态组件。"
        mood="home"
        compact
        stats={[
          { label: "Hero", value: "CSS", hint: "无版权图片" },
          { label: "Cards", value: "28px", hint: "统一圆角" },
          { label: "Mobile", value: "App-like", hint: "底部胶囊导航" }
        ]}
      />

      <section className="grid gap-5 lg:grid-cols-3">
        {mockZones.map((zone) => (
          <ZoneEntryCard key={zone.id} zone={zone} />
        ))}
      </section>

      <SummaryStatsCard
        stats={[
          { label: "信息总量", value: 128, icon: <FileText className="h-5 w-5" /> },
          { label: "新报告", value: 6, icon: <Activity className="h-5 w-5" /> },
          { label: "待处理任务", value: 2, icon: <Workflow className="h-5 w-5" /> },
          { label: "风险预警", value: 1, icon: <Gauge className="h-5 w-5" /> }
        ]}
      />

      <TopicHeroCard topic={mockTopic} zoneType="analysis" zoneName="AI 分析辅助专区" lastRunLabel="刚刚" />
      <SignalMetricStrip signal={mockSignal} />

      <SectionCard title="移动首页预览" description="检查首屏重点、底部导航安全区和 APK WebView 里的 App 感。">
        <div className="mx-auto max-w-[25rem] rounded-[38px] border border-slate-200 bg-slate-950 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
          <div className="overflow-hidden rounded-[30px] bg-[#f7fbfc]">
            <div className="flex items-center justify-between border-b border-slate-200/70 bg-white/86 px-4 py-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Radar</p>
                <p className="font-black text-slate-950">AI 信息雷达</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Bell className="h-4 w-4" />
              </span>
            </div>
            <div className="space-y-4 p-4 pb-28">
              <div className="rounded-[28px] border border-white bg-white p-5 shadow-[0_16px_42px_rgba(15,23,42,0.08)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">今日总览</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">6 条更新待处理</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">重点关注 1 条 fallback 和 2 条高优先级来源。</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="报告" value="6" description="今日生成" icon={<FileText className="h-4 w-4" />} status="info" />
                <MetricCard label="提醒" value="2" description="需要确认" icon={<AlertTriangle className="h-4 w-4" />} status="warning" />
              </div>
            </div>
            <div className="mx-4 mb-[calc(1rem+env(safe-area-inset-bottom))] grid grid-cols-4 rounded-full border border-slate-200 bg-white p-1.5 shadow-[0_14px_36px_rgba(15,23,42,0.12)]">
              {[
                { label: "首页", Icon: Home },
                { label: "专区", Icon: Workflow },
                { label: "报告", Icon: FileText },
                { label: "我的", Icon: Settings }
              ].map(({ label, Icon }, index) => (
                <span key={label} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-full text-[0.68rem] font-black ${index === 0 ? "bg-slate-950 text-white" : "text-slate-500"}`}>
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <ReportLibraryCard
          report={{
            id: "report-preview",
            zoneId: "analysis-zone",
            runLogId: null,
            title: "AI 算力基础设施观察简报",
            type: "topic",
            markdown: "# AI 算力基础设施观察简报\n\n这是设计预览 mock 报告。",
            summary: "关注算力、液冷、电力和光模块的公开信息变化，保留来源核验与合规提示。",
            metadata: null,
            createdAt: new Date().toISOString(),
            favorite: true,
            zone: { id: "analysis-zone", name: "AI 分析辅助专区", type: "analysis" },
            tags: [{ id: "tag-preview", name: "产业链", color: null, createdAt: new Date().toISOString() }]
          }}
        />
        <IndustryFlowCard modules={modules} edges={edges} />
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <SectionCard title="Search Topic" description="检索类主题强调来源和摘要。">
          <TopicHeroCard topic={mockSearchTopic} zoneType="search" zoneName="信息检索专区" lastRunLabel="刚刚" />
        </SectionCard>
        <SectionCard title="Analysis Topic" description="分析类主题强调因子和风险提示。">
          <TopicHeroCard topic={mockTopic} zoneType="analysis" zoneName="AI 分析辅助专区" lastRunLabel="刚刚" />
        </SectionCard>
        <SectionCard title="Linkage Topic" description="联动类主题强调模块关系和路径。">
          <TopicHeroCard topic={mockLinkageTopic} zoneType="linkage" zoneName="联合分析专区" lastRunLabel="刚刚" />
        </SectionCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <SourceListCard items={mockInfoItems} title="搜索结果预览" />
        <NotificationDigest notifications={mockNotifications} unreadCount={2} />
      </section>

      <SectionCard title="组件样式" description="Hero、状态标签、指标卡、报告卡、底部导航预览。">
        <div className="grid gap-4 lg:grid-cols-3">
          <MiniArtworkCard mood="search" label="Search Mood" value="检索与来源" />
          <MetricCard label="MetricCard" value="96%" description="统一浅色卡片与柔和阴影" icon={<Gauge className="h-5 w-5" />} status="success" trend="good" />
          <div className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
            <div className="mx-auto grid max-w-sm grid-cols-5 rounded-full border border-slate-200 bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              {[
                { label: "首页", Icon: Home },
                { label: "专区", Icon: Workflow },
                { label: "报告", Icon: FileText },
                { label: "运行", Icon: Gauge },
                { label: "我的", Icon: Settings }
              ].map(({ label, Icon }, index) => (
                <span key={String(label)} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-full text-[0.68rem] font-black ${index === 0 ? "bg-slate-950 text-white" : "text-slate-500"}`}>
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusPill tone="success">success</StatusPill>
              <StatusPill tone="warning">warning</StatusPill>
              <StatusPill tone="danger">danger</StatusPill>
              <StatusPill tone="info">info</StatusPill>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="状态预览" description="空状态、加载状态和错误状态使用统一组件，避免页面只显示 loading 文本。">
        <div className="grid gap-5 xl:grid-cols-3">
          <EmptyState
            title="这里还没有报告"
            description="运行一个 Topic 后，生成的摘要会自动出现在这里。"
            icon={<FileText className="h-5 w-5" />}
            action={
              <ActionButton variant="secondary" size="sm">
                <Search className="h-4 w-4" />
                去运行 Topic
              </ActionButton>
            }
          />
          <div className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
            <SkeletonCard compact className="shadow-none" />
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <LoadingState title="正在测试 Provider" description="正在连接服务端并校验搜索与总结结果。" cards={2} />
            </div>
          </div>
          <ErrorState title="暂时无法连接服务" description="请确认本地 Next.js 服务正在运行，并检查 Provider Key 是否已配置。" />
        </div>
      </SectionCard>

      <SectionCard title="发布验收关注点" description="用于发布前快速确认页面是否像 App、是否有状态反馈、是否适合移动端阅读。">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "移动底部导航", value: "safe-area", icon: <Smartphone className="h-4 w-4" /> },
            { label: "运行日志", value: "timeline", icon: <Activity className="h-4 w-4" /> },
            { label: "通知中心", value: "message flow", icon: <Bell className="h-4 w-4" /> },
            { label: "错误反馈", value: "actionable", icon: <AlertTriangle className="h-4 w-4" /> }
          ].map((item) => (
            <div key={item.label} className="rounded-[22px] border border-slate-200/70 bg-slate-50/88 p-4">
              <div className="flex items-center gap-2 text-sky-700">{item.icon}<span className="text-xs font-black uppercase tracking-[0.16em]">{item.value}</span></div>
              <p className="mt-3 font-black text-slate-950">{item.label}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
