# AI 信息雷达

AI 信息雷达现在是一个本地可运行的 **Multi-Zone Intelligence Hub**：多专区信息检索与 AI 分析平台。项目基于 Next.js + TypeScript + Tailwind CSS + Prisma + SQLite，旧的 `backend/` 和 `frontend/` 目录保留为历史版本。

## 第 4 轮定位

项目不再只是“单关键词信息雷达”，而是按场景拆成三个一级专区：

- **信息检索专区 Search Zone**：适合考公信息、新闻资讯、政策文件、比赛资料、学习资料。流程是搜索、去重、来源可信度、AI 总结、Markdown 简报。
- **AI 分析辅助专区 Analysis Zone**：适合财经公司、股票观察、行业热点、科技公司、风险追踪、政策影响分析。流程是搜索、总结、因子分析、DailySignal、风险/关注度辅助判断。
- **多模块联合分析专区 Linkage Zone**：适合 AI + PCB + 光模块、AI 算力 + 液冷 + 电力、半导体 + 设备 + 材料等产业链主题。流程是模块搜索、模块关系、联动路径、假设、风险断点和联动报告。

不是所有专区都显示趋势图。Search Zone 的目标是快速检索和总结，不强制展示风险趋势或股票因子；Analysis Zone 和 Linkage Zone 才展示因子、DailySignal、联动强度等分析信息。

## 第 4.5 轮：Clean Tech UI Refactor

本轮是 UI/UX 和信息架构优化，不重写业务逻辑、不删除旧 `backend/` / `frontend/`，也不破坏已有 API。目标是把产品整理成简洁科技感 SaaS 工作台。

新增 UI 基础组件：

- `components/ui/AppContainer.tsx`
- `components/ui/PageHeader.tsx`
- `components/ui/MetricCard.tsx`
- `components/ui/SectionCard.tsx`
- `components/ui/EmptyState.tsx`
- `components/ui/StatusPill.tsx`
- `components/ui/ActionButton.tsx`
- `components/ui/ProviderStatusBar.tsx`
- `components/ui/GradientBackground.tsx`

主要界面变化：

- 首页 Dashboard 改成 Landing Dashboard：顶部 Hero、Provider 状态条、今日概览指标、三大专区入口、最近报告、最新联动分析。
- `/zones` 页面用于解释三大专区差异：适用场景、处理流程、Topic 数、Report 数和最近更新时间。
- `/zones/[id]` 根据 `zone.type` 显示不同重点：Search 强调检索和 Markdown，Analysis 强调因子和 DailySignal，Linkage 强调模块、关系和路径。
- `/zones/[id]/topics/[topicId]` 根据 Topic 所属专区拆成三种布局，避免把检索、财经分析和产业链联动混在同一个信息结构里。
- `/linkage` 改成产业链联动总览，展示模块数量、关系数量、最近 `linkageScore`、`riskScore`、`confidence` 和最近运行时间。
- `IndustryChainMap` 与 `LinkagePathView` 用卡片、箭头、关系标签和强度条表达上游、中游、下游传导路径。
- `ReportPreview` 统一报告预览、复制 Markdown 和展开正文。

验证 UI 重构没有破坏原功能：

```powershell
npm run typecheck
npm run build
```

本轮没有新增 Prisma migration；如果本地数据库已经完成第 4 轮迁移，无需再次为 4.5 单独迁移。

## 第 5 轮：Production Workflow Core

本轮把项目从“手动点击生成报告的 Demo”升级为可追踪、可调度、可长期运行的信息检索工作流系统。

新增核心能力：

