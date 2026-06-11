import { prisma } from "@/lib/prisma";
import {
  serializeDailySignal,
  serializeInfoItem,
  serializeKeyword,
  serializeLinkageAnalysis,
  serializeLinkageEdge,
  serializeLinkageModule,
  serializeSummary,
  serializeWorkspaceZone,
  serializeZoneReport,
  serializeZoneTopic
} from "@/lib/serializers";
import { defaultZoneDefinitions } from "@/lib/templates/zoneTemplates";
import type {
  SearchMode,
  WorkspaceZoneDTO,
  ZoneDetailDTO,
  ZoneTopicDetailDTO,
  ZoneType
} from "@/lib/types";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseMetadata(value: string | null): { topicId?: string } {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (typeof parsed === "object" && parsed && "topicId" in parsed) {
      return {
        topicId: typeof parsed.topicId === "string" ? parsed.topicId : undefined
      };
    }
  } catch {
    return {};
  }

  return {};
}

export async function ensureDefaultZones() {
  const existingCount = await prisma.workspaceZone.count();

  if (existingCount === 0) {
    for (const zoneDefinition of defaultZoneDefinitions) {
      await prisma.workspaceZone.create({
        data: {
          name: zoneDefinition.name,
          type: zoneDefinition.type,
          description: zoneDefinition.description,
          icon: zoneDefinition.icon,
          color: zoneDefinition.color,
          topics: {
            create: zoneDefinition.topics.map((topic) => ({
              name: topic.name,
              category: topic.category,
              description: topic.description,
              searchMode: topic.searchMode,
              summaryTemplate: topic.summaryTemplate ?? null,
              analysisEnabled: Boolean(topic.analysisEnabled),
              factorEnabled: Boolean(topic.factorEnabled),
              linkageEnabled: Boolean(topic.linkageEnabled)
            }))
          }
        }
      });
    }

    return;
  }

  for (const zoneDefinition of defaultZoneDefinitions) {
    const zone = await prisma.workspaceZone.findFirst({
      where: {
        type: zoneDefinition.type
      }
    });

    if (!zone) {
      await prisma.workspaceZone.create({
        data: {
          name: zoneDefinition.name,
          type: zoneDefinition.type,
          description: zoneDefinition.description,
          icon: zoneDefinition.icon,
          color: zoneDefinition.color,
          topics: {
            create: zoneDefinition.topics.map((topic) => ({
              name: topic.name,
              category: topic.category,
              description: topic.description,
              searchMode: topic.searchMode,
              summaryTemplate: topic.summaryTemplate ?? null,
              analysisEnabled: Boolean(topic.analysisEnabled),
              factorEnabled: Boolean(topic.factorEnabled),
              linkageEnabled: Boolean(topic.linkageEnabled)
            }))
          }
        }
      });
    }
  }
}

export async function listZones(): Promise<WorkspaceZoneDTO[]> {
  await ensureDefaultZones();

  const zones = await prisma.workspaceZone.findMany({
    orderBy: [{ type: "asc" }, { createdAt: "asc" }],
    include: {
      reports: {
        orderBy: { createdAt: "desc" },
        take: 20
      },
      _count: {
        select: {
          topics: true,
          reports: true
        }
      }
    }
  });

  return zones.map(serializeWorkspaceZone);
}

