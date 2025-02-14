import prisma from "@/db";
import { isStateOrFederal } from "@/utils/job";
import { computePayrollRecords } from "@/utils/payrollRecords";
import { getActor } from "@/utils/prisma";
import { AccountType, JobType } from "@prisma/client";
import { addDays, format, parse, startOfWeek } from "date-fns";
import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import { match } from "ts-pattern";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ timesheetId: string }> },
) {
  const actor = await getActor();
  if (actor?.accountType !== AccountType.DEV && actor?.accountType !== AccountType.ADMIN) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { timesheetId } = await params;

  const employees = await prisma.employee.findMany({
    where: {
      timesheetId,
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

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet();
  sheet.columns = [
    {},
    { width: 32 },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
  ];

  const seen = new Set<string>();

  employees
    .flatMap((employee) => employee.entries.map((entry) => entry.day.job))
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .forEach((job) => {
      if (seen.has(job.jobId)) {
        return;
      }

      seen.add(job.jobId);

      const jobNameRow = sheet.addRow([
        "",
        job.name,
        "",
        ...[0, 1, 2, 3, 4, 5, 6].map((dayId) =>
          format(addDays(startOfWeek(parse(timesheetId, "yyyy-MM-dd", new Date())), dayId), "M/d"),
        ),
        "",
        "",
        "",
        "",
      ]);
      if (isStateOrFederal(job.jobType)) {
        jobNameRow.getCell(2).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "ff8ce99a" },
        };
      }

      if (!job.isActive) {
        const dayIdCompleted = Math.max(
          -Infinity,
          ...records
            .filter((record) => record.job.jobId === job.jobId)
            .flatMap((record) => [
              ...record.dayIdToSeconds.flatMap((seconds, dayId) => (seconds > 0 ? dayId : [])),
              ...record.dayIdToOvertimeSeconds.flatMap((seconds, dayId) =>
                seconds > 0 ? dayId : [],
              ),
            ]),
        );

        if (dayIdCompleted >= 0) {
          jobNameRow.getCell(dayIdCompleted + 4).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "ffffe066" },
          };
        }
      }

      sheet.addRow([
        "",
        "",
        "Rate",
        ...[0, 1, 2, 3, 4, 5, 6].map((dayId) =>
          format(addDays(startOfWeek(parse(timesheetId, "yyyy-MM-dd", new Date())), dayId), "E"),
        ),
        "Hours",
        "Paid Out",
        "Original Budget",
        "Remaining Budget",
        "Original Man Hours",
        "Remaining Man Hours",
      ]);

      let totalSeconds = 0;
      let totalCents = 0;

      records
        .filter((record) => record.job.jobId === job.jobId)
        .toSorted((a, b) => a.employee.name.localeCompare(b.employee.name))
        .forEach((record) => {
          let centsPerHour = match(record.job.jobType)
            .with(JobType.PRIVATE, () => record.employee.ratePrivateCentsPerHour)
            .with(JobType.STATE, JobType.FEDERAL, () => record.employee.rateDavisBaconCentsPerHour)
            .exhaustive();
          let seconds = record.dayIdToSeconds.reduce((acc, curr) => acc + curr, 0);
          let cents = Math.ceil((seconds / 3600) * centsPerHour);

          sheet.addRow([
            record.employee.displayId,
            record.employee.name,
            centsPerHour / 100,
            record.dayIdToSeconds[0] / 3600 || "",
            record.dayIdToSeconds[1] / 3600 || "",
            record.dayIdToSeconds[2] / 3600 || "",
            record.dayIdToSeconds[3] / 3600 || "",
            record.dayIdToSeconds[4] / 3600 || "",
            record.dayIdToSeconds[5] / 3600 || "",
            record.dayIdToSeconds[6] / 3600 || "",
            seconds / 3600 || "",
            cents / 100,
          ]);
          totalSeconds += seconds;
          totalCents += cents;

          centsPerHour = match(record.job.jobType)
            .with(JobType.PRIVATE, () => record.employee.ratePrivateCentsPerHour * 1.5)
            .with(
              JobType.STATE,
              JobType.FEDERAL,
              () => record.employee.rateDavisBaconOvertimeCentsPerHour,
            )
            .exhaustive();
          seconds = record.dayIdToOvertimeSeconds.reduce((acc, curr) => acc + curr, 0);
          cents = Math.ceil((seconds / 3600) * centsPerHour);
          if (seconds > 0) {
            const overtimeRow = sheet.addRow([
              record.employee.displayId,
              `${record.employee.name}/OT`,
              centsPerHour / 100,
              record.dayIdToOvertimeSeconds[0] / 3600 || "",
              record.dayIdToOvertimeSeconds[1] / 3600 || "",
              record.dayIdToOvertimeSeconds[2] / 3600 || "",
              record.dayIdToOvertimeSeconds[3] / 3600 || "",
              record.dayIdToOvertimeSeconds[4] / 3600 || "",
              record.dayIdToOvertimeSeconds[5] / 3600 || "",
              record.dayIdToOvertimeSeconds[6] / 3600 || "",
              seconds / 3600 || "",
              cents / 100,
            ]);
            overtimeRow.getCell(2).fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "ffb197fc" },
            };
            totalSeconds += seconds;
            totalCents += cents;
          }
        });

      sheet.addRow([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Total",
        totalSeconds / 3600,
        totalCents / 100,
        job.budgetOriginalCents !== null ? job.budgetOriginalCents / 100 : "",
        job.budgetCurrentCents !== null ? (job.budgetCurrentCents - totalCents) / 100 : "",
        job.originalLaborSeconds !== null ? job.originalLaborSeconds / 3600 : "",
        job.currentLaborSeconds !== null ? (job.currentLaborSeconds - totalSeconds) / 3600 : "",
      ]);
      sheet.addRow([]);
    });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="by-job-${timesheetId}.xlsx"`,
    },
  });
}
