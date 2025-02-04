/*
  Warnings:

  - You are about to drop the column `isConfirmed` on the `Entry` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EntryConfirmationStatus" AS ENUM ('INITIAL', 'TEXT_SENT', 'CONFIRMED');

-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "isConfirmed",
ADD COLUMN     "entryConfirmationStatus" "EntryConfirmationStatus" NOT NULL DEFAULT 'INITIAL';
