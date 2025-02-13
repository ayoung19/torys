/*
  Warnings:

  - Made the column `oldJobId` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "oldJobId" SET NOT NULL,
ALTER COLUMN "oldJobId" DROP DEFAULT;
