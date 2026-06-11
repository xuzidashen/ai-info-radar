export type SourceCredibility = {
  score: number;
  label: "high" | "medium" | "low" | "unknown";
  reason: string;
};

const highTrustHints = [
  "gov.cn",
  "edu.cn",
  "sse.com.cn",
  "szse.cn",
  "hkex.com.hk",
  "sec.gov",
  "nasdaq.com",
  "nyse.com",
  "docs.",
  "developer.",
  "official",
  "公告",
  "官网",
  "官方"
];

const mainstreamMediaHints = [
  "reuters.com",
  "apnews.com",
  "xinhua",
  "people.com.cn",
  "cctv.com",
  "caixin.com",
  "yicai.com",
  "cls.cn",
  "thepaper.cn"
];

const mediumTrustHints = [
  "36kr.com",
  "huxiu.com",
  "ithome.com",
  "infoq.cn",
  "github.com",
  "medium.com",
  "substack.com",
  "csdn.net",
  "zhihu.com",
  "雪球",
  "财联社",
  "行业",
  "博客",
  "社区"
];

const lowTrustHints = [
  "采集",
  "转载",
  "标题党",
  "来源不明",
  "unknown",
  "不详",
  "mirror",
  "aggregator"
];

function hostOf(url: string) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function includesAny(value: string, hints: string[]) {
  return hints.some((hint) => value.includes(hint.toLowerCase()));
}

export function getSourceCredibility(source: string, url: string): SourceCredibility {
  const host = hostOf(url);
  const haystack = `${source} ${host}`.toLowerCase();

  if (!source && !host) {
    return {
      score: 0.2,
      label: "low",
      reason: "缺少明确来源和 URL，可信度只能作为低可信处理。"
    };
  }

  if (includesAny(haystack, highTrustHints) || includesAny(haystack, mainstreamMediaHints)) {
    return {
      score: 0.9,
      label: "high",
      reason: "来源匹配政府、教育、交易所、官方文档、官方公告或主流媒体等高可信线索。"
    };
  }

  if (includesAny(haystack, mediumTrustHints)) {
    return {
      score: 0.65,
      label: "medium",
      reason: "来源匹配行业媒体、财经门户、技术博客或知名社区，适合作为辅助参考。"
    };
  }

  if (includesAny(haystack, lowTrustHints)) {
    return {
      score: 0.3,
      label: "low",
      reason: "来源存在采集、转载、来源不明或标题党特征，需要谨慎验证。"
    };
  }

  return {
    score: 0.5,
    label: "unknown",
    reason: "未命中明确可信度规则，当前无法判断来源级别。"
  };
}
