import prisma from "@/db";
import { auth } from "@clerk/nextjs/server";
import { AccountType } from "@prisma/client";
import { redirect } from "next/navigation";
import { match } from "ts-pattern";

export default async function Page() {
  const actor = await prisma.account.findUniqueOrThrow({
    where: {
      accountId: auth().userId || "",
    },
  });

  // TODO: Move this to middleware?
  match(actor.accountType)
    .with(AccountType.DEV, () => redirect("/dashboard"))
    .with(AccountType.ADMIN, () => redirect("/dashboard"))
    .with(AccountType.COORDINATOR, () => redirect("/jobs"))
    .with(AccountType.FOREMAN, () => redirect("/timesheets"))
    .exhaustive();
}
