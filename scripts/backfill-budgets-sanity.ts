import assert from "node:assert/strict";
import { computeBackfill, JobLedger, SettlementUpdate, WeeklyLabor } from "../src/utils/budgets";

// Offline proof for `computeBackfill` — no DB required. Models the real recovery
// window (six settlements the cron missed) plus two edge cases: an untracked
// (null-budget) job and a job created mid-outage.
//
//   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/backfill-budgets-sanity.ts

const weeks = [
  "2026-08-01", // anchor — last correctly-settled week, never rewritten
  "2026-08-08",
  "2026-08-15",
  "2026-08-22",
  "2026-08-29",
  "2026-09-05",
  "2026-09-12",
];

// Every week holds the same "stuck" value: the cron never ran, so the ledger was
// copied forward unchanged. jobC is created mid-outage (first appears 08-15).
const jobsByWeek = new Map<string, Map<string, JobLedger>>(
  weeks.map((week): [string, Map<string, JobLedger>] => [week, new Map()]),
);
const put = (jobId: string, weeksPresent: string[], ledger: JobLedger) => {
  weeksPresent.forEach((week) => {
    jobsByWeek.get(week)!.set(jobId, { ...ledger });
  });
};

put("jobA", weeks, { budgetCurrentCents: 1_000_000, currentLaborSeconds: 360_000 });
put("jobB", weeks, { budgetCurrentCents: null, currentLaborSeconds: null }); // untracked budget
put("jobC", weeks.slice(2), { budgetCurrentCents: 50_000, currentLaborSeconds: 5_000 }); // added 08-15

// Labor booked against each source week (all weeks except the last).
const laborByWeek = new Map<string, Map<string, WeeklyLabor>>([
  [
    "2026-08-01",
    new Map([
      ["jobA", { cents: 111, seconds: 3600 }],
      ["jobB", { cents: 999, seconds: 999 }],
    ]),
  ],
  [
    "2026-08-08",
    new Map([
      ["jobA", { cents: 222, seconds: 3601 }],
      ["jobB", { cents: 999, seconds: 999 }],
    ]),
  ],
  [
    "2026-08-15",
    new Map([
      ["jobA", { cents: 333, seconds: 3602 }],
      ["jobC", { cents: 1000, seconds: 100 }],
    ]),
  ],
  [
    "2026-08-22",
    new Map([
      ["jobA", { cents: 444, seconds: 3603 }],
      ["jobC", { cents: 2000, seconds: 200 }],
    ]),
  ],
  [
    "2026-08-29",
    new Map([
      ["jobA", { cents: 555, seconds: 3604 }],
      ["jobC", { cents: 3000, seconds: 300 }],
    ]),
  ],
  [
    "2026-09-05",
    new Map([
      ["jobA", { cents: 666, seconds: 3605 }],
      ["jobC", { cents: 4000, seconds: 400 }],
    ]),
  ],
]);

const cloneLedgers = (source: Map<string, Map<string, JobLedger>>) =>
  new Map(
    Array.from(source, ([week, jobs]): [string, Map<string, JobLedger>] => [
      week,
      new Map(Array.from(jobs, ([jobId, ledger]): [string, JobLedger] => [jobId, { ...ledger }])),
    ]),
  );

const budgetTo = (updates: SettlementUpdate[], timesheetId: string, jobId: string) =>
  updates.find((u) => u.timesheetId === timesheetId && u.jobId === jobId)?.budgetCurrentCents.to;
const laborTo = (updates: SettlementUpdate[], timesheetId: string, jobId: string) =>
  updates.find((u) => u.timesheetId === timesheetId && u.jobId === jobId)?.currentLaborSeconds.to;

const run1 = computeBackfill(weeks, jobsByWeek, laborByWeek);

