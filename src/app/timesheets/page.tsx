import { TimesheetJobsPage } from "@/components/TimesheetJobsPage";
import prisma from "@/db";
import { currentTimesheetId } from "@/utils/date";
import { notFound } from "next/navigation";

export default async function Page() {
  const timesheet = await prisma.timesheet.findUnique({
    where: {
      timesheetId: currentTimesheetId(),
    },
    include: {
      jobs: true,
    },
  });

  if (timesheet === null) {
    notFound();
  }

  return <TimesheetJobsPage timesheet={timesheet} jobs={timesheet.jobs} />;
}
