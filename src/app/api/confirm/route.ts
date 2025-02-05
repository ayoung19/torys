import prisma from "@/db";
import { currentTimesheetId } from "@/utils/date";
import { TZDate } from "@date-fns/tz";
import { EntryConfirmationStatus } from "@prisma/client";
import { getDay } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  From: z.string(),
});

export async function POST(req: NextRequest) {
  const { From } = schema.parse(await req.json());

  // Confirm all entries today that were awaiting confirmation from the provided employee.
  await prisma.entry.updateMany({
    where: {
      timesheetId: currentTimesheetId(),
      dayId: getDay(TZDate.tz("Pacific/Honolulu")),
      entryConfirmationStatus: EntryConfirmationStatus.AWAITING,
      employee: {
        phoneNumber: From.replace("+1", ""),
      },
    },
    data: {
      entryConfirmationStatus: EntryConfirmationStatus.CONFIRMED,
    },
  });

  return NextResponse.json({});
}
