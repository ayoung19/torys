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
    LogRocket.init("torys/torys");

    LogRocket.identify(actor.accountId, {
      name: actorUsername,
    });
  }, []);

  return null;
};
