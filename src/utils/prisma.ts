import prisma from "@/db";
import { auth } from "@clerk/nextjs/server";
import { Account } from "@prisma/client";
import { ActionJson } from "./action";

export const getActor = async () => {
  return await prisma.account.findUnique({
    where: {
      accountId: auth().userId || "",
      isActive: true,
    },
  });
};

export const getActorOrThrow = async () => {
  return await prisma.account.findUniqueOrThrow({
    where: {
      accountId: auth().userId || "",
      isActive: true,
    },
  });
};

export const createAction = async (actor: Account, targetId: string, actionJson: ActionJson) => {
  return await prisma.action.create({
    data: {
      actorId: actor.accountId,
      targetId,
      actionType: actionJson.type,
      actionJson,
    },
  });
};
