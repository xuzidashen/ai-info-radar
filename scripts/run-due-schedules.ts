import { prisma } from "@/lib/prisma";
import { runDueSchedules } from "@/lib/services/scheduleService";

async function main() {
  const startedAt = new Date();
  console.log(`[schedules:run-due] started at ${startedAt.toISOString()}`);

  const result = await runDueSchedules(startedAt);
  console.log(
    `[schedules:run-due] total=${result.total} success=${result.successCount} failed=${result.failedCount}`
  );

  for (const item of result.results) {
    const status = item.ok ? "ok" : "failed";
    console.log(
      `[schedules:run-due] ${status} schedule=${item.scheduleId} topic=${item.topicId}${item.error ? ` error=${item.error}` : ""}`
    );
  }
}

main()
  .catch((error) => {
    console.error("[schedules:run-due] fatal", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
