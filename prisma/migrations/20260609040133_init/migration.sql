-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "lastSearchedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InfoItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "summary" TEXT NOT NULL,
    "importance" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InfoItem_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keywordId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Summary_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_name_key" ON "Keyword"("name");

-- CreateIndex
CREATE INDEX "Keyword_category_idx" ON "Keyword"("category");

-- CreateIndex
CREATE INDEX "Keyword_createdAt_idx" ON "Keyword"("createdAt");

-- CreateIndex
CREATE INDEX "InfoItem_keywordId_idx" ON "InfoItem"("keywordId");

-- CreateIndex
CREATE INDEX "InfoItem_importance_idx" ON "InfoItem"("importance");

-- CreateIndex
CREATE INDEX "InfoItem_publishedAt_idx" ON "InfoItem"("publishedAt");

-- CreateIndex
CREATE INDEX "Summary_keywordId_idx" ON "Summary"("keywordId");

-- CreateIndex
CREATE INDEX "Summary_createdAt_idx" ON "Summary"("createdAt");
