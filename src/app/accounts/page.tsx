import { AccountsPage } from "@/components/AccountsPage";
import prisma from "@/db";
import { ACCOUNT_TYPES_DEV_ADMIN, canActorModifyAccount } from "@/utils/account";
import { createAction, getActor, getActorOrThrow } from "@/utils/prisma";
import { ActionResult, StringifyValues } from "@/utils/types";
import { clerkClient } from "@clerk/nextjs/server";
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
  async function upsertAccountAction(account: StringifyValues<Account>): Promise<ActionResult> {
    "use server";

    const { accountId, ...rest } = accountSchema.parse(account);

    // Validate the account id with Clerk.
    await clerkClient.users.getUser(accountId);

    const actor = await getActorOrThrow();

    // If actor is admin, they can't make dev or admin accounts.
    if (
      actor.accountType === AccountType.ADMIN &&
      ACCOUNT_TYPES_DEV_ADMIN.includes(rest.accountType)
    ) {
      return { status: "error", message: "forbidden" };
    }

    const existingAccount = await prisma.account.findUnique({
      where: {
        accountId,
      },
    });

    if (existingAccount && !canActorModifyAccount(actor, existingAccount)) {
      return { status: "error", message: "forbidden" };
    }

    const upsertedAccount = await prisma.account.upsert({
      where: {
        accountId,
      },
      update: rest,
      create: {
        accountId,
        ...rest,
      },
    });

    await createAction(actor, upsertedAccount.accountId, {
      type: "upsert-account",
      data: upsertedAccount,
    });

    revalidatePath("/accounts");

    return null;
  }

  const [actor, accounts, users] = await Promise.all([
    getActor(),
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