- **TopicRunLog**：每次运行 Topic 都会记录运行类型、触发方式、状态、耗时、provider、fallback、数量统计、质量评分和错误信息。
- **TopicSchedule**：支持 daily / weekly / manual_only 三类基础定时刷新规则。Next.js 不依赖常驻后台进程，执行入口可以是 API、Vercel Cron、Linux cron、Windows 任务计划程序或本地脚本。
- **ProviderQualitySnapshot**：记录 Search / Summary / Factor / Linkage provider 的成功率、fallback、延迟、结果数量、错误和质量分。
- **报告中心**：`/reports` 汇总所有 ZoneReport，支持专区、类型、日期和关键词筛选；`/reports/[id]` 查看报告详情、Markdown 正文和 metadata。
- **运行日志中心**：`/runs` 查看运行次数、成功、失败、fallback、平均耗时；`/runs/[id]` 查看单次运行详情并支持重试。
- **定时刷新页面**：`/schedules` 创建、编辑、启用/停用、删除定时刷新规则，并可手动触发 due schedules。
- **质量监控页面**：`/quality` 查看各 provider 的成功率、fallback 次数、平均延迟、最近错误和质量评分。
- **报告包导出**：报告中心可按当前筛选条件复制完整 Markdown 报告包。

本轮新增 Prisma migration：

```text
prisma/migrations/20260610141129_add_production_workflow_core
```

本轮新增脚本：

```powershell
npm run schedules:run-due
```

它会执行当前所有 due schedules，可接入 Windows 任务计划程序或 Linux cron。

## 第 6 轮：Mobile Preview + Automation Ops Pro

本轮分为两部分：先做 **Capacitor APK 预览版**，再增强自动化运营能力。当前 APK 不是纯离线安卓成品，而是一个 WebView 预览壳：它会加载正在运行的 Next.js Web App，服务端能力仍由本地局域网地址或云端 HTTPS 地址提供。

### 第 6A：APK 预览版

新增 Capacitor 配置：

```text
capacitor.config.ts
android/
public/mobile-preview-placeholder.txt
```

APK 加载地址优先级：

```text
CAPACITOR_SERVER_URL
NEXT_PUBLIC_MOBILE_BASE_URL
http://10.0.2.2:3000
```

说明：

- `10.0.2.2:3000` 用于 Android Emulator 访问开发电脑 localhost。
- 真机预览需要使用电脑局域网 IP，例如 `http://192.168.1.8:3000`。
- 远程预览建议先部署 Web App 到 HTTPS 域名，再让 APK 指向该 HTTPS 地址。
- API Key 不会写入 Android 代码，真实 provider 仍由服务端代理。
- 开发阶段允许 http cleartext，生产环境建议只使用 HTTPS。

本地真机预览步骤：

```powershell
npm.cmd run dev -- -H 0.0.0.0
$env:CAPACITOR_SERVER_URL="http://你的电脑局域网IP:3000"
npm run mobile:sync
npm run mobile:open
```

生成 debug APK：

```powershell
npm run mobile:build:debug:win
```

APK 路径通常是：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

如果构建提示找不到 Java，需要安装 JDK，并设置 `JAVA_HOME`。如果 Android Studio 或 Android SDK 未安装，需要先完成 Android Studio 的 SDK 配置。

新增页面：

- `/mobile-preview`：说明 APK 预览模式、当前 server url 来源、本地局域网预览、模拟器预览、真机安装和常见问题。

移动端体验优化：

- 手机端导航改为底部导航，顶部保留产品标识和通知入口。
- 主内容增加底部安全间距，避免被系统导航遮挡。
- 报告、运行日志、定时刷新、质量监控等页面保持卡片式布局，移动端不依赖宽表格。
- Topic 操作按钮、报告筛选、Provider 状态等区域支持换行和纵向排列。

### 第 6B：自动化运营增强

新增核心能力：

- **重试策略**：失败或 fallback 日志可重试，配置错误和 Key 缺失不建议自动重试。每个原始 runLog 最多 3 次手动重试。
- **通知中心**：`/notifications` 展示运行失败、fallback、报告生成、定时完成、provider 质量告警和联动风险提示。
- **报告收藏和标签**：报告详情可收藏、添加标签、移除标签；报告中心可按收藏和标签筛选。
- **报告对比**：`/reports/compare` 可选择两个报告，比较标题、专区、时间、摘要、Markdown、metadata、长度变化和结构变化。
- **Provider 成本占位统计**：质量监控页面显示今日/本周估算成本、各 provider 调用次数、warning / failed / fallback 趋势。当前多数 provider 不稳定返回 token 成本，因此字段先保留为 null 或 0。
- **Provider 质量 warning**：搜索结果为空、总结过短、因子缺失、联动路径为空、fallback、延迟过高都会降低质量分并进入 warning。

