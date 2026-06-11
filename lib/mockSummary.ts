import { categoryLabels, type InfoItemDTO, type KeywordCategory } from "@/lib/types";
import type { MockInfoItemInput } from "@/lib/mockSearch";

type SummaryItem = Pick<InfoItemDTO, "title" | "source" | "summary" | "importance"> | MockInfoItemInput;

function sourceDigest(items: SummaryItem[]): string {
  return items
    .slice(0, 5)
    .map((item, index) => `${index + 1}. ${item.source}：${item.title}`)
    .join("\n");
}

function highSignal(items: SummaryItem[]): string {
  const high = items.find((item) => item.importance === "high") ?? items[0];
  return high ? `${high.title}。${high.summary}` : "暂无高优先级信号。";
}

export function generateMockSummary(keyword: {
  name: string;
  category: KeywordCategory;
  description?: string | null;
}, items: SummaryItem[]): string {
  const topic = `“${keyword.name}”`;
  const category = categoryLabels[keyword.category];
  const context = keyword.description ? `用户备注：${keyword.description}` : `当前分类：${category}`;
  const digest = sourceDigest(items);
  const signal = highSignal(items);

  if (keyword.category === "finance") {
    return `【今日新增信息】
本次为 ${topic} 汇总 ${items.length} 条公开信息，重点覆盖公告、产业链和市场关注度变化。

【核心变化】
${signal}

【短期影响】
短期更适合作为舆情和公开信息跟踪线索，需要关注后续公告、监管口径和行业数据是否相互印证。

【长期影响】
长期影响取决于基本面、行业周期、技术路线和政策环境的连续变化，当前仅能作为观察清单。

【风险提示】
信息可能存在延迟、误读或来源偏差。以上内容仅为公开信息整理和辅助研究，不构成投资建议。

【来源摘要】
${digest}

【备注】
${context}`;
  }

  if (keyword.category === "policy") {
    return `【事件背景】
本次围绕 ${topic} 汇总报名、政策文件、地方公告和备考相关公开信息。

【政策要点】
${signal}

【申论可用角度】
可从治理能力、公共服务、公平效率、基层执行和数字化管理等角度提炼表达。

【官方表达】
建议积累“稳步推进”“精准施策”“优化服务”“规范流程”“提升质效”等规范表述。

【可积累素材】
将关键时间、发布主体、适用对象和执行要求整理成素材卡，方便后续复盘。

【来源摘要】
${digest}

【备注】
${context}`;
  }

  if (keyword.category === "ai-tech") {
    return `【最新更新】
本次围绕 ${topic} 汇总产品、模型、开发者工具和社区讨论的新变化。

【功能变化】
${signal}

【对普通用户的影响】
普通用户可以重点关注使用门槛、成本变化、稳定性和实际场景效率。

【对开发者的影响】
开发者应关注 API 兼容性、模型能力边界、调用成本、文档变化和迁移风险。

【是否值得关注】
值得继续观察；如果当前使用 mock 简报，需要接入真实搜索和 AI 总结后再提升判断精度。

【来源摘要】
${digest}

【备注】
${context}`;
  }

  if (keyword.category === "study") {
    return `【资料变化】
本次围绕 ${topic} 汇总资料、任务、提交节点和学习计划相关信息。

【任务提醒】
${signal}

【可执行动作】
建议立刻完成资料归档、时间表更新、关键任务拆解和责任人确认。

【风险点】
注意报名截止、材料版本、提交格式、组队状态和评审规则变更。

【下一步建议】
把今天新增信息转成待办清单，并在下一次生成简报时复核是否有节点变化。

【备注】
${context}`;
  }

  return `【信息概览】
本次围绕 ${topic} 生成 ${items.length} 条信息卡片。

【重要变化】
${signal}

【可能影响】
当前信息适合作为个人跟踪线索，建议继续观察来源是否更新。

【风险点】
当前版本可能使用 mock 搜索和 mock 总结，真实判断需结合外部来源验证。

【下一步建议】
将高优先级信息转成待办或复核清单。

【来源摘要】
${digest}

【备注】
${context}`;
}