// --- jobA: budget/labor cascade down the whole chain -------------------------
assert.equal(budgetTo(run1, "2026-08-08", "jobA"), 999_889);
assert.equal(budgetTo(run1, "2026-08-15", "jobA"), 999_667);
assert.equal(budgetTo(run1, "2026-08-22", "jobA"), 999_334);
assert.equal(budgetTo(run1, "2026-08-29", "jobA"), 998_890);
assert.equal(budgetTo(run1, "2026-09-05", "jobA"), 998_335);
assert.equal(budgetTo(run1, "2026-09-12", "jobA"), 1_000_000 - (111 + 222 + 333 + 444 + 555 + 666));
assert.equal(
  laborTo(run1, "2026-09-12", "jobA"),
  360_000 - (3600 + 3601 + 3602 + 3603 + 3604 + 3605),
);

// --- jobB: null budget/labor left untouched (route writes `undefined`) --------
run1
  .filter((u) => u.jobId === "jobB")
  .forEach((u) => {
    assert.equal(u.budgetCurrentCents.to, null);
    assert.equal(u.currentLaborSeconds.to, null);
  });

// --- jobC: anchored at 08-15, so nothing before 08-22 is touched -------------
assert.equal(
  run1.some(
    (u) => u.jobId === "jobC" && (u.timesheetId === "2026-08-08" || u.timesheetId === "2026-08-15"),
  ),
  false,
);
assert.equal(budgetTo(run1, "2026-08-22", "jobC"), 49_000);
assert.equal(budgetTo(run1, "2026-09-12", "jobC"), 50_000 - (1000 + 2000 + 3000 + 4000));
assert.equal(laborTo(run1, "2026-09-12", "jobC"), 5_000 - (100 + 200 + 300 + 400));

// --- Idempotency: apply the writes, re-run, every target `to` is identical ----
const applied = cloneLedgers(jobsByWeek);
run1.forEach((u) => {
  const ledger = applied.get(u.timesheetId)!.get(u.jobId)!;
  if (u.budgetCurrentCents.to !== null) ledger.budgetCurrentCents = u.budgetCurrentCents.to;
  if (u.currentLaborSeconds.to !== null) ledger.currentLaborSeconds = u.currentLaborSeconds.to;
});
const run2 = computeBackfill(weeks, applied, laborByWeek);
const toValues = (updates: SettlementUpdate[]) =>
  new Map(
    updates.map((u) => [
      `${u.timesheetId}|${u.jobId}`,
      `${u.budgetCurrentCents.to}|${u.currentLaborSeconds.to}`,
    ]),
  );
assert.deepEqual(
  toValues(run2),
  toValues(run1),
  "re-running after a write must produce identical targets",
);

// --- Equivalence: computeBackfill == replaying the six cron runs in order -----
const sequential = cloneLedgers(jobsByWeek);
for (let i = 1; i < weeks.length; i++) {
  const fromJobs = sequential.get(weeks[i - 1])!;
  const toJobs = sequential.get(weeks[i])!;
  const labor = laborByWeek.get(weeks[i - 1]) ?? new Map<string, WeeklyLabor>();
  toJobs.forEach((toLedger, jobId) => {
    const fromLedger = fromJobs.get(jobId);
    if (fromLedger === undefined) return; // cron only settles jobs present in the source week
    const l = labor.get(jobId) ?? { cents: 0, seconds: 0 };
    if (fromLedger.budgetCurrentCents !== null)
      toLedger.budgetCurrentCents = fromLedger.budgetCurrentCents - l.cents;
    if (fromLedger.currentLaborSeconds !== null)
      toLedger.currentLaborSeconds = fromLedger.currentLaborSeconds - l.seconds;
  });
}
assert.deepEqual(applied, sequential, "one in-memory pass must equal six sequential cron runs");

console.log(`OK — ${run1.length} settlement updates across ${weeks.length} weeks`);
console.log("  jobA 09-12 budget:", budgetTo(run1, "2026-09-12", "jobA"), "cents");
console.log("  jobC 09-12 budget:", budgetTo(run1, "2026-09-12", "jobC"), "cents");
console.log(
  "  jobB targets left null:",
  run1.filter((u) => u.jobId === "jobB").every((u) => u.budgetCurrentCents.to === null),
);
console.log("  idempotent + equals sequential cron replay: true");