本轮新增 Prisma migration：

```text
prisma/migrations/20260611014811_add_mobile_ops_pro
```

本轮新增脚本：

```powershell
npm run mobile:init
npm run mobile:sync
npm run mobile:open
npm run mobile:run
npm run mobile:build:debug
npm run mobile:build:debug:win
```

## 第 7 轮：Deploy Ready + Mobile Release Stabilization

本轮把项目推进到可部署、可远程访问、APK 可稳定指向云端服务的版本。Web 仍是主版本，APK 是移动入口，不把服务端逻辑、Prisma、SQLite 或 provider Key 打包进 APK。

新增运行模式变量：

```env
APP_ENV="local"
APP_BASE_URL="http://localhost:3000"
DATABASE_PROVIDER="sqlite"
APP_ADMIN_TOKEN=""
INTERNAL_API_SECRET=""
ENABLE_PUBLIC_ACCESS="false"
ENABLE_SETUP_WIZARD="true"
```

新增入口：

- `/system/health`：系统健康检查。
- `/setup`：首次启动引导。
- `/mobile-checklist`：移动端发布检查清单。
- `/provider-lab`：真实 provider / mock provider 稳定性测试。

新增脚本：

```powershell
npm run android:check
```

本机 APK 环境已验证：

```text
Android Studio: D:\Android studio
JAVA_HOME: D:\Android studio\jbr
java: 21.0.10
APK: android/app/build/outputs/apk/debug/app-debug.apk
```

部署文档：

- `docs/DEPLOYMENT.md`
- `docs/DATABASE.md`
- `docs/VERCEL_DEPLOY.md`
- `docs/NODE_SERVER_DEPLOY.md`
- `docs/APK_BUILD.md`

## 启动

```powershell
npm install
npx prisma migrate dev
npm run dev
```

PowerShell 如拦截 `npm.ps1`：

```powershell
npm.cmd install
npx.cmd prisma migrate dev
npm.cmd run dev
```

打开：

```text
http://localhost:3000
```

## 环境变量

默认 mock 模式：

```env
DATABASE_URL="file:../data/dev.db"
DATABASE_PROVIDER="sqlite"
APP_ENV="local"
APP_BASE_URL="http://localhost:3000"

SEARCH_PROVIDER="mock"
SUMMARY_PROVIDER="mock"
FACTOR_PROVIDER="mock"
LINKAGE_PROVIDER="mock"

CRON_SECRET=""
INTERNAL_API_SECRET=""
APP_ADMIN_TOKEN=""
ENABLE_PUBLIC_ACCESS="false"
ENABLE_SETUP_WIZARD="true"
DEFAULT_TIMEZONE="Asia/Shanghai"
CAPACITOR_SERVER_URL=""
NEXT_PUBLIC_MOBILE_BASE_URL=""

TAVILY_API_KEY=""
DEEPSEEK_API_KEY=""
DEEPSEEK_MODEL="deepseek-v4-flash"
```

真实 API 模式：

```env
SEARCH_PROVIDER="tavily"
SUMMARY_PROVIDER="deepseek"
FACTOR_PROVIDER="deepseek"
LINKAGE_PROVIDER="deepseek"

TAVILY_API_KEY="your_tavily_key"
DEEPSEEK_API_KEY="your_deepseek_key"
```

API Key 只放在 `.env`，不要写到前端代码。

`CRON_SECRET` 用于保护 `GET/POST /api/schedules/run-due`。如果配置了该值，请求必须带 header：

```text
x-cron-secret: your_secret
```

本地开发可留空；留空时接口会允许执行并返回 warning。

## 默认专区初始化

访问 `/zones` 或 `GET /api/zones` 时，如果数据库没有专区，会自动创建三个默认专区和示例 Topic。

也可以手动调用：

```text
POST /api/zones/init-defaults
```

验证：

```text
GET /api/zones
```

应返回 3 个专区：`search`、`analysis`、`linkage`。

## 使用方式

### 信息检索 Topic

