-- AlterTable
ALTER TABLE "Review" ADD COLUMN "previewToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Review_previewToken_key" ON "Review"("previewToken");