export async function getZoneDetail(id: string): Promise<ZoneDetailDTO | null> {
  await ensureDefaultZones();

  const zone = await prisma.workspaceZone.findUnique({
    where: { id },
    include: {
      reports: {
        orderBy: { createdAt: "desc" },
        take: 20
      },
      topics: {
        orderBy: { updatedAt: "desc" },
        include: {
          keyword: {
            include: {
              _count: {
                select: {
                  infoItems: true,
                  summaries: true
                }
              }
            }
          },
          moduleLinks: true,
          linkageAnalyses: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      },
      _count: {
        select: {
          topics: true,
          reports: true
        }
      }
    }
  });

  if (!zone) {
    return null;
  }

  const today = startOfToday();
  const reports = zone.reports.map(serializeZoneReport);
  const topics = await Promise.all(
    zone.topics.map(async (topic) => {
      const topicReports = zone.reports.filter((report) => parseMetadata(report.metadata).topicId === topic.id);
      const latestDailySignal = topic.keywordId
        ? await prisma.dailySignal.findFirst({
            where: {
              keywordId: topic.keywordId,
              date: {
                gte: today
              }
            },
            orderBy: { updatedAt: "desc" }
          })
        : null;

      return serializeZoneTopic({
        ...topic,
        latestReport: topicReports[0] ?? null,
        latestDailySignal
      });
    })
  );

  return {
    ...serializeWorkspaceZone(zone),
    topics,
    reports
  };
}

export async function createZone(input: {
  name: string;
  type: ZoneType;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
}) {
  const zone = await prisma.workspaceZone.create({
    data: {
      name: input.name,
      type: input.type,
      description: input.description ?? null,
      icon: input.icon ?? null,
      color: input.color ?? null
    },
    include: {
      _count: {
        select: {
          topics: true,
          reports: true
        }
      }
    }
  });

  return serializeWorkspaceZone(zone);
}

export async function updateZone(
  id: string,
  input: {
    name: string;
    type: ZoneType;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
  }
) {
  const zone = await prisma.workspaceZone.update({
    where: { id },
    data: {
      name: input.name,
      type: input.type,
      description: input.description ?? null,
      icon: input.icon ?? null,
      color: input.color ?? null
    },
    include: {
      _count: {
        select: {
          topics: true,
          reports: true
        }
      }
    }
  });

  return serializeWorkspaceZone(zone);
}

export async function deleteZone(id: string) {
  await prisma.workspaceZone.delete({
    where: { id }
  });
}

export async function listZoneTopics(zoneId: string) {
  const topics = await prisma.zoneTopic.findMany({
    where: { zoneId },
    orderBy: { updatedAt: "desc" },
    include: {
      keyword: {
        include: {
          _count: {
            select: {
              infoItems: true,
              summaries: true
            }
          }
        }
      },
      moduleLinks: true,
      linkageAnalyses: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  return topics.map(serializeZoneTopic);
}

export async function createZoneTopic(
  zoneId: string,
  input: {
    name: string;
    category: string;
    description?: string | null;
    searchMode: SearchMode;
    summaryTemplate?: string | null;
  }
) {
  const zone = await prisma.workspaceZone.findUnique({
    where: { id: zoneId }
  });

  if (!zone) {
    throw new Error("专区不存在");
  }

  const topic = await prisma.zoneTopic.create({
    data: {
      zoneId,
      name: input.name,
      category: input.category,
      description: input.description ?? null,
      searchMode: input.searchMode,
      summaryTemplate: input.summaryTemplate ?? null,
      analysisEnabled: zone.type === "analysis",
      factorEnabled: zone.type === "analysis",
      linkageEnabled: zone.type === "linkage"
    },
    include: {
      keyword: {
        include: {
          _count: {
            select: {
              infoItems: true,
              summaries: true
            }
          }
        }
      },
      moduleLinks: true,
      linkageAnalyses: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  return serializeZoneTopic(topic);
}

export async function updateZoneTopic(
  topicId: string,
  input: {
    name: string;
    category: string;
    description?: string | null;
    searchMode: SearchMode;
    summaryTemplate?: string | null;
    analysisEnabled?: boolean;
    factorEnabled?: boolean;
    linkageEnabled?: boolean;
  }
) {
  const topic = await prisma.zoneTopic.update({
    where: { id: topicId },
    data: {
      name: input.name,
      category: input.category,
      description: input.description ?? null,
      searchMode: input.searchMode,
      summaryTemplate: input.summaryTemplate ?? null,
      analysisEnabled: input.analysisEnabled,
      factorEnabled: input.factorEnabled,
      linkageEnabled: input.linkageEnabled
    },
    include: {
      keyword: {
        include: {
          _count: {
            select: {
              infoItems: true,
              summaries: true
            }
          }
        }
      },
      moduleLinks: true,
      linkageAnalyses: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  return serializeZoneTopic(topic);
}

export async function deleteZoneTopic(topicId: string) {
  await prisma.zoneTopic.delete({
    where: { id: topicId }
  });
}

export async function getZoneTopicDetail(topicId: string): Promise<ZoneTopicDetailDTO | null> {
  const topic = await prisma.zoneTopic.findUnique({
    where: { id: topicId },
    include: {
      zone: {
        include: {
          _count: {
            select: {
              topics: true,
              reports: true
            }
          }
        }
      },
      keyword: {
        include: {
          infoItems: {
            orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
            take: 20
          },
          summaries: {
            orderBy: { createdAt: "desc" },
            take: 10
          },
          dailySignals: {
            orderBy: { date: "desc" },
            take: 30
          },
          _count: {
            select: {
              infoItems: true,
              summaries: true
            }
          }
        }
      },
      moduleLinks: {
        orderBy: { createdAt: "asc" }
      },
      linkageAnalyses: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  });

  if (!topic) {
    return null;
  }

  const moduleIds = topic.moduleLinks.map((module) => module.id);
  const [edges, zoneReports] = await Promise.all([
    moduleIds.length > 0
      ? prisma.linkageEdge.findMany({
          where: {
            OR: [{ fromModuleId: { in: moduleIds } }, { toModuleId: { in: moduleIds } }]
          },
          orderBy: { createdAt: "asc" },
          include: {
            fromModule: true,
            toModule: true
          }
        })
      : Promise.resolve([]),
    prisma.zoneReport.findMany({
      where: {
        zoneId: topic.zoneId
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })
  ]);

  const reports = zoneReports.filter((report) => parseMetadata(report.metadata).topicId === topic.id).map(serializeZoneReport);

  return {
    ...serializeZoneTopic(topic),
    zone: serializeWorkspaceZone(topic.zone),
    reports,
    infoItems: topic.keyword?.infoItems.map(serializeInfoItem) ?? [],
    summaries: topic.keyword?.summaries.map(serializeSummary) ?? [],
    dailySignals: topic.keyword?.dailySignals.map(serializeDailySignal) ?? [],
    modules: topic.moduleLinks.map(serializeLinkageModule),
    edges: edges.map(serializeLinkageEdge),
    linkageAnalyses: topic.linkageAnalyses.map(serializeLinkageAnalysis)
  };
}

export async function getTopicOrThrow(topicId: string) {
  const topic = await prisma.zoneTopic.findUnique({
    where: { id: topicId },
    include: {
      zone: true
    }
  });

  if (!topic) {
    throw new Error("Topic 不存在");
  }

  return topic;
}
