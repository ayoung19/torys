import { getActor } from "@/utils/prisma";
import { AccountType } from "@prisma/client";
import { redirect } from "next/navigation";
import { match } from "ts-pattern";

export default async function Page() {
  const actor = await getActor();

  // TODO: Move this to middleware?
  match(actor?.accountType)
    .with(undefined, () => redirect("/unauthorized"))
    .with(AccountType.DEV, () => redirect("/dashboard"))
    .with(AccountType.ADMIN, () => redirect("/dashboard"))
    .with(AccountType.COORDINATOR, () => redirect("/jobs"))
    .with(AccountType.FOREMAN, () => redirect("/timesheets"))
    .exhaustive();
}
