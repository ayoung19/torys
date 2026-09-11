import prisma from "@/db";
import { computeBackfill, JobLedger, WeeklyLabor } from "@/utils/budgets";
import { timesheetLaborByJob } from "@/utils/payrollRecords";
import { NextRequest, NextResponse } from "next/server";

// One-off recovery for weeks the `update-budgets` cron missed (e.g. while
// GitHub Actions was disabled). Replays every weekly settlement in
// [fromTimesheetId, toTimesheetId] in a single deterministic, idempotent pass.
// Defaults to a dry run — pass `dryRun=false` to write.
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  if (formData.get("apiKey") !== process.env.API_KEY) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const fromTimesheetId = formData.get("fromTimesheetId");
  const toTimesheetId = formData.get("toTimesheetId");
  if (typeof fromTimesheetId !== "string" || typeof toTimesheetId !== "string") {
    return new NextResponse("Missing fromTimesheetId or toTimesheetId", { status: 400 });
  }

  const dryRun = formData.get("dryRun") !== "false";

  const weeks = (
    await prisma.timesheet.findMany({
      where: {
        timesheetId: {
          gte: fromTimesheetId,
          lte: toTimesheetId,
        },
      },
      orderBy: {
        timesheetId: "asc",
      },
    })
  ).map((timesheet) => timesheet.timesheetId);

  if (weeks.length < 2) {
    return NextResponse.json(
      { error: "range must span at least two timesheets", weeks },
      { status: 400 },
    );
  }

  const jobsByWeek = new Map<string, Map<string, JobLedger>>(
    await Promise.all(
      weeks.map(async (timesheetId): Promise<[string, Map<string, JobLedger>]> => {
        const jobs = await prisma.job.findMany({ where: { timesheetId } });

        return [
          timesheetId,
          new Map(
            jobs.map((job) => [
              job.jobId,
              {
                budgetCurrentCents: job.budgetCurrentCents,
                currentLaborSeconds: job.currentLaborSeconds,
              },
            ]),
          ),
        ];
      }),
    ),
  );

  // Labor is only needed for weeks acting as a settlement source (all but the last).
  const laborByWeek = new Map<string, Map<string, WeeklyLabor>>(
    await Promise.all(
      weeks.slice(0, -1).map(async (timesheetId): Promise<[string, Map<string, WeeklyLabor>]> => {
        const employees = await prisma.employee.findMany({
          where: { timesheetId },
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

        return [timesheetId, timesheetLaborByJob(employees)];
      }),
    ),
  );

  const updates = computeBackfill(weeks, jobsByWeek, laborByWeek);

  if (!dryRun) {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.job.update({
          where: {
            jobPrimaryKey: {
              timesheetId: update.timesheetId,
              jobId: update.jobId,
            },
          },
          data: {
            budgetCurrentCents: update.budgetCurrentCents.to ?? undefined,
            currentLaborSeconds: update.currentLaborSeconds.to ?? undefined,
          },
        }),
      ),
    );
  }

  return NextResponse.json({
    dryRun,
    settledPairs: weeks.slice(0, -1).map((week, i) => `${week} → ${weeks[i + 1]}`),
    jobsAffected: new Set(updates.map((update) => update.jobId)).size,
    updates,
  });
}