1. 打开 `/zones`。
2. 进入“信息检索专区”。
3. 创建 Topic，例如“广西公务员考试”。
4. 选择检索模式，如 `exam` 或 `policy`。
5. 点击“一键运行 Topic”。
6. Topic 详情页会显示搜索结果、AI 总结、来源列表、历史报告和 Markdown 复制。

### AI 分析 Topic

1. 进入“AI 分析辅助专区”。
2. 创建 Topic，例如“中芯国际”“AI 行业热点”。
3. 点击“一键运行 Topic”。
4. 系统会生成信息卡片、AI 总结、因子评分和 DailySignal。
5. 可查看情绪分、影响分、风险分、政策相关度、技术相关度、财经相关度、关注度和置信度。

财经/股票/行业内容只做公开信息整理和辅助研究，不构成投资建议。

### 联合分析 Topic

1. 进入“多模块联合分析专区”。
2. 创建或打开联动 Topic，例如“AI + PCB + 光模块”。
3. 添加模块，例如“AI 算力需求”“光模块”“数据中心”。
4. 添加模块关系，例如“AI 算力需求 → 光模块”，关系类型为 `demand_pull`。
5. 点击“一键运行 Topic”或调用 `/api/linkage/topics/[topicId]/analyze`。
6. 查看 LinkageAnalysis、keyPaths、assumptions、warnings 和联动报告。

上游、中游、下游含义：

- **上游**：原材料、政策、基础需求、核心供给约束。
- **中游**：制造、设备、材料、技术模块和关键零部件。
- **下游**：终端应用、市场需求、客户和应用场景。

## 联动分析指标

- `linkageScore`：模块之间联动强度，越高代表路径越明确、关系越强。
- `riskScore`：联动路径中的风险或断点强度，越高越需要人工复核。
- `confidence`：当前搜索结果和模块关系对结论的支撑程度。

这些指标是辅助研究信号，不代表事实真假，也不是投资建议。

## API Routes

- `GET /api/zones`
- `POST /api/zones`
- `GET /api/zones/[id]`
- `PATCH /api/zones/[id]`
- `DELETE /api/zones/[id]`
- `POST /api/zones/init-defaults`
- `GET /api/zones/[id]/topics`
- `POST /api/zones/[id]/topics`
- `GET /api/zones/[id]/topics/[topicId]`
- `PATCH /api/zones/[id]/topics/[topicId]`
- `DELETE /api/zones/[id]/topics/[topicId]`
- `POST /api/zones/[id]/topics/[topicId]/run`
- `GET /api/zones/[id]/reports`
- `GET /api/zones/[id]/reports/[reportId]`
- `GET /api/linkage/topics`
- `POST /api/linkage/topics/[topicId]/modules`
- `PATCH /api/linkage/modules/[moduleId]`
- `DELETE /api/linkage/modules/[moduleId]`
- `POST /api/linkage/topics/[topicId]/edges`
- `PATCH /api/linkage/edges/[edgeId]`
- `DELETE /api/linkage/edges/[edgeId]`
- `POST /api/linkage/topics/[topicId]/analyze`
- `GET /api/linkage/topics/[topicId]/analyses`
- `GET /api/runs`
- `GET /api/runs/[id]`
- `POST /api/runs/[id]/retry`
- `GET /api/schedules`
- `POST /api/schedules`
- `GET /api/schedules/[id]`
- `PATCH /api/schedules/[id]`
- `DELETE /api/schedules/[id]`
- `GET /api/schedules/run-due`
- `POST /api/schedules/run-due`
- `GET /api/reports`
- `GET /api/reports/[id]`
- `GET /api/reports/package`
- `POST /api/reports/[id]/favorite`
- `DELETE /api/reports/[id]/favorite`
- `POST /api/reports/[id]/tags`
- `DELETE /api/reports/[id]/tags/[tagId]`
- `GET /api/report-tags`
- `POST /api/report-tags`
- `GET /api/notifications`
- `PATCH /api/notifications/[id]/read`
- `POST /api/notifications/read-all`
- `GET /api/provider-quality`
- `GET /api/system/health`
- `POST /api/provider-lab/run`

旧接口仍保留：

