import { TimesheetJobsPage } from "@/components/TimesheetJobsPage";
import prisma from "@/db";
import { currentTimesheetId } from "@/utils/date";
import { getActorOrThrow } from "@/utils/prisma";
import { AccountType } from "@prisma/client";
import { notFound } from "next/navigation";

export default async function Page() {
  const actor = await getActorOrThrow();

  const timesheet = await prisma.timesheet.findUnique({
    where: {
      timesheetId: currentTimesheetId(),
    },
    include: {
      jobs: {
        where: actor.accountType === AccountType.FOREMAN ? { isActive: true } : undefined,
      },
    },
  });

  if (timesheet === null) {
    notFound();
  }

  return <TimesheetJobsPage timesheet={timesheet} jobs={timesheet.jobs} />;
}
