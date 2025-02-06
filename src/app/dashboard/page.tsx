import { DashboardPage } from "@/components/DashboardPage";
import prisma from "@/db";
import { ACCOUNT_TYPES_DEV_ADMIN } from "@/utils/account";
import { currentTimesheetId } from "@/utils/date";
import { ActionResult } from "@/utils/types";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export default async function Page() {
  async function approveAction(
    jobId: string,
    dayId: string,
    entryId: string,
  ): Promise<ActionResult> {
    "use server";

    const actor = await prisma.account.findUniqueOrThrow({
      where: {
        accountId: auth().userId || "",
      },
    });

    if (!ACCOUNT_TYPES_DEV_ADMIN.includes(actor.accountType)) {
      return { status: "error", message: "forbidden" };
    }

    await prisma.entry.update({
      where: {
        entryPrimaryKey: {
          timesheetId: currentTimesheetId(),
          jobId,
          dayId: parseInt(dayId),
          entryId,
        },
      },
      data: {
        isApproved: true,
      },
    });

    revalidatePath("/dashboard");

    return null;
  }
  async function denyAction(jobId: string, dayId: string, entryId: string): Promise<ActionResult> {
    "use server";

    const actor = await prisma.account.findUniqueOrThrow({
      where: {
        accountId: auth().userId || "",
      },
    });

    if (!ACCOUNT_TYPES_DEV_ADMIN.includes(actor.accountType)) {
      return { status: "error", message: "forbidden" };
    }

    await prisma.entry.delete({
      where: {
        entryPrimaryKey: {
          timesheetId: currentTimesheetId(),
          jobId,
          dayId: parseInt(dayId),
          entryId,
        },
      },
    });

    revalidatePath("/dashboard");

    return null;
  }

  const [deniedEntries, employees, jobs] = await Promise.all([
    prisma.entry.findMany({
      where: {
        timesheetId: currentTimesheetId(),
        isApproved: false,
      },
    }),
    prisma.employee.findMany({
      where: {
        timesheetId: currentTimesheetId(),
      },
    }),
    prisma.job.findMany({
      where: {
        timesheetId: currentTimesheetId(),
      },
    }),
  ]);

  return (
    <DashboardPage
      deniedEntries={deniedEntries}
      employees={employees}
      jobs={jobs}
      approveAction={approveAction}
      denyAction={denyAction}
    />
  );
}
