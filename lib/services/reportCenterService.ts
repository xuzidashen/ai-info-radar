import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { serializeReportTag, serializeZoneReport } from "@/lib/serializers";
import { buildMarkdownPackage } from "@/lib/utils/markdownPackage";
import type { ZoneReportType } from "@/lib/types";

export type ReportFilterInput = {
  zoneId?: string;
  topicId?: string;
  type?: ZoneReportType;
  query?: string;
  favoriteOnly?: boolean;
  tagId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
};

function metadataContainsTopic(topicId?: string) {
  return topicId ? `"topicId":"${topicId}"` : undefined;
}

function buildWhere(input: ReportFilterInput): Prisma.ZoneReportWhereInput {
  return {
    zoneId: input.zoneId,
    type: input.type,
    favorite: input.favoriteOnly ? { isNot: null } : undefined,
    tagLinks: input.tagId
      ? {
          some: {
            tagId: input.tagId
          }
        }
      : undefined,
    metadata: input.topicId
      ? {
          contains: metadataContainsTopic(input.topicId)
        }
      : undefined,
    createdAt:
      input.dateFrom || input.dateTo
        ? {
            gte: input.dateFrom,
            lte: input.dateTo
          }
        : undefined,
    OR: input.query
      ? [
          { title: { contains: input.query } },
          { summary: { contains: input.query } },
          { markdown: { contains: input.query } }
        ]
      : undefined
  };
}

const reportInclude = {
  zone: true,
  runLog: true,
  favorite: true,
  tagLinks: {
    include: {
      tag: true
    }
  }
} satisfies Prisma.ZoneReportInclude;

export async function listAllReports(input: ReportFilterInput = {}) {
  const reports = await prisma.zoneReport.findMany({
    where: buildWhere(input),
    orderBy: { createdAt: "desc" },
    take: Math.min(input.limit ?? 100, 500),
    include: reportInclude
  });

  return reports.map((report) => ({
    ...serializeZoneReport(report),
    zone: {
      id: report.zone.id,
      name: report.zone.name,
      type: report.zone.type
    },
    runLog: report.runLog
      ? {
          id: report.runLog.id,
          status: report.runLog.status,
          triggerType: report.runLog.triggerType
        }
      : null
  }));
}

export async function getRecentReports(limit = 8) {
  return listAllReports({ limit });
}

export async function getReportById(id: string) {
  const report = await prisma.zoneReport.findUnique({
    where: { id },
    include: reportInclude
  });

  if (!report) {
    return null;
  }

  return {
    ...serializeZoneReport(report),
    zone: {
      id: report.zone.id,
      name: report.zone.name,
      type: report.zone.type
    },
    runLog: report.runLog
      ? {
          id: report.runLog.id,
          status: report.runLog.status,
          triggerType: report.runLog.triggerType
        }
      : null
  };
}

export async function buildReportMarkdownPackage(input: ReportFilterInput = {}) {
  const reports = await prisma.zoneReport.findMany({
    where: buildWhere(input),
    orderBy: { createdAt: "desc" },
    take: Math.min(input.limit ?? 200, 500),
    include: {
      zone: true
    }
  });
  const zoneName = input.zoneId ? reports[0]?.zone.name ?? null : null;
  let topicName: string | null = null;

  if (input.topicId) {
    const topic = await prisma.zoneTopic.findUnique({
      where: { id: input.topicId }
    });
    topicName = topic?.name ?? null;
  }

  const rangeLabel = input.dateFrom || input.dateTo
    ? `${input.dateFrom?.toISOString() ?? "不限"} 至 ${input.dateTo?.toISOString() ?? "不限"}`
    : "全部报告";

  return {
    markdown: buildMarkdownPackage({
      reports: reports.map(serializeZoneReport),
      rangeLabel,
      zoneName,
      topicName
    }),
    count: reports.length
  };
}

export async function setReportFavorite(reportId: string, favorite: boolean) {
  if (favorite) {
    await prisma.reportFavorite.upsert({
      where: { reportId },
      update: {},
      create: { reportId }
    });
  } else {
    await prisma.reportFavorite.deleteMany({
      where: { reportId }
    });
  }

  return getReportById(reportId);
}

export async function listReportTags() {
  const tags = await prisma.reportTag.findMany({
    orderBy: { createdAt: "desc" }
  });

  return tags.map(serializeReportTag);
}

export async function createReportTag(input: { name: string; color?: string | null }) {
  const name = input.name.trim();

  if (!name) {
    throw new Error("标签名称不能为空");
  }

  const tag = await prisma.reportTag.upsert({
    where: { name },
    update: {
      color: input.color ?? undefined
    },
    create: {
      name,
      color: input.color ?? null
    }
  });

  return serializeReportTag(tag);
}

export async function addReportTag(reportId: string, input: { tagId?: string; name?: string; color?: string | null }) {
  const cleanName = input.name?.trim() ?? "";
  const tag = input.tagId
    ? await prisma.reportTag.findUnique({ where: { id: input.tagId } })
    : cleanName
      ? await prisma.reportTag.upsert({
          where: { name: cleanName },
          update: {
            color: input.color ?? undefined
          },
          create: {
            name: cleanName,
            color: input.color ?? null
          }
        })
      : null;

  if (!tag) {
    throw new Error("标签不存在或名称为空");
  }

  await prisma.zoneReportTag.upsert({
    where: {
      reportId_tagId: {
        reportId,
        tagId: tag.id
      }
    },
    update: {},
    create: {
      reportId,
      tagId: tag.id
    }
  });

  return getReportById(reportId);
}

export async function removeReportTag(reportId: string, tagId: string) {
  await prisma.zoneReportTag.deleteMany({
    where: {
      reportId,
      tagId
    }
  });

  return getReportById(reportId);
}
