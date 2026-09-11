import prisma from "@/db";
import { timesheetLaborByJob } from "@/utils/payrollRecords";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  if (formData.get("apiKey") !== process.env.API_KEY) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const [currentTimesheet, previousTimesheet] = await prisma.timesheet.findMany({
    orderBy: {
      timesheetId: "desc",
    },
    take: 2,
  });

  const employees = await prisma.employee.findMany({
    where: {
      timesheetId: previousTimesheet.timesheetId,
    },
    include: {
      entries: {
        include: {
          day: {
            include: {
              job: true,
            },
          },
        },
      },
    },
  });

  await Promise.all(
    Array.from(timesheetLaborByJob(employees)).map(([jobId, labor]) =>
      (async () => {
        const previousJob = await prisma.job.findUniqueOrThrow({
          where: {
            jobPrimaryKey: {
              timesheetId: previousTimesheet.timesheetId,
              jobId,
            },
          },
        });

        await prisma.job.update({
          where: {
            jobPrimaryKey: {
              timesheetId: currentTimesheet.timesheetId,
              jobId,
            },
          },
          data: {
            budgetCurrentCents:
              previousJob.budgetCurrentCents === null
                ? undefined
                : previousJob.budgetCurrentCents - labor.cents,
            currentLaborSeconds:
              previousJob.currentLaborSeconds === null
                ? undefined
                : previousJob.currentLaborSeconds - labor.seconds,
          },
        });
      })(),
    ),
  );

  return new NextResponse("Success", { status: 200 });
}
