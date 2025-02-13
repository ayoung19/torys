import { TimesheetJobDayPage } from "@/components/TimesheetJobDayPage";
import prisma from "@/db";
import { getActorOrThrow } from "@/utils/prisma";
import { ActionResult, StringifyValues } from "@/utils/types";
import { clerkClient } from "@clerk/nextjs/server";
import { TZDate } from "@date-fns/tz";
import { AccountType, Day, Entry, EntryConfirmationStatus } from "@prisma/client";
import { addDays, format, getDay, parse, startOfWeek } from "date-fns";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { match } from "ts-pattern";
import twilio from "twilio";
import { z } from "zod";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const updateEntryBodySchema = z.object({
  entryId: z.string(),
  timeInSeconds: z.coerce.number().int(),
  timeOutSeconds: z.coerce.number().int(),
  lunchSeconds: z.coerce.number().int(),
});

const updateDayBodySchema = z.object({
  description: z.string(),
});

// Performs shared authorization checks and day modifications.
const handleEntry = async (
  timesheetId: string,
  jobId: string,
  dayId: string,
  cb: () => Promise<ActionResult>,
): Promise<ActionResult> => {
  const [actor, day] = await Promise.all([
    getActorOrThrow(),
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

  // Foreman can only modify today.
  if (
    actor.accountType === AccountType.FOREMAN &&
    day.dayId !== getDay(TZDate.tz("Pacific/Honolulu"))
  ) {
    return { status: "error", message: "forbidden" };
  }

  // Foreman can only modify days that have not been edited or that they've previously edited.
  if (
    actor.accountType === AccountType.FOREMAN &&
    day.editorId !== null &&
    actor.accountId !== day.editorId
  ) {
    return { status: "error", message: "forbidden" };
  }

  const [result] = await Promise.all([
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

  revalidatePath(`/timesheets/${timesheetId}/${jobId}/${dayId}`);

  return result;
};

export default async function Page({
  params,
}: {
  params: Promise<{ timesheetId: string; jobId: string; dayId: string }>;
}) {
  const { timesheetId, jobId, dayId } = await params;

  async function createEntry(employeeId: string): Promise<ActionResult> {
    "use server";

    return await handleEntry(timesheetId, jobId, dayId, async () => {
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
        return { status: "error", message: "forbidden" };
      }

      await prisma.entry.create({
        data: {
          timesheetId,
          jobId,
          dayId: parseInt(dayId),
          employeeId,
          isApproved: true,
          entryConfirmationStatus: EntryConfirmationStatus.UNINITIALIZED,
          timeInSeconds: 0,
          timeOutSeconds: 0,
          lunchSeconds: 0,
        },
      });

      return null;
    });
  }

  async function updateEntry(
    body: Pick<
      StringifyValues<Entry>,
      "entryId" | "timeInSeconds" | "timeOutSeconds" | "lunchSeconds"
    >,
  ): Promise<ActionResult> {
    "use server";

    return await handleEntry(timesheetId, jobId, dayId, async () => {
      const { entryId, timeInSeconds, timeOutSeconds, lunchSeconds } =
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
        return { status: "error", message: "forbidden" };
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
        return { status: "error", message: "forbidden" };
      }

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
          entryConfirmationStatus: EntryConfirmationStatus.UNINITIALIZED,
          timeInSeconds,
          timeOutSeconds,
          lunchSeconds,
        },
      });

      // TODO: Make this trigger for foreman only.

      // Automatically approve entries if employee didn't work more than 8 hours for the day.
      const employeeEntries = await prisma.entry.findMany({
        where: {
          timesheetId,
          dayId: parseInt(dayId),
          employeeId: entry.employeeId,
        },
      });

      await prisma.entry.updateMany({
        where: {
          timesheetId,
          dayId: parseInt(dayId),
          employeeId: entry.employeeId,
          entryId: {
            in: employeeEntries.map((entry) => entry.entryId),
          },
        },
        data: {
          isApproved:
            employeeEntries.reduce(
              (acc, curr) => acc + curr.timeOutSeconds - curr.timeInSeconds - curr.lunchSeconds,
              0,
            ) <= 28800,
        },
      });

      // If entry is outside Monday-Friday 7am-4pm then deny the entry.
      if (dayId === "0" || dayId === "6" || timeInSeconds < 25200 || timeOutSeconds > 57600) {
        await prisma.entry.update({
          where: {
            entryPrimaryKey: {
              timesheetId,
              jobId: jobId,
              dayId: parseInt(dayId),
              entryId: entry.entryId,
            },
          },
          data: {
            isApproved: false,
          },
        });
      }

      return null;
    });
  }

  async function deleteEntry(entryId: string): Promise<ActionResult> {
    "use server";

    return await handleEntry(timesheetId, jobId, dayId, async () => {
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

      return null;
    });
  }

  async function copyCrew(): Promise<ActionResult> {
    "use server";

    return await handleEntry(timesheetId, jobId, dayId, async () => {
      const [previousDays, existingEntries] = await Promise.all([
        prisma.day.findMany({
          orderBy: [
            {
              timesheetId: "desc",
            },
            { dayId: "desc" },
          ],
          where: {
            OR: [
              {
                timesheetId: {
                  lt: timesheetId,
                },
              },
              {
                AND: [
                  {
                    timesheetId,
                  },
                  {
                    dayId: {
                      lt: parseInt(dayId),
                    },
                  },
                ],
              },
            ],
            jobId,
          },
          include: {
            entries: {
              include: {
                employee: true,
              },
            },
          },
          take: match(dayId)
            .with("0", () => 2)
            .with("1", () => 3)
            .otherwise(() => 1),
        }),
        prisma.entry.findMany({
          where: {
            timesheetId,
            jobId,
            dayId: parseInt(dayId),
          },
        }),
      ]);

      const previousDay = previousDays.find((day) => day.entries.length > 0);

      if (previousDay === undefined) {
        return { status: "info", message: "No crew to copy from previous day." };
      }

      const previousDayActiveEmployeeIds = Array.from(
        previousDay.entries.reduce<Set<string>>((acc, curr) => {
          if (curr.employee.isActive) {
            acc.add(curr.employeeId);
          }

          return acc;
        }, new Set()),
      );

      await Promise.all([
        prisma.entry.createMany({
          data: previousDayActiveEmployeeIds.map((employeeId) => ({
            timesheetId,
            jobId,
            dayId: parseInt(dayId),
            employeeId,
            isApproved: true,
            entryConfirmationStatus: EntryConfirmationStatus.UNINITIALIZED,
            timeInSeconds: 0,
            timeOutSeconds: 0,
            lunchSeconds: 0,
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

      return null;
    });
  }

  async function updateDay(body: Pick<StringifyValues<Day>, "description">): Promise<ActionResult> {
    "use server";

    return await handleEntry(timesheetId, jobId, dayId, async () => {
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

      return null;
    });
  }

  async function getConfirmations(): Promise<ActionResult> {
    "use server";

    return await handleEntry(timesheetId, jobId, dayId, async () => {
      const day = await prisma.day.findUniqueOrThrow({
        where: {
          dayPrimaryKey: {
            timesheetId,
            jobId,
            dayId: parseInt(dayId),
          },
        },
        include: {
          entries: true,
        },
      });

      const employeeIds = Array.from(new Set(day.entries.map((entry) => entry.employeeId)));

      const entries = await prisma.entry.findMany({
        where: {
          timesheetId,
          dayId: parseInt(dayId),
          employeeId: {
            in: employeeIds,
          },
        },
        include: {
          employee: true,
          day: {
            include: {
              job: true,
            },
          },
        },
      });

      await prisma.entry.updateMany({
        where: {
          timesheetId,
          jobId,
          dayId: parseInt(dayId),
          entryId: {
            in: entries
              .filter(
                (entry) => entry.entryConfirmationStatus === EntryConfirmationStatus.UNINITIALIZED,
              )
              .map((entry) => entry.entryId),
          },
          employee: {
            phoneNumber: {
              not: "",
            },
          },
        },
        data: {
          entryConfirmationStatus: EntryConfirmationStatus.AWAITING,
        },
      });

      await Promise.all(
        employeeIds.flatMap((employeeId) => {
          const employee = entries.find((entry) => entry.employeeId === employeeId)?.employee;
          JSON.stringify(
            entries.filter((entry) => entry.employeeId === employeeId),
            null,
            2,
          );
          if (!employee?.phoneNumber) {
            return [];
          }

          return client.messages.create({
            body: `Hi, ${employee.name}. We need you to confirm that the following timesheet is correct.
----
${entries
  .filter((entry) => entry.employeeId === employeeId)
  .toSorted((a, b) => a.timeInSeconds - b.timeInSeconds)
  .map(
    (entry) => `${format(
      addDays(startOfWeek(parse(entry.timesheetId, "yyyy-MM-dd", new Date())), entry.dayId),
      "E MMM dd",
    )}
    ${format(TZDate.tz("+00:00", entry.timeInSeconds * 1000), "hh:mm a")} to ${format(TZDate.tz("+00:00", entry.timeOutSeconds * 1000), "hh:mm a")}
    (${entry.day.job.name})`,
  )
  .join("\n")}
----
Respond 'OK' to this text to confirm these times. Contact your foreman if this information is incorrect.`,
            from: "+18082044203",
            to: `+1${employee.phoneNumber}`,
          });
        }),
      );

      return { status: "success", message: "Text confirmations have been sent." };
    });
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
      getConfirmations={getConfirmations}
    />
  );
}
