import { getActorOrThrow } from "@/utils/prisma";
import { AccountType } from "@prisma/client";
import { notFound } from "next/navigation";

export default async function TimesheetsLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActorOrThrow();
  if (actor.accountType === AccountType.COORDINATOR) {
    notFound();
  }

  return children;
}
