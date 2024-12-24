-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('DEV', 'ADMIN', 'COORDINATOR', 'FOREMAN');

-- CreateEnum
CREATE TYPE "RateType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'DAVIS_BACON', 'DRIVE_TIME');

-- CreateEnum
CREATE TYPE "OvertimeType" AS ENUM ('DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('ROOFING', 'CARPENTRY');

-- CreateTable
CREATE TABLE "Account" (
    "accountId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "Timesheet" (
    "timesheetId" TEXT NOT NULL,

    CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("timesheetId")
);

-- CreateTable
CREATE TABLE "Employee" (
    "timesheetId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "displayId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "rateResidentialCentsPerHour" INTEGER NOT NULL,
    "rateCommercialCentsPerHour" INTEGER NOT NULL,
    "rateDavisBaconCentsPerHour" INTEGER NOT NULL,
    "rateDavisBaconOvertimeCentsPerHour" INTEGER NOT NULL,
    "rateDriveTimeCentsPerHour" INTEGER NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("timesheetId","employeeId")
);

-- CreateTable
CREATE TABLE "Job" (
    "timesheetId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "budgetOriginalCents" INTEGER,
    "budgetCurrentCents" INTEGER,
    "rateType" "RateType" NOT NULL,
    "overtimeType" "OvertimeType" NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("timesheetId","jobId")
);

-- CreateTable
CREATE TABLE "Day" (
    "timesheetId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "dayId" INTEGER NOT NULL,
    "editorId" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("timesheetId","jobId","dayId")
);

-- CreateTable
CREATE TABLE "Entry" (
    "timesheetId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "dayId" INTEGER NOT NULL,
    "entryId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL,
    "timeInSeconds" INTEGER NOT NULL,
    "timeOutSeconds" INTEGER NOT NULL,
    "lunchSeconds" INTEGER NOT NULL,
    "entryType" "EntryType" NOT NULL,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("timesheetId","jobId","dayId","entryId")
);

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("timesheetId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("timesheetId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_timesheetId_jobId_fkey" FOREIGN KEY ("timesheetId", "jobId") REFERENCES "Job"("timesheetId", "jobId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "Account"("accountId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_timesheetId_jobId_dayId_fkey" FOREIGN KEY ("timesheetId", "jobId", "dayId") REFERENCES "Day"("timesheetId", "jobId", "dayId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_timesheetId_employeeId_fkey" FOREIGN KEY ("timesheetId", "employeeId") REFERENCES "Employee"("timesheetId", "employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;