- `GET /api/keywords`
- `POST /api/keywords`
- `POST /api/keywords/[id]/generate`
- `POST /api/keywords/[id]/analyze-factors`
- `GET /api/providers/status`
- `POST /api/providers/test-search`
- `POST /api/providers/test-summary`

## 合规边界

财经、股票、公司、行业分析页面必须遵守：

> 以上内容仅为公开信息整理和辅助研究，不构成投资建议。

全项目禁止输出具体交易方向、具体价格预期、确定性涨跌结论和交易执行指令。

允许表达：

- 值得关注
- 继续观察
- 风险升高
- 信息不足
- 偏正面
- 偏负面
- 需要人工复核

## 验证

```powershell
npm run typecheck
npm run build
```

已新增 Prisma migrations：

```text
prisma/migrations/20260610083959_add_multi_zone_hub
prisma/migrations/20260610141129_add_production_workflow_core
prisma/migrations/20260611014811_add_mobile_ops_pro
```

验证默认专区：

```text
GET /api/zones
```

验证 search topic：

```text
POST /api/zones/[searchZoneId]/topics/[topicId]/run
```

验证 analysis topic：

```text
POST /api/zones/[analysisZoneId]/topics/[topicId]/run
```

验证 linkage topic：

```text
POST /api/linkage/topics/[topicId]/modules
POST /api/linkage/topics/[topicId]/edges
POST /api/linkage/topics/[topicId]/analyze
```

mock 模式无需任何 API Key。配置 Tavily / DeepSeek 后重启开发服务器即可测试真实模式。

验证第 5 轮工作流：

```text
POST /api/zones/[zoneId]/topics/[topicId]/run
GET /api/runs
GET /api/reports
GET /api/provider-quality
GET/POST /api/schedules/run-due
```

页面验证：

- `/reports`：查看所有报告，复制 Markdown 报告包。
- `/reports/compare`：选择两个报告做本地差异对比。
- `/runs`：查看运行日志、质量分、fallback 和重试入口。
- `/schedules`：创建 daily / weekly 定时规则，手动运行 due schedules。
- `/notifications`：查看未读通知、标记已读、跳转关联报告或运行日志。
- `/quality`：查看 provider 成功率、fallback、平均延迟、成本占位和最近 warning。
- `/mobile-preview`：查看 APK 预览版启动说明。
- `/mobile-checklist`：检查 APK 发布前的 Web 地址、HTTPS、Provider、Cron 和 APK 输出。
- `/system/health`：查看部署健康检查和修复建议。
- `/setup`：查看本地、云端、APK 预览三种启动路径。
- `/provider-lab`：测试 search / summary / factor / linkage provider。

## Human-Grade Product UI Redesign

本轮把前端体验从偏工程化后台，重构为 Natural Sci-Fi Product System：

- 主背景改为浅色冷蓝灰，降低长时间使用的视觉疲劳。
- 首页、专区、报告、运行、质量、通知和移动页面改为圆角卡片、清晰层级和移动优先布局。
- 桌面端左侧导航重新分组为工作台、信息、运营、系统。
- 移动端底部导航固定为：首页、专区、报告、运行、我的。
- 新增 `/design-preview`，用于静态验收 Hero、专区卡、指标卡、报告卡、状态标签、底部导航和产业链卡片。

### 设计原则

- 自然、克制、科技感，不做模板站式后台。
- 重要信息优先展示，操作入口靠近上下文。
- 移动端按 App 体验设计，避免横向表格和拥挤按钮。
- 财经、公司、行业分析继续保留合规提示：以上内容仅为公开信息整理和辅助研究，不构成投资建议。

### Hero 背景策略

项目不直接使用参考图，也不下载版权不明图片。`components/brand/HeroArtwork.tsx` 使用 CSS 渐变、星点、地平线和远山轮廓生成默认 Hero。

如需使用自有授权图片，可放入：

```text
public/brand/hero-main.jpg
public/brand/hero-search.jpg
public/brand/hero-analysis.jpg
public/brand/hero-linkage.jpg
```

说明见 `public/brand/README.md`。

### 本轮重构页面

