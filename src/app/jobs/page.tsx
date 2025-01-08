import { JobsPage } from "@/components/JobsPage";
import prisma from "@/db";
import { ACCOUNT_TYPES_DEV_ADMIN } from "@/utils/account";
import { currentTimesheetId } from "@/utils/date";
import { StringifyValues } from "@/utils/types";
import { auth } from "@clerk/nextjs/server";
import { Job, OvertimeType, RateType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const jobSchema = z.object({
  timesheetId: z.string(),
  jobId: z.string(),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true"),
  name: z.string(),
  budgetOriginalCents: z.coerce.number().int().nullable(),
  budgetCurrentCents: z.coerce.number().int().nullable(),
  rateType: z.enum([
    RateType.RESIDENTIAL,
    RateType.COMMERCIAL,
    RateType.DAVIS_BACON,
    RateType.DRIVE_TIME,
  ]),
  overtimeType: z.enum([OvertimeType.DAILY, OvertimeType.WEEKLY]),
});

export default async function Page() {
  async function upsertAction(job: StringifyValues<Job>) {
    "use server";

    const { timesheetId, jobId, ...rest } = jobSchema.parse(job);

    const actor = await prisma.account.findUniqueOrThrow({
      where: {
        accountId: auth().userId || "",
      },
    });

    // Actor's role must be dev or admin.
    if (!ACCOUNT_TYPES_DEV_ADMIN.includes(actor.accountType)) {
      throw new Error("forbidden");
    }

    const upsertedJob = await prisma.job.upsert({
      where: {
        jobPrimaryKey: {
          timesheetId,
          jobId,
        },
      },
      update: rest,
      create: {
        timesheetId,
        ...rest,
      },
    });

    await prisma.day.createMany({
      data: Array.from(Array(7).keys()).map((dayId) => ({
        timesheetId,
        jobId: upsertedJob.jobId,
        dayId,
        description: "",
      })),
      skipDuplicates: true,
    });

    revalidatePath("/jobs");
  }

  const jobs = await prisma.job.findMany({
    where: {
      timesheetId: currentTimesheetId(),
    },
  });

  return <JobsPage jobs={jobs} upsertAction={upsertAction} />;
}
