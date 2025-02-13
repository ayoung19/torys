import prisma from "@/db";
import { isWeekend } from "@/utils/day";
import { isPrivateOrFederal, isStateOrFederal } from "@/utils/job";
import { computePayrollRecords } from "@/utils/payrollRecords";
import { Employee, Job, JobType } from "@prisma/client";
import { format, parse } from "date-fns";
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
    { header: "Co Code", key: "Co Code" },
    { header: "Batch ID", key: "Batch ID" },
    { header: "File #", key: "File #" },
    { header: "Temp Cost Number", key: "Temp Cost Number", width: 24 },
    { header: "Temp Rate", key: "Temp Rate" },
    { header: "Reg Hours", key: "Reg Hours" },
    { header: "O/T Hours", key: "O/T Hours" },
  ];

  employees
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .forEach((employee) => {
      if (employee.entries.length === 0) {
        return;
      }

      records
        .filter((record) => record.employee.employeeId === employee.employeeId)
        .forEach((record) => {
          record.dayIdToSeconds.forEach((seconds, dayId) => {
            if (seconds === 0) {
              return;
            }

            sheet.addRow({
              "Co Code": "1SI",
              "Batch ID": parseInt(format(parse(timesheetId, "yyyy-MM-dd", new Date()), "Mddyy")),
              "File #": parseInt(record.employee.displayId),
              "Temp Cost Number": `${record.job.oldJobId}-0${dayId}-RFR-${match(record.job.jobType)
                .with(JobType.PRIVATE, () => "N")
                .with(JobType.STATE, JobType.FEDERAL, () => `Y-${record.employee.fringeCode}`)
                .exhaustive()}`,
              "Temp Rate":
                match(record.job.jobType)
                  .with(JobType.PRIVATE, () => record.employee.ratePrivateCentsPerHour)
                  .with(
                    JobType.STATE,
                    JobType.FEDERAL,
                    () => record.employee.rateDavisBaconCentsPerHour,
                  )
                  .exhaustive() / 100,
              "Reg Hours": seconds / 3600,
              "O/T Hours": "",
            });
          });

          record.dayIdToOvertimeSeconds.forEach((seconds, dayId) => {
            if (seconds === 0) {
              return;
            }

            sheet.addRow({
              "Co Code": "1SI",
              "Batch ID": parseInt(format(parse(timesheetId, "yyyy-MM-dd", new Date()), "Mddyy")),
              "File #": parseInt(record.employee.displayId),
              "Temp Cost Number": `${record.job.oldJobId}-0${dayId}-RFR-${match(record.job.jobType)
                .with(JobType.PRIVATE, () => "N")
                .with(JobType.STATE, JobType.FEDERAL, () => `Y-${record.employee.fringeCode}`)
                .exhaustive()}`,
              "Temp Rate":
                match(record.job.jobType)
                  .with(JobType.PRIVATE, () => record.employee.ratePrivateCentsPerHour)
                  .with(JobType.STATE, JobType.FEDERAL, () =>
                    Math.ceil(record.employee.rateDavisBaconOvertimeCentsPerHour / 1.5),
                  )
                  .exhaustive() / 100,
              "Reg Hours": "",
              "O/T Hours": seconds / 3600,
            });
          });
        });
    });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="epi-${timesheetId}.xlsx"`,
    },
  });
}
