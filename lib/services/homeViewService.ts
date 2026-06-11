import { getFactorProviderStatus } from "@/lib/providers/factor";
import { getLinkageProviderStatus } from "@/lib/providers/linkage";
import { getSearchProviderStatus } from "@/lib/providers/search";
import { getSummaryProviderStatus } from "@/lib/providers/summary";
import { prisma } from "@/lib/prisma";
import { getProviderDashboardStats } from "@/lib/services/providerQualityService";
import { getRecentReports } from "@/lib/services/reportCenterService";
import { listRunLogs } from "@/lib/services/runLogService";
import { listZones } from "@/lib/services/zoneService";
import { listNotifications } from "@/lib/services/notificationService";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function getHomeView() {
  const today = startOfToday();
  const [zones, recentReports, notificationsResult, recentRuns, providerStats, topicCount, todayReportCount, highRiskSignalCount, pendingRunCount, latestLinkage] =
    await Promise.all([
      listZones(),
      getRecentReports(6),
      listNotifications({ limit: 6 }),
      listRunLogs({ limit: 6 }),
      getProviderDashboardStats(),
      prisma.zoneTopic.count(),
      prisma.zoneReport.count({ where: { createdAt: { gte: today } } }),
      prisma.dailySignal.count({
        where: {
          date: { gte: today },
          OR: [{ riskLevel: "high" }, { signalLevel: "high_risk" }]
        }
      }),
      prisma.topicRunLog.count({
        where: {
          startedAt: { gte: today },
          status: "running"
        }
      }),
      prisma.linkageAnalysis.findFirst({
        orderBy: { createdAt: "desc" },
        include: { topic: true }
      })
    ]);

  const providerStatus = [
    { label: "Search", ...getSearchProviderStatus() },
    { label: "Summary", ...getSummaryProviderStatus() },
    { label: "Factor", ...getFactorProviderStatus() },
    { label: "Linkage", ...getLinkageProviderStatus() }
  ];

  return {
    zones,
    recentReports,
    notifications: notificationsResult.notifications,
    unreadCount: notificationsResult.unreadCount,
    recentRuns,
    providerStatus,
    providerStats,
    todaySummary: {
      zoneCount: zones.length,
      topicCount,
      todayReportCount,
      totalReportCount: zones.reduce((sum, zone) => sum + (zone.reportCount ?? 0), 0),
      highRiskSignalCount,
      pendingRunCount
    },
    latestLinkage: latestLinkage
      ? {
          id: latestLinkage.id,
          topicName: latestLinkage.topic.name,
          title: latestLinkage.title,
          linkageScore: latestLinkage.linkageScore,
          riskScore: latestLinkage.riskScore,
          confidence: latestLinkage.confidence,
          createdAt: latestLinkage.createdAt.toISOString()
        }
      : null
  };
}
