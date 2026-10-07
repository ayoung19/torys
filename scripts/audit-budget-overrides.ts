import { z } from "zod";
import prisma from "../src/db";

// Read-only: lists MANUAL job-budget overrides since a cutoff.
//
// Human job edits (jobs/page.tsx) call createAction("upsert-job", ...); the
// update-budgets cron and the backfill write Job rows directly and never create
// an Action. So every upsert-job action is a human edit — making the audit log
// a precise detector of the manual corrections the reconciliation re-thread
// must NOT clobber. Any job listed here needs special handling (anchor the
// re-thread on the override, or reconcile it surgically) instead of a blind
// recompute from the 2026-08-01 baseline.
//
//   DATABASE_URL=... npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/audit-budget-overrides.ts [cutoffISO]
//
// cutoff defaults to just after the last clean cron run (2026-07-27).

const UpsertJobData = z
  .object({
    type: z.literal("upsert-job"),
    data: z
      .object({
        timesheetId: z.string(),
        budgetOriginalCents: z.number().nullable().optional(),
        budgetCurrentCents: z.number().nullable().optional(),
        currentLaborSeconds: z.number().nullable().optional(),
      })
      .passthrough(),
  })
  .passthrough();

async function main() {
  const cutoff = process.argv[2] ?? "2026-07-28";

  const actions = await prisma.action.findMany({
    where: { actionType: "upsert-job", timestamp: { gte: new Date(cutoff) } },
    orderBy: { timestamp: "asc" },
    include: { actor: true },
  });

  console.log(`upsert-job (human) actions since ${cutoff}: ${actions.length}`);
  console.log(
    "timestamp,actorId,actorPhone,jobId,weekEdited,budgetOriginalCents,budgetCurrentCents,currentLaborSeconds",
  );

  let parseErrors = 0;
  for (const action of actions) {
    const parsed = UpsertJobData.safeParse(action.actionJson);
    if (!parsed.success) {
      parseErrors += 1;
      console.log(
        `${action.timestamp.toISOString()},${action.actorId},,PARSE_ERROR,${action.targetId},,,,`,
      );
      continue;
    }
    const data = parsed.data.data;
    console.log(
      [
        action.timestamp.toISOString(),
        action.actorId,
        action.actor.phoneNumber,
        action.targetId,
        data.timesheetId,
        data.budgetOriginalCents ?? "",
        data.budgetCurrentCents ?? "",
        data.currentLaborSeconds ?? "",
      ].join(","),
    );
  }

  if (parseErrors > 0) {
    console.log(`\n(${parseErrors} actions failed to parse — inspect manually)`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
