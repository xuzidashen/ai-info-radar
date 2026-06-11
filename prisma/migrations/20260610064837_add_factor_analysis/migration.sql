-- AlterTable
ALTER TABLE "InfoItem" ADD COLUMN "attentionScore" REAL;
ALTER TABLE "InfoItem" ADD COLUMN "eventSubtype" TEXT;
ALTER TABLE "InfoItem" ADD COLUMN "eventType" TEXT;
ALTER TABLE "InfoItem" ADD COLUMN "factorConfidence" REAL;
ALTER TABLE "InfoItem" ADD COLUMN "factorReason" TEXT;
ALTER TABLE "InfoItem" ADD COLUMN "financialScore" REAL;
ALTER TABLE "InfoItem" ADD COLUMN "impactScore" REAL;
ALTER TABLE "InfoItem" ADD COLUMN "policyScore" REAL;
ALTER TABLE "InfoItem" ADD COLUMN "relatedCompanies" TEXT;
ALTER TABLE "InfoItem" ADD COLUMN "relatedIndustries" TEXT;
ALTER TABLE "InfoItem" ADD COLUMN "riskScore" REAL;
ALTER TABLE "InfoItem" ADD COLUMN "sentimentScore" REAL;
ALTER TABLE "InfoItem" ADD COLUMN "techScore" REAL;
ALTER TABLE "InfoItem" ADD COLUMN "timeHorizon" TEXT;

-- CreateTable
CREATE TABLE "DailySignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keywordId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "newsCount" INTEGER NOT NULL DEFAULT 0,
    "positiveCount" INTEGER NOT NULL DEFAULT 0,
    "negativeCount" INTEGER NOT NULL DEFAULT 0,
    "neutralCount" INTEGER NOT NULL DEFAULT 0,
    "avgSentiment" REAL,
    "avgImpact" REAL,
    "avgRisk" REAL,
    "avgPolicy" REAL,
    "avgTech" REAL,
    "avgFinancial" REAL,
    "avgAttention" REAL,
    "avgConfidence" REAL,
    "signalLevel" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "attentionLevel" TEXT NOT NULL,
    "summary" TEXT,
    "factorSnapshot" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailySignal_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DailySignal_keywordId_idx" ON "DailySignal"("keywordId");

-- CreateIndex
CREATE INDEX "DailySignal_date_idx" ON "DailySignal"("date");

-- CreateIndex
CREATE INDEX "DailySignal_signalLevel_idx" ON "DailySignal"("signalLevel");

-- CreateIndex
CREATE INDEX "DailySignal_riskLevel_idx" ON "DailySignal"("riskLevel");

-- CreateIndex
CREATE INDEX "DailySignal_attentionLevel_idx" ON "DailySignal"("attentionLevel");

-- CreateIndex
CREATE UNIQUE INDEX "DailySignal_keywordId_date_key" ON "DailySignal"("keywordId", "date");

-- CreateIndex
CREATE INDEX "InfoItem_eventType_idx" ON "InfoItem"("eventType");

-- CreateIndex
CREATE INDEX "InfoItem_riskScore_idx" ON "InfoItem"("riskScore");

-- CreateIndex
CREATE INDEX "InfoItem_attentionScore_idx" ON "InfoItem"("attentionScore");
