# AI 信息雷达 UI Redesign

高保真 UI 与浏览流程已提升为正式主入口，不改动数据库、Provider、运行日志等现有业务能力。普通用户默认进入首页、发现、收藏、我的四个入口，复杂管理能力继续保留在旧工作台。

## 正式与预览地址

- 正式首页：`/`
- 总览：`/redesign/preview`
- 保留的新版首页预览：`/redesign`
- 发现：`/redesign/discover`
- 收藏：`/redesign/saved`
- 我的：`/redesign/profile`
- 文章详情示例：`/redesign/article/ai-plan-2030`
- 旧版管理工作台：`/legacy`

## 信息架构

新版主导航收敛为：首页、发现、收藏、我的。`Zone`、`Run`、`Provider` 等系统能力仍保留在 `/legacy` 和原有管理页面，并从“我的 -> 管理与更多工具”进入，不再出现在普通用户的首层浏览路径。

## 设计语言

- 移动端优先，桌面端使用固定侧栏和内容双栏自然延展。
- 浅灰蓝背景、实色白卡与轻阴影，玻璃感只用于导航等非正文区域。
- 主色为清晰蓝色，辅以橙、绿色和紫色区分热点、离线阅读和专题。
- 卡片保持统一大圆角，正文和按钮维持足够对比度。
- 移动底栏包含 `safe-area-inset-bottom`，页面内容预留底部空间。
- 图标统一使用 Phosphor Icons。

## 组件结构

核心组件位于 `components/redesign/`：

- `RedesignShell`：移动底栏、桌面侧栏与响应式内容容器。
- `Navigation`：顶部导航、搜索栏、分类标签和区块标题。
- `NewsCards`：头条、今日简报、资讯列表和文章操作。
- `DiscoverCards`：热榜、精选专题与快速上升。
- `ProfileComponents`：用户卡、快捷入口、偏好、滑杆和设置项。
- `ArticleComponents`：文章标题、元信息、正文与相关阅读。

演示数据位于 `lib/mock/redesignData.ts`。后续接入真实数据时，应保持组件输入类型稳定，在页面或服务层将现有 `InfoItem`、`ZoneReport` 映射为 `RedesignArticle`。

## 后续数据接入

1. 将 `/redesign` 的推荐流接入现有 `InfoItem` 查询，不改卡片组件。
2. 将 `/redesign/discover` 的热榜和专题接入 Topic、评分与标签聚合。
3. 将收藏按钮接入用户本地偏好或云端收藏表。
4. 将文章详情接入 InfoItem 与报告内容，并保留原始来源链接。
5. 管理、Provider Lab、系统健康等专业能力继续保留在工作台入口，不混入普通阅读导航。

## 图片资源

当前图片清单与替换规格见 `public/redesign-assets/README.md`。正式上线前需换成自有或已授权素材；组件中的资源路径已集中在 mock 数据中，替换不需要修改页面结构。
