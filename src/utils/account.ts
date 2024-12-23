import { Account } from "@prisma/client";

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
  if (!["dev", "admin"].includes(actor.role)) {
    return false;
  }

  // If actor is admin, they can't modify dev or admin accounts.
  if (actor.role === "admin" && ["dev", "admin"].includes(account.role)) {
    return false;
  }

  return true;
};
