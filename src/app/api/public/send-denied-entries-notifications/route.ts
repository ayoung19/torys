import prisma from "@/db";
import { currentTimesheetId } from "@/utils/date";
import { AccountType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  if (formData.get("apiKey") !== process.env.API_KEY) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const [activeAdminAccounts, deniedEntriesCount] = await Promise.all([
    prisma.account.findMany({
      where: {
        isActive: true,
        accountType: AccountType.ADMIN,
      },
    }),
    prisma.entry.count({
      where: {
        timesheetId: currentTimesheetId(),
        isApproved: false,
      },
    }),
  ]);

  if (deniedEntriesCount > 0) {
    await Promise.all(
      activeAdminAccounts.flatMap((activeAdminAccount) => {
        if (!activeAdminAccount?.phoneNumber) {
          return [];
        }

        return client.messages.create({
          body: `Number of entries awaiting review: ${deniedEntriesCount}

Approve or deny them at https://new.torystimesheet.com/`,
          from: "+18082044203",
          to: `+1${activeAdminAccount.phoneNumber}`,
        });
      }),
    );
  }

  return new NextResponse("Success", { status: 200 });
}
