-- CreateTable
CREATE TABLE "WorkspaceZone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ZoneTopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "keywordId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "searchMode" TEXT NOT NULL,
    "summaryTemplate" TEXT,
    "analysisEnabled" BOOLEAN NOT NULL DEFAULT false,
    "factorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "linkageEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ZoneTopic_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "WorkspaceZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ZoneTopic_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ZoneReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "summary" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ZoneReport_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "WorkspaceZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LinkageModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT,
    "weight" REAL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LinkageModule_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "ZoneTopic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LinkageEdge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromModuleId" TEXT NOT NULL,
    "toModuleId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "strength" REAL,
    "direction" TEXT,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LinkageEdge_fromModuleId_fkey" FOREIGN KEY ("fromModuleId") REFERENCES "LinkageModule" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LinkageEdge_toModuleId_fkey" FOREIGN KEY ("toModuleId") REFERENCES "LinkageModule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LinkageAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "linkageScore" REAL,
    "riskScore" REAL,
    "confidence" REAL,
    "keyPaths" TEXT,
    "assumptions" TEXT,
    "warnings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LinkageAnalysis_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "ZoneTopic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WorkspaceZone_type_idx" ON "WorkspaceZone"("type");

-- CreateIndex
CREATE INDEX "ZoneTopic_zoneId_idx" ON "ZoneTopic"("zoneId");

-- CreateIndex
CREATE INDEX "ZoneTopic_keywordId_idx" ON "ZoneTopic"("keywordId");

-- CreateIndex
CREATE INDEX "ZoneReport_zoneId_idx" ON "ZoneReport"("zoneId");

-- CreateIndex
CREATE INDEX "ZoneReport_createdAt_idx" ON "ZoneReport"("createdAt");

-- CreateIndex
CREATE INDEX "LinkageModule_topicId_idx" ON "LinkageModule"("topicId");

-- CreateIndex
CREATE INDEX "LinkageEdge_fromModuleId_idx" ON "LinkageEdge"("fromModuleId");

-- CreateIndex
CREATE INDEX "LinkageEdge_toModuleId_idx" ON "LinkageEdge"("toModuleId");

-- CreateIndex
CREATE INDEX "LinkageAnalysis_topicId_idx" ON "LinkageAnalysis"("topicId");

-- CreateIndex
CREATE INDEX "LinkageAnalysis_createdAt_idx" ON "LinkageAnalysis"("createdAt");
