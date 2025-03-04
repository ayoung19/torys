import { DashboardPage } from "@/components/DashboardPage";
import prisma from "@/db";
import { ACCOUNT_TYPES_DEV_ADMIN } from "@/utils/account";
import { currentTimesheetId } from "@/utils/date";
import { getActorOrThrow } from "@/utils/prisma";
import { ActionResult } from "@/utils/types";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export default async function Page() {
  async function approveAction(
    jobId: string,
    dayId: string,
    entryId: string,
  ): Promise<ActionResult> {
    "use server";

    const actor = await getActorOrThrow();

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

    const actor = await getActorOrThrow();

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

  const [deniedEntries, timesheets, employees, jobs, activeJobsWithDays, users] = await Promise.all(
    [
      prisma.entry.findMany({
        where: {
          timesheetId: currentTimesheetId(),
          isApproved: false,
        },
      }),
      prisma.timesheet.findMany(),
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
      // Get all active jobs or jobs that were completed this week.
      prisma.job.findMany({
        where: {
          AND: [
            { timesheetId: currentTimesheetId() },
            {
              OR: [
                {
                  days: {
                    some: {
                      entries: {
                        some: {},
                      },
                    },
                  },
                },
                { isActive: true },
              ],
            },
          ],
        },
        include: {
          days: true,
        },
      }),
      (async () => {
        const totalCount = await clerkClient.users.getCount();

        return await clerkClient.users.getUserList({ limit: totalCount });
      })(),
    ],
  );

  return (
    <DashboardPage
      deniedEntries={deniedEntries}
      timesheets={timesheets}
      employees={employees}
      jobs={jobs}
      activeJobsWithDays={activeJobsWithDays}
      accountIdToUsername={users.data.reduce<Record<string, string>>((acc, curr) => {
        if (curr.username) {
          acc[curr.id] = curr.username;
        }

        return acc;
      }, {})}
      approveAction={approveAction}
      denyAction={denyAction}
    />
  );
}