- `/`：新产品首页，包含电影感 Hero、三大专区入口、今日摘要、最近报告、通知摘要和 Provider 状态。
- `/zones`：三大专区说明和入口。
- `/zones/[id]`：专区详情使用 ZoneHero，保留创建 Topic 和运行入口。
- `/zones/[id]/topics/[topicId]`：按 Search / Analysis / Linkage 展示不同结构。
- `/reports`：报告资料库卡片体验，保留筛选、收藏、标签和 Markdown 包。
- `/runs`：运行时间线。
- `/quality`：质量雷达。
- `/notifications`：消息流通知中心。
- `/mobile-preview`：更自然的 APK 预览说明。
- `/mobile-checklist`：移动发布检查和命令复制。
- `/design-preview`：静态视觉验收页。

### 重新生成 APK

Windows 环境：

```powershell
$env:JAVA_HOME="D:\Android studio\jbr"
npm run mobile:sync
npm run mobile:build:debug:win
```

Debug APK 输出：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### 验证旧功能

```powershell
npm run typecheck
npm run build
npm run mobile:sync
npm run mobile:build:debug:win
```

建议同时打开以下页面检查真实功能链路：

- `/`
- `/zones`
- `/reports`
- `/runs`
- `/quality`
- `/notifications`
- `/mobile-preview`
- `/mobile-checklist`
- `/design-preview`

## 第 8 轮：Design QA + Release Polish

本轮不重写业务逻辑、不改数据库 schema，重点把 Web 主版本和 APK 预览入口打磨到发布前可验收状态。

新增或强化内容：

- 统一状态组件：`components/ui/SkeletonCard.tsx`、`components/ui/LoadingState.tsx`、`components/ui/ErrorState.tsx`、`components/ui/Toast.tsx`。
- 全局 Toast：复制、保存、运行、重试等交互统一用轻量提示，不再只依赖按钮文案变化。
- 移动端细节：底部导航 safe-area、运行日志时间线、通知消息流、卡片换行和横向溢出控制。
- 品牌资产结构：`public/brand`、`public/icons`、`public/splash`，包含自有雷达 SVG 标记、图标和启动页源文件。
- Android 预备：debug 版 adaptive icon 已切到项目雷达图形，状态栏和导航栏颜色与 Web 主界面协调。
- 设计验收页：`/design-preview` 增加桌面首页、移动首页、Search / Analysis / Linkage Topic、报告卡片、通知卡片、空状态、加载状态、错误状态预览。

### 运行 UI 审计

```powershell
npm run ui:audit
```

脚本位置：

```text
scripts/ui-audit.ts
```

它会扫描旧样式关键词、参考图片引用、public 中未知大图、过多 hardcoded shadow/radius、lorem ipsum 和明显占位文案。审计结果是建议性质，不会阻断构建。

### 重新生成 APK

```powershell
$env:JAVA_HOME="D:\Android studio\jbr"
npm run mobile:sync
npm run mobile:build:debug:win
```

输出路径：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### APK 图标和启动页状态

- App name：`AI信息雷达`。
- Adaptive icon：已替换为项目自有雷达图形。
- Splash source：`public/splash/splash-light.svg` 和 `public/splash/splash-dark.svg` 已准备。
- 当前 debug APK 的 legacy PNG 和 native splash PNG 仍是预览资源，正式 release 前需要导出完整 density PNG 并配置 release 签名。

### 下一轮 release 签名准备

正式发布前需要准备：

- Android release keystore。
- `keystore.properties` 或 CI secret 配置。
- HTTPS 后端地址。
- release 构建命令和安装验收清单。
- 真实设备启动、登录外部服务、防火墙和 Provider fallback 验证。

## 云端多人同步部署

目标域名：

```text
https://aileida.zh.kg
```

多人同步必须上云，因为 Topic、报告、通知、运行日志、Provider 质量快照都需要写入同一个服务端数据库。APK 只是 Capacitor WebView 入口，必须打开同一个 HTTPS Web 服务，才能和电脑浏览器看到同一份数据。

### 为什么不能用 GitHub Pages

GitHub Pages 只能托管静态页面，不适合完整系统。本项目依赖：

