import prisma from "@/db";
import { isWeekend } from "@/utils/day";
import { isPrivateOrFederal, isStateOrFederal } from "@/utils/job";
import { Employee, Job, JobType } from "@prisma/client";
import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import { match } from "ts-pattern";

const dayIdToKey = (dayId: number) =>
  match(dayId)
    .with(0, () => "Sun" as const)
    .with(1, () => "Mon" as const)
    .with(2, () => "Tue" as const)
    .with(3, () => "Wed" as const)
    .with(4, () => "Thu" as const)
    .with(5, () => "Fri" as const)
    .with(6, () => "Sat" as const)
    .run();

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ timesheetId: string }> },
) {
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

  type Row = {
    job: Job;
    employee: Employee;
    dayIdToSeconds: [number, number, number, number, number, number, number];
    dayIdToOvertimeSeconds: [number, number, number, number, number, number, number];
  };

  const allRows: Row[] = [];

  employees.forEach((employee) => {
    const rows: Row[] = [];

    // Weekend OT.
    employee.entries.forEach((entry) => {
      const row = rows.find((row) => row.job.jobId === entry.jobId);

      if (row === undefined) {
        const newRow: Row = {
          job: entry.day.job,
          employee,
          dayIdToSeconds: [0, 0, 0, 0, 0, 0, 0],
          dayIdToOvertimeSeconds: [0, 0, 0, 0, 0, 0, 0],
        };

        newRow[
          isWeekend(entry.dayId) && isStateOrFederal(entry.day.job.jobType)
            ? "dayIdToOvertimeSeconds"
            : "dayIdToSeconds"
        ][entry.dayId] = entry.timeOutSeconds - entry.timeInSeconds - entry.lunchSeconds;

        rows.push(newRow);
      } else {
        row[
          isWeekend(entry.dayId) && isStateOrFederal(entry.day.job.jobType)
            ? "dayIdToOvertimeSeconds"
            : "dayIdToSeconds"
        ][entry.dayId] += entry.timeOutSeconds - entry.timeInSeconds - entry.lunchSeconds;
      }
    });

    const employeeEntriesLatestToEarliest = employee.entries
      .toSorted((a, b) => b.timeOutSeconds - a.timeOutSeconds)
      .toSorted((a, b) => b.dayId - a.dayId);

    // Daily OT.
    ([1, 2, 3, 4, 5] as const).forEach((dayId) => {
      let seconds = rows.reduce((acc, curr) => acc + curr.dayIdToSeconds[dayId], 0);

      employeeEntriesLatestToEarliest
        .filter((entry) => entry.dayId === dayId && entry.day.job.jobType === JobType.STATE)
        .forEach((entry) => {
          if (seconds > 28800) {
            const row = rows.find(
              (row) =>
                row.job.jobId === entry.jobId && row.employee.employeeId === entry.employeeId,
            );

            if (row !== undefined) {
              const temp = Math.min(seconds - 28800, row.dayIdToSeconds[dayId]);

              row.dayIdToOvertimeSeconds[dayId] += temp;
              row.dayIdToSeconds[dayId] -= temp;
              seconds -= temp;
            }
          }
        });
    });

    // Weekly OT.
    let seconds = rows.flatMap((row) => row.dayIdToSeconds).reduce((acc, curr) => acc + curr, 0);

    employeeEntriesLatestToEarliest
      .filter((entry) => !isWeekend(entry.dayId) && isPrivateOrFederal(entry.day.job.jobType))
      .forEach((entry) => {
        if (seconds > 144000) {
          const row = rows.find(
            (row) => row.job.jobId === entry.jobId && row.employee.employeeId === entry.employeeId,
          );

          if (row !== undefined) {
            const temp = Math.min(seconds - 144000, row.dayIdToSeconds[entry.dayId]);

            row.dayIdToOvertimeSeconds[entry.dayId] += temp;
            row.dayIdToSeconds[entry.dayId] -= temp;
            seconds -= temp;
          }
        }
      });

    rows.forEach((row) => allRows.push(row));
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet();
  sheet.columns = [
    { header: "Job", key: "Job", width: 32 },
    { header: "ID", key: "ID" },
    { header: "Employee Name", key: "Employee Name", width: 32 },
    { header: "Rate", key: "Rate" },
    { header: "Sun", key: "Sun" },
    { header: "Mon", key: "Mon" },
    { header: "Tue", key: "Tue" },
    { header: "Wed", key: "Wed" },
    { header: "Thu", key: "Thu" },
    { header: "Fri", key: "Fri" },
    { header: "Sat", key: "Sat" },
    { header: "Hours", key: "Hours" },
    { header: "Paid Out", key: "Paid Out" },
  ];

  employees
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .forEach((employee) => {
      if (employee.entries.length === 0) {
        return;
      }

      let totalSeconds = 0;
      let totalCents = 0;

      allRows
        .filter((row) => row.employee.employeeId === employee.employeeId)
        .forEach((row) => {
          let centsPerHour = match(row.job.jobType)
            .with(JobType.PRIVATE, () => row.employee.ratePrivateCentsPerHour)
            .with(JobType.STATE, JobType.FEDERAL, () => row.employee.rateDavisBaconCentsPerHour)
            .exhaustive();
          let seconds = row.dayIdToSeconds.reduce((acc, curr) => acc + curr, 0);
          let cents = Math.ceil((seconds / 3600) * centsPerHour);
          let addedRow = sheet.addRow({
            Job: row.job.name,
            ID: row.employee.displayId,
            "Employee Name": row.employee.name,
            Rate: centsPerHour / 100,
            Sun: row.dayIdToSeconds[0] / 3600 || "",
            Mon: row.dayIdToSeconds[1] / 3600 || "",
            Tue: row.dayIdToSeconds[2] / 3600 || "",
            Wed: row.dayIdToSeconds[3] / 3600 || "",
            Thu: row.dayIdToSeconds[4] / 3600 || "",
            Fri: row.dayIdToSeconds[5] / 3600 || "",
            Sat: row.dayIdToSeconds[6] / 3600 || "",
            Hours: seconds / 3600,
            "Paid Out": cents / 100,
          });
          addedRow.eachCell((cell) => {
            if (isStateOrFederal(row.job.jobType)) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "ff34a853" },
              };
            }
          });
          totalSeconds += seconds;
          totalCents += cents;

          centsPerHour = match(row.job.jobType)
            .with(JobType.PRIVATE, () => row.employee.ratePrivateCentsPerHour * 1.5)
            .with(
              JobType.STATE,
              JobType.FEDERAL,
              () => row.employee.rateDavisBaconOvertimeCentsPerHour,
            )
            .exhaustive();
          seconds = row.dayIdToOvertimeSeconds.reduce((acc, curr) => acc + curr, 0);
          cents = Math.ceil((seconds / 3600) * centsPerHour);
          if (seconds > 0) {
            addedRow = sheet.addRow({
              Job: row.job.name,
              ID: row.employee.displayId,
              "Employee Name": `${row.employee.name}/OT`,
              Rate: centsPerHour / 100,
              Sun: row.dayIdToOvertimeSeconds[0] / 3600 || "",
              Mon: row.dayIdToOvertimeSeconds[1] / 3600 || "",
              Tue: row.dayIdToOvertimeSeconds[2] / 3600 || "",
              Wed: row.dayIdToOvertimeSeconds[3] / 3600 || "",
              Thu: row.dayIdToOvertimeSeconds[4] / 3600 || "",
              Fri: row.dayIdToOvertimeSeconds[5] / 3600 || "",
              Sat: row.dayIdToOvertimeSeconds[6] / 3600 || "",
              Hours: seconds / 3600,
              "Paid Out": cents / 100,
            });
            addedRow.eachCell((cell) => {
              if (isStateOrFederal(row.job.jobType)) {
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "ff34a853" },
                };
              }
            });
            totalSeconds += seconds;
            totalCents += cents;
          }
        });

      sheet.addRow({
        Job: "Total",
        Hours: totalSeconds / 3600,
        "Paid Out": totalCents / 100,
      });
      sheet.addRow({});
    });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="by-employee-${timesheetId}.xlsx"`,
    },
  });
}
