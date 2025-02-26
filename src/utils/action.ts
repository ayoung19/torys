import { z } from "zod";
import { AccountSchema, EmployeeSchema, JobSchema } from "../../prisma/generated/zod";

const UpsertAccountAction = z.object({
  type: z.literal("upsert-account"),
  data: AccountSchema,
});
type UpsertAccountAction = z.infer<typeof UpsertAccountAction>;

const UpsertEmployeeAction = z.object({
  type: z.literal("upsert-employee"),
  data: EmployeeSchema,
});
type UpsertEmployeeAction = z.infer<typeof UpsertEmployeeAction>;

const UpsertJobAction = z.object({
  type: z.literal("upsert-job"),
  data: JobSchema,
});
type UpsertJobAction = z.infer<typeof UpsertJobAction>;

export const ActionJson = z.discriminatedUnion("type", [
  UpsertAccountAction,
  UpsertEmployeeAction,
  UpsertJobAction,
]);
export type ActionJson = z.infer<typeof ActionJson>;
