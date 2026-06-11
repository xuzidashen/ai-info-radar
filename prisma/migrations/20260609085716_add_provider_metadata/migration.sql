-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InfoItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "summary" TEXT NOT NULL,
    "importance" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "score" REAL,
    "rawContent" TEXT,
    "fetchedAt" DATETIME,
    "keywordId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InfoItem_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InfoItem" ("createdAt", "id", "importance", "keywordId", "publishedAt", "sentiment", "source", "summary", "title", "url") SELECT "createdAt", "id", "importance", "keywordId", "publishedAt", "sentiment", "source", "summary", "title", "url" FROM "InfoItem";
DROP TABLE "InfoItem";
ALTER TABLE "new_InfoItem" RENAME TO "InfoItem";
CREATE INDEX "InfoItem_keywordId_idx" ON "InfoItem"("keywordId");
CREATE INDEX "InfoItem_importance_idx" ON "InfoItem"("importance");
CREATE INDEX "InfoItem_publishedAt_idx" ON "InfoItem"("publishedAt");
CREATE INDEX "InfoItem_provider_idx" ON "InfoItem"("provider");
CREATE TABLE "new_Summary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keywordId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Summary_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Summary" ("content", "createdAt", "id", "keywordId") SELECT "content", "createdAt", "id", "keywordId" FROM "Summary";
DROP TABLE "Summary";
ALTER TABLE "new_Summary" RENAME TO "Summary";
CREATE INDEX "Summary_keywordId_idx" ON "Summary"("keywordId");
CREATE INDEX "Summary_createdAt_idx" ON "Summary"("createdAt");
CREATE INDEX "Summary_provider_idx" ON "Summary"("provider");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
