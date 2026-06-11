import type { ZoneReportDTO } from "@/lib/types";

function headings(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("#") || /^【.+】$/.test(line))
    .map((line) => line.replace(/^#+\s*/, ""));
}

function keywordSet(value: string) {
  return new Set(
    value
      .replace(/[^\p{Script=Han}\p{Letter}\p{Number}\s]/gu, " ")
      .split(/\s+/)
      .map((item) => item.trim())
      .filter((item) => item.length >= 2)
      .slice(0, 300)
  );
}

function topicIdFromMetadata(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as { topicId?: unknown };
    return typeof parsed.topicId === "string" ? parsed.topicId : null;
  } catch {
    return null;
  }
}

export function diffReports(left: ZoneReportDTO, right: ZoneReportDTO) {
  const leftHeadings = headings(left.markdown);
  const rightHeadings = headings(right.markdown);
  const commonHeadings = leftHeadings.filter((heading) => rightHeadings.includes(heading));
  const addedHeadings = rightHeadings.filter((heading) => !leftHeadings.includes(heading));
  const removedHeadings = leftHeadings.filter((heading) => !rightHeadings.includes(heading));
  const leftKeywords = keywordSet(`${left.title} ${left.summary ?? ""} ${left.markdown}`);
  const rightKeywords = keywordSet(`${right.title} ${right.summary ?? ""} ${right.markdown}`);
  const commonKeywordCount = Array.from(leftKeywords).filter((keyword) => rightKeywords.has(keyword)).length;
  const lengthDiff = right.markdown.length - left.markdown.length;
  const createdDiffHours = Math.round((new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()) / 36_000) / 10;
  const leftTopicId = topicIdFromMetadata(left.metadata);
  const rightTopicId = topicIdFromMetadata(right.metadata);
  const sameTopic = Boolean(leftTopicId && rightTopicId && leftTopicId === rightTopicId);

  return {
    lengthDiff,
    commonHeadings,
    addedHeadings,
    removedHeadings,
    commonKeywordCount,
    createdDiffHours,
    sameTopic,
    summary: [
      `右侧报告比左侧${lengthDiff >= 0 ? "增加" : "减少"} ${Math.abs(lengthDiff)} 个字符。`,
      `共同结构标题 ${commonHeadings.length} 个，新增结构 ${addedHeadings.length} 个，减少结构 ${removedHeadings.length} 个。`,
      `粗略共同关键词 ${commonKeywordCount} 个。`,
      `生成时间相差约 ${createdDiffHours} 小时。`,
      sameTopic ? "两个报告来自同一 Topic，可重点观察新增结构和摘要变化。" : "两个报告不一定来自同一 Topic，请结合专区和主题判断差异。"
    ].join(" ")
  };
}
