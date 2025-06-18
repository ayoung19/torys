import prisma from "@/db";
import { getActor } from "@/utils/prisma";
import { TZDate } from "@date-fns/tz";
import { AccountType, Entry } from "@prisma/client";
import { addDays, format, parse, startOfWeek } from "date-fns";
import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ timesheetId: string; jobId: string }> },
) {
  const actor = await getActor();
  if (actor?.accountType !== AccountType.DEV && actor?.accountType !== AccountType.ADMIN) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { timesheetId, jobId } = await params;

  const [employees, job] = await Promise.all([
    prisma.employee.findMany({
      where: {
        timesheetId,
        entries: {
          some: {
            jobId,
          },
        },
      },
      include: {
        entries: {
          where: {
            jobId,
          },
          include: {
            day: {
              include: {
                job: true,
              },
            },
          },
        },
      },
    }),
    prisma.job.findUniqueOrThrow({
      where: {
        jobPrimaryKey: {
          timesheetId,
          jobId,
        },
      },
      include: {
        days: true,
      },
    }),
  ]);

  const employeeIdToDayIdToEntries: Record<string, Record<number, Entry[]>> = {};

  employees.forEach((employee) => {
    employee.entries.forEach((entry) => {
      if (!employeeIdToDayIdToEntries[employee.employeeId]) {
        employeeIdToDayIdToEntries[employee.employeeId] = {};
      }

      if (!employeeIdToDayIdToEntries[employee.employeeId][entry.dayId]) {
        employeeIdToDayIdToEntries[employee.employeeId][entry.dayId] = [];
      }

      employeeIdToDayIdToEntries[employee.employeeId][entry.dayId].push(entry);
    });
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet();
  sheet.columns = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];

  sheet.addRow(["Tory's Roofing", ...Array(employees.length).fill(""), "Job:", job.name]);
  sheet.addRow(["Timesheet", ...Array(employees.length).fill(""), "Week Ending:", timesheetId]);
  sheet.addRow(["Day", "Date", "Names:", ...employees.map((employee) => employee.name)]);

  job.days
    .toSorted((day) => day.dayId - day.dayId)
    .forEach(({ dayId }) => {
      const d = addDays(startOfWeek(parse(timesheetId, "yyyy-MM-dd", new Date())), dayId);

      sheet.addRow([
        format(d, "E"),
        format(d, "MM/dd"),
        "Time In:",
        ...employees.map((employee) =>
          employeeIdToDayIdToEntries[employee.employeeId][dayId]
            ? employeeIdToDayIdToEntries[employee.employeeId][dayId]
                .map((entry) => format(TZDate.tz("+00:00", entry.timeInSeconds * 1000), "hh:mmaaa"))
                .join(", ")
            : "",
        ),
      ]);
      sheet.addRow([
        "",
        "",
        "Time Out:",
        ...employees.map((employee) =>
          employeeIdToDayIdToEntries[employee.employeeId][dayId]
            ? employeeIdToDayIdToEntries[employee.employeeId][dayId]
                .map((entry) =>
                  format(TZDate.tz("+00:00", entry.timeOutSeconds * 1000), "hh:mmaaa"),
                )
                .join(", ")
            : "",
        ),
      ]);
      sheet.addRow([
        "",
        "",
        "Total Hours:",
        ...employees.map((employee) =>
          employeeIdToDayIdToEntries[employee.employeeId][dayId]
            ? employeeIdToDayIdToEntries[employee.employeeId][dayId]
                .map(
                  (entry) =>
                    (entry.timeOutSeconds - entry.timeInSeconds - entry.lunchSeconds) / 3600,
                )
                .reduce((acc, curr) => acc + curr, 0)
            : "",
        ),
      ]);
    });

  sheet.addRow([
    "",
    "",
    "Grand Total Hours:",
    ...employees.map(
      (employee) =>
        employee.entries
          .map((entry) => entry.timeOutSeconds - entry.timeInSeconds - entry.lunchSeconds)
          .reduce((acc, curr) => acc + curr, 0) / 3600,
    ),
  ]);

  sheet.addRow(["Date", "Description of Work"]);

  job.days
    .toSorted((day) => day.dayId - day.dayId)
    .forEach((day) => {
      const d = addDays(startOfWeek(parse(timesheetId, "yyyy-MM-dd", new Date())), day.dayId);

      sheet.addRow([format(d, "MM/dd"), day.description]);
    });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${job.name}-${timesheetId}.xlsx"`,
    },
  });
}
