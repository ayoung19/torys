import prisma from "../src/db";
import { timesheetLaborByJob } from "../src/utils/payrollRecords";

// Independent, from-first-principles verification of the budget ledger.
//
// For every job in the current (latest) week it reconstructs the expected
// remaining budget purely as:
//
//     budgetOriginalCents − (total approved labor across ALL prior weeks)
//
// and diffs that against the stored budgetCurrentCents. This trusts NONE of the
// backfill's anchoring logic — it walks each job back to its contract origin —
// so if it lands on the same jobs/amounts as the backfill's proposed values,
// the correction is objectively confirmed rather than merely internally
// consistent. Read-only; safe to run against production.
//
//   DATABASE_URL=... npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/verify-budgets.ts

async function main() {
  const timesheets = await prisma.timesheet.findMany({ orderBy: { timesheetId: "asc" } });
  if (timesheets.length < 2) {
    console.log("not enough timesheets to verify");
    return;
  }

  const weeks = timesheets.map((timesheet) => timesheet.timesheetId);
  const currentWeek = weeks[weeks.length - 1];
  const priorWeeks = weeks.slice(0, -1);

  console.log(
    `current week: ${currentWeek}; summing approved labor across ${priorWeeks.length} prior weeks...`,
  );

  // Total approved labor per jobId across every completed week, using the app's
  // own payroll calculation as ground truth.
  const laborByJob = new Map<string, { cents: number; seconds: number }>();
  for (const timesheetId of priorWeeks) {
    const employees = await prisma.employee.findMany({
      where: { timesheetId },
      include: { entries: { include: { day: { include: { job: true } } } } },
    });
    timesheetLaborByJob(employees).forEach((labor, jobId) => {
      const prev = laborByJob.get(jobId) ?? { cents: 0, seconds: 0 };
      laborByJob.set(jobId, {
        cents: prev.cents + labor.cents,
        seconds: prev.seconds + labor.seconds,
      });
    });
  }

  const currentJobs = await prisma.job.findMany({ where: { timesheetId: currentWeek } });

  let budgetedWithoutOrigin = 0;
  const offBy: { jobId: string; origin: number; stored: number; expected: number; diff: number }[] =
    [];

  for (const job of currentJobs) {
    if (job.budgetCurrentCents === null) continue; // untracked budget — nothing to verify
    if (job.budgetOriginalCents === null) {
      budgetedWithoutOrigin += 1; // running budget with no origin to anchor on
      continue;
    }
    const labor = laborByJob.get(job.jobId) ?? { cents: 0, seconds: 0 };
    const expected = job.budgetOriginalCents - labor.cents;
    const diff = job.budgetCurrentCents - expected; // > 0 ⇒ budget overstated
    if (diff !== 0) {
      offBy.push({
        jobId: job.jobId,
        origin: job.budgetOriginalCents,
        stored: job.budgetCurrentCents,
        expected,
        diff,
      });
    }
  }

  offBy.sort((a, b) => b.diff - a.diff);
  const totalOver = offBy.reduce((acc, row) => acc + row.diff, 0);

  console.log("");
  console.log(
    `jobs with a trackable budget + origin: ${currentJobs.length - budgetedWithoutOrigin}`,
  );
  console.log(`  stored != (origin − totalLabor): ${offBy.length}`);
  console.log(
    `  budgeted jobs without an origin (unverifiable this way): ${budgetedWithoutOrigin}`,
  );
  console.log(
    `  TOTAL overstatement (stored − expected): ${totalOver} cents = $${(totalOver / 100).toFixed(2)}`,
  );
  console.log("");
  console.log("jobId,origin_cents,stored_cents,expected_cents,diff_cents");
  for (const row of offBy) {
    console.log(`${row.jobId},${row.origin},${row.stored},${row.expected},${row.diff}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
