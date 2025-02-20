import prisma from "@/db";
import {
  computePayrollRecords,
  recordToOvertimeTotal,
  recordToRegularTotal,
} from "@/utils/payrollRecords";
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

  const records = computePayrollRecords(employees);

  await Promise.all(
    Array.from(new Set(records.map((record) => record.job.jobId))).map((jobId) =>
      (async () => {
        const previousJob = await prisma.job.findUniqueOrThrow({
          where: {
            jobPrimaryKey: {
              timesheetId: previousTimesheet.timesheetId,
              jobId,
            },
          },
        });

        const { totalSeconds, totalCents } = records
          .filter((record) => record.job.jobId === jobId)
          .reduce(
            (acc, curr) => {
              const regularTotal = recordToRegularTotal(curr);
              const overtimeTotal = recordToOvertimeTotal(curr);

              return {
                totalSeconds: acc.totalSeconds + regularTotal.seconds + overtimeTotal.seconds,
                totalCents: acc.totalCents + regularTotal.cents + overtimeTotal.cents,
              };
            },
            { totalSeconds: 0, totalCents: 0 },
          );

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
                : previousJob.budgetCurrentCents - totalCents,
            currentLaborSeconds:
              previousJob.currentLaborSeconds === null
                ? undefined
                : previousJob.currentLaborSeconds - totalSeconds,
          },
        });
      })(),
    ),
  );

  return new NextResponse("Success", { status: 200 });
}
