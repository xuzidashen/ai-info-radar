import { TopNav } from "@/components/redesign/Navigation";
import { InsightList } from "@/components/redesign/InsightComponents";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { insights } from "@/lib/mock/redesignData";

export default function InsightsPage() {
  return <RedesignShell><div className="space-y-6"><TopNav title="分析结果" subtitle="把主题变化整理成易读的深度内容" showBrand={false} /><InsightList insights={insights} /></div></RedesignShell>;
}
