/*
  Warnings:

  - Made the column `fringeCode` on table `Employee` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "fringeCode" SET NOT NULL,
ALTER COLUMN "fringeCode" DROP DEFAULT;
