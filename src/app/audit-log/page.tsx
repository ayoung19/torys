import { AuditLogPage } from "@/components/AuditLogPage";
import prisma from "@/db";
import { currentTimesheetId } from "@/utils/date";
import { clerkClient } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

export default async function Page() {
  async function findFirstAction(args: Prisma.ActionFindFirstArgs) {
    "use server";

    const action = await prisma.action.findFirst(args);

    return action;
  }

  const [actions, users] = await Promise.all([
    prisma.action.findMany({
      orderBy: {
        timestamp: "desc",
      },
    }),
    (async () => {
      const totalCount = await clerkClient.users.getCount();

      return await clerkClient.users.getUserList({ limit: totalCount });
    })(),
  ]);

  const [employees, jobs, entries] = await Promise.all([
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
    prisma.entry.findMany({
      where: {
        timesheetId: currentTimesheetId(),
      },
    }),
  ]);

  return (
    <AuditLogPage
      actions={actions}
      employees={employees}
      jobs={jobs}
      entries={entries}
      accountIdToUsername={users.data.reduce<Record<string, string>>((acc, curr) => {
        if (curr.username) {
          acc[curr.id] = curr.username;
        }

        return acc;
      }, {})}
      findFirstAction={findFirstAction}
    />
  );
}
