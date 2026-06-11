-- AlterTable
ALTER TABLE "InfoItem" ADD COLUMN "credibilityLabel" TEXT;
ALTER TABLE "InfoItem" ADD COLUMN "credibilityReason" TEXT;
ALTER TABLE "InfoItem" ADD COLUMN "credibilityScore" REAL;

-- CreateIndex
CREATE INDEX "InfoItem_credibilityLabel_idx" ON "InfoItem"("credibilityLabel");
