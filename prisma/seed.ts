import { AccountType, JobType, PrismaClient } from "@prisma/client";
import employeesJSON from "./employees.json";
import jobsJSON from "./jobs.json";

const prisma = new PrismaClient();

async function main() {
  await prisma.entry.deleteMany();
  await prisma.day.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.job.deleteMany();
  await prisma.timesheet.deleteMany();
  await prisma.action.deleteMany();
  await prisma.account.deleteMany();

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

  await prisma.timesheet.create({
    data: {
      timesheetId: "2025-05-03",
    },
  });

  await prisma.employee.createMany({
    data: employeesJSON.map((employee) => ({
      timesheetId: "2025-05-03",
      ...employee,
      fringeCode: "",
    })),
  });

  await prisma.job.createMany({
    data: jobsJSON.map((job) => ({
      timesheetId: "2025-05-03",
      ...job,
      jobType:
        job.jobType === "STATE"
          ? JobType.STATE
          : job.jobType === "FEDERAL"
            ? JobType.FEDERAL
            : JobType.PRIVATE,
    })),
  });

  const jobs = await prisma.job.findMany({
    where: {
      timesheetId: "2025-05-03",
    },
  });

  await prisma.day.createMany({
    data: jobs.flatMap((job) =>
      Array.from(Array(7).keys()).map((dayId) => ({
        timesheetId: "2025-05-03",
        jobId: job.jobId,
        dayId,
        description: "",
      })),
    ),
  });
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
