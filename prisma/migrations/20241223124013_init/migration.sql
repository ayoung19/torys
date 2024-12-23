-- CreateTable
CREATE TABLE "Account" (
    "accountId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("accountId")
);
