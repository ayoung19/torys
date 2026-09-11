export type JobLedger = {
  budgetCurrentCents: number | null;
  currentLaborSeconds: number | null;
};

export type WeeklyLabor = {
  cents: number;
  seconds: number;
};

export type SettlementUpdate = {
  timesheetId: string;
  jobId: string;
  laborDeductedCents: number;
  laborDeductedSeconds: number;
  budgetCurrentCents: { from: number | null; to: number | null };
  currentLaborSeconds: { from: number | null; to: number | null };
};

/**
 * Replays the weekly budget settlement across `orderedWeeks` (ascending by
 * week-ending id). For each consecutive (from, to) pair, the running budget /
 * labor carried into `to` is set to `from`'s value minus the labor booked
 * against `from` — identical to the `update-budgets` cron, but threaded
 * in-memory so a multi-week gap is settled in a single deterministic pass.
 *
 * Each job is anchored on the earliest week it appears in; that week is treated
 * as the last correct value and is never rewritten, which makes the pass
 * idempotent: re-running reads the same anchor and the same immutable labor, so
 * it can never double-deduct. A null budget / labor is left untouched, matching
 * the cron's behavior for jobs without a tracked budget.
 */
export const computeBackfill = (
  orderedWeeks: string[],
  jobsByWeek: Map<string, Map<string, JobLedger>>,
  laborByWeek: Map<string, Map<string, WeeklyLabor>>,
): SettlementUpdate[] => {
  const updates: SettlementUpdate[] = [];

  const jobIds = new Set<string>();
  jobsByWeek.forEach((jobs) => {
    jobs.forEach((_ledger, jobId) => {
      jobIds.add(jobId);
    });
  });

  jobIds.forEach((jobId) => {
    let running: JobLedger | undefined;
    let anchorIndex = -1;
    for (let i = 0; i < orderedWeeks.length; i++) {
      const ledger = jobsByWeek.get(orderedWeeks[i])?.get(jobId);
      if (ledger !== undefined) {
        running = { ...ledger };
        anchorIndex = i;
        break;
      }
    }
    if (running === undefined) {
      return;
    }

    for (let i = anchorIndex + 1; i < orderedWeeks.length; i++) {
      const toJob = jobsByWeek.get(orderedWeeks[i])?.get(jobId);
      if (toJob === undefined) {
        break;
      }

      const labor = laborByWeek.get(orderedWeeks[i - 1])?.get(jobId) ?? { cents: 0, seconds: 0 };

      if (running.budgetCurrentCents !== null) {
        running.budgetCurrentCents -= labor.cents;
      }
      if (running.currentLaborSeconds !== null) {
        running.currentLaborSeconds -= labor.seconds;
      }

      updates.push({
        timesheetId: orderedWeeks[i],
        jobId,
        laborDeductedCents: labor.cents,
        laborDeductedSeconds: labor.seconds,
        budgetCurrentCents: { from: toJob.budgetCurrentCents, to: running.budgetCurrentCents },
        currentLaborSeconds: { from: toJob.currentLaborSeconds, to: running.currentLaborSeconds },
      });
    }
  });

  return updates;
};
