import { z } from "zod";
import { AccountSchema, EmployeeSchema, JobSchema } from "../../prisma/generated/zod";

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

export const ActionJson = z.discriminatedUnion("type", [
  UpsertAccountAction,
  UpsertEmployeeAction,
  UpsertJobAction,
]);
export type ActionJson = z.infer<typeof ActionJson>;
