/*
  Warnings:

  - A unique constraint covering the columns `[timesheetId,oldJobId]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "oldJobId" INTEGER DEFAULT floor(random() * 1000000)::int;

-- CreateIndex
CREATE UNIQUE INDEX "Job_timesheetId_oldJobId_key" ON "Job"("timesheetId", "oldJobId");
