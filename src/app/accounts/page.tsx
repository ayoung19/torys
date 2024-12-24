import { AccountsPage } from "@/components/AccountsPage";
import prisma from "@/db";
import { ACCOUNT_TYPES_DEV_ADMIN, canActorModifyAccount } from "@/utils/account";
import { StringifyValues } from "@/utils/types";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Account, AccountType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const accountSchema = z.object({
  accountId: z.string(),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true"),
  phoneNumber: z.string(),
  accountType: z.enum([
    AccountType.DEV,
    AccountType.ADMIN,
    AccountType.COORDINATOR,
    AccountType.FOREMAN,
  ]),
});

export default async function Page() {
  async function upsertAccountAction(account: StringifyValues<Account>) {
    "use server";

    const { accountId, ...rest } = accountSchema.parse(account);

    // Validate the account id with Clerk.
    await clerkClient.users.getUser(accountId);

    const actor = await prisma.account.findUniqueOrThrow({
      where: {
        accountId: auth().userId || "",
      },
    });

    // If actor is admin, they can't make dev or admin accounts.
    if (
      actor.accountType === AccountType.ADMIN &&
      ACCOUNT_TYPES_DEV_ADMIN.includes(rest.accountType)
    ) {
      throw new Error("forbidden");
    }

    const existingAccount = await prisma.account.findUnique({
      where: {
        accountId,
      },
    });

    if (existingAccount && !canActorModifyAccount(actor, existingAccount)) {
      throw new Error("forbidden");
    }

    await prisma.account.upsert({
      where: {
        accountId,
      },
      update: rest,
      create: {
        accountId,
        ...rest,
      },
    });

    revalidatePath("/accounts");
  }

  const [actor, accounts, users] = await Promise.all([
    prisma.account.findUniqueOrThrow({
      where: {
        accountId: auth().userId || "",
      },
    }),
    prisma.account.findMany(),
    (async () => {
      const totalCount = await clerkClient.users.getCount();

      return await clerkClient.users.getUserList({ limit: totalCount });
    })(),
  ]);

  return (
    <AccountsPage
      actor={actor}
      accounts={accounts}
      accountIdToUsername={users.data.reduce<Record<string, string>>((acc, curr) => {
        if (curr.username) {
          acc[curr.id] = curr.username;
        }

        return acc;
      }, {})}
      upsertAccountAction={upsertAccountAction}
    />
  );
}
