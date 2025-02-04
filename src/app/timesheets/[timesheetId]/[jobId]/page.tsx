import { TimesheetJobDaysPage } from "@/components/TimesheetJobDaysPage";
import prisma from "@/db";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ timesheetId: string; jobId: string }>;
}) {
  const { timesheetId, jobId } = await params;

  const job = await prisma.job.findUnique({
    where: {
      jobPrimaryKey: {
        timesheetId,
        jobId,
      },
    },
    include: {
      timesheet: true,
      days: true,
    },
  });

  if (job === null) {
    notFound();
  }

  return <TimesheetJobDaysPage timesheet={job.timesheet} job={job} days={job.days} />;
}