- Next.js API Routes
- Prisma 服务端逻辑
- PostgreSQL 数据库写入
- Tavily / DeepSeek provider 代理
- 报告生成
- 运行日志
- 定时任务
- 通知中心
- Provider 质量监控

完整系统推荐：Vercel + PostgreSQL + `aileida.zh.kg`。

### 推荐架构

- Web + API：Vercel
- 数据库：Neon / Supabase / Railway PostgreSQL
- 域名：`aileida.zh.kg`
- APK：Capacitor WebView，`server.url` 指向 `https://aileida.zh.kg`
- API Key：只放 Vercel Environment Variables，不打进 APK

### Vercel 导入

1. 在 Vercel 新建项目并导入当前仓库。
2. Framework 选择 Next.js。
3. Build Command 使用仓库里的 `vercel.json`：`npm run build:cloud`。
4. 部署前先配置 Environment Variables。

`build:cloud` 会临时生成 PostgreSQL Prisma schema。原因是 Prisma datasource provider 不能可靠地用 `env()` 动态切换；本地保留 SQLite，云端构建切到 PostgreSQL。

### PostgreSQL 配置

创建 Neon / Supabase / Railway Postgres 后，在 Vercel 配置：

```env
DATABASE_PROVIDER="postgres"
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

首次初始化云端数据库：

```powershell
npm run prisma:db:push:cloud
```

当前历史 migrations 是 SQLite 迁移，不直接用于 PostgreSQL。后续稳定多人版本可建立 PostgreSQL migration baseline。

### Vercel 环境变量

```env
APP_ENV="cloud"
APP_BASE_URL="https://aileida.zh.kg"
NEXT_PUBLIC_MOBILE_BASE_URL="https://aileida.zh.kg"

DATABASE_PROVIDER="postgres"
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

SEARCH_PROVIDER="tavily"
SUMMARY_PROVIDER="deepseek"
FACTOR_PROVIDER="deepseek"
LINKAGE_PROVIDER="deepseek"

TAVILY_API_KEY=""
DEEPSEEK_API_KEY=""
DEEPSEEK_MODEL="deepseek-v4-flash"

CRON_SECRET=""
INTERNAL_API_SECRET=""
APP_ADMIN_TOKEN=""

ENABLE_PUBLIC_ACCESS="false"
ENABLE_SETUP_WIZARD="false"
DEFAULT_TIMEZONE="Asia/Shanghai"
```

### DNS 配置

详细步骤见：

```text
docs/DNS_AILEIDA.md
```

核心流程：

1. Vercel 项目 `Settings -> Domains` 添加 `aileida.zh.kg`。
2. 按 Vercel 页面显示的 DNS 记录去 dnsneko 添加。
3. 不要自己猜 A / CNAME / TXT，以 Vercel 显示为准。
4. TXT 验证记录添加后回 Vercel 点击 Verify。
5. DNS 生效后，Vercel 会自动签发 HTTPS 证书。

### 云端 APK 打包

```powershell
$env:NEXT_PUBLIC_MOBILE_BASE_URL="https://aileida.zh.kg"
$env:CAPACITOR_SERVER_URL="https://aileida.zh.kg"
npm run mobile:sync
npm run mobile:build:debug:win
```

输出：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### 云端检查

```powershell
npm run cloud:check
```

这个脚本会检查 `APP_ENV`、`APP_BASE_URL`、`NEXT_PUBLIC_MOBILE_BASE_URL`、`DATABASE_PROVIDER`、`DATABASE_URL`、Provider Key、`CRON_SECRET`、`INTERNAL_API_SECRET`、`APP_ADMIN_TOKEN` 和 Capacitor URL 是否仍指向 `10.0.2.2`。

### 验证同步

1. 打开 `https://aileida.zh.kg`。
2. 打开 `/system/health`，确认 cloud 部署检查没有 danger。
3. 打开 `/provider-lab`，测试 Tavily / DeepSeek provider。
4. 安装重新打包的 APK。
5. 在 Web 新建或运行 Topic。
6. 在 APK 查看同一个 Topic、报告、通知和运行日志。
7. 在 APK 运行 Topic，再回 Web 检查数据是否同步。
