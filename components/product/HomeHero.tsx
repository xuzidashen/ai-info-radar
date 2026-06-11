import { CinematicHero } from "@/components/brand/CinematicHero";
import { productCopy } from "@/lib/design/copy";

export function HomeHero({
  zoneCount,
  reportCount,
  unreadCount
}: {
  zoneCount: number;
  reportCount: number;
  unreadCount: number;
}) {
  return (
    <CinematicHero
      eyebrow={productCopy.homepage.eyebrow}
      title={productCopy.homepage.title}
      subtitle={productCopy.homepage.subtitle}
      description={productCopy.homepage.description}
      ctaLabel={productCopy.homepage.ctaLabel}
      ctaHref="/zones"
      mood="home"
      stats={[
        { label: "专区", value: String(zoneCount), hint: "Search / Analysis / Linkage" },
        { label: "报告", value: String(reportCount), hint: "已沉淀资料" },
        { label: "未读", value: String(unreadCount), hint: "通知中心" }
      ]}
    />
  );
}
