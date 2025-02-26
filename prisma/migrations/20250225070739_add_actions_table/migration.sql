-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "actionJson" JSONB NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Account"("accountId") ON DELETE RESTRICT ON UPDATE CASCADE;
