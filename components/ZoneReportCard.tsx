import { ReportPreview } from "@/components/ReportPreview";
import type { ZoneReportDTO } from "@/lib/types";

export function ZoneReportCard({ report, compact = false, zoneName }: { report: ZoneReportDTO; compact?: boolean; zoneName?: string }) {
  return <ReportPreview report={report} compact={compact} zoneName={zoneName} />;
}
