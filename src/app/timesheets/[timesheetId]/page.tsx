import { TimesheetJobsPage } from "@/components/TimesheetJobsPage";
import prisma from "@/db";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ timesheetId: string }> }) {
  const { timesheetId } = await params;

  const timesheet = await prisma.timesheet.findUnique({
    where: {
      timesheetId,
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
