import { z } from "zod";
import { AccountSchema, DaySchema, EmployeeSchema, JobSchema } from "../../prisma/generated/zod";

export const UpsertAccountAction = z.object({
  type: z.literal("upsert-account"),
  data: AccountSchema,
});
export type UpsertAccountAction = z.infer<typeof UpsertAccountAction>;

export const UpsertEmployeeAction = z.object({
  type: z.literal("upsert-employee"),
  data: EmployeeSchema,
});
export type UpsertEmployeeAction = z.infer<typeof UpsertEmployeeAction>;

export const UpsertJobAction = z.object({
  type: z.literal("upsert-job"),
  data: JobSchema,
});
export type UpsertJobAction = z.infer<typeof UpsertJobAction>;

export const UpdateDayAction = z.object({
  type: z.literal("update-day"),
  data: DaySchema,
});
export type UpdateDayAction = z.infer<typeof UpdateDayAction>;

export const ActionJson = z.discriminatedUnion("type", [
  UpsertAccountAction,
  UpsertEmployeeAction,
  UpsertJobAction,
  UpdateDayAction,
]);
export type ActionJson = z.infer<typeof ActionJson>;
