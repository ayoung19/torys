import { JobsPage } from "@/components/JobsPage";
import prisma from "@/db";
import { ACCOUNT_TYPES_DEV_ADMIN } from "@/utils/account";
import { currentTimesheetId } from "@/utils/date";
import { getActorOrThrow } from "@/utils/prisma";
import { ActionResult, Nullable, StringifyValues } from "@/utils/types";
import { Job, JobType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const jobSchema = z.object({
  timesheetId: z.string(),
  jobId: z.string(),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true"),
  name: z.string(),
  budgetOriginalCents: z.coerce.number().int().nullable(),
  budgetCurrentCents: z.coerce.number().int().nullable(),
  originalLaborSeconds: z.coerce.number().int().nullable(),
  currentLaborSeconds: z.coerce.number().int().nullable(),
  jobType: z.enum([JobType.PRIVATE, JobType.STATE, JobType.FEDERAL]),
});

export default async function Page() {
  async function upsertAction(
    job: Nullable<
      StringifyValues<Job>,
      "budgetOriginalCents" | "budgetCurrentCents" | "originalLaborSeconds" | "currentLaborSeconds"
    >,
  ): Promise<ActionResult> {
    "use server";

    const { timesheetId, jobId, ...rest } = jobSchema.parse(job);

    const actor = await getActorOrThrow();

    // Actor's role must be dev or admin.
    if (!ACCOUNT_TYPES_DEV_ADMIN.includes(actor.accountType)) {
      return { status: "error", message: "forbidden" };
    }

    const { oldJobId = 0 } =
      (await prisma.job.findFirst({
        where: {
          timesheetId,
        },
        orderBy: {
          oldJobId: "desc",
        },
      })) || {};

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
        oldJobId: oldJobId + 1,
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

    return null;
  }

  const jobs = await prisma.job.findMany({
    where: {
      timesheetId: currentTimesheetId(),
    },
  });

  return <JobsPage jobs={jobs} upsertAction={upsertAction} />;
}
