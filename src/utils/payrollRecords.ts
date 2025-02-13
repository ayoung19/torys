import { Employee, Job, JobType, Prisma } from "@prisma/client";
import { isWeekend } from "./day";
import { isPrivateOrFederal, isStateOrFederal } from "./job";

type Record = {
  job: Job;
  employee: Employee;
  dayIdToSeconds: [number, number, number, number, number, number, number];
  dayIdToOvertimeSeconds: [number, number, number, number, number, number, number];
};

export const computePayrollRecords = (
  employees: Prisma.EmployeeGetPayload<{
    include: {
      entries: {
        include: {
          day: {
            include: {
              job: true;
            };
          };
        };
      };
    };
  }>[],
) => {
  const out: Record[] = [];

  employees.forEach((employee) => {
    const records: Record[] = [];

    // Weekend OT.
    employee.entries.forEach((entry) => {
      if (!entry.isApproved) {
        return;
      }

      const record = records.find((record) => record.job.jobId === entry.jobId);

      if (record === undefined) {
        const newRecord: Record = {
          job: entry.day.job,
          employee,
          dayIdToSeconds: [0, 0, 0, 0, 0, 0, 0],
          dayIdToOvertimeSeconds: [0, 0, 0, 0, 0, 0, 0],
        };

        // TODO: Federal holidays.
        newRecord[
          isWeekend(entry.dayId) && isStateOrFederal(entry.day.job.jobType)
            ? "dayIdToOvertimeSeconds"
            : "dayIdToSeconds"
        ][entry.dayId] += entry.timeOutSeconds - entry.timeInSeconds - entry.lunchSeconds;

        records.push(newRecord);
      } else {
        // TODO: Federal holidays.
        record[
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
      let seconds = records.reduce((acc, curr) => acc + curr.dayIdToSeconds[dayId], 0);

      employeeEntriesLatestToEarliest
        .filter((entry) => entry.dayId === dayId && entry.day.job.jobType === JobType.STATE)
        .forEach((entry) => {
          if (seconds > 28800) {
            const record = records.find(
              (record) =>
                record.job.jobId === entry.jobId && record.employee.employeeId === entry.employeeId,
            );

            if (record !== undefined) {
              const temp = Math.min(seconds - 28800, record.dayIdToSeconds[dayId]);

              record.dayIdToOvertimeSeconds[dayId] += temp;
              record.dayIdToSeconds[dayId] -= temp;
              seconds -= temp;
            }
          }
        });
    });

    // Weekly OT.
    let seconds = records
      .flatMap((record) => record.dayIdToSeconds)
      .reduce((acc, curr) => acc + curr, 0);

    employeeEntriesLatestToEarliest
      .filter((entry) => !isWeekend(entry.dayId) && isPrivateOrFederal(entry.day.job.jobType))
      .forEach((entry) => {
        if (seconds > 144000) {
          const record = records.find(
            (record) =>
              record.job.jobId === entry.jobId && record.employee.employeeId === entry.employeeId,
          );

          if (record !== undefined) {
            const temp = Math.min(seconds - 144000, record.dayIdToSeconds[entry.dayId]);

            record.dayIdToOvertimeSeconds[entry.dayId] += temp;
            record.dayIdToSeconds[entry.dayId] -= temp;
            seconds -= temp;
          }
        }
      });

    records.forEach((record) => out.push(record));
  });

  return out;
};
