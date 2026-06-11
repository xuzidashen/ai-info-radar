-- AlterTable
ALTER TABLE "ProviderQualitySnapshot" ADD COLUMN "estimatedCost" REAL;
ALTER TABLE "ProviderQualitySnapshot" ADD COLUMN "inputTokens" INTEGER;
ALTER TABLE "ProviderQualitySnapshot" ADD COLUMN "outputTokens" INTEGER;

-- CreateTable
CREATE TABLE "AppNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "zoneId" TEXT,
    "topicId" TEXT,
    "runLogId" TEXT,
    "reportId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ReportTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ReportFavorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportFavorite_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ZoneReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ZoneReportTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "ZoneReportTag_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ZoneReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ZoneReportTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ReportTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TopicRunLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT,
    "zoneId" TEXT,
    "parentRunLogId" TEXT,
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
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    CONSTRAINT "TopicRunLog_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "WorkspaceZone" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TopicRunLog_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "ZoneTopic" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TopicRunLog_parentRunLogId_fkey" FOREIGN KEY ("parentRunLogId") REFERENCES "TopicRunLog" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TopicRunLog" ("dedupedCount", "durationMs", "errorMessage", "factorProvider", "fallbackUsed", "filteredCount", "finishedAt", "id", "linkageProvider", "metadata", "qualityLabel", "qualityReason", "qualityScore", "rawResultCount", "reportCount", "runType", "savedItemCount", "searchProvider", "startedAt", "status", "summaryProvider", "topicId", "triggerType", "zoneId") SELECT "dedupedCount", "durationMs", "errorMessage", "factorProvider", "fallbackUsed", "filteredCount", "finishedAt", "id", "linkageProvider", "metadata", "qualityLabel", "qualityReason", "qualityScore", "rawResultCount", "reportCount", "runType", "savedItemCount", "searchProvider", "startedAt", "status", "summaryProvider", "topicId", "triggerType", "zoneId" FROM "TopicRunLog";
DROP TABLE "TopicRunLog";
ALTER TABLE "new_TopicRunLog" RENAME TO "TopicRunLog";
CREATE INDEX "TopicRunLog_topicId_idx" ON "TopicRunLog"("topicId");
CREATE INDEX "TopicRunLog_zoneId_idx" ON "TopicRunLog"("zoneId");
CREATE INDEX "TopicRunLog_parentRunLogId_idx" ON "TopicRunLog"("parentRunLogId");
CREATE INDEX "TopicRunLog_status_idx" ON "TopicRunLog"("status");
CREATE INDEX "TopicRunLog_startedAt_idx" ON "TopicRunLog"("startedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "AppNotification_read_idx" ON "AppNotification"("read");

-- CreateIndex
CREATE INDEX "AppNotification_type_idx" ON "AppNotification"("type");

-- CreateIndex
CREATE INDEX "AppNotification_createdAt_idx" ON "AppNotification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReportTag_name_key" ON "ReportTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ReportFavorite_reportId_key" ON "ReportFavorite"("reportId");

-- CreateIndex
CREATE INDEX "ZoneReportTag_reportId_idx" ON "ZoneReportTag"("reportId");

-- CreateIndex
CREATE INDEX "ZoneReportTag_tagId_idx" ON "ZoneReportTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ZoneReportTag_reportId_tagId_key" ON "ZoneReportTag"("reportId", "tagId");
