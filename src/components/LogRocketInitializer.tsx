"use client";

import { Account } from "@prisma/client";
import LogRocket from "logrocket";
import { useEffect } from "react";

interface Props {
  actor: Account;
  actorUsername: string;
}

export const LogRocketInitializer = ({ actor, actorUsername }: Props) => {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      return;
    }

    LogRocket.init("torys/torys");

    LogRocket.identify(actor.accountId, {
      name: actorUsername,
    });
  }, [actor.accountId, actorUsername]);

  return null;
};
