import prisma from "@/db";
import { isStateOrFederal } from "@/utils/job";
import { computePayrollRecords } from "@/utils/payrollRecords";
import { JobType } from "@prisma/client";
import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import { match } from "ts-pattern";

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

  const records = computePayrollRecords(employees);

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

      records
        .filter((record) => record.employee.employeeId === employee.employeeId)
        .forEach((record) => {
          let centsPerHour = match(record.job.jobType)
            .with(JobType.PRIVATE, () => record.employee.ratePrivateCentsPerHour)
            .with(JobType.STATE, JobType.FEDERAL, () => record.employee.rateDavisBaconCentsPerHour)
            .exhaustive();
          let seconds = record.dayIdToSeconds.reduce((acc, curr) => acc + curr, 0);
          let cents = Math.ceil((seconds / 3600) * centsPerHour);
          let addedRow = sheet.addRow({
            Job: record.job.name,
            ID: record.employee.displayId,
            "Employee Name": record.employee.name,
            Rate: centsPerHour / 100,
            Sun: record.dayIdToSeconds[0] / 3600 || "",
            Mon: record.dayIdToSeconds[1] / 3600 || "",
            Tue: record.dayIdToSeconds[2] / 3600 || "",
            Wed: record.dayIdToSeconds[3] / 3600 || "",
            Thu: record.dayIdToSeconds[4] / 3600 || "",
            Fri: record.dayIdToSeconds[5] / 3600 || "",
            Sat: record.dayIdToSeconds[6] / 3600 || "",
            Hours: seconds / 3600,
            "Paid Out": cents / 100,
          });
          addedRow.eachCell((cell) => {
            if (isStateOrFederal(record.job.jobType)) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "ff34a853" },
              };
            }
          });
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
            addedRow = sheet.addRow({
              Job: record.job.name,
              ID: record.employee.displayId,
              "Employee Name": `${record.employee.name}/OT`,
              Rate: centsPerHour / 100,
              Sun: record.dayIdToOvertimeSeconds[0] / 3600 || "",
              Mon: record.dayIdToOvertimeSeconds[1] / 3600 || "",
              Tue: record.dayIdToOvertimeSeconds[2] / 3600 || "",
              Wed: record.dayIdToOvertimeSeconds[3] / 3600 || "",
              Thu: record.dayIdToOvertimeSeconds[4] / 3600 || "",
              Fri: record.dayIdToOvertimeSeconds[5] / 3600 || "",
              Sat: record.dayIdToOvertimeSeconds[6] / 3600 || "",
              Hours: seconds / 3600,
              "Paid Out": cents / 100,
            });
            addedRow.eachCell((cell) => {
              if (isStateOrFederal(record.job.jobType)) {
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
