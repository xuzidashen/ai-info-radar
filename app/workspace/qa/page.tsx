import { WorkspaceQa } from "@/components/redesign/WorkspaceQa";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { prisma } from "@/lib/prisma";
import { canUseDatabase, getMainFlowTopics } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

async function getDatabaseConnectionStatus() {
  if (!canUseDatabase()) {
    return {
      ok: false,
      label: "未连接",
      detail: "DATABASE_URL 未配置为 PostgreSQL，当前只能使用 mock / 本地兜底。"
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      ok: true,
      label: "正常",
      detail: "Neon / PostgreSQL 可连接。"
    };
  } catch {
    return {
      ok: false,
      label: "异常",
      detail: "数据库连接失败，请检查 Vercel 环境变量和 Neon 状态。"
    };
  }
}

export default async function WorkspaceQaPage() {
  const [topics, database] = await Promise.all([getMainFlowTopics(), getDatabaseConnectionStatus()]);

  return (
    <RedesignShell showBottomNav={false}>
      <WorkspaceQa topics={topics} database={database} />
    </RedesignShell>
  );
}
