-- CreateTable
CREATE TABLE "TopicRunLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT,
    "zoneId" TEXT,
    "runType" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "durationMs" INTEGER,
    "searchProvider" TEXT,
    "summaryProvider" TEXT,
    "factorProvider" TEXT,
    "linkageProvider" TEXT,
    "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "rawResultCount" INTEGER NOT NULL DEFAULT 0,
    "filteredCount" INTEGER NOT NULL DEFAULT 0,
    "dedupedCount" INTEGER NOT NULL DEFAULT 0,
    "savedItemCount" INTEGER NOT NULL DEFAULT 0,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "qualityScore" REAL,
    "qualityLabel" TEXT,
    "qualityReason" TEXT,
    "metadata" TEXT,
    CONSTRAINT "TopicRunLog_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "WorkspaceZone" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TopicRunLog_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "ZoneTopic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TopicSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL,
    "hour" INTEGER,
    "minute" INTEGER,
    "dayOfWeek" INTEGER,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "lastRunAt" DATETIME,
    "nextRunAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TopicSchedule_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "ZoneTopic" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TopicSchedule_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "WorkspaceZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProviderQualitySnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerType" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
    "latencyMs" INTEGER,
    "resultCount" INTEGER,
    "errorMessage" TEXT,
    "qualityScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ZoneReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "runLogId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "summary" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ZoneReport_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "WorkspaceZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ZoneReport_runLogId_fkey" FOREIGN KEY ("runLogId") REFERENCES "TopicRunLog" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ZoneReport" ("createdAt", "id", "markdown", "metadata", "summary", "title", "type", "zoneId") SELECT "createdAt", "id", "markdown", "metadata", "summary", "title", "type", "zoneId" FROM "ZoneReport";
DROP TABLE "ZoneReport";
ALTER TABLE "new_ZoneReport" RENAME TO "ZoneReport";
CREATE INDEX "ZoneReport_zoneId_idx" ON "ZoneReport"("zoneId");
CREATE INDEX "ZoneReport_runLogId_idx" ON "ZoneReport"("runLogId");
CREATE INDEX "ZoneReport_createdAt_idx" ON "ZoneReport"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TopicRunLog_topicId_idx" ON "TopicRunLog"("topicId");

-- CreateIndex
CREATE INDEX "TopicRunLog_zoneId_idx" ON "TopicRunLog"("zoneId");

-- CreateIndex
CREATE INDEX "TopicRunLog_status_idx" ON "TopicRunLog"("status");

-- CreateIndex
CREATE INDEX "TopicRunLog_startedAt_idx" ON "TopicRunLog"("startedAt");

-- CreateIndex
CREATE INDEX "TopicSchedule_topicId_idx" ON "TopicSchedule"("topicId");

-- CreateIndex
CREATE INDEX "TopicSchedule_zoneId_idx" ON "TopicSchedule"("zoneId");

-- CreateIndex
CREATE INDEX "TopicSchedule_enabled_idx" ON "TopicSchedule"("enabled");

-- CreateIndex
CREATE INDEX "TopicSchedule_nextRunAt_idx" ON "TopicSchedule"("nextRunAt");

-- CreateIndex
CREATE INDEX "ProviderQualitySnapshot_providerType_idx" ON "ProviderQualitySnapshot"("providerType");

-- CreateIndex
CREATE INDEX "ProviderQualitySnapshot_providerName_idx" ON "ProviderQualitySnapshot"("providerName");

-- CreateIndex
CREATE INDEX "ProviderQualitySnapshot_createdAt_idx" ON "ProviderQualitySnapshot"("createdAt");
