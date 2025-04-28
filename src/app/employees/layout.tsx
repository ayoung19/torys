import { getActorOrThrow } from "@/utils/prisma";
import { AccountType } from "@prisma/client";
import { notFound } from "next/navigation";

export default async function EmployeesLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActorOrThrow();
  if (actor.accountType === AccountType.COORDINATOR || actor.accountType === AccountType.FOREMAN) {
    notFound();
  }

  return children;
}
