import { getActorOrThrow } from "@/utils/prisma";
import { AccountType } from "@prisma/client";
import { notFound } from "next/navigation";

export default async function JobsLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActorOrThrow();
  if (actor.accountType === AccountType.FOREMAN) {
    notFound();
  }

  return children;
}
