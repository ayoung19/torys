import { AccountType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (process.env.DEV_ACCOUNT_ID) {
    const devAccount = await prisma.account.upsert({
      where: { accountId: process.env.DEV_ACCOUNT_ID },
      update: {},
      create: {
        accountId: process.env.DEV_ACCOUNT_ID,
        isActive: true,
        phoneNumber: "",
        accountType: AccountType.DEV,
      },
    });

    console.log(devAccount);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
