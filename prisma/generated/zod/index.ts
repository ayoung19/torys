import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.DbNull;
  if (v === 'JsonNull') return Prisma.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.function(z.tuple([]), z.any()) }),
    z.record(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const AccountScalarFieldEnumSchema = z.enum(['accountId','isActive','phoneNumber','accountType']);

export const TimesheetScalarFieldEnumSchema = z.enum(['timesheetId']);

export const EmployeeScalarFieldEnumSchema = z.enum(['timesheetId','employeeId','isActive','displayId','name','phoneNumber','fringeCode','ratePrivateCentsPerHour','rateDavisBaconCentsPerHour','rateDavisBaconOvertimeCentsPerHour']);

export const JobScalarFieldEnumSchema = z.enum(['timesheetId','jobId','oldJobId','isActive','name','budgetOriginalCents','budgetCurrentCents','originalLaborSeconds','currentLaborSeconds','jobType']);

export const DayScalarFieldEnumSchema = z.enum(['timesheetId','jobId','dayId','editorId','description']);

export const EntryScalarFieldEnumSchema = z.enum(['timesheetId','jobId','dayId','entryId','employeeId','isApproved','entryConfirmationStatus','timeInSeconds','timeOutSeconds','lunchSeconds']);

export const ActionScalarFieldEnumSchema = z.enum(['id','timestamp','actorId','targetId','actionType','actionJson']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const JsonNullValueInputSchema = z.enum(['JsonNull',]).transform((value) => (value === 'JsonNull' ? Prisma.JsonNull : value));

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.JsonNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const AccountTypeSchema = z.enum(['DEV','ADMIN','COORDINATOR','FOREMAN']);

export type AccountTypeType = `${z.infer<typeof AccountTypeSchema>}`

export const JobTypeSchema = z.enum(['PRIVATE','STATE','FEDERAL']);

export type JobTypeType = `${z.infer<typeof JobTypeSchema>}`

export const EntryConfirmationStatusSchema = z.enum(['UNINITIALIZED','AWAITING','CONFIRMED']);

export type EntryConfirmationStatusType = `${z.infer<typeof EntryConfirmationStatusSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// ACCOUNT SCHEMA
/////////////////////////////////////////

export const AccountSchema = z.object({
  accountType: AccountTypeSchema,
  accountId: z.string(),
  isActive: z.boolean(),
  phoneNumber: z.string(),
})

export type Account = z.infer<typeof AccountSchema>

/////////////////////////////////////////
// TIMESHEET SCHEMA
/////////////////////////////////////////

export const TimesheetSchema = z.object({
  timesheetId: z.string(),
})

export type Timesheet = z.infer<typeof TimesheetSchema>

/////////////////////////////////////////
// EMPLOYEE SCHEMA
/////////////////////////////////////////

export const EmployeeSchema = z.object({
  timesheetId: z.string(),
  employeeId: z.string(),
  isActive: z.boolean(),
  displayId: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  fringeCode: z.string(),
  ratePrivateCentsPerHour: z.number().int(),
  rateDavisBaconCentsPerHour: z.number().int(),
  rateDavisBaconOvertimeCentsPerHour: z.number().int(),
})

export type Employee = z.infer<typeof EmployeeSchema>

/////////////////////////////////////////
// JOB SCHEMA
/////////////////////////////////////////

export const JobSchema = z.object({
  jobType: JobTypeSchema,
  timesheetId: z.string(),
  jobId: z.string(),
  oldJobId: z.number().int(),
  isActive: z.boolean(),
  name: z.string(),
  budgetOriginalCents: z.number().int().nullable(),
  budgetCurrentCents: z.number().int().nullable(),
  originalLaborSeconds: z.number().int().nullable(),
  currentLaborSeconds: z.number().int().nullable(),
})

export type Job = z.infer<typeof JobSchema>

/////////////////////////////////////////
// DAY SCHEMA
/////////////////////////////////////////

export const DaySchema = z.object({
  timesheetId: z.string(),
  jobId: z.string(),
  dayId: z.number().int(),
  editorId: z.string().nullable(),
  description: z.string(),
})

export type Day = z.infer<typeof DaySchema>

/////////////////////////////////////////
// ENTRY SCHEMA
/////////////////////////////////////////

export const EntrySchema = z.object({
  entryConfirmationStatus: EntryConfirmationStatusSchema,
  timesheetId: z.string(),
  jobId: z.string(),
  dayId: z.number().int(),
  entryId: z.string(),
  employeeId: z.string(),
  isApproved: z.boolean(),
  timeInSeconds: z.number().int(),
  timeOutSeconds: z.number().int(),
  lunchSeconds: z.number().int(),
})

export type Entry = z.infer<typeof EntrySchema>

/////////////////////////////////////////
// ACTION SCHEMA
/////////////////////////////////////////

export const ActionSchema = z.object({
  id: z.string(),
  timestamp: z.coerce.date(),
  actorId: z.string(),
  targetId: z.string(),
  actionType: z.string(),
  actionJson: JsonValueSchema,
})

export type Action = z.infer<typeof ActionSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// ACCOUNT
//------------------------------------------------------

export const AccountIncludeSchema: z.ZodType<Prisma.AccountInclude> = z.object({
  daysEdited: z.union([z.boolean(),z.lazy(() => DayFindManyArgsSchema)]).optional(),
  actions: z.union([z.boolean(),z.lazy(() => ActionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => AccountCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const AccountArgsSchema: z.ZodType<Prisma.AccountDefaultArgs> = z.object({
  select: z.lazy(() => AccountSelectSchema).optional(),
  include: z.lazy(() => AccountIncludeSchema).optional(),
}).strict();

export const AccountCountOutputTypeArgsSchema: z.ZodType<Prisma.AccountCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => AccountCountOutputTypeSelectSchema).nullish(),
}).strict();

export const AccountCountOutputTypeSelectSchema: z.ZodType<Prisma.AccountCountOutputTypeSelect> = z.object({
  daysEdited: z.boolean().optional(),
  actions: z.boolean().optional(),
}).strict();

export const AccountSelectSchema: z.ZodType<Prisma.AccountSelect> = z.object({
  accountId: z.boolean().optional(),
  isActive: z.boolean().optional(),
  phoneNumber: z.boolean().optional(),
  accountType: z.boolean().optional(),
  daysEdited: z.union([z.boolean(),z.lazy(() => DayFindManyArgsSchema)]).optional(),
  actions: z.union([z.boolean(),z.lazy(() => ActionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => AccountCountOutputTypeArgsSchema)]).optional(),
}).strict()

// TIMESHEET
//------------------------------------------------------

export const TimesheetIncludeSchema: z.ZodType<Prisma.TimesheetInclude> = z.object({
  employees: z.union([z.boolean(),z.lazy(() => EmployeeFindManyArgsSchema)]).optional(),
  jobs: z.union([z.boolean(),z.lazy(() => JobFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TimesheetCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const TimesheetArgsSchema: z.ZodType<Prisma.TimesheetDefaultArgs> = z.object({
  select: z.lazy(() => TimesheetSelectSchema).optional(),
  include: z.lazy(() => TimesheetIncludeSchema).optional(),
}).strict();

export const TimesheetCountOutputTypeArgsSchema: z.ZodType<Prisma.TimesheetCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => TimesheetCountOutputTypeSelectSchema).nullish(),
}).strict();

export const TimesheetCountOutputTypeSelectSchema: z.ZodType<Prisma.TimesheetCountOutputTypeSelect> = z.object({
  employees: z.boolean().optional(),
  jobs: z.boolean().optional(),
}).strict();

export const TimesheetSelectSchema: z.ZodType<Prisma.TimesheetSelect> = z.object({
  timesheetId: z.boolean().optional(),
  employees: z.union([z.boolean(),z.lazy(() => EmployeeFindManyArgsSchema)]).optional(),
  jobs: z.union([z.boolean(),z.lazy(() => JobFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TimesheetCountOutputTypeArgsSchema)]).optional(),
}).strict()

// EMPLOYEE
//------------------------------------------------------

export const EmployeeIncludeSchema: z.ZodType<Prisma.EmployeeInclude> = z.object({
  timesheet: z.union([z.boolean(),z.lazy(() => TimesheetArgsSchema)]).optional(),
  entries: z.union([z.boolean(),z.lazy(() => EntryFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => EmployeeCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const EmployeeArgsSchema: z.ZodType<Prisma.EmployeeDefaultArgs> = z.object({
  select: z.lazy(() => EmployeeSelectSchema).optional(),
  include: z.lazy(() => EmployeeIncludeSchema).optional(),
}).strict();

export const EmployeeCountOutputTypeArgsSchema: z.ZodType<Prisma.EmployeeCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => EmployeeCountOutputTypeSelectSchema).nullish(),
}).strict();

export const EmployeeCountOutputTypeSelectSchema: z.ZodType<Prisma.EmployeeCountOutputTypeSelect> = z.object({
  entries: z.boolean().optional(),
}).strict();

export const EmployeeSelectSchema: z.ZodType<Prisma.EmployeeSelect> = z.object({
  timesheetId: z.boolean().optional(),
  employeeId: z.boolean().optional(),
  isActive: z.boolean().optional(),
  displayId: z.boolean().optional(),
  name: z.boolean().optional(),
  phoneNumber: z.boolean().optional(),
  fringeCode: z.boolean().optional(),
  ratePrivateCentsPerHour: z.boolean().optional(),
  rateDavisBaconCentsPerHour: z.boolean().optional(),
  rateDavisBaconOvertimeCentsPerHour: z.boolean().optional(),
  timesheet: z.union([z.boolean(),z.lazy(() => TimesheetArgsSchema)]).optional(),
  entries: z.union([z.boolean(),z.lazy(() => EntryFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => EmployeeCountOutputTypeArgsSchema)]).optional(),
}).strict()

// JOB
//------------------------------------------------------

export const JobIncludeSchema: z.ZodType<Prisma.JobInclude> = z.object({
  timesheet: z.union([z.boolean(),z.lazy(() => TimesheetArgsSchema)]).optional(),
  days: z.union([z.boolean(),z.lazy(() => DayFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => JobCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const JobArgsSchema: z.ZodType<Prisma.JobDefaultArgs> = z.object({
  select: z.lazy(() => JobSelectSchema).optional(),
  include: z.lazy(() => JobIncludeSchema).optional(),
}).strict();

export const JobCountOutputTypeArgsSchema: z.ZodType<Prisma.JobCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => JobCountOutputTypeSelectSchema).nullish(),
}).strict();

export const JobCountOutputTypeSelectSchema: z.ZodType<Prisma.JobCountOutputTypeSelect> = z.object({
  days: z.boolean().optional(),
}).strict();

export const JobSelectSchema: z.ZodType<Prisma.JobSelect> = z.object({
  timesheetId: z.boolean().optional(),
  jobId: z.boolean().optional(),
  oldJobId: z.boolean().optional(),
  isActive: z.boolean().optional(),
  name: z.boolean().optional(),
  budgetOriginalCents: z.boolean().optional(),
  budgetCurrentCents: z.boolean().optional(),
  originalLaborSeconds: z.boolean().optional(),
  currentLaborSeconds: z.boolean().optional(),
  jobType: z.boolean().optional(),
  timesheet: z.union([z.boolean(),z.lazy(() => TimesheetArgsSchema)]).optional(),
  days: z.union([z.boolean(),z.lazy(() => DayFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => JobCountOutputTypeArgsSchema)]).optional(),
}).strict()

// DAY
//------------------------------------------------------

export const DayIncludeSchema: z.ZodType<Prisma.DayInclude> = z.object({
  job: z.union([z.boolean(),z.lazy(() => JobArgsSchema)]).optional(),
  editor: z.union([z.boolean(),z.lazy(() => AccountArgsSchema)]).optional(),
  entries: z.union([z.boolean(),z.lazy(() => EntryFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => DayCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const DayArgsSchema: z.ZodType<Prisma.DayDefaultArgs> = z.object({
  select: z.lazy(() => DaySelectSchema).optional(),
  include: z.lazy(() => DayIncludeSchema).optional(),
}).strict();

export const DayCountOutputTypeArgsSchema: z.ZodType<Prisma.DayCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => DayCountOutputTypeSelectSchema).nullish(),
}).strict();

export const DayCountOutputTypeSelectSchema: z.ZodType<Prisma.DayCountOutputTypeSelect> = z.object({
  entries: z.boolean().optional(),
}).strict();

export const DaySelectSchema: z.ZodType<Prisma.DaySelect> = z.object({
  timesheetId: z.boolean().optional(),
  jobId: z.boolean().optional(),
  dayId: z.boolean().optional(),
  editorId: z.boolean().optional(),
  description: z.boolean().optional(),
  job: z.union([z.boolean(),z.lazy(() => JobArgsSchema)]).optional(),
  editor: z.union([z.boolean(),z.lazy(() => AccountArgsSchema)]).optional(),
  entries: z.union([z.boolean(),z.lazy(() => EntryFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => DayCountOutputTypeArgsSchema)]).optional(),
}).strict()

// ENTRY
//------------------------------------------------------

export const EntryIncludeSchema: z.ZodType<Prisma.EntryInclude> = z.object({
  day: z.union([z.boolean(),z.lazy(() => DayArgsSchema)]).optional(),
  employee: z.union([z.boolean(),z.lazy(() => EmployeeArgsSchema)]).optional(),
}).strict()

export const EntryArgsSchema: z.ZodType<Prisma.EntryDefaultArgs> = z.object({
  select: z.lazy(() => EntrySelectSchema).optional(),
  include: z.lazy(() => EntryIncludeSchema).optional(),
}).strict();

export const EntrySelectSchema: z.ZodType<Prisma.EntrySelect> = z.object({
  timesheetId: z.boolean().optional(),
  jobId: z.boolean().optional(),
  dayId: z.boolean().optional(),
  entryId: z.boolean().optional(),
  employeeId: z.boolean().optional(),
  isApproved: z.boolean().optional(),
  entryConfirmationStatus: z.boolean().optional(),
  timeInSeconds: z.boolean().optional(),
  timeOutSeconds: z.boolean().optional(),
  lunchSeconds: z.boolean().optional(),
  day: z.union([z.boolean(),z.lazy(() => DayArgsSchema)]).optional(),
  employee: z.union([z.boolean(),z.lazy(() => EmployeeArgsSchema)]).optional(),
}).strict()

// ACTION
//------------------------------------------------------

export const ActionIncludeSchema: z.ZodType<Prisma.ActionInclude> = z.object({
  actor: z.union([z.boolean(),z.lazy(() => AccountArgsSchema)]).optional(),
}).strict()

export const ActionArgsSchema: z.ZodType<Prisma.ActionDefaultArgs> = z.object({
  select: z.lazy(() => ActionSelectSchema).optional(),
  include: z.lazy(() => ActionIncludeSchema).optional(),
}).strict();

export const ActionSelectSchema: z.ZodType<Prisma.ActionSelect> = z.object({
  id: z.boolean().optional(),
  timestamp: z.boolean().optional(),
  actorId: z.boolean().optional(),
  targetId: z.boolean().optional(),
  actionType: z.boolean().optional(),
  actionJson: z.boolean().optional(),
  actor: z.union([z.boolean(),z.lazy(() => AccountArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const AccountWhereInputSchema: z.ZodType<Prisma.AccountWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  accountId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  phoneNumber: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  accountType: z.union([ z.lazy(() => EnumAccountTypeFilterSchema),z.lazy(() => AccountTypeSchema) ]).optional(),
  daysEdited: z.lazy(() => DayListRelationFilterSchema).optional(),
  actions: z.lazy(() => ActionListRelationFilterSchema).optional()
}).strict();

export const AccountOrderByWithRelationInputSchema: z.ZodType<Prisma.AccountOrderByWithRelationInput> = z.object({
  accountId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  phoneNumber: z.lazy(() => SortOrderSchema).optional(),
  accountType: z.lazy(() => SortOrderSchema).optional(),
  daysEdited: z.lazy(() => DayOrderByRelationAggregateInputSchema).optional(),
  actions: z.lazy(() => ActionOrderByRelationAggregateInputSchema).optional()
}).strict();

export const AccountWhereUniqueInputSchema: z.ZodType<Prisma.AccountWhereUniqueInput> = z.object({
  accountId: z.string()
})
.and(z.object({
  accountId: z.string().optional(),
  AND: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  phoneNumber: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  accountType: z.union([ z.lazy(() => EnumAccountTypeFilterSchema),z.lazy(() => AccountTypeSchema) ]).optional(),
  daysEdited: z.lazy(() => DayListRelationFilterSchema).optional(),
  actions: z.lazy(() => ActionListRelationFilterSchema).optional()
}).strict());

export const AccountOrderByWithAggregationInputSchema: z.ZodType<Prisma.AccountOrderByWithAggregationInput> = z.object({
  accountId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  phoneNumber: z.lazy(() => SortOrderSchema).optional(),
  accountType: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => AccountCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => AccountMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => AccountMinOrderByAggregateInputSchema).optional()
}).strict();

export const AccountScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.AccountScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => AccountScalarWhereWithAggregatesInputSchema),z.lazy(() => AccountScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountScalarWhereWithAggregatesInputSchema),z.lazy(() => AccountScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  accountId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  phoneNumber: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  accountType: z.union([ z.lazy(() => EnumAccountTypeWithAggregatesFilterSchema),z.lazy(() => AccountTypeSchema) ]).optional(),
}).strict();

export const TimesheetWhereInputSchema: z.ZodType<Prisma.TimesheetWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TimesheetWhereInputSchema),z.lazy(() => TimesheetWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TimesheetWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TimesheetWhereInputSchema),z.lazy(() => TimesheetWhereInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  employees: z.lazy(() => EmployeeListRelationFilterSchema).optional(),
  jobs: z.lazy(() => JobListRelationFilterSchema).optional()
}).strict();

export const TimesheetOrderByWithRelationInputSchema: z.ZodType<Prisma.TimesheetOrderByWithRelationInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  employees: z.lazy(() => EmployeeOrderByRelationAggregateInputSchema).optional(),
  jobs: z.lazy(() => JobOrderByRelationAggregateInputSchema).optional()
}).strict();

export const TimesheetWhereUniqueInputSchema: z.ZodType<Prisma.TimesheetWhereUniqueInput> = z.object({
  timesheetId: z.string()
})
.and(z.object({
  timesheetId: z.string().optional(),
  AND: z.union([ z.lazy(() => TimesheetWhereInputSchema),z.lazy(() => TimesheetWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TimesheetWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TimesheetWhereInputSchema),z.lazy(() => TimesheetWhereInputSchema).array() ]).optional(),
  employees: z.lazy(() => EmployeeListRelationFilterSchema).optional(),
  jobs: z.lazy(() => JobListRelationFilterSchema).optional()
}).strict());

export const TimesheetOrderByWithAggregationInputSchema: z.ZodType<Prisma.TimesheetOrderByWithAggregationInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TimesheetCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TimesheetMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TimesheetMinOrderByAggregateInputSchema).optional()
}).strict();

export const TimesheetScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TimesheetScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TimesheetScalarWhereWithAggregatesInputSchema),z.lazy(() => TimesheetScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TimesheetScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TimesheetScalarWhereWithAggregatesInputSchema),z.lazy(() => TimesheetScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const EmployeeWhereInputSchema: z.ZodType<Prisma.EmployeeWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EmployeeWhereInputSchema),z.lazy(() => EmployeeWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmployeeWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmployeeWhereInputSchema),z.lazy(() => EmployeeWhereInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  employeeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  displayId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  phoneNumber: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fringeCode: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  ratePrivateCentsPerHour: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  rateDavisBaconCentsPerHour: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  timesheet: z.union([ z.lazy(() => TimesheetRelationFilterSchema),z.lazy(() => TimesheetWhereInputSchema) ]).optional(),
  entries: z.lazy(() => EntryListRelationFilterSchema).optional()
}).strict();

export const EmployeeOrderByWithRelationInputSchema: z.ZodType<Prisma.EmployeeOrderByWithRelationInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  employeeId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  displayId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phoneNumber: z.lazy(() => SortOrderSchema).optional(),
  fringeCode: z.lazy(() => SortOrderSchema).optional(),
  ratePrivateCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  rateDavisBaconCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  timesheet: z.lazy(() => TimesheetOrderByWithRelationInputSchema).optional(),
  entries: z.lazy(() => EntryOrderByRelationAggregateInputSchema).optional()
}).strict();

export const EmployeeWhereUniqueInputSchema: z.ZodType<Prisma.EmployeeWhereUniqueInput> = z.object({
  employeePrimaryKey: z.lazy(() => EmployeeEmployeePrimaryKeyCompoundUniqueInputSchema)
})
.and(z.object({
  employeePrimaryKey: z.lazy(() => EmployeeEmployeePrimaryKeyCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => EmployeeWhereInputSchema),z.lazy(() => EmployeeWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmployeeWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmployeeWhereInputSchema),z.lazy(() => EmployeeWhereInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  employeeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  displayId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  phoneNumber: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fringeCode: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  ratePrivateCentsPerHour: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  rateDavisBaconCentsPerHour: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  timesheet: z.union([ z.lazy(() => TimesheetRelationFilterSchema),z.lazy(() => TimesheetWhereInputSchema) ]).optional(),
  entries: z.lazy(() => EntryListRelationFilterSchema).optional()
}).strict());

export const EmployeeOrderByWithAggregationInputSchema: z.ZodType<Prisma.EmployeeOrderByWithAggregationInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  employeeId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  displayId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phoneNumber: z.lazy(() => SortOrderSchema).optional(),
  fringeCode: z.lazy(() => SortOrderSchema).optional(),
  ratePrivateCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  rateDavisBaconCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => EmployeeCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => EmployeeAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => EmployeeMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => EmployeeMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => EmployeeSumOrderByAggregateInputSchema).optional()
}).strict();

export const EmployeeScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.EmployeeScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => EmployeeScalarWhereWithAggregatesInputSchema),z.lazy(() => EmployeeScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmployeeScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmployeeScalarWhereWithAggregatesInputSchema),z.lazy(() => EmployeeScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  employeeId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  displayId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  phoneNumber: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  fringeCode: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  ratePrivateCentsPerHour: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  rateDavisBaconCentsPerHour: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
}).strict();

export const JobWhereInputSchema: z.ZodType<Prisma.JobWhereInput> = z.object({
  AND: z.union([ z.lazy(() => JobWhereInputSchema),z.lazy(() => JobWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => JobWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => JobWhereInputSchema),z.lazy(() => JobWhereInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  jobId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  oldJobId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  budgetOriginalCents: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  budgetCurrentCents: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  originalLaborSeconds: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  currentLaborSeconds: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  jobType: z.union([ z.lazy(() => EnumJobTypeFilterSchema),z.lazy(() => JobTypeSchema) ]).optional(),
  timesheet: z.union([ z.lazy(() => TimesheetRelationFilterSchema),z.lazy(() => TimesheetWhereInputSchema) ]).optional(),
  days: z.lazy(() => DayListRelationFilterSchema).optional()
}).strict();

export const JobOrderByWithRelationInputSchema: z.ZodType<Prisma.JobOrderByWithRelationInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  oldJobId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  budgetOriginalCents: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  budgetCurrentCents: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  originalLaborSeconds: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  currentLaborSeconds: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  jobType: z.lazy(() => SortOrderSchema).optional(),
  timesheet: z.lazy(() => TimesheetOrderByWithRelationInputSchema).optional(),
  days: z.lazy(() => DayOrderByRelationAggregateInputSchema).optional()
}).strict();

export const JobWhereUniqueInputSchema: z.ZodType<Prisma.JobWhereUniqueInput> = z.union([
  z.object({
    jobPrimaryKey: z.lazy(() => JobJobPrimaryKeyCompoundUniqueInputSchema),
    timesheetId_oldJobId: z.lazy(() => JobTimesheetIdOldJobIdCompoundUniqueInputSchema)
  }),
  z.object({
    jobPrimaryKey: z.lazy(() => JobJobPrimaryKeyCompoundUniqueInputSchema),
  }),
  z.object({
    timesheetId_oldJobId: z.lazy(() => JobTimesheetIdOldJobIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  timesheetId_oldJobId: z.lazy(() => JobTimesheetIdOldJobIdCompoundUniqueInputSchema).optional(),
  jobPrimaryKey: z.lazy(() => JobJobPrimaryKeyCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => JobWhereInputSchema),z.lazy(() => JobWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => JobWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => JobWhereInputSchema),z.lazy(() => JobWhereInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  jobId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  oldJobId: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  budgetOriginalCents: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  budgetCurrentCents: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  originalLaborSeconds: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  currentLaborSeconds: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  jobType: z.union([ z.lazy(() => EnumJobTypeFilterSchema),z.lazy(() => JobTypeSchema) ]).optional(),
  timesheet: z.union([ z.lazy(() => TimesheetRelationFilterSchema),z.lazy(() => TimesheetWhereInputSchema) ]).optional(),
  days: z.lazy(() => DayListRelationFilterSchema).optional()
}).strict());

export const JobOrderByWithAggregationInputSchema: z.ZodType<Prisma.JobOrderByWithAggregationInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  oldJobId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  budgetOriginalCents: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  budgetCurrentCents: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  originalLaborSeconds: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  currentLaborSeconds: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  jobType: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => JobCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => JobAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => JobMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => JobMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => JobSumOrderByAggregateInputSchema).optional()
}).strict();

export const JobScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.JobScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => JobScalarWhereWithAggregatesInputSchema),z.lazy(() => JobScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => JobScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => JobScalarWhereWithAggregatesInputSchema),z.lazy(() => JobScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  jobId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  oldJobId: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  budgetOriginalCents: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  budgetCurrentCents: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  originalLaborSeconds: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  currentLaborSeconds: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  jobType: z.union([ z.lazy(() => EnumJobTypeWithAggregatesFilterSchema),z.lazy(() => JobTypeSchema) ]).optional(),
}).strict();

export const DayWhereInputSchema: z.ZodType<Prisma.DayWhereInput> = z.object({
  AND: z.union([ z.lazy(() => DayWhereInputSchema),z.lazy(() => DayWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => DayWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DayWhereInputSchema),z.lazy(() => DayWhereInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  jobId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  dayId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  editorId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  job: z.union([ z.lazy(() => JobRelationFilterSchema),z.lazy(() => JobWhereInputSchema) ]).optional(),
  editor: z.union([ z.lazy(() => AccountNullableRelationFilterSchema),z.lazy(() => AccountWhereInputSchema) ]).optional().nullable(),
  entries: z.lazy(() => EntryListRelationFilterSchema).optional()
}).strict();

export const DayOrderByWithRelationInputSchema: z.ZodType<Prisma.DayOrderByWithRelationInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  dayId: z.lazy(() => SortOrderSchema).optional(),
  editorId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  job: z.lazy(() => JobOrderByWithRelationInputSchema).optional(),
  editor: z.lazy(() => AccountOrderByWithRelationInputSchema).optional(),
  entries: z.lazy(() => EntryOrderByRelationAggregateInputSchema).optional()
}).strict();

export const DayWhereUniqueInputSchema: z.ZodType<Prisma.DayWhereUniqueInput> = z.object({
  dayPrimaryKey: z.lazy(() => DayDayPrimaryKeyCompoundUniqueInputSchema)
})
.and(z.object({
  dayPrimaryKey: z.lazy(() => DayDayPrimaryKeyCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => DayWhereInputSchema),z.lazy(() => DayWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => DayWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DayWhereInputSchema),z.lazy(() => DayWhereInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  jobId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  dayId: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  editorId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  job: z.union([ z.lazy(() => JobRelationFilterSchema),z.lazy(() => JobWhereInputSchema) ]).optional(),
  editor: z.union([ z.lazy(() => AccountNullableRelationFilterSchema),z.lazy(() => AccountWhereInputSchema) ]).optional().nullable(),
  entries: z.lazy(() => EntryListRelationFilterSchema).optional()
}).strict());

export const DayOrderByWithAggregationInputSchema: z.ZodType<Prisma.DayOrderByWithAggregationInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  dayId: z.lazy(() => SortOrderSchema).optional(),
  editorId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => DayCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => DayAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => DayMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => DayMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => DaySumOrderByAggregateInputSchema).optional()
}).strict();

export const DayScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.DayScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => DayScalarWhereWithAggregatesInputSchema),z.lazy(() => DayScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => DayScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DayScalarWhereWithAggregatesInputSchema),z.lazy(() => DayScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  jobId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  dayId: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  editorId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const EntryWhereInputSchema: z.ZodType<Prisma.EntryWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EntryWhereInputSchema),z.lazy(() => EntryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EntryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EntryWhereInputSchema),z.lazy(() => EntryWhereInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  jobId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  dayId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  entryId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  employeeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isApproved: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  entryConfirmationStatus: z.union([ z.lazy(() => EnumEntryConfirmationStatusFilterSchema),z.lazy(() => EntryConfirmationStatusSchema) ]).optional(),
  timeInSeconds: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  timeOutSeconds: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  lunchSeconds: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  day: z.union([ z.lazy(() => DayRelationFilterSchema),z.lazy(() => DayWhereInputSchema) ]).optional(),
  employee: z.union([ z.lazy(() => EmployeeRelationFilterSchema),z.lazy(() => EmployeeWhereInputSchema) ]).optional(),
}).strict();

export const EntryOrderByWithRelationInputSchema: z.ZodType<Prisma.EntryOrderByWithRelationInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  dayId: z.lazy(() => SortOrderSchema).optional(),
  entryId: z.lazy(() => SortOrderSchema).optional(),
  employeeId: z.lazy(() => SortOrderSchema).optional(),
  isApproved: z.lazy(() => SortOrderSchema).optional(),
  entryConfirmationStatus: z.lazy(() => SortOrderSchema).optional(),
  timeInSeconds: z.lazy(() => SortOrderSchema).optional(),
  timeOutSeconds: z.lazy(() => SortOrderSchema).optional(),
  lunchSeconds: z.lazy(() => SortOrderSchema).optional(),
  day: z.lazy(() => DayOrderByWithRelationInputSchema).optional(),
  employee: z.lazy(() => EmployeeOrderByWithRelationInputSchema).optional()
}).strict();

export const EntryWhereUniqueInputSchema: z.ZodType<Prisma.EntryWhereUniqueInput> = z.object({
  entryPrimaryKey: z.lazy(() => EntryEntryPrimaryKeyCompoundUniqueInputSchema)
})
.and(z.object({
  entryPrimaryKey: z.lazy(() => EntryEntryPrimaryKeyCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => EntryWhereInputSchema),z.lazy(() => EntryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EntryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EntryWhereInputSchema),z.lazy(() => EntryWhereInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  jobId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  dayId: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  entryId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  employeeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isApproved: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  entryConfirmationStatus: z.union([ z.lazy(() => EnumEntryConfirmationStatusFilterSchema),z.lazy(() => EntryConfirmationStatusSchema) ]).optional(),
  timeInSeconds: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  timeOutSeconds: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  lunchSeconds: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  day: z.union([ z.lazy(() => DayRelationFilterSchema),z.lazy(() => DayWhereInputSchema) ]).optional(),
  employee: z.union([ z.lazy(() => EmployeeRelationFilterSchema),z.lazy(() => EmployeeWhereInputSchema) ]).optional(),
}).strict());

export const EntryOrderByWithAggregationInputSchema: z.ZodType<Prisma.EntryOrderByWithAggregationInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  dayId: z.lazy(() => SortOrderSchema).optional(),
  entryId: z.lazy(() => SortOrderSchema).optional(),
  employeeId: z.lazy(() => SortOrderSchema).optional(),
  isApproved: z.lazy(() => SortOrderSchema).optional(),
  entryConfirmationStatus: z.lazy(() => SortOrderSchema).optional(),
  timeInSeconds: z.lazy(() => SortOrderSchema).optional(),
  timeOutSeconds: z.lazy(() => SortOrderSchema).optional(),
  lunchSeconds: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => EntryCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => EntryAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => EntryMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => EntryMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => EntrySumOrderByAggregateInputSchema).optional()
}).strict();

export const EntryScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.EntryScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => EntryScalarWhereWithAggregatesInputSchema),z.lazy(() => EntryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => EntryScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EntryScalarWhereWithAggregatesInputSchema),z.lazy(() => EntryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  jobId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  dayId: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  entryId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  employeeId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  isApproved: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  entryConfirmationStatus: z.union([ z.lazy(() => EnumEntryConfirmationStatusWithAggregatesFilterSchema),z.lazy(() => EntryConfirmationStatusSchema) ]).optional(),
  timeInSeconds: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  timeOutSeconds: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  lunchSeconds: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
}).strict();

export const ActionWhereInputSchema: z.ZodType<Prisma.ActionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ActionWhereInputSchema),z.lazy(() => ActionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ActionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ActionWhereInputSchema),z.lazy(() => ActionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  actorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  targetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  actionType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  actionJson: z.lazy(() => JsonFilterSchema).optional(),
  actor: z.union([ z.lazy(() => AccountRelationFilterSchema),z.lazy(() => AccountWhereInputSchema) ]).optional(),
}).strict();

export const ActionOrderByWithRelationInputSchema: z.ZodType<Prisma.ActionOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.lazy(() => SortOrderSchema).optional(),
  targetId: z.lazy(() => SortOrderSchema).optional(),
  actionType: z.lazy(() => SortOrderSchema).optional(),
  actionJson: z.lazy(() => SortOrderSchema).optional(),
  actor: z.lazy(() => AccountOrderByWithRelationInputSchema).optional()
}).strict();

export const ActionWhereUniqueInputSchema: z.ZodType<Prisma.ActionWhereUniqueInput> = z.object({
  id: z.string()
})
.and(z.object({
  id: z.string().optional(),
  AND: z.union([ z.lazy(() => ActionWhereInputSchema),z.lazy(() => ActionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ActionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ActionWhereInputSchema),z.lazy(() => ActionWhereInputSchema).array() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  actorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  targetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  actionType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  actionJson: z.lazy(() => JsonFilterSchema).optional(),
  actor: z.union([ z.lazy(() => AccountRelationFilterSchema),z.lazy(() => AccountWhereInputSchema) ]).optional(),
}).strict());

export const ActionOrderByWithAggregationInputSchema: z.ZodType<Prisma.ActionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.lazy(() => SortOrderSchema).optional(),
  targetId: z.lazy(() => SortOrderSchema).optional(),
  actionType: z.lazy(() => SortOrderSchema).optional(),
  actionJson: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ActionCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ActionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ActionMinOrderByAggregateInputSchema).optional()
}).strict();

export const ActionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ActionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ActionScalarWhereWithAggregatesInputSchema),z.lazy(() => ActionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ActionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ActionScalarWhereWithAggregatesInputSchema),z.lazy(() => ActionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  actorId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  targetId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  actionType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  actionJson: z.lazy(() => JsonWithAggregatesFilterSchema).optional()
}).strict();

export const AccountCreateInputSchema: z.ZodType<Prisma.AccountCreateInput> = z.object({
  accountId: z.string(),
  isActive: z.boolean(),
  phoneNumber: z.string(),
  accountType: z.lazy(() => AccountTypeSchema),
  daysEdited: z.lazy(() => DayCreateNestedManyWithoutEditorInputSchema).optional(),
  actions: z.lazy(() => ActionCreateNestedManyWithoutActorInputSchema).optional()
}).strict();

export const AccountUncheckedCreateInputSchema: z.ZodType<Prisma.AccountUncheckedCreateInput> = z.object({
  accountId: z.string(),
  isActive: z.boolean(),
  phoneNumber: z.string(),
  accountType: z.lazy(() => AccountTypeSchema),
  daysEdited: z.lazy(() => DayUncheckedCreateNestedManyWithoutEditorInputSchema).optional(),
  actions: z.lazy(() => ActionUncheckedCreateNestedManyWithoutActorInputSchema).optional()
}).strict();

export const AccountUpdateInputSchema: z.ZodType<Prisma.AccountUpdateInput> = z.object({
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountType: z.union([ z.lazy(() => AccountTypeSchema),z.lazy(() => EnumAccountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  daysEdited: z.lazy(() => DayUpdateManyWithoutEditorNestedInputSchema).optional(),
  actions: z.lazy(() => ActionUpdateManyWithoutActorNestedInputSchema).optional()
}).strict();

export const AccountUncheckedUpdateInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateInput> = z.object({
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountType: z.union([ z.lazy(() => AccountTypeSchema),z.lazy(() => EnumAccountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  daysEdited: z.lazy(() => DayUncheckedUpdateManyWithoutEditorNestedInputSchema).optional(),
  actions: z.lazy(() => ActionUncheckedUpdateManyWithoutActorNestedInputSchema).optional()
}).strict();

export const AccountCreateManyInputSchema: z.ZodType<Prisma.AccountCreateManyInput> = z.object({
  accountId: z.string(),
  isActive: z.boolean(),
  phoneNumber: z.string(),
  accountType: z.lazy(() => AccountTypeSchema)
}).strict();

export const AccountUpdateManyMutationInputSchema: z.ZodType<Prisma.AccountUpdateManyMutationInput> = z.object({
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountType: z.union([ z.lazy(() => AccountTypeSchema),z.lazy(() => EnumAccountTypeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountUncheckedUpdateManyInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateManyInput> = z.object({
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountType: z.union([ z.lazy(() => AccountTypeSchema),z.lazy(() => EnumAccountTypeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TimesheetCreateInputSchema: z.ZodType<Prisma.TimesheetCreateInput> = z.object({
  timesheetId: z.string(),
  employees: z.lazy(() => EmployeeCreateNestedManyWithoutTimesheetInputSchema).optional(),
  jobs: z.lazy(() => JobCreateNestedManyWithoutTimesheetInputSchema).optional()
}).strict();

export const TimesheetUncheckedCreateInputSchema: z.ZodType<Prisma.TimesheetUncheckedCreateInput> = z.object({
  timesheetId: z.string(),
  employees: z.lazy(() => EmployeeUncheckedCreateNestedManyWithoutTimesheetInputSchema).optional(),
  jobs: z.lazy(() => JobUncheckedCreateNestedManyWithoutTimesheetInputSchema).optional()
}).strict();

export const TimesheetUpdateInputSchema: z.ZodType<Prisma.TimesheetUpdateInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  employees: z.lazy(() => EmployeeUpdateManyWithoutTimesheetNestedInputSchema).optional(),
  jobs: z.lazy(() => JobUpdateManyWithoutTimesheetNestedInputSchema).optional()
}).strict();

export const TimesheetUncheckedUpdateInputSchema: z.ZodType<Prisma.TimesheetUncheckedUpdateInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  employees: z.lazy(() => EmployeeUncheckedUpdateManyWithoutTimesheetNestedInputSchema).optional(),
  jobs: z.lazy(() => JobUncheckedUpdateManyWithoutTimesheetNestedInputSchema).optional()
}).strict();

export const TimesheetCreateManyInputSchema: z.ZodType<Prisma.TimesheetCreateManyInput> = z.object({
  timesheetId: z.string()
}).strict();

export const TimesheetUpdateManyMutationInputSchema: z.ZodType<Prisma.TimesheetUpdateManyMutationInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TimesheetUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TimesheetUncheckedUpdateManyInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EmployeeCreateInputSchema: z.ZodType<Prisma.EmployeeCreateInput> = z.object({
  employeeId: z.string().optional(),
  isActive: z.boolean(),
  displayId: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  fringeCode: z.string(),
  ratePrivateCentsPerHour: z.number().int(),
  rateDavisBaconCentsPerHour: z.number().int(),
  rateDavisBaconOvertimeCentsPerHour: z.number().int(),
  timesheet: z.lazy(() => TimesheetCreateNestedOneWithoutEmployeesInputSchema),
  entries: z.lazy(() => EntryCreateNestedManyWithoutEmployeeInputSchema).optional()
}).strict();

export const EmployeeUncheckedCreateInputSchema: z.ZodType<Prisma.EmployeeUncheckedCreateInput> = z.object({
  timesheetId: z.string(),
  employeeId: z.string().optional(),
  isActive: z.boolean(),
  displayId: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  fringeCode: z.string(),
  ratePrivateCentsPerHour: z.number().int(),
  rateDavisBaconCentsPerHour: z.number().int(),
  rateDavisBaconOvertimeCentsPerHour: z.number().int(),
  entries: z.lazy(() => EntryUncheckedCreateNestedManyWithoutEmployeeInputSchema).optional()
}).strict();

export const EmployeeUpdateInputSchema: z.ZodType<Prisma.EmployeeUpdateInput> = z.object({
  employeeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fringeCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ratePrivateCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timesheet: z.lazy(() => TimesheetUpdateOneRequiredWithoutEmployeesNestedInputSchema).optional(),
  entries: z.lazy(() => EntryUpdateManyWithoutEmployeeNestedInputSchema).optional()
}).strict();

export const EmployeeUncheckedUpdateInputSchema: z.ZodType<Prisma.EmployeeUncheckedUpdateInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  employeeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fringeCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ratePrivateCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  entries: z.lazy(() => EntryUncheckedUpdateManyWithoutEmployeeNestedInputSchema).optional()
}).strict();

export const EmployeeCreateManyInputSchema: z.ZodType<Prisma.EmployeeCreateManyInput> = z.object({
  timesheetId: z.string(),
  employeeId: z.string().optional(),
  isActive: z.boolean(),
  displayId: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  fringeCode: z.string(),
  ratePrivateCentsPerHour: z.number().int(),
  rateDavisBaconCentsPerHour: z.number().int(),
  rateDavisBaconOvertimeCentsPerHour: z.number().int()
}).strict();

export const EmployeeUpdateManyMutationInputSchema: z.ZodType<Prisma.EmployeeUpdateManyMutationInput> = z.object({
  employeeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fringeCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ratePrivateCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EmployeeUncheckedUpdateManyInputSchema: z.ZodType<Prisma.EmployeeUncheckedUpdateManyInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  employeeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fringeCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ratePrivateCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const JobCreateInputSchema: z.ZodType<Prisma.JobCreateInput> = z.object({
  jobId: z.string().optional(),
  oldJobId: z.number().int(),
  isActive: z.boolean(),
  name: z.string(),
  budgetOriginalCents: z.number().int().optional().nullable(),
  budgetCurrentCents: z.number().int().optional().nullable(),
  originalLaborSeconds: z.number().int().optional().nullable(),
  currentLaborSeconds: z.number().int().optional().nullable(),
  jobType: z.lazy(() => JobTypeSchema),
  timesheet: z.lazy(() => TimesheetCreateNestedOneWithoutJobsInputSchema),
  days: z.lazy(() => DayCreateNestedManyWithoutJobInputSchema).optional()
}).strict();

export const JobUncheckedCreateInputSchema: z.ZodType<Prisma.JobUncheckedCreateInput> = z.object({
  timesheetId: z.string(),
  jobId: z.string().optional(),
  oldJobId: z.number().int(),
  isActive: z.boolean(),
  name: z.string(),
  budgetOriginalCents: z.number().int().optional().nullable(),
  budgetCurrentCents: z.number().int().optional().nullable(),
  originalLaborSeconds: z.number().int().optional().nullable(),
  currentLaborSeconds: z.number().int().optional().nullable(),
  jobType: z.lazy(() => JobTypeSchema),
  days: z.lazy(() => DayUncheckedCreateNestedManyWithoutJobInputSchema).optional()
}).strict();

export const JobUpdateInputSchema: z.ZodType<Prisma.JobUpdateInput> = z.object({
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  oldJobId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  budgetOriginalCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  budgetCurrentCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  originalLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  jobType: z.union([ z.lazy(() => JobTypeSchema),z.lazy(() => EnumJobTypeFieldUpdateOperationsInputSchema) ]).optional(),
  timesheet: z.lazy(() => TimesheetUpdateOneRequiredWithoutJobsNestedInputSchema).optional(),
  days: z.lazy(() => DayUpdateManyWithoutJobNestedInputSchema).optional()
}).strict();

export const JobUncheckedUpdateInputSchema: z.ZodType<Prisma.JobUncheckedUpdateInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  oldJobId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  budgetOriginalCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  budgetCurrentCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  originalLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  jobType: z.union([ z.lazy(() => JobTypeSchema),z.lazy(() => EnumJobTypeFieldUpdateOperationsInputSchema) ]).optional(),
  days: z.lazy(() => DayUncheckedUpdateManyWithoutJobNestedInputSchema).optional()
}).strict();

export const JobCreateManyInputSchema: z.ZodType<Prisma.JobCreateManyInput> = z.object({
  timesheetId: z.string(),
  jobId: z.string().optional(),
  oldJobId: z.number().int(),
  isActive: z.boolean(),
  name: z.string(),
  budgetOriginalCents: z.number().int().optional().nullable(),
  budgetCurrentCents: z.number().int().optional().nullable(),
  originalLaborSeconds: z.number().int().optional().nullable(),
  currentLaborSeconds: z.number().int().optional().nullable(),
  jobType: z.lazy(() => JobTypeSchema)
}).strict();

export const JobUpdateManyMutationInputSchema: z.ZodType<Prisma.JobUpdateManyMutationInput> = z.object({
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  oldJobId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  budgetOriginalCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  budgetCurrentCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  originalLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  jobType: z.union([ z.lazy(() => JobTypeSchema),z.lazy(() => EnumJobTypeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const JobUncheckedUpdateManyInputSchema: z.ZodType<Prisma.JobUncheckedUpdateManyInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  oldJobId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  budgetOriginalCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  budgetCurrentCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  originalLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  jobType: z.union([ z.lazy(() => JobTypeSchema),z.lazy(() => EnumJobTypeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const DayCreateInputSchema: z.ZodType<Prisma.DayCreateInput> = z.object({
  dayId: z.number().int(),
  description: z.string(),
  job: z.lazy(() => JobCreateNestedOneWithoutDaysInputSchema),
  editor: z.lazy(() => AccountCreateNestedOneWithoutDaysEditedInputSchema).optional(),
  entries: z.lazy(() => EntryCreateNestedManyWithoutDayInputSchema).optional()
}).strict();

export const DayUncheckedCreateInputSchema: z.ZodType<Prisma.DayUncheckedCreateInput> = z.object({
  timesheetId: z.string(),
  jobId: z.string(),
  dayId: z.number().int(),
  editorId: z.string().optional().nullable(),
  description: z.string(),
  entries: z.lazy(() => EntryUncheckedCreateNestedManyWithoutDayInputSchema).optional()
}).strict();

export const DayUpdateInputSchema: z.ZodType<Prisma.DayUpdateInput> = z.object({
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  job: z.lazy(() => JobUpdateOneRequiredWithoutDaysNestedInputSchema).optional(),
  editor: z.lazy(() => AccountUpdateOneWithoutDaysEditedNestedInputSchema).optional(),
  entries: z.lazy(() => EntryUpdateManyWithoutDayNestedInputSchema).optional()
}).strict();

export const DayUncheckedUpdateInputSchema: z.ZodType<Prisma.DayUncheckedUpdateInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  editorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entries: z.lazy(() => EntryUncheckedUpdateManyWithoutDayNestedInputSchema).optional()
}).strict();

export const DayCreateManyInputSchema: z.ZodType<Prisma.DayCreateManyInput> = z.object({
  timesheetId: z.string(),
  jobId: z.string(),
  dayId: z.number().int(),
  editorId: z.string().optional().nullable(),
  description: z.string()
}).strict();

export const DayUpdateManyMutationInputSchema: z.ZodType<Prisma.DayUpdateManyMutationInput> = z.object({
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const DayUncheckedUpdateManyInputSchema: z.ZodType<Prisma.DayUncheckedUpdateManyInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  editorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EntryCreateInputSchema: z.ZodType<Prisma.EntryCreateInput> = z.object({
  entryId: z.string().optional(),
  isApproved: z.boolean(),
  entryConfirmationStatus: z.lazy(() => EntryConfirmationStatusSchema),
  timeInSeconds: z.number().int(),
  timeOutSeconds: z.number().int(),
  lunchSeconds: z.number().int(),
  day: z.lazy(() => DayCreateNestedOneWithoutEntriesInputSchema),
  employee: z.lazy(() => EmployeeCreateNestedOneWithoutEntriesInputSchema)
}).strict();

export const EntryUncheckedCreateInputSchema: z.ZodType<Prisma.EntryUncheckedCreateInput> = z.object({
  timesheetId: z.string(),
  jobId: z.string(),
  dayId: z.number().int(),
  entryId: z.string().optional(),
  employeeId: z.string(),
  isApproved: z.boolean(),
  entryConfirmationStatus: z.lazy(() => EntryConfirmationStatusSchema),
  timeInSeconds: z.number().int(),
  timeOutSeconds: z.number().int(),
  lunchSeconds: z.number().int()
}).strict();

export const EntryUpdateInputSchema: z.ZodType<Prisma.EntryUpdateInput> = z.object({
  entryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isApproved: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  entryConfirmationStatus: z.union([ z.lazy(() => EntryConfirmationStatusSchema),z.lazy(() => EnumEntryConfirmationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  timeInSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timeOutSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lunchSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  day: z.lazy(() => DayUpdateOneRequiredWithoutEntriesNestedInputSchema).optional(),
  employee: z.lazy(() => EmployeeUpdateOneRequiredWithoutEntriesNestedInputSchema).optional()
}).strict();

export const EntryUncheckedUpdateInputSchema: z.ZodType<Prisma.EntryUncheckedUpdateInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  entryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  employeeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isApproved: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  entryConfirmationStatus: z.union([ z.lazy(() => EntryConfirmationStatusSchema),z.lazy(() => EnumEntryConfirmationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  timeInSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timeOutSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lunchSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EntryCreateManyInputSchema: z.ZodType<Prisma.EntryCreateManyInput> = z.object({
  timesheetId: z.string(),
  jobId: z.string(),
  dayId: z.number().int(),
  entryId: z.string().optional(),
  employeeId: z.string(),
  isApproved: z.boolean(),
  entryConfirmationStatus: z.lazy(() => EntryConfirmationStatusSchema),
  timeInSeconds: z.number().int(),
  timeOutSeconds: z.number().int(),
  lunchSeconds: z.number().int()
}).strict();

export const EntryUpdateManyMutationInputSchema: z.ZodType<Prisma.EntryUpdateManyMutationInput> = z.object({
  entryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isApproved: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  entryConfirmationStatus: z.union([ z.lazy(() => EntryConfirmationStatusSchema),z.lazy(() => EnumEntryConfirmationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  timeInSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timeOutSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lunchSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EntryUncheckedUpdateManyInputSchema: z.ZodType<Prisma.EntryUncheckedUpdateManyInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  entryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  employeeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isApproved: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  entryConfirmationStatus: z.union([ z.lazy(() => EntryConfirmationStatusSchema),z.lazy(() => EnumEntryConfirmationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  timeInSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timeOutSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lunchSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ActionCreateInputSchema: z.ZodType<Prisma.ActionCreateInput> = z.object({
  id: z.string().optional(),
  timestamp: z.coerce.date().optional(),
  targetId: z.string(),
  actionType: z.string(),
  actionJson: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  actor: z.lazy(() => AccountCreateNestedOneWithoutActionsInputSchema)
}).strict();

export const ActionUncheckedCreateInputSchema: z.ZodType<Prisma.ActionUncheckedCreateInput> = z.object({
  id: z.string().optional(),
  timestamp: z.coerce.date().optional(),
  actorId: z.string(),
  targetId: z.string(),
  actionType: z.string(),
  actionJson: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
}).strict();

export const ActionUpdateInputSchema: z.ZodType<Prisma.ActionUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  targetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actionType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actionJson: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  actor: z.lazy(() => AccountUpdateOneRequiredWithoutActionsNestedInputSchema).optional()
}).strict();

export const ActionUncheckedUpdateInputSchema: z.ZodType<Prisma.ActionUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  actorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  targetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actionType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actionJson: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export const ActionCreateManyInputSchema: z.ZodType<Prisma.ActionCreateManyInput> = z.object({
  id: z.string().optional(),
  timestamp: z.coerce.date().optional(),
  actorId: z.string(),
  targetId: z.string(),
  actionType: z.string(),
  actionJson: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
}).strict();

export const ActionUpdateManyMutationInputSchema: z.ZodType<Prisma.ActionUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  targetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actionType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actionJson: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export const ActionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ActionUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  actorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  targetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actionType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actionJson: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const EnumAccountTypeFilterSchema: z.ZodType<Prisma.EnumAccountTypeFilter> = z.object({
  equals: z.lazy(() => AccountTypeSchema).optional(),
  in: z.lazy(() => AccountTypeSchema).array().optional(),
  notIn: z.lazy(() => AccountTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => AccountTypeSchema),z.lazy(() => NestedEnumAccountTypeFilterSchema) ]).optional(),
}).strict();

export const DayListRelationFilterSchema: z.ZodType<Prisma.DayListRelationFilter> = z.object({
  every: z.lazy(() => DayWhereInputSchema).optional(),
  some: z.lazy(() => DayWhereInputSchema).optional(),
  none: z.lazy(() => DayWhereInputSchema).optional()
}).strict();

export const ActionListRelationFilterSchema: z.ZodType<Prisma.ActionListRelationFilter> = z.object({
  every: z.lazy(() => ActionWhereInputSchema).optional(),
  some: z.lazy(() => ActionWhereInputSchema).optional(),
  none: z.lazy(() => ActionWhereInputSchema).optional()
}).strict();

export const DayOrderByRelationAggregateInputSchema: z.ZodType<Prisma.DayOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ActionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ActionOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountCountOrderByAggregateInputSchema: z.ZodType<Prisma.AccountCountOrderByAggregateInput> = z.object({
  accountId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  phoneNumber: z.lazy(() => SortOrderSchema).optional(),
  accountType: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountMaxOrderByAggregateInputSchema: z.ZodType<Prisma.AccountMaxOrderByAggregateInput> = z.object({
  accountId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  phoneNumber: z.lazy(() => SortOrderSchema).optional(),
  accountType: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountMinOrderByAggregateInputSchema: z.ZodType<Prisma.AccountMinOrderByAggregateInput> = z.object({
  accountId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  phoneNumber: z.lazy(() => SortOrderSchema).optional(),
  accountType: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const EnumAccountTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumAccountTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => AccountTypeSchema).optional(),
  in: z.lazy(() => AccountTypeSchema).array().optional(),
  notIn: z.lazy(() => AccountTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => AccountTypeSchema),z.lazy(() => NestedEnumAccountTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumAccountTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumAccountTypeFilterSchema).optional()
}).strict();

export const EmployeeListRelationFilterSchema: z.ZodType<Prisma.EmployeeListRelationFilter> = z.object({
  every: z.lazy(() => EmployeeWhereInputSchema).optional(),
  some: z.lazy(() => EmployeeWhereInputSchema).optional(),
  none: z.lazy(() => EmployeeWhereInputSchema).optional()
}).strict();

export const JobListRelationFilterSchema: z.ZodType<Prisma.JobListRelationFilter> = z.object({
  every: z.lazy(() => JobWhereInputSchema).optional(),
  some: z.lazy(() => JobWhereInputSchema).optional(),
  none: z.lazy(() => JobWhereInputSchema).optional()
}).strict();

export const EmployeeOrderByRelationAggregateInputSchema: z.ZodType<Prisma.EmployeeOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const JobOrderByRelationAggregateInputSchema: z.ZodType<Prisma.JobOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TimesheetCountOrderByAggregateInputSchema: z.ZodType<Prisma.TimesheetCountOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TimesheetMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TimesheetMaxOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TimesheetMinOrderByAggregateInputSchema: z.ZodType<Prisma.TimesheetMinOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const TimesheetRelationFilterSchema: z.ZodType<Prisma.TimesheetRelationFilter> = z.object({
  is: z.lazy(() => TimesheetWhereInputSchema).optional(),
  isNot: z.lazy(() => TimesheetWhereInputSchema).optional()
}).strict();

export const EntryListRelationFilterSchema: z.ZodType<Prisma.EntryListRelationFilter> = z.object({
  every: z.lazy(() => EntryWhereInputSchema).optional(),
  some: z.lazy(() => EntryWhereInputSchema).optional(),
  none: z.lazy(() => EntryWhereInputSchema).optional()
}).strict();

export const EntryOrderByRelationAggregateInputSchema: z.ZodType<Prisma.EntryOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EmployeeEmployeePrimaryKeyCompoundUniqueInputSchema: z.ZodType<Prisma.EmployeeEmployeePrimaryKeyCompoundUniqueInput> = z.object({
  timesheetId: z.string(),
  employeeId: z.string()
}).strict();

export const EmployeeCountOrderByAggregateInputSchema: z.ZodType<Prisma.EmployeeCountOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  employeeId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  displayId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phoneNumber: z.lazy(() => SortOrderSchema).optional(),
  fringeCode: z.lazy(() => SortOrderSchema).optional(),
  ratePrivateCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  rateDavisBaconCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EmployeeAvgOrderByAggregateInputSchema: z.ZodType<Prisma.EmployeeAvgOrderByAggregateInput> = z.object({
  ratePrivateCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  rateDavisBaconCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EmployeeMaxOrderByAggregateInputSchema: z.ZodType<Prisma.EmployeeMaxOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  employeeId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  displayId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phoneNumber: z.lazy(() => SortOrderSchema).optional(),
  fringeCode: z.lazy(() => SortOrderSchema).optional(),
  ratePrivateCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  rateDavisBaconCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EmployeeMinOrderByAggregateInputSchema: z.ZodType<Prisma.EmployeeMinOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  employeeId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  displayId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phoneNumber: z.lazy(() => SortOrderSchema).optional(),
  fringeCode: z.lazy(() => SortOrderSchema).optional(),
  ratePrivateCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  rateDavisBaconCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EmployeeSumOrderByAggregateInputSchema: z.ZodType<Prisma.EmployeeSumOrderByAggregateInput> = z.object({
  ratePrivateCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  rateDavisBaconCentsPerHour: z.lazy(() => SortOrderSchema).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const IntNullableFilterSchema: z.ZodType<Prisma.IntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const EnumJobTypeFilterSchema: z.ZodType<Prisma.EnumJobTypeFilter> = z.object({
  equals: z.lazy(() => JobTypeSchema).optional(),
  in: z.lazy(() => JobTypeSchema).array().optional(),
  notIn: z.lazy(() => JobTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => JobTypeSchema),z.lazy(() => NestedEnumJobTypeFilterSchema) ]).optional(),
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const JobTimesheetIdOldJobIdCompoundUniqueInputSchema: z.ZodType<Prisma.JobTimesheetIdOldJobIdCompoundUniqueInput> = z.object({
  timesheetId: z.string(),
  oldJobId: z.number()
}).strict();

export const JobJobPrimaryKeyCompoundUniqueInputSchema: z.ZodType<Prisma.JobJobPrimaryKeyCompoundUniqueInput> = z.object({
  timesheetId: z.string(),
  jobId: z.string()
}).strict();

export const JobCountOrderByAggregateInputSchema: z.ZodType<Prisma.JobCountOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  oldJobId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  budgetOriginalCents: z.lazy(() => SortOrderSchema).optional(),
  budgetCurrentCents: z.lazy(() => SortOrderSchema).optional(),
  originalLaborSeconds: z.lazy(() => SortOrderSchema).optional(),
  currentLaborSeconds: z.lazy(() => SortOrderSchema).optional(),
  jobType: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const JobAvgOrderByAggregateInputSchema: z.ZodType<Prisma.JobAvgOrderByAggregateInput> = z.object({
  oldJobId: z.lazy(() => SortOrderSchema).optional(),
  budgetOriginalCents: z.lazy(() => SortOrderSchema).optional(),
  budgetCurrentCents: z.lazy(() => SortOrderSchema).optional(),
  originalLaborSeconds: z.lazy(() => SortOrderSchema).optional(),
  currentLaborSeconds: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const JobMaxOrderByAggregateInputSchema: z.ZodType<Prisma.JobMaxOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  oldJobId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  budgetOriginalCents: z.lazy(() => SortOrderSchema).optional(),
  budgetCurrentCents: z.lazy(() => SortOrderSchema).optional(),
  originalLaborSeconds: z.lazy(() => SortOrderSchema).optional(),
  currentLaborSeconds: z.lazy(() => SortOrderSchema).optional(),
  jobType: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const JobMinOrderByAggregateInputSchema: z.ZodType<Prisma.JobMinOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  oldJobId: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  budgetOriginalCents: z.lazy(() => SortOrderSchema).optional(),
  budgetCurrentCents: z.lazy(() => SortOrderSchema).optional(),
  originalLaborSeconds: z.lazy(() => SortOrderSchema).optional(),
  currentLaborSeconds: z.lazy(() => SortOrderSchema).optional(),
  jobType: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const JobSumOrderByAggregateInputSchema: z.ZodType<Prisma.JobSumOrderByAggregateInput> = z.object({
  oldJobId: z.lazy(() => SortOrderSchema).optional(),
  budgetOriginalCents: z.lazy(() => SortOrderSchema).optional(),
  budgetCurrentCents: z.lazy(() => SortOrderSchema).optional(),
  originalLaborSeconds: z.lazy(() => SortOrderSchema).optional(),
  currentLaborSeconds: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const IntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.IntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict();

export const EnumJobTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumJobTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => JobTypeSchema).optional(),
  in: z.lazy(() => JobTypeSchema).array().optional(),
  notIn: z.lazy(() => JobTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => JobTypeSchema),z.lazy(() => NestedEnumJobTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumJobTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumJobTypeFilterSchema).optional()
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const JobRelationFilterSchema: z.ZodType<Prisma.JobRelationFilter> = z.object({
  is: z.lazy(() => JobWhereInputSchema).optional(),
  isNot: z.lazy(() => JobWhereInputSchema).optional()
}).strict();

export const AccountNullableRelationFilterSchema: z.ZodType<Prisma.AccountNullableRelationFilter> = z.object({
  is: z.lazy(() => AccountWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => AccountWhereInputSchema).optional().nullable()
}).strict();

export const DayDayPrimaryKeyCompoundUniqueInputSchema: z.ZodType<Prisma.DayDayPrimaryKeyCompoundUniqueInput> = z.object({
  timesheetId: z.string(),
  jobId: z.string(),
  dayId: z.number()
}).strict();

export const DayCountOrderByAggregateInputSchema: z.ZodType<Prisma.DayCountOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  dayId: z.lazy(() => SortOrderSchema).optional(),
  editorId: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DayAvgOrderByAggregateInputSchema: z.ZodType<Prisma.DayAvgOrderByAggregateInput> = z.object({
  dayId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DayMaxOrderByAggregateInputSchema: z.ZodType<Prisma.DayMaxOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  dayId: z.lazy(() => SortOrderSchema).optional(),
  editorId: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DayMinOrderByAggregateInputSchema: z.ZodType<Prisma.DayMinOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  dayId: z.lazy(() => SortOrderSchema).optional(),
  editorId: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DaySumOrderByAggregateInputSchema: z.ZodType<Prisma.DaySumOrderByAggregateInput> = z.object({
  dayId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const EnumEntryConfirmationStatusFilterSchema: z.ZodType<Prisma.EnumEntryConfirmationStatusFilter> = z.object({
  equals: z.lazy(() => EntryConfirmationStatusSchema).optional(),
  in: z.lazy(() => EntryConfirmationStatusSchema).array().optional(),
  notIn: z.lazy(() => EntryConfirmationStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => EntryConfirmationStatusSchema),z.lazy(() => NestedEnumEntryConfirmationStatusFilterSchema) ]).optional(),
}).strict();

export const DayRelationFilterSchema: z.ZodType<Prisma.DayRelationFilter> = z.object({
  is: z.lazy(() => DayWhereInputSchema).optional(),
  isNot: z.lazy(() => DayWhereInputSchema).optional()
}).strict();

export const EmployeeRelationFilterSchema: z.ZodType<Prisma.EmployeeRelationFilter> = z.object({
  is: z.lazy(() => EmployeeWhereInputSchema).optional(),
  isNot: z.lazy(() => EmployeeWhereInputSchema).optional()
}).strict();

export const EntryEntryPrimaryKeyCompoundUniqueInputSchema: z.ZodType<Prisma.EntryEntryPrimaryKeyCompoundUniqueInput> = z.object({
  timesheetId: z.string(),
  jobId: z.string(),
  dayId: z.number(),
  entryId: z.string()
}).strict();

export const EntryCountOrderByAggregateInputSchema: z.ZodType<Prisma.EntryCountOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  dayId: z.lazy(() => SortOrderSchema).optional(),
  entryId: z.lazy(() => SortOrderSchema).optional(),
  employeeId: z.lazy(() => SortOrderSchema).optional(),
  isApproved: z.lazy(() => SortOrderSchema).optional(),
  entryConfirmationStatus: z.lazy(() => SortOrderSchema).optional(),
  timeInSeconds: z.lazy(() => SortOrderSchema).optional(),
  timeOutSeconds: z.lazy(() => SortOrderSchema).optional(),
  lunchSeconds: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EntryAvgOrderByAggregateInputSchema: z.ZodType<Prisma.EntryAvgOrderByAggregateInput> = z.object({
  dayId: z.lazy(() => SortOrderSchema).optional(),
  timeInSeconds: z.lazy(() => SortOrderSchema).optional(),
  timeOutSeconds: z.lazy(() => SortOrderSchema).optional(),
  lunchSeconds: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EntryMaxOrderByAggregateInputSchema: z.ZodType<Prisma.EntryMaxOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  dayId: z.lazy(() => SortOrderSchema).optional(),
  entryId: z.lazy(() => SortOrderSchema).optional(),
  employeeId: z.lazy(() => SortOrderSchema).optional(),
  isApproved: z.lazy(() => SortOrderSchema).optional(),
  entryConfirmationStatus: z.lazy(() => SortOrderSchema).optional(),
  timeInSeconds: z.lazy(() => SortOrderSchema).optional(),
  timeOutSeconds: z.lazy(() => SortOrderSchema).optional(),
  lunchSeconds: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EntryMinOrderByAggregateInputSchema: z.ZodType<Prisma.EntryMinOrderByAggregateInput> = z.object({
  timesheetId: z.lazy(() => SortOrderSchema).optional(),
  jobId: z.lazy(() => SortOrderSchema).optional(),
  dayId: z.lazy(() => SortOrderSchema).optional(),
  entryId: z.lazy(() => SortOrderSchema).optional(),
  employeeId: z.lazy(() => SortOrderSchema).optional(),
  isApproved: z.lazy(() => SortOrderSchema).optional(),
  entryConfirmationStatus: z.lazy(() => SortOrderSchema).optional(),
  timeInSeconds: z.lazy(() => SortOrderSchema).optional(),
  timeOutSeconds: z.lazy(() => SortOrderSchema).optional(),
  lunchSeconds: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EntrySumOrderByAggregateInputSchema: z.ZodType<Prisma.EntrySumOrderByAggregateInput> = z.object({
  dayId: z.lazy(() => SortOrderSchema).optional(),
  timeInSeconds: z.lazy(() => SortOrderSchema).optional(),
  timeOutSeconds: z.lazy(() => SortOrderSchema).optional(),
  lunchSeconds: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumEntryConfirmationStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumEntryConfirmationStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => EntryConfirmationStatusSchema).optional(),
  in: z.lazy(() => EntryConfirmationStatusSchema).array().optional(),
  notIn: z.lazy(() => EntryConfirmationStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => EntryConfirmationStatusSchema),z.lazy(() => NestedEnumEntryConfirmationStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumEntryConfirmationStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumEntryConfirmationStatusFilterSchema).optional()
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const JsonFilterSchema: z.ZodType<Prisma.JsonFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional()
}).strict();

export const AccountRelationFilterSchema: z.ZodType<Prisma.AccountRelationFilter> = z.object({
  is: z.lazy(() => AccountWhereInputSchema).optional(),
  isNot: z.lazy(() => AccountWhereInputSchema).optional()
}).strict();

export const ActionCountOrderByAggregateInputSchema: z.ZodType<Prisma.ActionCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.lazy(() => SortOrderSchema).optional(),
  targetId: z.lazy(() => SortOrderSchema).optional(),
  actionType: z.lazy(() => SortOrderSchema).optional(),
  actionJson: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ActionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ActionMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.lazy(() => SortOrderSchema).optional(),
  targetId: z.lazy(() => SortOrderSchema).optional(),
  actionType: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ActionMinOrderByAggregateInputSchema: z.ZodType<Prisma.ActionMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.lazy(() => SortOrderSchema).optional(),
  targetId: z.lazy(() => SortOrderSchema).optional(),
  actionType: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const JsonWithAggregatesFilterSchema: z.ZodType<Prisma.JsonWithAggregatesFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedJsonFilterSchema).optional(),
  _max: z.lazy(() => NestedJsonFilterSchema).optional()
}).strict();

export const DayCreateNestedManyWithoutEditorInputSchema: z.ZodType<Prisma.DayCreateNestedManyWithoutEditorInput> = z.object({
  create: z.union([ z.lazy(() => DayCreateWithoutEditorInputSchema),z.lazy(() => DayCreateWithoutEditorInputSchema).array(),z.lazy(() => DayUncheckedCreateWithoutEditorInputSchema),z.lazy(() => DayUncheckedCreateWithoutEditorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => DayCreateOrConnectWithoutEditorInputSchema),z.lazy(() => DayCreateOrConnectWithoutEditorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => DayCreateManyEditorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ActionCreateNestedManyWithoutActorInputSchema: z.ZodType<Prisma.ActionCreateNestedManyWithoutActorInput> = z.object({
  create: z.union([ z.lazy(() => ActionCreateWithoutActorInputSchema),z.lazy(() => ActionCreateWithoutActorInputSchema).array(),z.lazy(() => ActionUncheckedCreateWithoutActorInputSchema),z.lazy(() => ActionUncheckedCreateWithoutActorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ActionCreateOrConnectWithoutActorInputSchema),z.lazy(() => ActionCreateOrConnectWithoutActorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ActionCreateManyActorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ActionWhereUniqueInputSchema),z.lazy(() => ActionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const DayUncheckedCreateNestedManyWithoutEditorInputSchema: z.ZodType<Prisma.DayUncheckedCreateNestedManyWithoutEditorInput> = z.object({
  create: z.union([ z.lazy(() => DayCreateWithoutEditorInputSchema),z.lazy(() => DayCreateWithoutEditorInputSchema).array(),z.lazy(() => DayUncheckedCreateWithoutEditorInputSchema),z.lazy(() => DayUncheckedCreateWithoutEditorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => DayCreateOrConnectWithoutEditorInputSchema),z.lazy(() => DayCreateOrConnectWithoutEditorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => DayCreateManyEditorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ActionUncheckedCreateNestedManyWithoutActorInputSchema: z.ZodType<Prisma.ActionUncheckedCreateNestedManyWithoutActorInput> = z.object({
  create: z.union([ z.lazy(() => ActionCreateWithoutActorInputSchema),z.lazy(() => ActionCreateWithoutActorInputSchema).array(),z.lazy(() => ActionUncheckedCreateWithoutActorInputSchema),z.lazy(() => ActionUncheckedCreateWithoutActorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ActionCreateOrConnectWithoutActorInputSchema),z.lazy(() => ActionCreateOrConnectWithoutActorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ActionCreateManyActorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ActionWhereUniqueInputSchema),z.lazy(() => ActionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict();

export const EnumAccountTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumAccountTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => AccountTypeSchema).optional()
}).strict();

export const DayUpdateManyWithoutEditorNestedInputSchema: z.ZodType<Prisma.DayUpdateManyWithoutEditorNestedInput> = z.object({
  create: z.union([ z.lazy(() => DayCreateWithoutEditorInputSchema),z.lazy(() => DayCreateWithoutEditorInputSchema).array(),z.lazy(() => DayUncheckedCreateWithoutEditorInputSchema),z.lazy(() => DayUncheckedCreateWithoutEditorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => DayCreateOrConnectWithoutEditorInputSchema),z.lazy(() => DayCreateOrConnectWithoutEditorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => DayUpsertWithWhereUniqueWithoutEditorInputSchema),z.lazy(() => DayUpsertWithWhereUniqueWithoutEditorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => DayCreateManyEditorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => DayUpdateWithWhereUniqueWithoutEditorInputSchema),z.lazy(() => DayUpdateWithWhereUniqueWithoutEditorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => DayUpdateManyWithWhereWithoutEditorInputSchema),z.lazy(() => DayUpdateManyWithWhereWithoutEditorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => DayScalarWhereInputSchema),z.lazy(() => DayScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ActionUpdateManyWithoutActorNestedInputSchema: z.ZodType<Prisma.ActionUpdateManyWithoutActorNestedInput> = z.object({
  create: z.union([ z.lazy(() => ActionCreateWithoutActorInputSchema),z.lazy(() => ActionCreateWithoutActorInputSchema).array(),z.lazy(() => ActionUncheckedCreateWithoutActorInputSchema),z.lazy(() => ActionUncheckedCreateWithoutActorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ActionCreateOrConnectWithoutActorInputSchema),z.lazy(() => ActionCreateOrConnectWithoutActorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ActionUpsertWithWhereUniqueWithoutActorInputSchema),z.lazy(() => ActionUpsertWithWhereUniqueWithoutActorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ActionCreateManyActorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ActionWhereUniqueInputSchema),z.lazy(() => ActionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ActionWhereUniqueInputSchema),z.lazy(() => ActionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ActionWhereUniqueInputSchema),z.lazy(() => ActionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ActionWhereUniqueInputSchema),z.lazy(() => ActionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ActionUpdateWithWhereUniqueWithoutActorInputSchema),z.lazy(() => ActionUpdateWithWhereUniqueWithoutActorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ActionUpdateManyWithWhereWithoutActorInputSchema),z.lazy(() => ActionUpdateManyWithWhereWithoutActorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ActionScalarWhereInputSchema),z.lazy(() => ActionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const DayUncheckedUpdateManyWithoutEditorNestedInputSchema: z.ZodType<Prisma.DayUncheckedUpdateManyWithoutEditorNestedInput> = z.object({
  create: z.union([ z.lazy(() => DayCreateWithoutEditorInputSchema),z.lazy(() => DayCreateWithoutEditorInputSchema).array(),z.lazy(() => DayUncheckedCreateWithoutEditorInputSchema),z.lazy(() => DayUncheckedCreateWithoutEditorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => DayCreateOrConnectWithoutEditorInputSchema),z.lazy(() => DayCreateOrConnectWithoutEditorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => DayUpsertWithWhereUniqueWithoutEditorInputSchema),z.lazy(() => DayUpsertWithWhereUniqueWithoutEditorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => DayCreateManyEditorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => DayUpdateWithWhereUniqueWithoutEditorInputSchema),z.lazy(() => DayUpdateWithWhereUniqueWithoutEditorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => DayUpdateManyWithWhereWithoutEditorInputSchema),z.lazy(() => DayUpdateManyWithWhereWithoutEditorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => DayScalarWhereInputSchema),z.lazy(() => DayScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ActionUncheckedUpdateManyWithoutActorNestedInputSchema: z.ZodType<Prisma.ActionUncheckedUpdateManyWithoutActorNestedInput> = z.object({
  create: z.union([ z.lazy(() => ActionCreateWithoutActorInputSchema),z.lazy(() => ActionCreateWithoutActorInputSchema).array(),z.lazy(() => ActionUncheckedCreateWithoutActorInputSchema),z.lazy(() => ActionUncheckedCreateWithoutActorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ActionCreateOrConnectWithoutActorInputSchema),z.lazy(() => ActionCreateOrConnectWithoutActorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ActionUpsertWithWhereUniqueWithoutActorInputSchema),z.lazy(() => ActionUpsertWithWhereUniqueWithoutActorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ActionCreateManyActorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ActionWhereUniqueInputSchema),z.lazy(() => ActionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ActionWhereUniqueInputSchema),z.lazy(() => ActionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ActionWhereUniqueInputSchema),z.lazy(() => ActionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ActionWhereUniqueInputSchema),z.lazy(() => ActionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ActionUpdateWithWhereUniqueWithoutActorInputSchema),z.lazy(() => ActionUpdateWithWhereUniqueWithoutActorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ActionUpdateManyWithWhereWithoutActorInputSchema),z.lazy(() => ActionUpdateManyWithWhereWithoutActorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ActionScalarWhereInputSchema),z.lazy(() => ActionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const EmployeeCreateNestedManyWithoutTimesheetInputSchema: z.ZodType<Prisma.EmployeeCreateNestedManyWithoutTimesheetInput> = z.object({
  create: z.union([ z.lazy(() => EmployeeCreateWithoutTimesheetInputSchema),z.lazy(() => EmployeeCreateWithoutTimesheetInputSchema).array(),z.lazy(() => EmployeeUncheckedCreateWithoutTimesheetInputSchema),z.lazy(() => EmployeeUncheckedCreateWithoutTimesheetInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmployeeCreateOrConnectWithoutTimesheetInputSchema),z.lazy(() => EmployeeCreateOrConnectWithoutTimesheetInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmployeeCreateManyTimesheetInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EmployeeWhereUniqueInputSchema),z.lazy(() => EmployeeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const JobCreateNestedManyWithoutTimesheetInputSchema: z.ZodType<Prisma.JobCreateNestedManyWithoutTimesheetInput> = z.object({
  create: z.union([ z.lazy(() => JobCreateWithoutTimesheetInputSchema),z.lazy(() => JobCreateWithoutTimesheetInputSchema).array(),z.lazy(() => JobUncheckedCreateWithoutTimesheetInputSchema),z.lazy(() => JobUncheckedCreateWithoutTimesheetInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JobCreateOrConnectWithoutTimesheetInputSchema),z.lazy(() => JobCreateOrConnectWithoutTimesheetInputSchema).array() ]).optional(),
  createMany: z.lazy(() => JobCreateManyTimesheetInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => JobWhereUniqueInputSchema),z.lazy(() => JobWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EmployeeUncheckedCreateNestedManyWithoutTimesheetInputSchema: z.ZodType<Prisma.EmployeeUncheckedCreateNestedManyWithoutTimesheetInput> = z.object({
  create: z.union([ z.lazy(() => EmployeeCreateWithoutTimesheetInputSchema),z.lazy(() => EmployeeCreateWithoutTimesheetInputSchema).array(),z.lazy(() => EmployeeUncheckedCreateWithoutTimesheetInputSchema),z.lazy(() => EmployeeUncheckedCreateWithoutTimesheetInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmployeeCreateOrConnectWithoutTimesheetInputSchema),z.lazy(() => EmployeeCreateOrConnectWithoutTimesheetInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmployeeCreateManyTimesheetInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EmployeeWhereUniqueInputSchema),z.lazy(() => EmployeeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const JobUncheckedCreateNestedManyWithoutTimesheetInputSchema: z.ZodType<Prisma.JobUncheckedCreateNestedManyWithoutTimesheetInput> = z.object({
  create: z.union([ z.lazy(() => JobCreateWithoutTimesheetInputSchema),z.lazy(() => JobCreateWithoutTimesheetInputSchema).array(),z.lazy(() => JobUncheckedCreateWithoutTimesheetInputSchema),z.lazy(() => JobUncheckedCreateWithoutTimesheetInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JobCreateOrConnectWithoutTimesheetInputSchema),z.lazy(() => JobCreateOrConnectWithoutTimesheetInputSchema).array() ]).optional(),
  createMany: z.lazy(() => JobCreateManyTimesheetInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => JobWhereUniqueInputSchema),z.lazy(() => JobWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EmployeeUpdateManyWithoutTimesheetNestedInputSchema: z.ZodType<Prisma.EmployeeUpdateManyWithoutTimesheetNestedInput> = z.object({
  create: z.union([ z.lazy(() => EmployeeCreateWithoutTimesheetInputSchema),z.lazy(() => EmployeeCreateWithoutTimesheetInputSchema).array(),z.lazy(() => EmployeeUncheckedCreateWithoutTimesheetInputSchema),z.lazy(() => EmployeeUncheckedCreateWithoutTimesheetInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmployeeCreateOrConnectWithoutTimesheetInputSchema),z.lazy(() => EmployeeCreateOrConnectWithoutTimesheetInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EmployeeUpsertWithWhereUniqueWithoutTimesheetInputSchema),z.lazy(() => EmployeeUpsertWithWhereUniqueWithoutTimesheetInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmployeeCreateManyTimesheetInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EmployeeWhereUniqueInputSchema),z.lazy(() => EmployeeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EmployeeWhereUniqueInputSchema),z.lazy(() => EmployeeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EmployeeWhereUniqueInputSchema),z.lazy(() => EmployeeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EmployeeWhereUniqueInputSchema),z.lazy(() => EmployeeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EmployeeUpdateWithWhereUniqueWithoutTimesheetInputSchema),z.lazy(() => EmployeeUpdateWithWhereUniqueWithoutTimesheetInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EmployeeUpdateManyWithWhereWithoutTimesheetInputSchema),z.lazy(() => EmployeeUpdateManyWithWhereWithoutTimesheetInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EmployeeScalarWhereInputSchema),z.lazy(() => EmployeeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const JobUpdateManyWithoutTimesheetNestedInputSchema: z.ZodType<Prisma.JobUpdateManyWithoutTimesheetNestedInput> = z.object({
  create: z.union([ z.lazy(() => JobCreateWithoutTimesheetInputSchema),z.lazy(() => JobCreateWithoutTimesheetInputSchema).array(),z.lazy(() => JobUncheckedCreateWithoutTimesheetInputSchema),z.lazy(() => JobUncheckedCreateWithoutTimesheetInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JobCreateOrConnectWithoutTimesheetInputSchema),z.lazy(() => JobCreateOrConnectWithoutTimesheetInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => JobUpsertWithWhereUniqueWithoutTimesheetInputSchema),z.lazy(() => JobUpsertWithWhereUniqueWithoutTimesheetInputSchema).array() ]).optional(),
  createMany: z.lazy(() => JobCreateManyTimesheetInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => JobWhereUniqueInputSchema),z.lazy(() => JobWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => JobWhereUniqueInputSchema),z.lazy(() => JobWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => JobWhereUniqueInputSchema),z.lazy(() => JobWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => JobWhereUniqueInputSchema),z.lazy(() => JobWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => JobUpdateWithWhereUniqueWithoutTimesheetInputSchema),z.lazy(() => JobUpdateWithWhereUniqueWithoutTimesheetInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => JobUpdateManyWithWhereWithoutTimesheetInputSchema),z.lazy(() => JobUpdateManyWithWhereWithoutTimesheetInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => JobScalarWhereInputSchema),z.lazy(() => JobScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const EmployeeUncheckedUpdateManyWithoutTimesheetNestedInputSchema: z.ZodType<Prisma.EmployeeUncheckedUpdateManyWithoutTimesheetNestedInput> = z.object({
  create: z.union([ z.lazy(() => EmployeeCreateWithoutTimesheetInputSchema),z.lazy(() => EmployeeCreateWithoutTimesheetInputSchema).array(),z.lazy(() => EmployeeUncheckedCreateWithoutTimesheetInputSchema),z.lazy(() => EmployeeUncheckedCreateWithoutTimesheetInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmployeeCreateOrConnectWithoutTimesheetInputSchema),z.lazy(() => EmployeeCreateOrConnectWithoutTimesheetInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EmployeeUpsertWithWhereUniqueWithoutTimesheetInputSchema),z.lazy(() => EmployeeUpsertWithWhereUniqueWithoutTimesheetInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmployeeCreateManyTimesheetInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EmployeeWhereUniqueInputSchema),z.lazy(() => EmployeeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EmployeeWhereUniqueInputSchema),z.lazy(() => EmployeeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EmployeeWhereUniqueInputSchema),z.lazy(() => EmployeeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EmployeeWhereUniqueInputSchema),z.lazy(() => EmployeeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EmployeeUpdateWithWhereUniqueWithoutTimesheetInputSchema),z.lazy(() => EmployeeUpdateWithWhereUniqueWithoutTimesheetInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EmployeeUpdateManyWithWhereWithoutTimesheetInputSchema),z.lazy(() => EmployeeUpdateManyWithWhereWithoutTimesheetInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EmployeeScalarWhereInputSchema),z.lazy(() => EmployeeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const JobUncheckedUpdateManyWithoutTimesheetNestedInputSchema: z.ZodType<Prisma.JobUncheckedUpdateManyWithoutTimesheetNestedInput> = z.object({
  create: z.union([ z.lazy(() => JobCreateWithoutTimesheetInputSchema),z.lazy(() => JobCreateWithoutTimesheetInputSchema).array(),z.lazy(() => JobUncheckedCreateWithoutTimesheetInputSchema),z.lazy(() => JobUncheckedCreateWithoutTimesheetInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JobCreateOrConnectWithoutTimesheetInputSchema),z.lazy(() => JobCreateOrConnectWithoutTimesheetInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => JobUpsertWithWhereUniqueWithoutTimesheetInputSchema),z.lazy(() => JobUpsertWithWhereUniqueWithoutTimesheetInputSchema).array() ]).optional(),
  createMany: z.lazy(() => JobCreateManyTimesheetInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => JobWhereUniqueInputSchema),z.lazy(() => JobWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => JobWhereUniqueInputSchema),z.lazy(() => JobWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => JobWhereUniqueInputSchema),z.lazy(() => JobWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => JobWhereUniqueInputSchema),z.lazy(() => JobWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => JobUpdateWithWhereUniqueWithoutTimesheetInputSchema),z.lazy(() => JobUpdateWithWhereUniqueWithoutTimesheetInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => JobUpdateManyWithWhereWithoutTimesheetInputSchema),z.lazy(() => JobUpdateManyWithWhereWithoutTimesheetInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => JobScalarWhereInputSchema),z.lazy(() => JobScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TimesheetCreateNestedOneWithoutEmployeesInputSchema: z.ZodType<Prisma.TimesheetCreateNestedOneWithoutEmployeesInput> = z.object({
  create: z.union([ z.lazy(() => TimesheetCreateWithoutEmployeesInputSchema),z.lazy(() => TimesheetUncheckedCreateWithoutEmployeesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TimesheetCreateOrConnectWithoutEmployeesInputSchema).optional(),
  connect: z.lazy(() => TimesheetWhereUniqueInputSchema).optional()
}).strict();

export const EntryCreateNestedManyWithoutEmployeeInputSchema: z.ZodType<Prisma.EntryCreateNestedManyWithoutEmployeeInput> = z.object({
  create: z.union([ z.lazy(() => EntryCreateWithoutEmployeeInputSchema),z.lazy(() => EntryCreateWithoutEmployeeInputSchema).array(),z.lazy(() => EntryUncheckedCreateWithoutEmployeeInputSchema),z.lazy(() => EntryUncheckedCreateWithoutEmployeeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EntryCreateOrConnectWithoutEmployeeInputSchema),z.lazy(() => EntryCreateOrConnectWithoutEmployeeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EntryCreateManyEmployeeInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EntryUncheckedCreateNestedManyWithoutEmployeeInputSchema: z.ZodType<Prisma.EntryUncheckedCreateNestedManyWithoutEmployeeInput> = z.object({
  create: z.union([ z.lazy(() => EntryCreateWithoutEmployeeInputSchema),z.lazy(() => EntryCreateWithoutEmployeeInputSchema).array(),z.lazy(() => EntryUncheckedCreateWithoutEmployeeInputSchema),z.lazy(() => EntryUncheckedCreateWithoutEmployeeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EntryCreateOrConnectWithoutEmployeeInputSchema),z.lazy(() => EntryCreateOrConnectWithoutEmployeeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EntryCreateManyEmployeeInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const TimesheetUpdateOneRequiredWithoutEmployeesNestedInputSchema: z.ZodType<Prisma.TimesheetUpdateOneRequiredWithoutEmployeesNestedInput> = z.object({
  create: z.union([ z.lazy(() => TimesheetCreateWithoutEmployeesInputSchema),z.lazy(() => TimesheetUncheckedCreateWithoutEmployeesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TimesheetCreateOrConnectWithoutEmployeesInputSchema).optional(),
  upsert: z.lazy(() => TimesheetUpsertWithoutEmployeesInputSchema).optional(),
  connect: z.lazy(() => TimesheetWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TimesheetUpdateToOneWithWhereWithoutEmployeesInputSchema),z.lazy(() => TimesheetUpdateWithoutEmployeesInputSchema),z.lazy(() => TimesheetUncheckedUpdateWithoutEmployeesInputSchema) ]).optional(),
}).strict();

export const EntryUpdateManyWithoutEmployeeNestedInputSchema: z.ZodType<Prisma.EntryUpdateManyWithoutEmployeeNestedInput> = z.object({
  create: z.union([ z.lazy(() => EntryCreateWithoutEmployeeInputSchema),z.lazy(() => EntryCreateWithoutEmployeeInputSchema).array(),z.lazy(() => EntryUncheckedCreateWithoutEmployeeInputSchema),z.lazy(() => EntryUncheckedCreateWithoutEmployeeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EntryCreateOrConnectWithoutEmployeeInputSchema),z.lazy(() => EntryCreateOrConnectWithoutEmployeeInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EntryUpsertWithWhereUniqueWithoutEmployeeInputSchema),z.lazy(() => EntryUpsertWithWhereUniqueWithoutEmployeeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EntryCreateManyEmployeeInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EntryUpdateWithWhereUniqueWithoutEmployeeInputSchema),z.lazy(() => EntryUpdateWithWhereUniqueWithoutEmployeeInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EntryUpdateManyWithWhereWithoutEmployeeInputSchema),z.lazy(() => EntryUpdateManyWithWhereWithoutEmployeeInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EntryScalarWhereInputSchema),z.lazy(() => EntryScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const EntryUncheckedUpdateManyWithoutEmployeeNestedInputSchema: z.ZodType<Prisma.EntryUncheckedUpdateManyWithoutEmployeeNestedInput> = z.object({
  create: z.union([ z.lazy(() => EntryCreateWithoutEmployeeInputSchema),z.lazy(() => EntryCreateWithoutEmployeeInputSchema).array(),z.lazy(() => EntryUncheckedCreateWithoutEmployeeInputSchema),z.lazy(() => EntryUncheckedCreateWithoutEmployeeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EntryCreateOrConnectWithoutEmployeeInputSchema),z.lazy(() => EntryCreateOrConnectWithoutEmployeeInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EntryUpsertWithWhereUniqueWithoutEmployeeInputSchema),z.lazy(() => EntryUpsertWithWhereUniqueWithoutEmployeeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EntryCreateManyEmployeeInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EntryUpdateWithWhereUniqueWithoutEmployeeInputSchema),z.lazy(() => EntryUpdateWithWhereUniqueWithoutEmployeeInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EntryUpdateManyWithWhereWithoutEmployeeInputSchema),z.lazy(() => EntryUpdateManyWithWhereWithoutEmployeeInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EntryScalarWhereInputSchema),z.lazy(() => EntryScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TimesheetCreateNestedOneWithoutJobsInputSchema: z.ZodType<Prisma.TimesheetCreateNestedOneWithoutJobsInput> = z.object({
  create: z.union([ z.lazy(() => TimesheetCreateWithoutJobsInputSchema),z.lazy(() => TimesheetUncheckedCreateWithoutJobsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TimesheetCreateOrConnectWithoutJobsInputSchema).optional(),
  connect: z.lazy(() => TimesheetWhereUniqueInputSchema).optional()
}).strict();

export const DayCreateNestedManyWithoutJobInputSchema: z.ZodType<Prisma.DayCreateNestedManyWithoutJobInput> = z.object({
  create: z.union([ z.lazy(() => DayCreateWithoutJobInputSchema),z.lazy(() => DayCreateWithoutJobInputSchema).array(),z.lazy(() => DayUncheckedCreateWithoutJobInputSchema),z.lazy(() => DayUncheckedCreateWithoutJobInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => DayCreateOrConnectWithoutJobInputSchema),z.lazy(() => DayCreateOrConnectWithoutJobInputSchema).array() ]).optional(),
  createMany: z.lazy(() => DayCreateManyJobInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const DayUncheckedCreateNestedManyWithoutJobInputSchema: z.ZodType<Prisma.DayUncheckedCreateNestedManyWithoutJobInput> = z.object({
  create: z.union([ z.lazy(() => DayCreateWithoutJobInputSchema),z.lazy(() => DayCreateWithoutJobInputSchema).array(),z.lazy(() => DayUncheckedCreateWithoutJobInputSchema),z.lazy(() => DayUncheckedCreateWithoutJobInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => DayCreateOrConnectWithoutJobInputSchema),z.lazy(() => DayCreateOrConnectWithoutJobInputSchema).array() ]).optional(),
  createMany: z.lazy(() => DayCreateManyJobInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const NullableIntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const EnumJobTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumJobTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => JobTypeSchema).optional()
}).strict();

export const TimesheetUpdateOneRequiredWithoutJobsNestedInputSchema: z.ZodType<Prisma.TimesheetUpdateOneRequiredWithoutJobsNestedInput> = z.object({
  create: z.union([ z.lazy(() => TimesheetCreateWithoutJobsInputSchema),z.lazy(() => TimesheetUncheckedCreateWithoutJobsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TimesheetCreateOrConnectWithoutJobsInputSchema).optional(),
  upsert: z.lazy(() => TimesheetUpsertWithoutJobsInputSchema).optional(),
  connect: z.lazy(() => TimesheetWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TimesheetUpdateToOneWithWhereWithoutJobsInputSchema),z.lazy(() => TimesheetUpdateWithoutJobsInputSchema),z.lazy(() => TimesheetUncheckedUpdateWithoutJobsInputSchema) ]).optional(),
}).strict();

export const DayUpdateManyWithoutJobNestedInputSchema: z.ZodType<Prisma.DayUpdateManyWithoutJobNestedInput> = z.object({
  create: z.union([ z.lazy(() => DayCreateWithoutJobInputSchema),z.lazy(() => DayCreateWithoutJobInputSchema).array(),z.lazy(() => DayUncheckedCreateWithoutJobInputSchema),z.lazy(() => DayUncheckedCreateWithoutJobInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => DayCreateOrConnectWithoutJobInputSchema),z.lazy(() => DayCreateOrConnectWithoutJobInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => DayUpsertWithWhereUniqueWithoutJobInputSchema),z.lazy(() => DayUpsertWithWhereUniqueWithoutJobInputSchema).array() ]).optional(),
  createMany: z.lazy(() => DayCreateManyJobInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => DayUpdateWithWhereUniqueWithoutJobInputSchema),z.lazy(() => DayUpdateWithWhereUniqueWithoutJobInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => DayUpdateManyWithWhereWithoutJobInputSchema),z.lazy(() => DayUpdateManyWithWhereWithoutJobInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => DayScalarWhereInputSchema),z.lazy(() => DayScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const DayUncheckedUpdateManyWithoutJobNestedInputSchema: z.ZodType<Prisma.DayUncheckedUpdateManyWithoutJobNestedInput> = z.object({
  create: z.union([ z.lazy(() => DayCreateWithoutJobInputSchema),z.lazy(() => DayCreateWithoutJobInputSchema).array(),z.lazy(() => DayUncheckedCreateWithoutJobInputSchema),z.lazy(() => DayUncheckedCreateWithoutJobInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => DayCreateOrConnectWithoutJobInputSchema),z.lazy(() => DayCreateOrConnectWithoutJobInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => DayUpsertWithWhereUniqueWithoutJobInputSchema),z.lazy(() => DayUpsertWithWhereUniqueWithoutJobInputSchema).array() ]).optional(),
  createMany: z.lazy(() => DayCreateManyJobInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => DayWhereUniqueInputSchema),z.lazy(() => DayWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => DayUpdateWithWhereUniqueWithoutJobInputSchema),z.lazy(() => DayUpdateWithWhereUniqueWithoutJobInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => DayUpdateManyWithWhereWithoutJobInputSchema),z.lazy(() => DayUpdateManyWithWhereWithoutJobInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => DayScalarWhereInputSchema),z.lazy(() => DayScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const JobCreateNestedOneWithoutDaysInputSchema: z.ZodType<Prisma.JobCreateNestedOneWithoutDaysInput> = z.object({
  create: z.union([ z.lazy(() => JobCreateWithoutDaysInputSchema),z.lazy(() => JobUncheckedCreateWithoutDaysInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => JobCreateOrConnectWithoutDaysInputSchema).optional(),
  connect: z.lazy(() => JobWhereUniqueInputSchema).optional()
}).strict();

export const AccountCreateNestedOneWithoutDaysEditedInputSchema: z.ZodType<Prisma.AccountCreateNestedOneWithoutDaysEditedInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutDaysEditedInputSchema),z.lazy(() => AccountUncheckedCreateWithoutDaysEditedInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AccountCreateOrConnectWithoutDaysEditedInputSchema).optional(),
  connect: z.lazy(() => AccountWhereUniqueInputSchema).optional()
}).strict();

export const EntryCreateNestedManyWithoutDayInputSchema: z.ZodType<Prisma.EntryCreateNestedManyWithoutDayInput> = z.object({
  create: z.union([ z.lazy(() => EntryCreateWithoutDayInputSchema),z.lazy(() => EntryCreateWithoutDayInputSchema).array(),z.lazy(() => EntryUncheckedCreateWithoutDayInputSchema),z.lazy(() => EntryUncheckedCreateWithoutDayInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EntryCreateOrConnectWithoutDayInputSchema),z.lazy(() => EntryCreateOrConnectWithoutDayInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EntryCreateManyDayInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EntryUncheckedCreateNestedManyWithoutDayInputSchema: z.ZodType<Prisma.EntryUncheckedCreateNestedManyWithoutDayInput> = z.object({
  create: z.union([ z.lazy(() => EntryCreateWithoutDayInputSchema),z.lazy(() => EntryCreateWithoutDayInputSchema).array(),z.lazy(() => EntryUncheckedCreateWithoutDayInputSchema),z.lazy(() => EntryUncheckedCreateWithoutDayInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EntryCreateOrConnectWithoutDayInputSchema),z.lazy(() => EntryCreateOrConnectWithoutDayInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EntryCreateManyDayInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const JobUpdateOneRequiredWithoutDaysNestedInputSchema: z.ZodType<Prisma.JobUpdateOneRequiredWithoutDaysNestedInput> = z.object({
  create: z.union([ z.lazy(() => JobCreateWithoutDaysInputSchema),z.lazy(() => JobUncheckedCreateWithoutDaysInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => JobCreateOrConnectWithoutDaysInputSchema).optional(),
  upsert: z.lazy(() => JobUpsertWithoutDaysInputSchema).optional(),
  connect: z.lazy(() => JobWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => JobUpdateToOneWithWhereWithoutDaysInputSchema),z.lazy(() => JobUpdateWithoutDaysInputSchema),z.lazy(() => JobUncheckedUpdateWithoutDaysInputSchema) ]).optional(),
}).strict();

export const AccountUpdateOneWithoutDaysEditedNestedInputSchema: z.ZodType<Prisma.AccountUpdateOneWithoutDaysEditedNestedInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutDaysEditedInputSchema),z.lazy(() => AccountUncheckedCreateWithoutDaysEditedInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AccountCreateOrConnectWithoutDaysEditedInputSchema).optional(),
  upsert: z.lazy(() => AccountUpsertWithoutDaysEditedInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => AccountWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => AccountWhereInputSchema) ]).optional(),
  connect: z.lazy(() => AccountWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => AccountUpdateToOneWithWhereWithoutDaysEditedInputSchema),z.lazy(() => AccountUpdateWithoutDaysEditedInputSchema),z.lazy(() => AccountUncheckedUpdateWithoutDaysEditedInputSchema) ]).optional(),
}).strict();

export const EntryUpdateManyWithoutDayNestedInputSchema: z.ZodType<Prisma.EntryUpdateManyWithoutDayNestedInput> = z.object({
  create: z.union([ z.lazy(() => EntryCreateWithoutDayInputSchema),z.lazy(() => EntryCreateWithoutDayInputSchema).array(),z.lazy(() => EntryUncheckedCreateWithoutDayInputSchema),z.lazy(() => EntryUncheckedCreateWithoutDayInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EntryCreateOrConnectWithoutDayInputSchema),z.lazy(() => EntryCreateOrConnectWithoutDayInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EntryUpsertWithWhereUniqueWithoutDayInputSchema),z.lazy(() => EntryUpsertWithWhereUniqueWithoutDayInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EntryCreateManyDayInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EntryUpdateWithWhereUniqueWithoutDayInputSchema),z.lazy(() => EntryUpdateWithWhereUniqueWithoutDayInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EntryUpdateManyWithWhereWithoutDayInputSchema),z.lazy(() => EntryUpdateManyWithWhereWithoutDayInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EntryScalarWhereInputSchema),z.lazy(() => EntryScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const EntryUncheckedUpdateManyWithoutDayNestedInputSchema: z.ZodType<Prisma.EntryUncheckedUpdateManyWithoutDayNestedInput> = z.object({
  create: z.union([ z.lazy(() => EntryCreateWithoutDayInputSchema),z.lazy(() => EntryCreateWithoutDayInputSchema).array(),z.lazy(() => EntryUncheckedCreateWithoutDayInputSchema),z.lazy(() => EntryUncheckedCreateWithoutDayInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EntryCreateOrConnectWithoutDayInputSchema),z.lazy(() => EntryCreateOrConnectWithoutDayInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EntryUpsertWithWhereUniqueWithoutDayInputSchema),z.lazy(() => EntryUpsertWithWhereUniqueWithoutDayInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EntryCreateManyDayInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EntryWhereUniqueInputSchema),z.lazy(() => EntryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EntryUpdateWithWhereUniqueWithoutDayInputSchema),z.lazy(() => EntryUpdateWithWhereUniqueWithoutDayInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EntryUpdateManyWithWhereWithoutDayInputSchema),z.lazy(() => EntryUpdateManyWithWhereWithoutDayInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EntryScalarWhereInputSchema),z.lazy(() => EntryScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const DayCreateNestedOneWithoutEntriesInputSchema: z.ZodType<Prisma.DayCreateNestedOneWithoutEntriesInput> = z.object({
  create: z.union([ z.lazy(() => DayCreateWithoutEntriesInputSchema),z.lazy(() => DayUncheckedCreateWithoutEntriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => DayCreateOrConnectWithoutEntriesInputSchema).optional(),
  connect: z.lazy(() => DayWhereUniqueInputSchema).optional()
}).strict();

export const EmployeeCreateNestedOneWithoutEntriesInputSchema: z.ZodType<Prisma.EmployeeCreateNestedOneWithoutEntriesInput> = z.object({
  create: z.union([ z.lazy(() => EmployeeCreateWithoutEntriesInputSchema),z.lazy(() => EmployeeUncheckedCreateWithoutEntriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EmployeeCreateOrConnectWithoutEntriesInputSchema).optional(),
  connect: z.lazy(() => EmployeeWhereUniqueInputSchema).optional()
}).strict();

export const EnumEntryConfirmationStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumEntryConfirmationStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => EntryConfirmationStatusSchema).optional()
}).strict();

export const DayUpdateOneRequiredWithoutEntriesNestedInputSchema: z.ZodType<Prisma.DayUpdateOneRequiredWithoutEntriesNestedInput> = z.object({
  create: z.union([ z.lazy(() => DayCreateWithoutEntriesInputSchema),z.lazy(() => DayUncheckedCreateWithoutEntriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => DayCreateOrConnectWithoutEntriesInputSchema).optional(),
  upsert: z.lazy(() => DayUpsertWithoutEntriesInputSchema).optional(),
  connect: z.lazy(() => DayWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => DayUpdateToOneWithWhereWithoutEntriesInputSchema),z.lazy(() => DayUpdateWithoutEntriesInputSchema),z.lazy(() => DayUncheckedUpdateWithoutEntriesInputSchema) ]).optional(),
}).strict();

export const EmployeeUpdateOneRequiredWithoutEntriesNestedInputSchema: z.ZodType<Prisma.EmployeeUpdateOneRequiredWithoutEntriesNestedInput> = z.object({
  create: z.union([ z.lazy(() => EmployeeCreateWithoutEntriesInputSchema),z.lazy(() => EmployeeUncheckedCreateWithoutEntriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EmployeeCreateOrConnectWithoutEntriesInputSchema).optional(),
  upsert: z.lazy(() => EmployeeUpsertWithoutEntriesInputSchema).optional(),
  connect: z.lazy(() => EmployeeWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => EmployeeUpdateToOneWithWhereWithoutEntriesInputSchema),z.lazy(() => EmployeeUpdateWithoutEntriesInputSchema),z.lazy(() => EmployeeUncheckedUpdateWithoutEntriesInputSchema) ]).optional(),
}).strict();

export const AccountCreateNestedOneWithoutActionsInputSchema: z.ZodType<Prisma.AccountCreateNestedOneWithoutActionsInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutActionsInputSchema),z.lazy(() => AccountUncheckedCreateWithoutActionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AccountCreateOrConnectWithoutActionsInputSchema).optional(),
  connect: z.lazy(() => AccountWhereUniqueInputSchema).optional()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const AccountUpdateOneRequiredWithoutActionsNestedInputSchema: z.ZodType<Prisma.AccountUpdateOneRequiredWithoutActionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutActionsInputSchema),z.lazy(() => AccountUncheckedCreateWithoutActionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AccountCreateOrConnectWithoutActionsInputSchema).optional(),
  upsert: z.lazy(() => AccountUpsertWithoutActionsInputSchema).optional(),
  connect: z.lazy(() => AccountWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => AccountUpdateToOneWithWhereWithoutActionsInputSchema),z.lazy(() => AccountUpdateWithoutActionsInputSchema),z.lazy(() => AccountUncheckedUpdateWithoutActionsInputSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedEnumAccountTypeFilterSchema: z.ZodType<Prisma.NestedEnumAccountTypeFilter> = z.object({
  equals: z.lazy(() => AccountTypeSchema).optional(),
  in: z.lazy(() => AccountTypeSchema).array().optional(),
  notIn: z.lazy(() => AccountTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => AccountTypeSchema),z.lazy(() => NestedEnumAccountTypeFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const NestedEnumAccountTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumAccountTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => AccountTypeSchema).optional(),
  in: z.lazy(() => AccountTypeSchema).array().optional(),
  notIn: z.lazy(() => AccountTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => AccountTypeSchema),z.lazy(() => NestedEnumAccountTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumAccountTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumAccountTypeFilterSchema).optional()
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumJobTypeFilterSchema: z.ZodType<Prisma.NestedEnumJobTypeFilter> = z.object({
  equals: z.lazy(() => JobTypeSchema).optional(),
  in: z.lazy(() => JobTypeSchema).array().optional(),
  notIn: z.lazy(() => JobTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => JobTypeSchema),z.lazy(() => NestedEnumJobTypeFilterSchema) ]).optional(),
}).strict();

export const NestedIntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict();

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumJobTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumJobTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => JobTypeSchema).optional(),
  in: z.lazy(() => JobTypeSchema).array().optional(),
  notIn: z.lazy(() => JobTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => JobTypeSchema),z.lazy(() => NestedEnumJobTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumJobTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumJobTypeFilterSchema).optional()
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedEnumEntryConfirmationStatusFilterSchema: z.ZodType<Prisma.NestedEnumEntryConfirmationStatusFilter> = z.object({
  equals: z.lazy(() => EntryConfirmationStatusSchema).optional(),
  in: z.lazy(() => EntryConfirmationStatusSchema).array().optional(),
  notIn: z.lazy(() => EntryConfirmationStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => EntryConfirmationStatusSchema),z.lazy(() => NestedEnumEntryConfirmationStatusFilterSchema) ]).optional(),
}).strict();

export const NestedEnumEntryConfirmationStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumEntryConfirmationStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => EntryConfirmationStatusSchema).optional(),
  in: z.lazy(() => EntryConfirmationStatusSchema).array().optional(),
  notIn: z.lazy(() => EntryConfirmationStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => EntryConfirmationStatusSchema),z.lazy(() => NestedEnumEntryConfirmationStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumEntryConfirmationStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumEntryConfirmationStatusFilterSchema).optional()
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedJsonFilterSchema: z.ZodType<Prisma.NestedJsonFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional()
}).strict();

export const DayCreateWithoutEditorInputSchema: z.ZodType<Prisma.DayCreateWithoutEditorInput> = z.object({
  dayId: z.number().int(),
  description: z.string(),
  job: z.lazy(() => JobCreateNestedOneWithoutDaysInputSchema),
  entries: z.lazy(() => EntryCreateNestedManyWithoutDayInputSchema).optional()
}).strict();

export const DayUncheckedCreateWithoutEditorInputSchema: z.ZodType<Prisma.DayUncheckedCreateWithoutEditorInput> = z.object({
  timesheetId: z.string(),
  jobId: z.string(),
  dayId: z.number().int(),
  description: z.string(),
  entries: z.lazy(() => EntryUncheckedCreateNestedManyWithoutDayInputSchema).optional()
}).strict();

export const DayCreateOrConnectWithoutEditorInputSchema: z.ZodType<Prisma.DayCreateOrConnectWithoutEditorInput> = z.object({
  where: z.lazy(() => DayWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => DayCreateWithoutEditorInputSchema),z.lazy(() => DayUncheckedCreateWithoutEditorInputSchema) ]),
}).strict();

export const DayCreateManyEditorInputEnvelopeSchema: z.ZodType<Prisma.DayCreateManyEditorInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => DayCreateManyEditorInputSchema),z.lazy(() => DayCreateManyEditorInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ActionCreateWithoutActorInputSchema: z.ZodType<Prisma.ActionCreateWithoutActorInput> = z.object({
  id: z.string().optional(),
  timestamp: z.coerce.date().optional(),
  targetId: z.string(),
  actionType: z.string(),
  actionJson: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
}).strict();

export const ActionUncheckedCreateWithoutActorInputSchema: z.ZodType<Prisma.ActionUncheckedCreateWithoutActorInput> = z.object({
  id: z.string().optional(),
  timestamp: z.coerce.date().optional(),
  targetId: z.string(),
  actionType: z.string(),
  actionJson: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
}).strict();

export const ActionCreateOrConnectWithoutActorInputSchema: z.ZodType<Prisma.ActionCreateOrConnectWithoutActorInput> = z.object({
  where: z.lazy(() => ActionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ActionCreateWithoutActorInputSchema),z.lazy(() => ActionUncheckedCreateWithoutActorInputSchema) ]),
}).strict();

export const ActionCreateManyActorInputEnvelopeSchema: z.ZodType<Prisma.ActionCreateManyActorInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ActionCreateManyActorInputSchema),z.lazy(() => ActionCreateManyActorInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const DayUpsertWithWhereUniqueWithoutEditorInputSchema: z.ZodType<Prisma.DayUpsertWithWhereUniqueWithoutEditorInput> = z.object({
  where: z.lazy(() => DayWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => DayUpdateWithoutEditorInputSchema),z.lazy(() => DayUncheckedUpdateWithoutEditorInputSchema) ]),
  create: z.union([ z.lazy(() => DayCreateWithoutEditorInputSchema),z.lazy(() => DayUncheckedCreateWithoutEditorInputSchema) ]),
}).strict();

export const DayUpdateWithWhereUniqueWithoutEditorInputSchema: z.ZodType<Prisma.DayUpdateWithWhereUniqueWithoutEditorInput> = z.object({
  where: z.lazy(() => DayWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => DayUpdateWithoutEditorInputSchema),z.lazy(() => DayUncheckedUpdateWithoutEditorInputSchema) ]),
}).strict();

export const DayUpdateManyWithWhereWithoutEditorInputSchema: z.ZodType<Prisma.DayUpdateManyWithWhereWithoutEditorInput> = z.object({
  where: z.lazy(() => DayScalarWhereInputSchema),
  data: z.union([ z.lazy(() => DayUpdateManyMutationInputSchema),z.lazy(() => DayUncheckedUpdateManyWithoutEditorInputSchema) ]),
}).strict();

export const DayScalarWhereInputSchema: z.ZodType<Prisma.DayScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => DayScalarWhereInputSchema),z.lazy(() => DayScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => DayScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DayScalarWhereInputSchema),z.lazy(() => DayScalarWhereInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  jobId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  dayId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  editorId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const ActionUpsertWithWhereUniqueWithoutActorInputSchema: z.ZodType<Prisma.ActionUpsertWithWhereUniqueWithoutActorInput> = z.object({
  where: z.lazy(() => ActionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ActionUpdateWithoutActorInputSchema),z.lazy(() => ActionUncheckedUpdateWithoutActorInputSchema) ]),
  create: z.union([ z.lazy(() => ActionCreateWithoutActorInputSchema),z.lazy(() => ActionUncheckedCreateWithoutActorInputSchema) ]),
}).strict();

export const ActionUpdateWithWhereUniqueWithoutActorInputSchema: z.ZodType<Prisma.ActionUpdateWithWhereUniqueWithoutActorInput> = z.object({
  where: z.lazy(() => ActionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ActionUpdateWithoutActorInputSchema),z.lazy(() => ActionUncheckedUpdateWithoutActorInputSchema) ]),
}).strict();

export const ActionUpdateManyWithWhereWithoutActorInputSchema: z.ZodType<Prisma.ActionUpdateManyWithWhereWithoutActorInput> = z.object({
  where: z.lazy(() => ActionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ActionUpdateManyMutationInputSchema),z.lazy(() => ActionUncheckedUpdateManyWithoutActorInputSchema) ]),
}).strict();

export const ActionScalarWhereInputSchema: z.ZodType<Prisma.ActionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ActionScalarWhereInputSchema),z.lazy(() => ActionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ActionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ActionScalarWhereInputSchema),z.lazy(() => ActionScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  actorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  targetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  actionType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  actionJson: z.lazy(() => JsonFilterSchema).optional()
}).strict();

export const EmployeeCreateWithoutTimesheetInputSchema: z.ZodType<Prisma.EmployeeCreateWithoutTimesheetInput> = z.object({
  employeeId: z.string().optional(),
  isActive: z.boolean(),
  displayId: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  fringeCode: z.string(),
  ratePrivateCentsPerHour: z.number().int(),
  rateDavisBaconCentsPerHour: z.number().int(),
  rateDavisBaconOvertimeCentsPerHour: z.number().int(),
  entries: z.lazy(() => EntryCreateNestedManyWithoutEmployeeInputSchema).optional()
}).strict();

export const EmployeeUncheckedCreateWithoutTimesheetInputSchema: z.ZodType<Prisma.EmployeeUncheckedCreateWithoutTimesheetInput> = z.object({
  employeeId: z.string().optional(),
  isActive: z.boolean(),
  displayId: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  fringeCode: z.string(),
  ratePrivateCentsPerHour: z.number().int(),
  rateDavisBaconCentsPerHour: z.number().int(),
  rateDavisBaconOvertimeCentsPerHour: z.number().int(),
  entries: z.lazy(() => EntryUncheckedCreateNestedManyWithoutEmployeeInputSchema).optional()
}).strict();

export const EmployeeCreateOrConnectWithoutTimesheetInputSchema: z.ZodType<Prisma.EmployeeCreateOrConnectWithoutTimesheetInput> = z.object({
  where: z.lazy(() => EmployeeWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EmployeeCreateWithoutTimesheetInputSchema),z.lazy(() => EmployeeUncheckedCreateWithoutTimesheetInputSchema) ]),
}).strict();

export const EmployeeCreateManyTimesheetInputEnvelopeSchema: z.ZodType<Prisma.EmployeeCreateManyTimesheetInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => EmployeeCreateManyTimesheetInputSchema),z.lazy(() => EmployeeCreateManyTimesheetInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const JobCreateWithoutTimesheetInputSchema: z.ZodType<Prisma.JobCreateWithoutTimesheetInput> = z.object({
  jobId: z.string().optional(),
  oldJobId: z.number().int(),
  isActive: z.boolean(),
  name: z.string(),
  budgetOriginalCents: z.number().int().optional().nullable(),
  budgetCurrentCents: z.number().int().optional().nullable(),
  originalLaborSeconds: z.number().int().optional().nullable(),
  currentLaborSeconds: z.number().int().optional().nullable(),
  jobType: z.lazy(() => JobTypeSchema),
  days: z.lazy(() => DayCreateNestedManyWithoutJobInputSchema).optional()
}).strict();

export const JobUncheckedCreateWithoutTimesheetInputSchema: z.ZodType<Prisma.JobUncheckedCreateWithoutTimesheetInput> = z.object({
  jobId: z.string().optional(),
  oldJobId: z.number().int(),
  isActive: z.boolean(),
  name: z.string(),
  budgetOriginalCents: z.number().int().optional().nullable(),
  budgetCurrentCents: z.number().int().optional().nullable(),
  originalLaborSeconds: z.number().int().optional().nullable(),
  currentLaborSeconds: z.number().int().optional().nullable(),
  jobType: z.lazy(() => JobTypeSchema),
  days: z.lazy(() => DayUncheckedCreateNestedManyWithoutJobInputSchema).optional()
}).strict();

export const JobCreateOrConnectWithoutTimesheetInputSchema: z.ZodType<Prisma.JobCreateOrConnectWithoutTimesheetInput> = z.object({
  where: z.lazy(() => JobWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => JobCreateWithoutTimesheetInputSchema),z.lazy(() => JobUncheckedCreateWithoutTimesheetInputSchema) ]),
}).strict();

export const JobCreateManyTimesheetInputEnvelopeSchema: z.ZodType<Prisma.JobCreateManyTimesheetInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => JobCreateManyTimesheetInputSchema),z.lazy(() => JobCreateManyTimesheetInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const EmployeeUpsertWithWhereUniqueWithoutTimesheetInputSchema: z.ZodType<Prisma.EmployeeUpsertWithWhereUniqueWithoutTimesheetInput> = z.object({
  where: z.lazy(() => EmployeeWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EmployeeUpdateWithoutTimesheetInputSchema),z.lazy(() => EmployeeUncheckedUpdateWithoutTimesheetInputSchema) ]),
  create: z.union([ z.lazy(() => EmployeeCreateWithoutTimesheetInputSchema),z.lazy(() => EmployeeUncheckedCreateWithoutTimesheetInputSchema) ]),
}).strict();

export const EmployeeUpdateWithWhereUniqueWithoutTimesheetInputSchema: z.ZodType<Prisma.EmployeeUpdateWithWhereUniqueWithoutTimesheetInput> = z.object({
  where: z.lazy(() => EmployeeWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EmployeeUpdateWithoutTimesheetInputSchema),z.lazy(() => EmployeeUncheckedUpdateWithoutTimesheetInputSchema) ]),
}).strict();

export const EmployeeUpdateManyWithWhereWithoutTimesheetInputSchema: z.ZodType<Prisma.EmployeeUpdateManyWithWhereWithoutTimesheetInput> = z.object({
  where: z.lazy(() => EmployeeScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EmployeeUpdateManyMutationInputSchema),z.lazy(() => EmployeeUncheckedUpdateManyWithoutTimesheetInputSchema) ]),
}).strict();

export const EmployeeScalarWhereInputSchema: z.ZodType<Prisma.EmployeeScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EmployeeScalarWhereInputSchema),z.lazy(() => EmployeeScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmployeeScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmployeeScalarWhereInputSchema),z.lazy(() => EmployeeScalarWhereInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  employeeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  displayId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  phoneNumber: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fringeCode: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  ratePrivateCentsPerHour: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  rateDavisBaconCentsPerHour: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
}).strict();

export const JobUpsertWithWhereUniqueWithoutTimesheetInputSchema: z.ZodType<Prisma.JobUpsertWithWhereUniqueWithoutTimesheetInput> = z.object({
  where: z.lazy(() => JobWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => JobUpdateWithoutTimesheetInputSchema),z.lazy(() => JobUncheckedUpdateWithoutTimesheetInputSchema) ]),
  create: z.union([ z.lazy(() => JobCreateWithoutTimesheetInputSchema),z.lazy(() => JobUncheckedCreateWithoutTimesheetInputSchema) ]),
}).strict();

export const JobUpdateWithWhereUniqueWithoutTimesheetInputSchema: z.ZodType<Prisma.JobUpdateWithWhereUniqueWithoutTimesheetInput> = z.object({
  where: z.lazy(() => JobWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => JobUpdateWithoutTimesheetInputSchema),z.lazy(() => JobUncheckedUpdateWithoutTimesheetInputSchema) ]),
}).strict();

export const JobUpdateManyWithWhereWithoutTimesheetInputSchema: z.ZodType<Prisma.JobUpdateManyWithWhereWithoutTimesheetInput> = z.object({
  where: z.lazy(() => JobScalarWhereInputSchema),
  data: z.union([ z.lazy(() => JobUpdateManyMutationInputSchema),z.lazy(() => JobUncheckedUpdateManyWithoutTimesheetInputSchema) ]),
}).strict();

export const JobScalarWhereInputSchema: z.ZodType<Prisma.JobScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => JobScalarWhereInputSchema),z.lazy(() => JobScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => JobScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => JobScalarWhereInputSchema),z.lazy(() => JobScalarWhereInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  jobId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  oldJobId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  budgetOriginalCents: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  budgetCurrentCents: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  originalLaborSeconds: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  currentLaborSeconds: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  jobType: z.union([ z.lazy(() => EnumJobTypeFilterSchema),z.lazy(() => JobTypeSchema) ]).optional(),
}).strict();

export const TimesheetCreateWithoutEmployeesInputSchema: z.ZodType<Prisma.TimesheetCreateWithoutEmployeesInput> = z.object({
  timesheetId: z.string(),
  jobs: z.lazy(() => JobCreateNestedManyWithoutTimesheetInputSchema).optional()
}).strict();

export const TimesheetUncheckedCreateWithoutEmployeesInputSchema: z.ZodType<Prisma.TimesheetUncheckedCreateWithoutEmployeesInput> = z.object({
  timesheetId: z.string(),
  jobs: z.lazy(() => JobUncheckedCreateNestedManyWithoutTimesheetInputSchema).optional()
}).strict();

export const TimesheetCreateOrConnectWithoutEmployeesInputSchema: z.ZodType<Prisma.TimesheetCreateOrConnectWithoutEmployeesInput> = z.object({
  where: z.lazy(() => TimesheetWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TimesheetCreateWithoutEmployeesInputSchema),z.lazy(() => TimesheetUncheckedCreateWithoutEmployeesInputSchema) ]),
}).strict();

export const EntryCreateWithoutEmployeeInputSchema: z.ZodType<Prisma.EntryCreateWithoutEmployeeInput> = z.object({
  entryId: z.string().optional(),
  isApproved: z.boolean(),
  entryConfirmationStatus: z.lazy(() => EntryConfirmationStatusSchema),
  timeInSeconds: z.number().int(),
  timeOutSeconds: z.number().int(),
  lunchSeconds: z.number().int(),
  day: z.lazy(() => DayCreateNestedOneWithoutEntriesInputSchema)
}).strict();

export const EntryUncheckedCreateWithoutEmployeeInputSchema: z.ZodType<Prisma.EntryUncheckedCreateWithoutEmployeeInput> = z.object({
  jobId: z.string(),
  dayId: z.number().int(),
  entryId: z.string().optional(),
  isApproved: z.boolean(),
  entryConfirmationStatus: z.lazy(() => EntryConfirmationStatusSchema),
  timeInSeconds: z.number().int(),
  timeOutSeconds: z.number().int(),
  lunchSeconds: z.number().int()
}).strict();

export const EntryCreateOrConnectWithoutEmployeeInputSchema: z.ZodType<Prisma.EntryCreateOrConnectWithoutEmployeeInput> = z.object({
  where: z.lazy(() => EntryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EntryCreateWithoutEmployeeInputSchema),z.lazy(() => EntryUncheckedCreateWithoutEmployeeInputSchema) ]),
}).strict();

export const EntryCreateManyEmployeeInputEnvelopeSchema: z.ZodType<Prisma.EntryCreateManyEmployeeInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => EntryCreateManyEmployeeInputSchema),z.lazy(() => EntryCreateManyEmployeeInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const TimesheetUpsertWithoutEmployeesInputSchema: z.ZodType<Prisma.TimesheetUpsertWithoutEmployeesInput> = z.object({
  update: z.union([ z.lazy(() => TimesheetUpdateWithoutEmployeesInputSchema),z.lazy(() => TimesheetUncheckedUpdateWithoutEmployeesInputSchema) ]),
  create: z.union([ z.lazy(() => TimesheetCreateWithoutEmployeesInputSchema),z.lazy(() => TimesheetUncheckedCreateWithoutEmployeesInputSchema) ]),
  where: z.lazy(() => TimesheetWhereInputSchema).optional()
}).strict();

export const TimesheetUpdateToOneWithWhereWithoutEmployeesInputSchema: z.ZodType<Prisma.TimesheetUpdateToOneWithWhereWithoutEmployeesInput> = z.object({
  where: z.lazy(() => TimesheetWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TimesheetUpdateWithoutEmployeesInputSchema),z.lazy(() => TimesheetUncheckedUpdateWithoutEmployeesInputSchema) ]),
}).strict();

export const TimesheetUpdateWithoutEmployeesInputSchema: z.ZodType<Prisma.TimesheetUpdateWithoutEmployeesInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  jobs: z.lazy(() => JobUpdateManyWithoutTimesheetNestedInputSchema).optional()
}).strict();

export const TimesheetUncheckedUpdateWithoutEmployeesInputSchema: z.ZodType<Prisma.TimesheetUncheckedUpdateWithoutEmployeesInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  jobs: z.lazy(() => JobUncheckedUpdateManyWithoutTimesheetNestedInputSchema).optional()
}).strict();

export const EntryUpsertWithWhereUniqueWithoutEmployeeInputSchema: z.ZodType<Prisma.EntryUpsertWithWhereUniqueWithoutEmployeeInput> = z.object({
  where: z.lazy(() => EntryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EntryUpdateWithoutEmployeeInputSchema),z.lazy(() => EntryUncheckedUpdateWithoutEmployeeInputSchema) ]),
  create: z.union([ z.lazy(() => EntryCreateWithoutEmployeeInputSchema),z.lazy(() => EntryUncheckedCreateWithoutEmployeeInputSchema) ]),
}).strict();

export const EntryUpdateWithWhereUniqueWithoutEmployeeInputSchema: z.ZodType<Prisma.EntryUpdateWithWhereUniqueWithoutEmployeeInput> = z.object({
  where: z.lazy(() => EntryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EntryUpdateWithoutEmployeeInputSchema),z.lazy(() => EntryUncheckedUpdateWithoutEmployeeInputSchema) ]),
}).strict();

export const EntryUpdateManyWithWhereWithoutEmployeeInputSchema: z.ZodType<Prisma.EntryUpdateManyWithWhereWithoutEmployeeInput> = z.object({
  where: z.lazy(() => EntryScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EntryUpdateManyMutationInputSchema),z.lazy(() => EntryUncheckedUpdateManyWithoutEmployeeInputSchema) ]),
}).strict();

export const EntryScalarWhereInputSchema: z.ZodType<Prisma.EntryScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EntryScalarWhereInputSchema),z.lazy(() => EntryScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EntryScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EntryScalarWhereInputSchema),z.lazy(() => EntryScalarWhereInputSchema).array() ]).optional(),
  timesheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  jobId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  dayId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  entryId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  employeeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isApproved: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  entryConfirmationStatus: z.union([ z.lazy(() => EnumEntryConfirmationStatusFilterSchema),z.lazy(() => EntryConfirmationStatusSchema) ]).optional(),
  timeInSeconds: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  timeOutSeconds: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  lunchSeconds: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
}).strict();

export const TimesheetCreateWithoutJobsInputSchema: z.ZodType<Prisma.TimesheetCreateWithoutJobsInput> = z.object({
  timesheetId: z.string(),
  employees: z.lazy(() => EmployeeCreateNestedManyWithoutTimesheetInputSchema).optional()
}).strict();

export const TimesheetUncheckedCreateWithoutJobsInputSchema: z.ZodType<Prisma.TimesheetUncheckedCreateWithoutJobsInput> = z.object({
  timesheetId: z.string(),
  employees: z.lazy(() => EmployeeUncheckedCreateNestedManyWithoutTimesheetInputSchema).optional()
}).strict();

export const TimesheetCreateOrConnectWithoutJobsInputSchema: z.ZodType<Prisma.TimesheetCreateOrConnectWithoutJobsInput> = z.object({
  where: z.lazy(() => TimesheetWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TimesheetCreateWithoutJobsInputSchema),z.lazy(() => TimesheetUncheckedCreateWithoutJobsInputSchema) ]),
}).strict();

export const DayCreateWithoutJobInputSchema: z.ZodType<Prisma.DayCreateWithoutJobInput> = z.object({
  dayId: z.number().int(),
  description: z.string(),
  editor: z.lazy(() => AccountCreateNestedOneWithoutDaysEditedInputSchema).optional(),
  entries: z.lazy(() => EntryCreateNestedManyWithoutDayInputSchema).optional()
}).strict();

export const DayUncheckedCreateWithoutJobInputSchema: z.ZodType<Prisma.DayUncheckedCreateWithoutJobInput> = z.object({
  dayId: z.number().int(),
  editorId: z.string().optional().nullable(),
  description: z.string(),
  entries: z.lazy(() => EntryUncheckedCreateNestedManyWithoutDayInputSchema).optional()
}).strict();

export const DayCreateOrConnectWithoutJobInputSchema: z.ZodType<Prisma.DayCreateOrConnectWithoutJobInput> = z.object({
  where: z.lazy(() => DayWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => DayCreateWithoutJobInputSchema),z.lazy(() => DayUncheckedCreateWithoutJobInputSchema) ]),
}).strict();

export const DayCreateManyJobInputEnvelopeSchema: z.ZodType<Prisma.DayCreateManyJobInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => DayCreateManyJobInputSchema),z.lazy(() => DayCreateManyJobInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const TimesheetUpsertWithoutJobsInputSchema: z.ZodType<Prisma.TimesheetUpsertWithoutJobsInput> = z.object({
  update: z.union([ z.lazy(() => TimesheetUpdateWithoutJobsInputSchema),z.lazy(() => TimesheetUncheckedUpdateWithoutJobsInputSchema) ]),
  create: z.union([ z.lazy(() => TimesheetCreateWithoutJobsInputSchema),z.lazy(() => TimesheetUncheckedCreateWithoutJobsInputSchema) ]),
  where: z.lazy(() => TimesheetWhereInputSchema).optional()
}).strict();

export const TimesheetUpdateToOneWithWhereWithoutJobsInputSchema: z.ZodType<Prisma.TimesheetUpdateToOneWithWhereWithoutJobsInput> = z.object({
  where: z.lazy(() => TimesheetWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TimesheetUpdateWithoutJobsInputSchema),z.lazy(() => TimesheetUncheckedUpdateWithoutJobsInputSchema) ]),
}).strict();

export const TimesheetUpdateWithoutJobsInputSchema: z.ZodType<Prisma.TimesheetUpdateWithoutJobsInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  employees: z.lazy(() => EmployeeUpdateManyWithoutTimesheetNestedInputSchema).optional()
}).strict();

export const TimesheetUncheckedUpdateWithoutJobsInputSchema: z.ZodType<Prisma.TimesheetUncheckedUpdateWithoutJobsInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  employees: z.lazy(() => EmployeeUncheckedUpdateManyWithoutTimesheetNestedInputSchema).optional()
}).strict();

export const DayUpsertWithWhereUniqueWithoutJobInputSchema: z.ZodType<Prisma.DayUpsertWithWhereUniqueWithoutJobInput> = z.object({
  where: z.lazy(() => DayWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => DayUpdateWithoutJobInputSchema),z.lazy(() => DayUncheckedUpdateWithoutJobInputSchema) ]),
  create: z.union([ z.lazy(() => DayCreateWithoutJobInputSchema),z.lazy(() => DayUncheckedCreateWithoutJobInputSchema) ]),
}).strict();

export const DayUpdateWithWhereUniqueWithoutJobInputSchema: z.ZodType<Prisma.DayUpdateWithWhereUniqueWithoutJobInput> = z.object({
  where: z.lazy(() => DayWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => DayUpdateWithoutJobInputSchema),z.lazy(() => DayUncheckedUpdateWithoutJobInputSchema) ]),
}).strict();

export const DayUpdateManyWithWhereWithoutJobInputSchema: z.ZodType<Prisma.DayUpdateManyWithWhereWithoutJobInput> = z.object({
  where: z.lazy(() => DayScalarWhereInputSchema),
  data: z.union([ z.lazy(() => DayUpdateManyMutationInputSchema),z.lazy(() => DayUncheckedUpdateManyWithoutJobInputSchema) ]),
}).strict();

export const JobCreateWithoutDaysInputSchema: z.ZodType<Prisma.JobCreateWithoutDaysInput> = z.object({
  jobId: z.string().optional(),
  oldJobId: z.number().int(),
  isActive: z.boolean(),
  name: z.string(),
  budgetOriginalCents: z.number().int().optional().nullable(),
  budgetCurrentCents: z.number().int().optional().nullable(),
  originalLaborSeconds: z.number().int().optional().nullable(),
  currentLaborSeconds: z.number().int().optional().nullable(),
  jobType: z.lazy(() => JobTypeSchema),
  timesheet: z.lazy(() => TimesheetCreateNestedOneWithoutJobsInputSchema)
}).strict();

export const JobUncheckedCreateWithoutDaysInputSchema: z.ZodType<Prisma.JobUncheckedCreateWithoutDaysInput> = z.object({
  timesheetId: z.string(),
  jobId: z.string().optional(),
  oldJobId: z.number().int(),
  isActive: z.boolean(),
  name: z.string(),
  budgetOriginalCents: z.number().int().optional().nullable(),
  budgetCurrentCents: z.number().int().optional().nullable(),
  originalLaborSeconds: z.number().int().optional().nullable(),
  currentLaborSeconds: z.number().int().optional().nullable(),
  jobType: z.lazy(() => JobTypeSchema)
}).strict();

export const JobCreateOrConnectWithoutDaysInputSchema: z.ZodType<Prisma.JobCreateOrConnectWithoutDaysInput> = z.object({
  where: z.lazy(() => JobWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => JobCreateWithoutDaysInputSchema),z.lazy(() => JobUncheckedCreateWithoutDaysInputSchema) ]),
}).strict();

export const AccountCreateWithoutDaysEditedInputSchema: z.ZodType<Prisma.AccountCreateWithoutDaysEditedInput> = z.object({
  accountId: z.string(),
  isActive: z.boolean(),
  phoneNumber: z.string(),
  accountType: z.lazy(() => AccountTypeSchema),
  actions: z.lazy(() => ActionCreateNestedManyWithoutActorInputSchema).optional()
}).strict();

export const AccountUncheckedCreateWithoutDaysEditedInputSchema: z.ZodType<Prisma.AccountUncheckedCreateWithoutDaysEditedInput> = z.object({
  accountId: z.string(),
  isActive: z.boolean(),
  phoneNumber: z.string(),
  accountType: z.lazy(() => AccountTypeSchema),
  actions: z.lazy(() => ActionUncheckedCreateNestedManyWithoutActorInputSchema).optional()
}).strict();

export const AccountCreateOrConnectWithoutDaysEditedInputSchema: z.ZodType<Prisma.AccountCreateOrConnectWithoutDaysEditedInput> = z.object({
  where: z.lazy(() => AccountWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AccountCreateWithoutDaysEditedInputSchema),z.lazy(() => AccountUncheckedCreateWithoutDaysEditedInputSchema) ]),
}).strict();

export const EntryCreateWithoutDayInputSchema: z.ZodType<Prisma.EntryCreateWithoutDayInput> = z.object({
  entryId: z.string().optional(),
  isApproved: z.boolean(),
  entryConfirmationStatus: z.lazy(() => EntryConfirmationStatusSchema),
  timeInSeconds: z.number().int(),
  timeOutSeconds: z.number().int(),
  lunchSeconds: z.number().int(),
  employee: z.lazy(() => EmployeeCreateNestedOneWithoutEntriesInputSchema)
}).strict();

export const EntryUncheckedCreateWithoutDayInputSchema: z.ZodType<Prisma.EntryUncheckedCreateWithoutDayInput> = z.object({
  entryId: z.string().optional(),
  employeeId: z.string(),
  isApproved: z.boolean(),
  entryConfirmationStatus: z.lazy(() => EntryConfirmationStatusSchema),
  timeInSeconds: z.number().int(),
  timeOutSeconds: z.number().int(),
  lunchSeconds: z.number().int()
}).strict();

export const EntryCreateOrConnectWithoutDayInputSchema: z.ZodType<Prisma.EntryCreateOrConnectWithoutDayInput> = z.object({
  where: z.lazy(() => EntryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EntryCreateWithoutDayInputSchema),z.lazy(() => EntryUncheckedCreateWithoutDayInputSchema) ]),
}).strict();

export const EntryCreateManyDayInputEnvelopeSchema: z.ZodType<Prisma.EntryCreateManyDayInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => EntryCreateManyDayInputSchema),z.lazy(() => EntryCreateManyDayInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const JobUpsertWithoutDaysInputSchema: z.ZodType<Prisma.JobUpsertWithoutDaysInput> = z.object({
  update: z.union([ z.lazy(() => JobUpdateWithoutDaysInputSchema),z.lazy(() => JobUncheckedUpdateWithoutDaysInputSchema) ]),
  create: z.union([ z.lazy(() => JobCreateWithoutDaysInputSchema),z.lazy(() => JobUncheckedCreateWithoutDaysInputSchema) ]),
  where: z.lazy(() => JobWhereInputSchema).optional()
}).strict();

export const JobUpdateToOneWithWhereWithoutDaysInputSchema: z.ZodType<Prisma.JobUpdateToOneWithWhereWithoutDaysInput> = z.object({
  where: z.lazy(() => JobWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => JobUpdateWithoutDaysInputSchema),z.lazy(() => JobUncheckedUpdateWithoutDaysInputSchema) ]),
}).strict();

export const JobUpdateWithoutDaysInputSchema: z.ZodType<Prisma.JobUpdateWithoutDaysInput> = z.object({
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  oldJobId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  budgetOriginalCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  budgetCurrentCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  originalLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  jobType: z.union([ z.lazy(() => JobTypeSchema),z.lazy(() => EnumJobTypeFieldUpdateOperationsInputSchema) ]).optional(),
  timesheet: z.lazy(() => TimesheetUpdateOneRequiredWithoutJobsNestedInputSchema).optional()
}).strict();

export const JobUncheckedUpdateWithoutDaysInputSchema: z.ZodType<Prisma.JobUncheckedUpdateWithoutDaysInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  oldJobId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  budgetOriginalCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  budgetCurrentCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  originalLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  jobType: z.union([ z.lazy(() => JobTypeSchema),z.lazy(() => EnumJobTypeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountUpsertWithoutDaysEditedInputSchema: z.ZodType<Prisma.AccountUpsertWithoutDaysEditedInput> = z.object({
  update: z.union([ z.lazy(() => AccountUpdateWithoutDaysEditedInputSchema),z.lazy(() => AccountUncheckedUpdateWithoutDaysEditedInputSchema) ]),
  create: z.union([ z.lazy(() => AccountCreateWithoutDaysEditedInputSchema),z.lazy(() => AccountUncheckedCreateWithoutDaysEditedInputSchema) ]),
  where: z.lazy(() => AccountWhereInputSchema).optional()
}).strict();

export const AccountUpdateToOneWithWhereWithoutDaysEditedInputSchema: z.ZodType<Prisma.AccountUpdateToOneWithWhereWithoutDaysEditedInput> = z.object({
  where: z.lazy(() => AccountWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => AccountUpdateWithoutDaysEditedInputSchema),z.lazy(() => AccountUncheckedUpdateWithoutDaysEditedInputSchema) ]),
}).strict();

export const AccountUpdateWithoutDaysEditedInputSchema: z.ZodType<Prisma.AccountUpdateWithoutDaysEditedInput> = z.object({
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountType: z.union([ z.lazy(() => AccountTypeSchema),z.lazy(() => EnumAccountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  actions: z.lazy(() => ActionUpdateManyWithoutActorNestedInputSchema).optional()
}).strict();

export const AccountUncheckedUpdateWithoutDaysEditedInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateWithoutDaysEditedInput> = z.object({
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountType: z.union([ z.lazy(() => AccountTypeSchema),z.lazy(() => EnumAccountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  actions: z.lazy(() => ActionUncheckedUpdateManyWithoutActorNestedInputSchema).optional()
}).strict();

export const EntryUpsertWithWhereUniqueWithoutDayInputSchema: z.ZodType<Prisma.EntryUpsertWithWhereUniqueWithoutDayInput> = z.object({
  where: z.lazy(() => EntryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EntryUpdateWithoutDayInputSchema),z.lazy(() => EntryUncheckedUpdateWithoutDayInputSchema) ]),
  create: z.union([ z.lazy(() => EntryCreateWithoutDayInputSchema),z.lazy(() => EntryUncheckedCreateWithoutDayInputSchema) ]),
}).strict();

export const EntryUpdateWithWhereUniqueWithoutDayInputSchema: z.ZodType<Prisma.EntryUpdateWithWhereUniqueWithoutDayInput> = z.object({
  where: z.lazy(() => EntryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EntryUpdateWithoutDayInputSchema),z.lazy(() => EntryUncheckedUpdateWithoutDayInputSchema) ]),
}).strict();

export const EntryUpdateManyWithWhereWithoutDayInputSchema: z.ZodType<Prisma.EntryUpdateManyWithWhereWithoutDayInput> = z.object({
  where: z.lazy(() => EntryScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EntryUpdateManyMutationInputSchema),z.lazy(() => EntryUncheckedUpdateManyWithoutDayInputSchema) ]),
}).strict();

export const DayCreateWithoutEntriesInputSchema: z.ZodType<Prisma.DayCreateWithoutEntriesInput> = z.object({
  dayId: z.number().int(),
  description: z.string(),
  job: z.lazy(() => JobCreateNestedOneWithoutDaysInputSchema),
  editor: z.lazy(() => AccountCreateNestedOneWithoutDaysEditedInputSchema).optional()
}).strict();

export const DayUncheckedCreateWithoutEntriesInputSchema: z.ZodType<Prisma.DayUncheckedCreateWithoutEntriesInput> = z.object({
  timesheetId: z.string(),
  jobId: z.string(),
  dayId: z.number().int(),
  editorId: z.string().optional().nullable(),
  description: z.string()
}).strict();

export const DayCreateOrConnectWithoutEntriesInputSchema: z.ZodType<Prisma.DayCreateOrConnectWithoutEntriesInput> = z.object({
  where: z.lazy(() => DayWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => DayCreateWithoutEntriesInputSchema),z.lazy(() => DayUncheckedCreateWithoutEntriesInputSchema) ]),
}).strict();

export const EmployeeCreateWithoutEntriesInputSchema: z.ZodType<Prisma.EmployeeCreateWithoutEntriesInput> = z.object({
  employeeId: z.string().optional(),
  isActive: z.boolean(),
  displayId: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  fringeCode: z.string(),
  ratePrivateCentsPerHour: z.number().int(),
  rateDavisBaconCentsPerHour: z.number().int(),
  rateDavisBaconOvertimeCentsPerHour: z.number().int(),
  timesheet: z.lazy(() => TimesheetCreateNestedOneWithoutEmployeesInputSchema)
}).strict();

export const EmployeeUncheckedCreateWithoutEntriesInputSchema: z.ZodType<Prisma.EmployeeUncheckedCreateWithoutEntriesInput> = z.object({
  timesheetId: z.string(),
  employeeId: z.string().optional(),
  isActive: z.boolean(),
  displayId: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  fringeCode: z.string(),
  ratePrivateCentsPerHour: z.number().int(),
  rateDavisBaconCentsPerHour: z.number().int(),
  rateDavisBaconOvertimeCentsPerHour: z.number().int()
}).strict();

export const EmployeeCreateOrConnectWithoutEntriesInputSchema: z.ZodType<Prisma.EmployeeCreateOrConnectWithoutEntriesInput> = z.object({
  where: z.lazy(() => EmployeeWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EmployeeCreateWithoutEntriesInputSchema),z.lazy(() => EmployeeUncheckedCreateWithoutEntriesInputSchema) ]),
}).strict();

export const DayUpsertWithoutEntriesInputSchema: z.ZodType<Prisma.DayUpsertWithoutEntriesInput> = z.object({
  update: z.union([ z.lazy(() => DayUpdateWithoutEntriesInputSchema),z.lazy(() => DayUncheckedUpdateWithoutEntriesInputSchema) ]),
  create: z.union([ z.lazy(() => DayCreateWithoutEntriesInputSchema),z.lazy(() => DayUncheckedCreateWithoutEntriesInputSchema) ]),
  where: z.lazy(() => DayWhereInputSchema).optional()
}).strict();

export const DayUpdateToOneWithWhereWithoutEntriesInputSchema: z.ZodType<Prisma.DayUpdateToOneWithWhereWithoutEntriesInput> = z.object({
  where: z.lazy(() => DayWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => DayUpdateWithoutEntriesInputSchema),z.lazy(() => DayUncheckedUpdateWithoutEntriesInputSchema) ]),
}).strict();

export const DayUpdateWithoutEntriesInputSchema: z.ZodType<Prisma.DayUpdateWithoutEntriesInput> = z.object({
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  job: z.lazy(() => JobUpdateOneRequiredWithoutDaysNestedInputSchema).optional(),
  editor: z.lazy(() => AccountUpdateOneWithoutDaysEditedNestedInputSchema).optional()
}).strict();

export const DayUncheckedUpdateWithoutEntriesInputSchema: z.ZodType<Prisma.DayUncheckedUpdateWithoutEntriesInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  editorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EmployeeUpsertWithoutEntriesInputSchema: z.ZodType<Prisma.EmployeeUpsertWithoutEntriesInput> = z.object({
  update: z.union([ z.lazy(() => EmployeeUpdateWithoutEntriesInputSchema),z.lazy(() => EmployeeUncheckedUpdateWithoutEntriesInputSchema) ]),
  create: z.union([ z.lazy(() => EmployeeCreateWithoutEntriesInputSchema),z.lazy(() => EmployeeUncheckedCreateWithoutEntriesInputSchema) ]),
  where: z.lazy(() => EmployeeWhereInputSchema).optional()
}).strict();

export const EmployeeUpdateToOneWithWhereWithoutEntriesInputSchema: z.ZodType<Prisma.EmployeeUpdateToOneWithWhereWithoutEntriesInput> = z.object({
  where: z.lazy(() => EmployeeWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => EmployeeUpdateWithoutEntriesInputSchema),z.lazy(() => EmployeeUncheckedUpdateWithoutEntriesInputSchema) ]),
}).strict();

export const EmployeeUpdateWithoutEntriesInputSchema: z.ZodType<Prisma.EmployeeUpdateWithoutEntriesInput> = z.object({
  employeeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fringeCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ratePrivateCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timesheet: z.lazy(() => TimesheetUpdateOneRequiredWithoutEmployeesNestedInputSchema).optional()
}).strict();

export const EmployeeUncheckedUpdateWithoutEntriesInputSchema: z.ZodType<Prisma.EmployeeUncheckedUpdateWithoutEntriesInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  employeeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fringeCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ratePrivateCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountCreateWithoutActionsInputSchema: z.ZodType<Prisma.AccountCreateWithoutActionsInput> = z.object({
  accountId: z.string(),
  isActive: z.boolean(),
  phoneNumber: z.string(),
  accountType: z.lazy(() => AccountTypeSchema),
  daysEdited: z.lazy(() => DayCreateNestedManyWithoutEditorInputSchema).optional()
}).strict();

export const AccountUncheckedCreateWithoutActionsInputSchema: z.ZodType<Prisma.AccountUncheckedCreateWithoutActionsInput> = z.object({
  accountId: z.string(),
  isActive: z.boolean(),
  phoneNumber: z.string(),
  accountType: z.lazy(() => AccountTypeSchema),
  daysEdited: z.lazy(() => DayUncheckedCreateNestedManyWithoutEditorInputSchema).optional()
}).strict();

export const AccountCreateOrConnectWithoutActionsInputSchema: z.ZodType<Prisma.AccountCreateOrConnectWithoutActionsInput> = z.object({
  where: z.lazy(() => AccountWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AccountCreateWithoutActionsInputSchema),z.lazy(() => AccountUncheckedCreateWithoutActionsInputSchema) ]),
}).strict();

export const AccountUpsertWithoutActionsInputSchema: z.ZodType<Prisma.AccountUpsertWithoutActionsInput> = z.object({
  update: z.union([ z.lazy(() => AccountUpdateWithoutActionsInputSchema),z.lazy(() => AccountUncheckedUpdateWithoutActionsInputSchema) ]),
  create: z.union([ z.lazy(() => AccountCreateWithoutActionsInputSchema),z.lazy(() => AccountUncheckedCreateWithoutActionsInputSchema) ]),
  where: z.lazy(() => AccountWhereInputSchema).optional()
}).strict();

export const AccountUpdateToOneWithWhereWithoutActionsInputSchema: z.ZodType<Prisma.AccountUpdateToOneWithWhereWithoutActionsInput> = z.object({
  where: z.lazy(() => AccountWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => AccountUpdateWithoutActionsInputSchema),z.lazy(() => AccountUncheckedUpdateWithoutActionsInputSchema) ]),
}).strict();

export const AccountUpdateWithoutActionsInputSchema: z.ZodType<Prisma.AccountUpdateWithoutActionsInput> = z.object({
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountType: z.union([ z.lazy(() => AccountTypeSchema),z.lazy(() => EnumAccountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  daysEdited: z.lazy(() => DayUpdateManyWithoutEditorNestedInputSchema).optional()
}).strict();

export const AccountUncheckedUpdateWithoutActionsInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateWithoutActionsInput> = z.object({
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountType: z.union([ z.lazy(() => AccountTypeSchema),z.lazy(() => EnumAccountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  daysEdited: z.lazy(() => DayUncheckedUpdateManyWithoutEditorNestedInputSchema).optional()
}).strict();

export const DayCreateManyEditorInputSchema: z.ZodType<Prisma.DayCreateManyEditorInput> = z.object({
  timesheetId: z.string(),
  jobId: z.string(),
  dayId: z.number().int(),
  description: z.string()
}).strict();

export const ActionCreateManyActorInputSchema: z.ZodType<Prisma.ActionCreateManyActorInput> = z.object({
  id: z.string().optional(),
  timestamp: z.coerce.date().optional(),
  targetId: z.string(),
  actionType: z.string(),
  actionJson: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
}).strict();

export const DayUpdateWithoutEditorInputSchema: z.ZodType<Prisma.DayUpdateWithoutEditorInput> = z.object({
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  job: z.lazy(() => JobUpdateOneRequiredWithoutDaysNestedInputSchema).optional(),
  entries: z.lazy(() => EntryUpdateManyWithoutDayNestedInputSchema).optional()
}).strict();

export const DayUncheckedUpdateWithoutEditorInputSchema: z.ZodType<Prisma.DayUncheckedUpdateWithoutEditorInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entries: z.lazy(() => EntryUncheckedUpdateManyWithoutDayNestedInputSchema).optional()
}).strict();

export const DayUncheckedUpdateManyWithoutEditorInputSchema: z.ZodType<Prisma.DayUncheckedUpdateManyWithoutEditorInput> = z.object({
  timesheetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ActionUpdateWithoutActorInputSchema: z.ZodType<Prisma.ActionUpdateWithoutActorInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  targetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actionType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actionJson: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export const ActionUncheckedUpdateWithoutActorInputSchema: z.ZodType<Prisma.ActionUncheckedUpdateWithoutActorInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  targetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actionType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actionJson: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export const ActionUncheckedUpdateManyWithoutActorInputSchema: z.ZodType<Prisma.ActionUncheckedUpdateManyWithoutActorInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  targetId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actionType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actionJson: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export const EmployeeCreateManyTimesheetInputSchema: z.ZodType<Prisma.EmployeeCreateManyTimesheetInput> = z.object({
  employeeId: z.string().optional(),
  isActive: z.boolean(),
  displayId: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  fringeCode: z.string(),
  ratePrivateCentsPerHour: z.number().int(),
  rateDavisBaconCentsPerHour: z.number().int(),
  rateDavisBaconOvertimeCentsPerHour: z.number().int()
}).strict();

export const JobCreateManyTimesheetInputSchema: z.ZodType<Prisma.JobCreateManyTimesheetInput> = z.object({
  jobId: z.string().optional(),
  oldJobId: z.number().int(),
  isActive: z.boolean(),
  name: z.string(),
  budgetOriginalCents: z.number().int().optional().nullable(),
  budgetCurrentCents: z.number().int().optional().nullable(),
  originalLaborSeconds: z.number().int().optional().nullable(),
  currentLaborSeconds: z.number().int().optional().nullable(),
  jobType: z.lazy(() => JobTypeSchema)
}).strict();

export const EmployeeUpdateWithoutTimesheetInputSchema: z.ZodType<Prisma.EmployeeUpdateWithoutTimesheetInput> = z.object({
  employeeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fringeCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ratePrivateCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  entries: z.lazy(() => EntryUpdateManyWithoutEmployeeNestedInputSchema).optional()
}).strict();

export const EmployeeUncheckedUpdateWithoutTimesheetInputSchema: z.ZodType<Prisma.EmployeeUncheckedUpdateWithoutTimesheetInput> = z.object({
  employeeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fringeCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ratePrivateCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  entries: z.lazy(() => EntryUncheckedUpdateManyWithoutEmployeeNestedInputSchema).optional()
}).strict();

export const EmployeeUncheckedUpdateManyWithoutTimesheetInputSchema: z.ZodType<Prisma.EmployeeUncheckedUpdateManyWithoutTimesheetInput> = z.object({
  employeeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phoneNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fringeCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ratePrivateCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rateDavisBaconOvertimeCentsPerHour: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const JobUpdateWithoutTimesheetInputSchema: z.ZodType<Prisma.JobUpdateWithoutTimesheetInput> = z.object({
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  oldJobId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  budgetOriginalCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  budgetCurrentCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  originalLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  jobType: z.union([ z.lazy(() => JobTypeSchema),z.lazy(() => EnumJobTypeFieldUpdateOperationsInputSchema) ]).optional(),
  days: z.lazy(() => DayUpdateManyWithoutJobNestedInputSchema).optional()
}).strict();

export const JobUncheckedUpdateWithoutTimesheetInputSchema: z.ZodType<Prisma.JobUncheckedUpdateWithoutTimesheetInput> = z.object({
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  oldJobId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  budgetOriginalCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  budgetCurrentCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  originalLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  jobType: z.union([ z.lazy(() => JobTypeSchema),z.lazy(() => EnumJobTypeFieldUpdateOperationsInputSchema) ]).optional(),
  days: z.lazy(() => DayUncheckedUpdateManyWithoutJobNestedInputSchema).optional()
}).strict();

export const JobUncheckedUpdateManyWithoutTimesheetInputSchema: z.ZodType<Prisma.JobUncheckedUpdateManyWithoutTimesheetInput> = z.object({
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  oldJobId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  budgetOriginalCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  budgetCurrentCents: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  originalLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentLaborSeconds: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  jobType: z.union([ z.lazy(() => JobTypeSchema),z.lazy(() => EnumJobTypeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EntryCreateManyEmployeeInputSchema: z.ZodType<Prisma.EntryCreateManyEmployeeInput> = z.object({
  jobId: z.string(),
  dayId: z.number().int(),
  entryId: z.string().optional(),
  isApproved: z.boolean(),
  entryConfirmationStatus: z.lazy(() => EntryConfirmationStatusSchema),
  timeInSeconds: z.number().int(),
  timeOutSeconds: z.number().int(),
  lunchSeconds: z.number().int()
}).strict();

export const EntryUpdateWithoutEmployeeInputSchema: z.ZodType<Prisma.EntryUpdateWithoutEmployeeInput> = z.object({
  entryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isApproved: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  entryConfirmationStatus: z.union([ z.lazy(() => EntryConfirmationStatusSchema),z.lazy(() => EnumEntryConfirmationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  timeInSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timeOutSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lunchSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  day: z.lazy(() => DayUpdateOneRequiredWithoutEntriesNestedInputSchema).optional()
}).strict();

export const EntryUncheckedUpdateWithoutEmployeeInputSchema: z.ZodType<Prisma.EntryUncheckedUpdateWithoutEmployeeInput> = z.object({
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  entryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isApproved: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  entryConfirmationStatus: z.union([ z.lazy(() => EntryConfirmationStatusSchema),z.lazy(() => EnumEntryConfirmationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  timeInSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timeOutSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lunchSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EntryUncheckedUpdateManyWithoutEmployeeInputSchema: z.ZodType<Prisma.EntryUncheckedUpdateManyWithoutEmployeeInput> = z.object({
  jobId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  entryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isApproved: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  entryConfirmationStatus: z.union([ z.lazy(() => EntryConfirmationStatusSchema),z.lazy(() => EnumEntryConfirmationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  timeInSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timeOutSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lunchSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const DayCreateManyJobInputSchema: z.ZodType<Prisma.DayCreateManyJobInput> = z.object({
  dayId: z.number().int(),
  editorId: z.string().optional().nullable(),
  description: z.string()
}).strict();

export const DayUpdateWithoutJobInputSchema: z.ZodType<Prisma.DayUpdateWithoutJobInput> = z.object({
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  editor: z.lazy(() => AccountUpdateOneWithoutDaysEditedNestedInputSchema).optional(),
  entries: z.lazy(() => EntryUpdateManyWithoutDayNestedInputSchema).optional()
}).strict();

export const DayUncheckedUpdateWithoutJobInputSchema: z.ZodType<Prisma.DayUncheckedUpdateWithoutJobInput> = z.object({
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  editorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entries: z.lazy(() => EntryUncheckedUpdateManyWithoutDayNestedInputSchema).optional()
}).strict();

export const DayUncheckedUpdateManyWithoutJobInputSchema: z.ZodType<Prisma.DayUncheckedUpdateManyWithoutJobInput> = z.object({
  dayId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  editorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EntryCreateManyDayInputSchema: z.ZodType<Prisma.EntryCreateManyDayInput> = z.object({
  entryId: z.string().optional(),
  employeeId: z.string(),
  isApproved: z.boolean(),
  entryConfirmationStatus: z.lazy(() => EntryConfirmationStatusSchema),
  timeInSeconds: z.number().int(),
  timeOutSeconds: z.number().int(),
  lunchSeconds: z.number().int()
}).strict();

export const EntryUpdateWithoutDayInputSchema: z.ZodType<Prisma.EntryUpdateWithoutDayInput> = z.object({
  entryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isApproved: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  entryConfirmationStatus: z.union([ z.lazy(() => EntryConfirmationStatusSchema),z.lazy(() => EnumEntryConfirmationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  timeInSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timeOutSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lunchSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  employee: z.lazy(() => EmployeeUpdateOneRequiredWithoutEntriesNestedInputSchema).optional()
}).strict();

export const EntryUncheckedUpdateWithoutDayInputSchema: z.ZodType<Prisma.EntryUncheckedUpdateWithoutDayInput> = z.object({
  entryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  employeeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isApproved: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  entryConfirmationStatus: z.union([ z.lazy(() => EntryConfirmationStatusSchema),z.lazy(() => EnumEntryConfirmationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  timeInSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timeOutSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lunchSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EntryUncheckedUpdateManyWithoutDayInputSchema: z.ZodType<Prisma.EntryUncheckedUpdateManyWithoutDayInput> = z.object({
  entryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  employeeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isApproved: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  entryConfirmationStatus: z.union([ z.lazy(() => EntryConfirmationStatusSchema),z.lazy(() => EnumEntryConfirmationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  timeInSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timeOutSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lunchSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const AccountFindFirstArgsSchema: z.ZodType<Prisma.AccountFindFirstArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccountScalarFieldEnumSchema,AccountScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const AccountFindFirstOrThrowArgsSchema: z.ZodType<Prisma.AccountFindFirstOrThrowArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccountScalarFieldEnumSchema,AccountScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const AccountFindManyArgsSchema: z.ZodType<Prisma.AccountFindManyArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccountScalarFieldEnumSchema,AccountScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const AccountAggregateArgsSchema: z.ZodType<Prisma.AccountAggregateArgs> = z.object({
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const AccountGroupByArgsSchema: z.ZodType<Prisma.AccountGroupByArgs> = z.object({
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithAggregationInputSchema.array(),AccountOrderByWithAggregationInputSchema ]).optional(),
  by: AccountScalarFieldEnumSchema.array(),
  having: AccountScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const AccountFindUniqueArgsSchema: z.ZodType<Prisma.AccountFindUniqueArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereUniqueInputSchema,
}).strict() ;

export const AccountFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.AccountFindUniqueOrThrowArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereUniqueInputSchema,
}).strict() ;

export const TimesheetFindFirstArgsSchema: z.ZodType<Prisma.TimesheetFindFirstArgs> = z.object({
  select: TimesheetSelectSchema.optional(),
  include: TimesheetIncludeSchema.optional(),
  where: TimesheetWhereInputSchema.optional(),
  orderBy: z.union([ TimesheetOrderByWithRelationInputSchema.array(),TimesheetOrderByWithRelationInputSchema ]).optional(),
  cursor: TimesheetWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TimesheetScalarFieldEnumSchema,TimesheetScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TimesheetFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TimesheetFindFirstOrThrowArgs> = z.object({
  select: TimesheetSelectSchema.optional(),
  include: TimesheetIncludeSchema.optional(),
  where: TimesheetWhereInputSchema.optional(),
  orderBy: z.union([ TimesheetOrderByWithRelationInputSchema.array(),TimesheetOrderByWithRelationInputSchema ]).optional(),
  cursor: TimesheetWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TimesheetScalarFieldEnumSchema,TimesheetScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TimesheetFindManyArgsSchema: z.ZodType<Prisma.TimesheetFindManyArgs> = z.object({
  select: TimesheetSelectSchema.optional(),
  include: TimesheetIncludeSchema.optional(),
  where: TimesheetWhereInputSchema.optional(),
  orderBy: z.union([ TimesheetOrderByWithRelationInputSchema.array(),TimesheetOrderByWithRelationInputSchema ]).optional(),
  cursor: TimesheetWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TimesheetScalarFieldEnumSchema,TimesheetScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TimesheetAggregateArgsSchema: z.ZodType<Prisma.TimesheetAggregateArgs> = z.object({
  where: TimesheetWhereInputSchema.optional(),
  orderBy: z.union([ TimesheetOrderByWithRelationInputSchema.array(),TimesheetOrderByWithRelationInputSchema ]).optional(),
  cursor: TimesheetWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TimesheetGroupByArgsSchema: z.ZodType<Prisma.TimesheetGroupByArgs> = z.object({
  where: TimesheetWhereInputSchema.optional(),
  orderBy: z.union([ TimesheetOrderByWithAggregationInputSchema.array(),TimesheetOrderByWithAggregationInputSchema ]).optional(),
  by: TimesheetScalarFieldEnumSchema.array(),
  having: TimesheetScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TimesheetFindUniqueArgsSchema: z.ZodType<Prisma.TimesheetFindUniqueArgs> = z.object({
  select: TimesheetSelectSchema.optional(),
  include: TimesheetIncludeSchema.optional(),
  where: TimesheetWhereUniqueInputSchema,
}).strict() ;

export const TimesheetFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TimesheetFindUniqueOrThrowArgs> = z.object({
  select: TimesheetSelectSchema.optional(),
  include: TimesheetIncludeSchema.optional(),
  where: TimesheetWhereUniqueInputSchema,
}).strict() ;

export const EmployeeFindFirstArgsSchema: z.ZodType<Prisma.EmployeeFindFirstArgs> = z.object({
  select: EmployeeSelectSchema.optional(),
  include: EmployeeIncludeSchema.optional(),
  where: EmployeeWhereInputSchema.optional(),
  orderBy: z.union([ EmployeeOrderByWithRelationInputSchema.array(),EmployeeOrderByWithRelationInputSchema ]).optional(),
  cursor: EmployeeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EmployeeScalarFieldEnumSchema,EmployeeScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EmployeeFindFirstOrThrowArgsSchema: z.ZodType<Prisma.EmployeeFindFirstOrThrowArgs> = z.object({
  select: EmployeeSelectSchema.optional(),
  include: EmployeeIncludeSchema.optional(),
  where: EmployeeWhereInputSchema.optional(),
  orderBy: z.union([ EmployeeOrderByWithRelationInputSchema.array(),EmployeeOrderByWithRelationInputSchema ]).optional(),
  cursor: EmployeeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EmployeeScalarFieldEnumSchema,EmployeeScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EmployeeFindManyArgsSchema: z.ZodType<Prisma.EmployeeFindManyArgs> = z.object({
  select: EmployeeSelectSchema.optional(),
  include: EmployeeIncludeSchema.optional(),
  where: EmployeeWhereInputSchema.optional(),
  orderBy: z.union([ EmployeeOrderByWithRelationInputSchema.array(),EmployeeOrderByWithRelationInputSchema ]).optional(),
  cursor: EmployeeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EmployeeScalarFieldEnumSchema,EmployeeScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EmployeeAggregateArgsSchema: z.ZodType<Prisma.EmployeeAggregateArgs> = z.object({
  where: EmployeeWhereInputSchema.optional(),
  orderBy: z.union([ EmployeeOrderByWithRelationInputSchema.array(),EmployeeOrderByWithRelationInputSchema ]).optional(),
  cursor: EmployeeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const EmployeeGroupByArgsSchema: z.ZodType<Prisma.EmployeeGroupByArgs> = z.object({
  where: EmployeeWhereInputSchema.optional(),
  orderBy: z.union([ EmployeeOrderByWithAggregationInputSchema.array(),EmployeeOrderByWithAggregationInputSchema ]).optional(),
  by: EmployeeScalarFieldEnumSchema.array(),
  having: EmployeeScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const EmployeeFindUniqueArgsSchema: z.ZodType<Prisma.EmployeeFindUniqueArgs> = z.object({
  select: EmployeeSelectSchema.optional(),
  include: EmployeeIncludeSchema.optional(),
  where: EmployeeWhereUniqueInputSchema,
}).strict() ;

export const EmployeeFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.EmployeeFindUniqueOrThrowArgs> = z.object({
  select: EmployeeSelectSchema.optional(),
  include: EmployeeIncludeSchema.optional(),
  where: EmployeeWhereUniqueInputSchema,
}).strict() ;

export const JobFindFirstArgsSchema: z.ZodType<Prisma.JobFindFirstArgs> = z.object({
  select: JobSelectSchema.optional(),
  include: JobIncludeSchema.optional(),
  where: JobWhereInputSchema.optional(),
  orderBy: z.union([ JobOrderByWithRelationInputSchema.array(),JobOrderByWithRelationInputSchema ]).optional(),
  cursor: JobWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ JobScalarFieldEnumSchema,JobScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const JobFindFirstOrThrowArgsSchema: z.ZodType<Prisma.JobFindFirstOrThrowArgs> = z.object({
  select: JobSelectSchema.optional(),
  include: JobIncludeSchema.optional(),
  where: JobWhereInputSchema.optional(),
  orderBy: z.union([ JobOrderByWithRelationInputSchema.array(),JobOrderByWithRelationInputSchema ]).optional(),
  cursor: JobWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ JobScalarFieldEnumSchema,JobScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const JobFindManyArgsSchema: z.ZodType<Prisma.JobFindManyArgs> = z.object({
  select: JobSelectSchema.optional(),
  include: JobIncludeSchema.optional(),
  where: JobWhereInputSchema.optional(),
  orderBy: z.union([ JobOrderByWithRelationInputSchema.array(),JobOrderByWithRelationInputSchema ]).optional(),
  cursor: JobWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ JobScalarFieldEnumSchema,JobScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const JobAggregateArgsSchema: z.ZodType<Prisma.JobAggregateArgs> = z.object({
  where: JobWhereInputSchema.optional(),
  orderBy: z.union([ JobOrderByWithRelationInputSchema.array(),JobOrderByWithRelationInputSchema ]).optional(),
  cursor: JobWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const JobGroupByArgsSchema: z.ZodType<Prisma.JobGroupByArgs> = z.object({
  where: JobWhereInputSchema.optional(),
  orderBy: z.union([ JobOrderByWithAggregationInputSchema.array(),JobOrderByWithAggregationInputSchema ]).optional(),
  by: JobScalarFieldEnumSchema.array(),
  having: JobScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const JobFindUniqueArgsSchema: z.ZodType<Prisma.JobFindUniqueArgs> = z.object({
  select: JobSelectSchema.optional(),
  include: JobIncludeSchema.optional(),
  where: JobWhereUniqueInputSchema,
}).strict() ;

export const JobFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.JobFindUniqueOrThrowArgs> = z.object({
  select: JobSelectSchema.optional(),
  include: JobIncludeSchema.optional(),
  where: JobWhereUniqueInputSchema,
}).strict() ;

export const DayFindFirstArgsSchema: z.ZodType<Prisma.DayFindFirstArgs> = z.object({
  select: DaySelectSchema.optional(),
  include: DayIncludeSchema.optional(),
  where: DayWhereInputSchema.optional(),
  orderBy: z.union([ DayOrderByWithRelationInputSchema.array(),DayOrderByWithRelationInputSchema ]).optional(),
  cursor: DayWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DayScalarFieldEnumSchema,DayScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const DayFindFirstOrThrowArgsSchema: z.ZodType<Prisma.DayFindFirstOrThrowArgs> = z.object({
  select: DaySelectSchema.optional(),
  include: DayIncludeSchema.optional(),
  where: DayWhereInputSchema.optional(),
  orderBy: z.union([ DayOrderByWithRelationInputSchema.array(),DayOrderByWithRelationInputSchema ]).optional(),
  cursor: DayWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DayScalarFieldEnumSchema,DayScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const DayFindManyArgsSchema: z.ZodType<Prisma.DayFindManyArgs> = z.object({
  select: DaySelectSchema.optional(),
  include: DayIncludeSchema.optional(),
  where: DayWhereInputSchema.optional(),
  orderBy: z.union([ DayOrderByWithRelationInputSchema.array(),DayOrderByWithRelationInputSchema ]).optional(),
  cursor: DayWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DayScalarFieldEnumSchema,DayScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const DayAggregateArgsSchema: z.ZodType<Prisma.DayAggregateArgs> = z.object({
  where: DayWhereInputSchema.optional(),
  orderBy: z.union([ DayOrderByWithRelationInputSchema.array(),DayOrderByWithRelationInputSchema ]).optional(),
  cursor: DayWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const DayGroupByArgsSchema: z.ZodType<Prisma.DayGroupByArgs> = z.object({
  where: DayWhereInputSchema.optional(),
  orderBy: z.union([ DayOrderByWithAggregationInputSchema.array(),DayOrderByWithAggregationInputSchema ]).optional(),
  by: DayScalarFieldEnumSchema.array(),
  having: DayScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const DayFindUniqueArgsSchema: z.ZodType<Prisma.DayFindUniqueArgs> = z.object({
  select: DaySelectSchema.optional(),
  include: DayIncludeSchema.optional(),
  where: DayWhereUniqueInputSchema,
}).strict() ;

export const DayFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.DayFindUniqueOrThrowArgs> = z.object({
  select: DaySelectSchema.optional(),
  include: DayIncludeSchema.optional(),
  where: DayWhereUniqueInputSchema,
}).strict() ;

export const EntryFindFirstArgsSchema: z.ZodType<Prisma.EntryFindFirstArgs> = z.object({
  select: EntrySelectSchema.optional(),
  include: EntryIncludeSchema.optional(),
  where: EntryWhereInputSchema.optional(),
  orderBy: z.union([ EntryOrderByWithRelationInputSchema.array(),EntryOrderByWithRelationInputSchema ]).optional(),
  cursor: EntryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EntryScalarFieldEnumSchema,EntryScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EntryFindFirstOrThrowArgsSchema: z.ZodType<Prisma.EntryFindFirstOrThrowArgs> = z.object({
  select: EntrySelectSchema.optional(),
  include: EntryIncludeSchema.optional(),
  where: EntryWhereInputSchema.optional(),
  orderBy: z.union([ EntryOrderByWithRelationInputSchema.array(),EntryOrderByWithRelationInputSchema ]).optional(),
  cursor: EntryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EntryScalarFieldEnumSchema,EntryScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EntryFindManyArgsSchema: z.ZodType<Prisma.EntryFindManyArgs> = z.object({
  select: EntrySelectSchema.optional(),
  include: EntryIncludeSchema.optional(),
  where: EntryWhereInputSchema.optional(),
  orderBy: z.union([ EntryOrderByWithRelationInputSchema.array(),EntryOrderByWithRelationInputSchema ]).optional(),
  cursor: EntryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EntryScalarFieldEnumSchema,EntryScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EntryAggregateArgsSchema: z.ZodType<Prisma.EntryAggregateArgs> = z.object({
  where: EntryWhereInputSchema.optional(),
  orderBy: z.union([ EntryOrderByWithRelationInputSchema.array(),EntryOrderByWithRelationInputSchema ]).optional(),
  cursor: EntryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const EntryGroupByArgsSchema: z.ZodType<Prisma.EntryGroupByArgs> = z.object({
  where: EntryWhereInputSchema.optional(),
  orderBy: z.union([ EntryOrderByWithAggregationInputSchema.array(),EntryOrderByWithAggregationInputSchema ]).optional(),
  by: EntryScalarFieldEnumSchema.array(),
  having: EntryScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const EntryFindUniqueArgsSchema: z.ZodType<Prisma.EntryFindUniqueArgs> = z.object({
  select: EntrySelectSchema.optional(),
  include: EntryIncludeSchema.optional(),
  where: EntryWhereUniqueInputSchema,
}).strict() ;

export const EntryFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.EntryFindUniqueOrThrowArgs> = z.object({
  select: EntrySelectSchema.optional(),
  include: EntryIncludeSchema.optional(),
  where: EntryWhereUniqueInputSchema,
}).strict() ;

export const ActionFindFirstArgsSchema: z.ZodType<Prisma.ActionFindFirstArgs> = z.object({
  select: ActionSelectSchema.optional(),
  include: ActionIncludeSchema.optional(),
  where: ActionWhereInputSchema.optional(),
  orderBy: z.union([ ActionOrderByWithRelationInputSchema.array(),ActionOrderByWithRelationInputSchema ]).optional(),
  cursor: ActionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ActionScalarFieldEnumSchema,ActionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ActionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ActionFindFirstOrThrowArgs> = z.object({
  select: ActionSelectSchema.optional(),
  include: ActionIncludeSchema.optional(),
  where: ActionWhereInputSchema.optional(),
  orderBy: z.union([ ActionOrderByWithRelationInputSchema.array(),ActionOrderByWithRelationInputSchema ]).optional(),
  cursor: ActionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ActionScalarFieldEnumSchema,ActionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ActionFindManyArgsSchema: z.ZodType<Prisma.ActionFindManyArgs> = z.object({
  select: ActionSelectSchema.optional(),
  include: ActionIncludeSchema.optional(),
  where: ActionWhereInputSchema.optional(),
  orderBy: z.union([ ActionOrderByWithRelationInputSchema.array(),ActionOrderByWithRelationInputSchema ]).optional(),
  cursor: ActionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ActionScalarFieldEnumSchema,ActionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ActionAggregateArgsSchema: z.ZodType<Prisma.ActionAggregateArgs> = z.object({
  where: ActionWhereInputSchema.optional(),
  orderBy: z.union([ ActionOrderByWithRelationInputSchema.array(),ActionOrderByWithRelationInputSchema ]).optional(),
  cursor: ActionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ActionGroupByArgsSchema: z.ZodType<Prisma.ActionGroupByArgs> = z.object({
  where: ActionWhereInputSchema.optional(),
  orderBy: z.union([ ActionOrderByWithAggregationInputSchema.array(),ActionOrderByWithAggregationInputSchema ]).optional(),
  by: ActionScalarFieldEnumSchema.array(),
  having: ActionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ActionFindUniqueArgsSchema: z.ZodType<Prisma.ActionFindUniqueArgs> = z.object({
  select: ActionSelectSchema.optional(),
  include: ActionIncludeSchema.optional(),
  where: ActionWhereUniqueInputSchema,
}).strict() ;

export const ActionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ActionFindUniqueOrThrowArgs> = z.object({
  select: ActionSelectSchema.optional(),
  include: ActionIncludeSchema.optional(),
  where: ActionWhereUniqueInputSchema,
}).strict() ;

export const AccountCreateArgsSchema: z.ZodType<Prisma.AccountCreateArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  data: z.union([ AccountCreateInputSchema,AccountUncheckedCreateInputSchema ]),
}).strict() ;

export const AccountUpsertArgsSchema: z.ZodType<Prisma.AccountUpsertArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereUniqueInputSchema,
  create: z.union([ AccountCreateInputSchema,AccountUncheckedCreateInputSchema ]),
  update: z.union([ AccountUpdateInputSchema,AccountUncheckedUpdateInputSchema ]),
}).strict() ;

export const AccountCreateManyArgsSchema: z.ZodType<Prisma.AccountCreateManyArgs> = z.object({
  data: z.union([ AccountCreateManyInputSchema,AccountCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const AccountCreateManyAndReturnArgsSchema: z.ZodType<Prisma.AccountCreateManyAndReturnArgs> = z.object({
  data: z.union([ AccountCreateManyInputSchema,AccountCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const AccountDeleteArgsSchema: z.ZodType<Prisma.AccountDeleteArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereUniqueInputSchema,
}).strict() ;

export const AccountUpdateArgsSchema: z.ZodType<Prisma.AccountUpdateArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  data: z.union([ AccountUpdateInputSchema,AccountUncheckedUpdateInputSchema ]),
  where: AccountWhereUniqueInputSchema,
}).strict() ;

export const AccountUpdateManyArgsSchema: z.ZodType<Prisma.AccountUpdateManyArgs> = z.object({
  data: z.union([ AccountUpdateManyMutationInputSchema,AccountUncheckedUpdateManyInputSchema ]),
  where: AccountWhereInputSchema.optional(),
}).strict() ;

export const AccountDeleteManyArgsSchema: z.ZodType<Prisma.AccountDeleteManyArgs> = z.object({
  where: AccountWhereInputSchema.optional(),
}).strict() ;

export const TimesheetCreateArgsSchema: z.ZodType<Prisma.TimesheetCreateArgs> = z.object({
  select: TimesheetSelectSchema.optional(),
  include: TimesheetIncludeSchema.optional(),
  data: z.union([ TimesheetCreateInputSchema,TimesheetUncheckedCreateInputSchema ]),
}).strict() ;

export const TimesheetUpsertArgsSchema: z.ZodType<Prisma.TimesheetUpsertArgs> = z.object({
  select: TimesheetSelectSchema.optional(),
  include: TimesheetIncludeSchema.optional(),
  where: TimesheetWhereUniqueInputSchema,
  create: z.union([ TimesheetCreateInputSchema,TimesheetUncheckedCreateInputSchema ]),
  update: z.union([ TimesheetUpdateInputSchema,TimesheetUncheckedUpdateInputSchema ]),
}).strict() ;

export const TimesheetCreateManyArgsSchema: z.ZodType<Prisma.TimesheetCreateManyArgs> = z.object({
  data: z.union([ TimesheetCreateManyInputSchema,TimesheetCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const TimesheetCreateManyAndReturnArgsSchema: z.ZodType<Prisma.TimesheetCreateManyAndReturnArgs> = z.object({
  data: z.union([ TimesheetCreateManyInputSchema,TimesheetCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const TimesheetDeleteArgsSchema: z.ZodType<Prisma.TimesheetDeleteArgs> = z.object({
  select: TimesheetSelectSchema.optional(),
  include: TimesheetIncludeSchema.optional(),
  where: TimesheetWhereUniqueInputSchema,
}).strict() ;

export const TimesheetUpdateArgsSchema: z.ZodType<Prisma.TimesheetUpdateArgs> = z.object({
  select: TimesheetSelectSchema.optional(),
  include: TimesheetIncludeSchema.optional(),
  data: z.union([ TimesheetUpdateInputSchema,TimesheetUncheckedUpdateInputSchema ]),
  where: TimesheetWhereUniqueInputSchema,
}).strict() ;

export const TimesheetUpdateManyArgsSchema: z.ZodType<Prisma.TimesheetUpdateManyArgs> = z.object({
  data: z.union([ TimesheetUpdateManyMutationInputSchema,TimesheetUncheckedUpdateManyInputSchema ]),
  where: TimesheetWhereInputSchema.optional(),
}).strict() ;

export const TimesheetDeleteManyArgsSchema: z.ZodType<Prisma.TimesheetDeleteManyArgs> = z.object({
  where: TimesheetWhereInputSchema.optional(),
}).strict() ;

export const EmployeeCreateArgsSchema: z.ZodType<Prisma.EmployeeCreateArgs> = z.object({
  select: EmployeeSelectSchema.optional(),
  include: EmployeeIncludeSchema.optional(),
  data: z.union([ EmployeeCreateInputSchema,EmployeeUncheckedCreateInputSchema ]),
}).strict() ;

export const EmployeeUpsertArgsSchema: z.ZodType<Prisma.EmployeeUpsertArgs> = z.object({
  select: EmployeeSelectSchema.optional(),
  include: EmployeeIncludeSchema.optional(),
  where: EmployeeWhereUniqueInputSchema,
  create: z.union([ EmployeeCreateInputSchema,EmployeeUncheckedCreateInputSchema ]),
  update: z.union([ EmployeeUpdateInputSchema,EmployeeUncheckedUpdateInputSchema ]),
}).strict() ;

export const EmployeeCreateManyArgsSchema: z.ZodType<Prisma.EmployeeCreateManyArgs> = z.object({
  data: z.union([ EmployeeCreateManyInputSchema,EmployeeCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const EmployeeCreateManyAndReturnArgsSchema: z.ZodType<Prisma.EmployeeCreateManyAndReturnArgs> = z.object({
  data: z.union([ EmployeeCreateManyInputSchema,EmployeeCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const EmployeeDeleteArgsSchema: z.ZodType<Prisma.EmployeeDeleteArgs> = z.object({
  select: EmployeeSelectSchema.optional(),
  include: EmployeeIncludeSchema.optional(),
  where: EmployeeWhereUniqueInputSchema,
}).strict() ;

export const EmployeeUpdateArgsSchema: z.ZodType<Prisma.EmployeeUpdateArgs> = z.object({
  select: EmployeeSelectSchema.optional(),
  include: EmployeeIncludeSchema.optional(),
  data: z.union([ EmployeeUpdateInputSchema,EmployeeUncheckedUpdateInputSchema ]),
  where: EmployeeWhereUniqueInputSchema,
}).strict() ;

export const EmployeeUpdateManyArgsSchema: z.ZodType<Prisma.EmployeeUpdateManyArgs> = z.object({
  data: z.union([ EmployeeUpdateManyMutationInputSchema,EmployeeUncheckedUpdateManyInputSchema ]),
  where: EmployeeWhereInputSchema.optional(),
}).strict() ;

export const EmployeeDeleteManyArgsSchema: z.ZodType<Prisma.EmployeeDeleteManyArgs> = z.object({
  where: EmployeeWhereInputSchema.optional(),
}).strict() ;

export const JobCreateArgsSchema: z.ZodType<Prisma.JobCreateArgs> = z.object({
  select: JobSelectSchema.optional(),
  include: JobIncludeSchema.optional(),
  data: z.union([ JobCreateInputSchema,JobUncheckedCreateInputSchema ]),
}).strict() ;

export const JobUpsertArgsSchema: z.ZodType<Prisma.JobUpsertArgs> = z.object({
  select: JobSelectSchema.optional(),
  include: JobIncludeSchema.optional(),
  where: JobWhereUniqueInputSchema,
  create: z.union([ JobCreateInputSchema,JobUncheckedCreateInputSchema ]),
  update: z.union([ JobUpdateInputSchema,JobUncheckedUpdateInputSchema ]),
}).strict() ;

export const JobCreateManyArgsSchema: z.ZodType<Prisma.JobCreateManyArgs> = z.object({
  data: z.union([ JobCreateManyInputSchema,JobCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const JobCreateManyAndReturnArgsSchema: z.ZodType<Prisma.JobCreateManyAndReturnArgs> = z.object({
  data: z.union([ JobCreateManyInputSchema,JobCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const JobDeleteArgsSchema: z.ZodType<Prisma.JobDeleteArgs> = z.object({
  select: JobSelectSchema.optional(),
  include: JobIncludeSchema.optional(),
  where: JobWhereUniqueInputSchema,
}).strict() ;

export const JobUpdateArgsSchema: z.ZodType<Prisma.JobUpdateArgs> = z.object({
  select: JobSelectSchema.optional(),
  include: JobIncludeSchema.optional(),
  data: z.union([ JobUpdateInputSchema,JobUncheckedUpdateInputSchema ]),
  where: JobWhereUniqueInputSchema,
}).strict() ;

export const JobUpdateManyArgsSchema: z.ZodType<Prisma.JobUpdateManyArgs> = z.object({
  data: z.union([ JobUpdateManyMutationInputSchema,JobUncheckedUpdateManyInputSchema ]),
  where: JobWhereInputSchema.optional(),
}).strict() ;

export const JobDeleteManyArgsSchema: z.ZodType<Prisma.JobDeleteManyArgs> = z.object({
  where: JobWhereInputSchema.optional(),
}).strict() ;

export const DayCreateArgsSchema: z.ZodType<Prisma.DayCreateArgs> = z.object({
  select: DaySelectSchema.optional(),
  include: DayIncludeSchema.optional(),
  data: z.union([ DayCreateInputSchema,DayUncheckedCreateInputSchema ]),
}).strict() ;

export const DayUpsertArgsSchema: z.ZodType<Prisma.DayUpsertArgs> = z.object({
  select: DaySelectSchema.optional(),
  include: DayIncludeSchema.optional(),
  where: DayWhereUniqueInputSchema,
  create: z.union([ DayCreateInputSchema,DayUncheckedCreateInputSchema ]),
  update: z.union([ DayUpdateInputSchema,DayUncheckedUpdateInputSchema ]),
}).strict() ;

export const DayCreateManyArgsSchema: z.ZodType<Prisma.DayCreateManyArgs> = z.object({
  data: z.union([ DayCreateManyInputSchema,DayCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const DayCreateManyAndReturnArgsSchema: z.ZodType<Prisma.DayCreateManyAndReturnArgs> = z.object({
  data: z.union([ DayCreateManyInputSchema,DayCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const DayDeleteArgsSchema: z.ZodType<Prisma.DayDeleteArgs> = z.object({
  select: DaySelectSchema.optional(),
  include: DayIncludeSchema.optional(),
  where: DayWhereUniqueInputSchema,
}).strict() ;

export const DayUpdateArgsSchema: z.ZodType<Prisma.DayUpdateArgs> = z.object({
  select: DaySelectSchema.optional(),
  include: DayIncludeSchema.optional(),
  data: z.union([ DayUpdateInputSchema,DayUncheckedUpdateInputSchema ]),
  where: DayWhereUniqueInputSchema,
}).strict() ;

export const DayUpdateManyArgsSchema: z.ZodType<Prisma.DayUpdateManyArgs> = z.object({
  data: z.union([ DayUpdateManyMutationInputSchema,DayUncheckedUpdateManyInputSchema ]),
  where: DayWhereInputSchema.optional(),
}).strict() ;

export const DayDeleteManyArgsSchema: z.ZodType<Prisma.DayDeleteManyArgs> = z.object({
  where: DayWhereInputSchema.optional(),
}).strict() ;

export const EntryCreateArgsSchema: z.ZodType<Prisma.EntryCreateArgs> = z.object({
  select: EntrySelectSchema.optional(),
  include: EntryIncludeSchema.optional(),
  data: z.union([ EntryCreateInputSchema,EntryUncheckedCreateInputSchema ]),
}).strict() ;

export const EntryUpsertArgsSchema: z.ZodType<Prisma.EntryUpsertArgs> = z.object({
  select: EntrySelectSchema.optional(),
  include: EntryIncludeSchema.optional(),
  where: EntryWhereUniqueInputSchema,
  create: z.union([ EntryCreateInputSchema,EntryUncheckedCreateInputSchema ]),
  update: z.union([ EntryUpdateInputSchema,EntryUncheckedUpdateInputSchema ]),
}).strict() ;

export const EntryCreateManyArgsSchema: z.ZodType<Prisma.EntryCreateManyArgs> = z.object({
  data: z.union([ EntryCreateManyInputSchema,EntryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const EntryCreateManyAndReturnArgsSchema: z.ZodType<Prisma.EntryCreateManyAndReturnArgs> = z.object({
  data: z.union([ EntryCreateManyInputSchema,EntryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const EntryDeleteArgsSchema: z.ZodType<Prisma.EntryDeleteArgs> = z.object({
  select: EntrySelectSchema.optional(),
  include: EntryIncludeSchema.optional(),
  where: EntryWhereUniqueInputSchema,
}).strict() ;

export const EntryUpdateArgsSchema: z.ZodType<Prisma.EntryUpdateArgs> = z.object({
  select: EntrySelectSchema.optional(),
  include: EntryIncludeSchema.optional(),
  data: z.union([ EntryUpdateInputSchema,EntryUncheckedUpdateInputSchema ]),
  where: EntryWhereUniqueInputSchema,
}).strict() ;

export const EntryUpdateManyArgsSchema: z.ZodType<Prisma.EntryUpdateManyArgs> = z.object({
  data: z.union([ EntryUpdateManyMutationInputSchema,EntryUncheckedUpdateManyInputSchema ]),
  where: EntryWhereInputSchema.optional(),
}).strict() ;

export const EntryDeleteManyArgsSchema: z.ZodType<Prisma.EntryDeleteManyArgs> = z.object({
  where: EntryWhereInputSchema.optional(),
}).strict() ;

export const ActionCreateArgsSchema: z.ZodType<Prisma.ActionCreateArgs> = z.object({
  select: ActionSelectSchema.optional(),
  include: ActionIncludeSchema.optional(),
  data: z.union([ ActionCreateInputSchema,ActionUncheckedCreateInputSchema ]),
}).strict() ;

export const ActionUpsertArgsSchema: z.ZodType<Prisma.ActionUpsertArgs> = z.object({
  select: ActionSelectSchema.optional(),
  include: ActionIncludeSchema.optional(),
  where: ActionWhereUniqueInputSchema,
  create: z.union([ ActionCreateInputSchema,ActionUncheckedCreateInputSchema ]),
  update: z.union([ ActionUpdateInputSchema,ActionUncheckedUpdateInputSchema ]),
}).strict() ;

export const ActionCreateManyArgsSchema: z.ZodType<Prisma.ActionCreateManyArgs> = z.object({
  data: z.union([ ActionCreateManyInputSchema,ActionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ActionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ActionCreateManyAndReturnArgs> = z.object({
  data: z.union([ ActionCreateManyInputSchema,ActionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ActionDeleteArgsSchema: z.ZodType<Prisma.ActionDeleteArgs> = z.object({
  select: ActionSelectSchema.optional(),
  include: ActionIncludeSchema.optional(),
  where: ActionWhereUniqueInputSchema,
}).strict() ;

export const ActionUpdateArgsSchema: z.ZodType<Prisma.ActionUpdateArgs> = z.object({
  select: ActionSelectSchema.optional(),
  include: ActionIncludeSchema.optional(),
  data: z.union([ ActionUpdateInputSchema,ActionUncheckedUpdateInputSchema ]),
  where: ActionWhereUniqueInputSchema,
}).strict() ;

export const ActionUpdateManyArgsSchema: z.ZodType<Prisma.ActionUpdateManyArgs> = z.object({
  data: z.union([ ActionUpdateManyMutationInputSchema,ActionUncheckedUpdateManyInputSchema ]),
  where: ActionWhereInputSchema.optional(),
}).strict() ;

export const ActionDeleteManyArgsSchema: z.ZodType<Prisma.ActionDeleteManyArgs> = z.object({
  where: ActionWhereInputSchema.optional(),
}).strict() ;