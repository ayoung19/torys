/*
  Warnings:

  - You are about to drop the column `entryConfirmationStatus` on the `Entry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "entryConfirmationStatus";

-- DropEnum
DROP TYPE "EntryConfirmationStatus";
