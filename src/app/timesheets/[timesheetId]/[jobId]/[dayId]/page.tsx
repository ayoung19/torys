import { TimesheetJobDayPage } from "@/components/TimesheetJobDayPage";
import prisma from "@/db";
import { StringifyValues } from "@/utils/types";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { AccountType, Day, Entry, EntryType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { z } from "zod";

const updateEntryBodySchema = z.object({
  entryId: z.string(),
  timeInSeconds: z.coerce.number().int(),
  timeOutSeconds: z.coerce.number().int(),
  lunchSeconds: z.coerce.number().int(),
  entryType: z.enum([EntryType.ROOFING, EntryType.CARPENTRY]),
});

const updateDayBodySchema = z.object({
  description: z.string(),
});

// Performs shared authorization checks and day modifications.
const handleEntry = async (
  timesheetId: string,
  jobId: string,
  dayId: string,
  cb: () => Promise<void>,
) => {
  const [actor, day] = await Promise.all([
    prisma.account.findUniqueOrThrow({
      where: {
        accountId: auth().userId || "",
      },
    }),
    prisma.day.findUniqueOrThrow({
      where: {
        dayPrimaryKey: {
          timesheetId,
          jobId,
          dayId: parseInt(dayId),
        },
      },
    }),
  ]);

  // Foreman can only modify days that have not been edited or that they've previously edited.
  if (
    actor.accountType === AccountType.FOREMAN &&
    day.editorId !== null &&
    actor.accountId !== day.editorId
  ) {
    throw new Error("forbidden");
  }

  await Promise.all([
    cb(),
    // Update editor if actor is a foreman.
    actor.accountType === AccountType.FOREMAN &&
      prisma.day.update({
        where: {
          dayPrimaryKey: {
            timesheetId,
            jobId,
            dayId: day.dayId,
          },
        },
        data: {
          editorId: actor.accountId,
        },
      }),
  ]);
};

export default async function Page({
  params,
}: {
  params: Promise<{ timesheetId: string; jobId: string; dayId: string }>;
}) {
  const { timesheetId, jobId, dayId } = await params;

  async function createEntry(employeeId: string) {
    "use server";

    await handleEntry(timesheetId, jobId, dayId, async () => {
      const employee = await prisma.employee.findUniqueOrThrow({
        where: {
          employeePrimaryKey: {
            timesheetId,
            employeeId,
          },
        },
      });

      // Can't add inactive employees.
      if (!employee.isActive) {
        throw new Error("forbidden");
      }

      await prisma.entry.create({
        data: {
          timesheetId,
          jobId,
          dayId: parseInt(dayId),
          employeeId,
          isValid: true,
          isConfirmed: false,
          timeInSeconds: 0,
          timeOutSeconds: 0,
          lunchSeconds: 0,
          entryType: EntryType.ROOFING,
        },
      });
    });

    revalidatePath(`/timesheets/${timesheetId}/${jobId}/${dayId}`);
  }

  async function updateEntry(
    body: Pick<
      StringifyValues<Entry>,
      "entryId" | "timeInSeconds" | "timeOutSeconds" | "lunchSeconds" | "entryType"
    >,
  ) {
    "use server";

    await handleEntry(timesheetId, jobId, dayId, async () => {
      const { entryId, timeInSeconds, timeOutSeconds, lunchSeconds, entryType } =
        updateEntryBodySchema.parse(body);

      if (
        timeInSeconds < 0 ||
        timeOutSeconds < 0 ||
        lunchSeconds < 0 ||
        timeOutSeconds - timeInSeconds - lunchSeconds < 0 ||
        // 86400 seconds in a day.
        timeOutSeconds > 86400 ||
        timeInSeconds > timeOutSeconds
      ) {
        throw new Error("forbidden");
      }

      const entry = await prisma.entry.findUniqueOrThrow({
        where: {
          entryPrimaryKey: {
            timesheetId,
            jobId,
            dayId: parseInt(dayId),
            entryId: entryId,
          },
        },
      });

      // Employee can't be in two places at once. [0, 0] never conflicts with any entry.
      const conflictingEntries = await prisma.entry.findMany({
        where: {
          timesheetId,
          dayId: parseInt(dayId),
          employeeId: entry.employeeId,
          entryId: {
            not: entry.entryId,
          },
          timeInSeconds: {
            lt: timeOutSeconds,
          },
          timeOutSeconds: {
            gt: timeInSeconds,
          },
        },
      });

      if (conflictingEntries.length > 0) {
        throw new Error("forbidden");
      }

      // TODO: Set isValid: false for certain conditions.

      await prisma.entry.update({
        where: {
          entryPrimaryKey: {
            timesheetId,
            jobId,
            dayId: parseInt(dayId),
            entryId: entryId,
          },
        },
        data: {
          timeInSeconds,
          timeOutSeconds,
          lunchSeconds,
          entryType,
        },
      });
    });

    revalidatePath(`/timesheets/${timesheetId}/${jobId}/${dayId}`);
  }

  async function deleteEntry(entryId: string) {
    "use server";

    await handleEntry(timesheetId, jobId, dayId, async () => {
      await prisma.entry.delete({
        where: {
          entryPrimaryKey: {
            timesheetId,
            jobId,
            dayId: parseInt(dayId),
            entryId,
          },
        },
      });
    });

    revalidatePath(`/timesheets/${timesheetId}/${jobId}/${dayId}`);
  }

  async function copyCrew() {
    "use server";

    await handleEntry(timesheetId, jobId, dayId, async () => {
      if (parseInt(dayId) === 0) {
        return;
      }

      const [previousDay, existingEntries] = await Promise.all([
        prisma.day.findUniqueOrThrow({
          where: {
            dayPrimaryKey: {
              timesheetId,
              jobId,
              dayId: parseInt(dayId) - 1,
            },
          },
          include: {
            entries: {
              include: {
                employee: true,
              },
            },
          },
        }),
        prisma.entry.findMany({
          where: {
            timesheetId,
            jobId,
            dayId: parseInt(dayId),
          },
        }),
      ]);

      const previousDayActiveEmployeeIds = Array.from(
        previousDay.entries.reduce<Set<string>>((acc, curr) => {
          if (curr.employee.isActive) {
            acc.add(curr.employeeId);
          }

          return acc;
        }, new Set()),
      );

      if (previousDayActiveEmployeeIds.length === 0) {
        // TODO: Return error/notification.
        return;
      }

      await Promise.allSettled([
        prisma.entry.createMany({
          data: previousDayActiveEmployeeIds.map((employeeId) => ({
            timesheetId,
            jobId,
            dayId: parseInt(dayId),
            employeeId,
            isValid: true,
            isConfirmed: false,
            timeInSeconds: 0,
            timeOutSeconds: 0,
            lunchSeconds: 0,
            entryType: EntryType.ROOFING,
          })),
        }),
        prisma.entry.deleteMany({
          where: {
            timesheetId,
            jobId,
            dayId: parseInt(dayId),
            entryId: {
              in: existingEntries.map((entry) => entry.entryId),
            },
          },
        }),
      ]);
    });

    revalidatePath(`/timesheets/${timesheetId}/${jobId}/${dayId}`);
  }

  async function updateDay(body: Pick<StringifyValues<Day>, "description">) {
    "use server";

    await handleEntry(timesheetId, jobId, dayId, async () => {
      const { description } = updateDayBodySchema.parse(body);

      await prisma.day.update({
        where: {
          dayPrimaryKey: {
            timesheetId,
            jobId,
            dayId: parseInt(dayId),
          },
        },
        data: {
          description,
        },
      });
    });

    revalidatePath(`/timesheets/${timesheetId}/${jobId}/${dayId}`);
  }

  const [employees, day] = await Promise.all([
    prisma.employee.findMany({
      where: {
        timesheetId,
      },
    }),
    prisma.day.findUnique({
      where: {
        dayPrimaryKey: {
          timesheetId,
          jobId,
          dayId: parseInt(dayId),
        },
      },
      include: {
        job: {
          include: {
            timesheet: true,
          },
        },
        entries: true,
        editor: true,
      },
    }),
  ]);

  if (day === null) {
    notFound();
  }

  const editorUsername =
    day.editor && (await clerkClient.users.getUser(day.editor.accountId)).username;

  return (
    <TimesheetJobDayPage
      timesheet={day.job.timesheet}
      job={day.job}
      day={day}
      entries={day.entries}
      employees={employees}
      editorUsername={editorUsername}
      createEntry={createEntry}
      updateEntry={updateEntry}
      deleteEntry={deleteEntry}
      copyCrew={copyCrew}
      updateDay={updateDay}
    />
  );
}
