import { Account, AccountType } from "@prisma/client";

export const ACCOUNT_TYPES_DEV_ADMIN: AccountType[] = [AccountType.DEV, AccountType.ADMIN];

export const canActorModifyAccount = (actor: Account, account: Account) => {
  // Actor cannot modify their own account.
  if (actor.accountId === account.accountId) {
    return false;
  }

  // Actor must be active.
  if (!actor.isActive) {
    return false;
  }

  // Actor's role must be dev or admin.
  if (!ACCOUNT_TYPES_DEV_ADMIN.includes(actor.accountType)) {
    return false;
  }

  // If actor is admin, they can't modify dev or admin accounts.
  if (
    actor.accountType === AccountType.ADMIN &&
    ACCOUNT_TYPES_DEV_ADMIN.includes(account.accountType)
  ) {
    return false;
  }

  return true;
};
