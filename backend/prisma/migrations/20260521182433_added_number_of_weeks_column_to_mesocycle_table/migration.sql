-- DropForeignKey
ALTER TABLE "SessionMuscleFeedback" DROP CONSTRAINT "SessionMuscleFeedback_performancefeedbackId_fkey";

-- DropForeignKey
ALTER TABLE "SessionMuscleFeedback" DROP CONSTRAINT "SessionMuscleFeedback_sorenessfeedbackId_fkey";

-- AlterTable
ALTER TABLE "Mesocycle" ADD COLUMN     "numberOfWeeks" INTEGER;

-- AddForeignKey
ALTER TABLE "SessionMuscleFeedback" ADD CONSTRAINT "SessionMuscleFeedback_performancefeedbackId_fkey" FOREIGN KEY ("performancefeedbackId") REFERENCES "Performancefeedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionMuscleFeedback" ADD CONSTRAINT "SessionMuscleFeedback_sorenessfeedbackId_fkey" FOREIGN KEY ("sorenessfeedbackId") REFERENCES "Sorenessfeedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;
