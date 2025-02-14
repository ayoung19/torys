import prisma from "@/db";
import { currentTimesheetId } from "@/utils/date";
import { TZDate } from "@date-fns/tz";
import { EntryConfirmationStatus } from "@prisma/client";
import { getDay } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const From = formData.get("From");
  const Body = formData.get("Body");

  if (From === null || Body === null) {
    return NextResponse.json(
      {},
      {
        status: 400,
      },
    );
  }

  if (Body.toString().toLowerCase() !== "ok") {
    return NextResponse.json({});
  }

  // Confirm all entries today that were awaiting confirmation from the provided employee.
  await prisma.entry.updateMany({
    where: {
      timesheetId: currentTimesheetId(),
      dayId: getDay(TZDate.tz("Pacific/Honolulu")),
      entryConfirmationStatus: EntryConfirmationStatus.AWAITING,
      employee: {
        phoneNumber: From.toString().replace("+1", ""),
      },
    },
    data: {
      entryConfirmationStatus: EntryConfirmationStatus.CONFIRMED,
    },
  });

  return NextResponse.json({});
}
