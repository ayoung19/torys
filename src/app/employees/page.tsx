import { EmployeesPage } from "@/components/EmployeesPage";
import prisma from "@/db";
import { ACCOUNT_TYPES_DEV_ADMIN } from "@/utils/account";
import { currentTimesheetId } from "@/utils/date";
import { StringifyValues } from "@/utils/types";
import { auth } from "@clerk/nextjs/server";
import { Employee } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const employeeSchema = z.object({
  timesheetId: z.string(),
  employeeId: z.string(),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true"),
  displayId: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  ratePrivateCentsPerHour: z.coerce.number().int(),
  rateDavisBaconCentsPerHour: z.coerce.number().int(),
  rateDavisBaconOvertimeCentsPerHour: z.coerce.number().int(),
});

export default async function Page() {
  async function upsertAction(employee: StringifyValues<Employee>) {
    "use server";

    const { timesheetId, employeeId, ...rest } = employeeSchema.parse(employee);

    const actor = await prisma.account.findUniqueOrThrow({
      where: {
        accountId: auth().userId || "",
      },
    });

    // Actor's role must be dev or admin.
    if (!ACCOUNT_TYPES_DEV_ADMIN.includes(actor.accountType)) {
      throw new Error("forbidden");
    }

    await prisma.employee.upsert({
      where: {
        employeePrimaryKey: {
          timesheetId,
          employeeId,
        },
      },
      update: rest,
      create: {
        timesheetId,
        ...rest,
      },
    });

    revalidatePath("/employees");
  }

  const employees = await prisma.employee.findMany({
    where: {
      timesheetId: currentTimesheetId(),
    },
  });

  return <EmployeesPage employees={employees} upsertAction={upsertAction} />;
}
