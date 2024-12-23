import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const devAccount = await prisma.account.upsert({
    where: { accountId: "user_2lhyc7EmEuvzN8xWoE0TVWIcB1t" },
    update: {},
    create: {
      accountId: "user_2lhyc7EmEuvzN8xWoE0TVWIcB1t",
      isActive: true,
      phoneNumber: "",
      role: "dev",
    },
  });

  console.log(devAccount);
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
