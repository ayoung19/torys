import prisma from "@/db";
import { auth } from "@clerk/nextjs/server";

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
