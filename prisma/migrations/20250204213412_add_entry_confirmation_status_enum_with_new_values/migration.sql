-- CreateEnum
CREATE TYPE "EntryConfirmationStatus" AS ENUM ('UNINITIALIZED', 'AWAITING', 'CONFIRMED');

-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "entryConfirmationStatus" "EntryConfirmationStatus" NOT NULL DEFAULT 'UNINITIALIZED';
