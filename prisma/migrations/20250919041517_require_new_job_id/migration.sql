/*
  Warnings:

  - Made the column `newJobId` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "newJobId" SET NOT NULL,
ALTER COLUMN "newJobId" DROP DEFAULT;
