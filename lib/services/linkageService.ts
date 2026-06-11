import { prisma } from "@/lib/prisma";
import { runLinkageProvider } from "@/lib/providers/linkage";
import type { LinkageAnalyzeInput } from "@/lib/providers/linkage/types";
import { serializeLinkageAnalysis, serializeLinkageEdge, serializeLinkageModule, serializeZoneTopic } from "@/lib/serializers";
import { createZoneReport } from "@/lib/services/zoneReportService";
import { buildIndustryChainMarkdown } from "@/lib/templates/linkageTemplates";
import type { LinkageModuleRole, LinkageRelationType } from "@/lib/types";

type ModuleSearchResults = Record<
  string,
  Array<{
    title: string;
    source: string;
    url: string;
    summary: string;
    publishedAt?: string | Date | null;
  }>
>;

export async function listLinkageTopics() {
  const topics = await prisma.zoneTopic.findMany({
    where: {
      zone: {
        type: "linkage"
      }
    },
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

  return Promise.all(
    topics.map(async (topic) => {
      const moduleIds = topic.moduleLinks.map((module) => module.id);
      const edgeCount = moduleIds.length
        ? await prisma.linkageEdge.count({
            where: {
              OR: [{ fromModuleId: { in: moduleIds } }, { toModuleId: { in: moduleIds } }]
            }
          })
        : 0;

      return {
        ...serializeZoneTopic(topic),
        edgeCount
      };
    })
  );
}

export async function createLinkageModule(
  topicId: string,
  input: {
    name: string;
    role: LinkageModuleRole;
    description?: string | null;
    weight?: number | null;
  }
) {
  const module = await prisma.linkageModule.create({
    data: {
      topicId,
      name: input.name,
      role: input.role,
      description: input.description ?? null,
      weight: input.weight ?? 1
    }
  });

  return serializeLinkageModule(module);
}

export async function updateLinkageModule(
  moduleId: string,
  input: {
    name: string;
    role: LinkageModuleRole;
    description?: string | null;
    weight?: number | null;
  }
) {
  const module = await prisma.linkageModule.update({
    where: { id: moduleId },
    data: {
      name: input.name,
      role: input.role,
      description: input.description ?? null,
      weight: input.weight ?? 1
    }
  });

  return serializeLinkageModule(module);
}

export async function deleteLinkageModule(moduleId: string) {
  await prisma.linkageModule.delete({
    where: { id: moduleId }
  });
}

export async function createLinkageEdge(
  topicId: string,
  input: {
    fromModuleId: string;
    toModuleId: string;
    relationType: LinkageRelationType;
    strength?: number | null;
    direction?: string | null;
    reason?: string | null;
  }
) {
  const modules = await prisma.linkageModule.findMany({
    where: {
      topicId,
      id: {
        in: [input.fromModuleId, input.toModuleId]
      }
    }
  });

  if (modules.length < 2) {
    throw new Error("模块不存在或不属于当前 Topic");
  }

  const edge = await prisma.linkageEdge.create({
    data: {
      fromModuleId: input.fromModuleId,
      toModuleId: input.toModuleId,
      relationType: input.relationType,
      strength: input.strength ?? 0.6,
      direction: input.direction ?? "forward",
      reason: input.reason ?? null
    },
    include: {
      fromModule: true,
      toModule: true
    }
  });

  return serializeLinkageEdge(edge);
}

export async function updateLinkageEdge(
  edgeId: string,
  input: {
    relationType: LinkageRelationType;
    strength?: number | null;
    direction?: string | null;
    reason?: string | null;
  }
) {
  const edge = await prisma.linkageEdge.update({
    where: { id: edgeId },
    data: {
      relationType: input.relationType,
      strength: input.strength ?? 0.6,
      direction: input.direction ?? "forward",
      reason: input.reason ?? null
    },
    include: {
      fromModule: true,
      toModule: true
    }
  });

  return serializeLinkageEdge(edge);
}

export async function deleteLinkageEdge(edgeId: string) {
  await prisma.linkageEdge.delete({
    where: { id: edgeId }
  });
}

export async function runLinkageAnalysis(
  topicId: string,
  moduleSearchResults: ModuleSearchResults = {},
  options: {
    runLogId?: string | null;
  } = {}
) {
  const topic = await prisma.zoneTopic.findUnique({
    where: { id: topicId },
    include: {
      zone: true,
      moduleLinks: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!topic) {
    throw new Error("Topic 不存在");
  }

  const moduleIds = topic.moduleLinks.map((module) => module.id);
  const edges = moduleIds.length
    ? await prisma.linkageEdge.findMany({
        where: {
          OR: [{ fromModuleId: { in: moduleIds } }, { toModuleId: { in: moduleIds } }]
        }
      })
    : [];

  const providerInput: LinkageAnalyzeInput = {
    topic: {
      id: topic.id,
      name: topic.name,
      category: topic.category,
      description: topic.description
    },
    modules: topic.moduleLinks.map((module) => ({
      id: module.id,
      name: module.name,
      role: module.role,
      description: module.description,
      weight: module.weight,
      searchResults: moduleSearchResults[module.id] ?? []
    })),
    edges: edges.map((edge) => ({
      from: edge.fromModuleId,
      to: edge.toModuleId,
      relationType: edge.relationType,
      strength: edge.strength,
      reason: edge.reason
    }))
  };

  const result = await runLinkageProvider(providerInput);
  const analysis = await prisma.linkageAnalysis.create({
    data: {
      topicId: topic.id,
      title: result.title,
      markdown: result.markdown,
      linkageScore: result.linkageScore,
      riskScore: result.riskScore,
      confidence: result.confidence,
      keyPaths: JSON.stringify(result.keyPaths),
      assumptions: JSON.stringify(result.assumptions),
      warnings: JSON.stringify(result.warnings)
    }
  });

  const report = await createZoneReport({
    zoneId: topic.zoneId,
    runLogId: options.runLogId ?? null,
    title: result.title,
    type: "linkage",
    markdown: result.markdown,
    summary: `联动分 ${result.linkageScore}，风险分 ${result.riskScore}，置信度 ${result.confidence}。`,
    metadata: {
      topicId: topic.id,
      linkageAnalysisId: analysis.id,
      provider: result.provider,
      fallbackUsed: result.fallbackUsed,
      industryChain: buildIndustryChainMarkdown(topic.moduleLinks.map(serializeLinkageModule))
    }
  });

  await prisma.zoneTopic.update({
    where: { id: topic.id },
    data: { updatedAt: new Date() }
  });

  return {
    analysis: serializeLinkageAnalysis(analysis),
    report,
    provider: result.provider,
    fallbackUsed: result.fallbackUsed
  };
}

export async function listLinkageAnalyses(topicId: string) {
  const analyses = await prisma.linkageAnalysis.findMany({
    where: { topicId },
    orderBy: { createdAt: "desc" }
  });

  return analyses.map(serializeLinkageAnalysis);
}
