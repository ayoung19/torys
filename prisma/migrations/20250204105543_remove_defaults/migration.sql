-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "ratePrivateCentsPerHour" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Entry" ALTER COLUMN "isApproved" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "jobType" DROP DEFAULT;
