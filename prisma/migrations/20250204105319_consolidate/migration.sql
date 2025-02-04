/*
  Warnings:

  - You are about to drop the column `rateCommercialCentsPerHour` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `rateDriveTimeCentsPerHour` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `rateResidentialCentsPerHour` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `entryType` on the `Entry` table. All the data in the column will be lost.
  - You are about to drop the column `isValid` on the `Entry` table. All the data in the column will be lost.
  - You are about to drop the column `overtimeType` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `rateType` on the `Job` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('PRIVATE', 'STATE', 'FEDERAL');

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "rateCommercialCentsPerHour",
DROP COLUMN "rateDriveTimeCentsPerHour",
DROP COLUMN "rateResidentialCentsPerHour",
ADD COLUMN     "ratePrivateCentsPerHour" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "entryType",
DROP COLUMN "isValid",
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "overtimeType",
DROP COLUMN "rateType",
ADD COLUMN     "jobType" "JobType" NOT NULL DEFAULT 'PRIVATE';

-- DropEnum
DROP TYPE "EntryType";

-- DropEnum
DROP TYPE "OvertimeType";

-- DropEnum
DROP TYPE "RateType";
