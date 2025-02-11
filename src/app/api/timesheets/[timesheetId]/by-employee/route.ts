import prisma from "@/db";
import { JobType } from "@prisma/client";
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
  employees.forEach((employee) => {
    const rows: Partial<{
      Job: string;
      ID: string;
      "Employee Name": string;
      Rate: number;
      Sun: number;
      Mon: number;
      Tue: number;
      Wed: number;
      Thu: number;
      Fri: number;
      Sat: number;
      Hours: number;
      "Paid Out": number;
      rowColor: string;
    }>[] = [];

    employee.entries.forEach((entry) => {
      if (!entry.isApproved) {
        return;
      }

      const i = rows.findIndex((row) => row.Job === entry.day.job.name);
      if (i === -1) {
        rows.push({
          Job: entry.day.job.name,
          ID: employee.displayId,
          "Employee Name": employee.name,
          Rate: match(entry.day.job.jobType)
            .with(JobType.PRIVATE, () => employee.ratePrivateCentsPerHour)
            .with(JobType.STATE, () => employee.rateDavisBaconCentsPerHour)
            .with(JobType.FEDERAL, () => employee.rateDavisBaconCentsPerHour)
            .exhaustive(),
          [dayIdToKey(entry.dayId)]:
            entry.timeOutSeconds - entry.timeInSeconds - entry.lunchSeconds,
          Hours: entry.timeOutSeconds - entry.timeInSeconds - entry.lunchSeconds,
          rowColor: match(entry.day.job.jobType)
            .with(JobType.PRIVATE, () => undefined)
            .with(JobType.STATE, () => "ff34a853")
            .with(JobType.FEDERAL, () => "ff34a853")
            .exhaustive(),
        });
      } else {
        rows[i][dayIdToKey(entry.dayId)] =
          (rows[i][dayIdToKey(entry.dayId)] || 0) +
          entry.timeOutSeconds -
          entry.timeInSeconds -
          entry.lunchSeconds;
        rows[i].Hours =
          (rows[i].Hours || 0) + entry.timeOutSeconds - entry.timeInSeconds - entry.lunchSeconds;
      }
    });

    for (const row of rows) {
      for (let i = 0; i < 7; i++) {
        row[dayIdToKey(i)] = (row[dayIdToKey(i)] || 0) / 3600;
      }
      row.Hours = (row.Hours || 0) / 3600;

      row["Paid Out"] = ((row.Hours || 0) * (row.Rate || 0)) / 100;
      row.Rate = (row.Rate || 0) / 100;
    }

    rows.forEach((row) => {
      const addedRow = sheet.addRow(
        Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value || ""])),
      );

      addedRow.eachCell((cell) => {
        if (row.rowColor) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: row.rowColor },
          };
        }
      });
    });

    if (rows.length > 0) {
      sheet.addRow({
        Job: "Total",
        Hours: rows.reduce((acc, curr) => acc + (curr.Hours || 0), 0),
        "Paid Out": rows.reduce((acc, curr) => acc + (curr["Paid Out"] || 0), 0),
      });
      sheet.addRow({});
    }
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
