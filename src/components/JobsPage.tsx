"use client";

import { centsToDollarString, dollarStringToCentsString } from "@/utils/currency";
import { currentTimesheetId } from "@/utils/date";
import { StringifyValues } from "@/utils/types";
import { Badge, Button, Card, CardFooter, Divider, Heading, Stack } from "@chakra-ui/react";
import { usePagination } from "@mantine/hooks";
import { Job, JobType } from "@prisma/client";
import { DataTable, FormLayout, FormRenderContext, useModals } from "@saas-ui/react";
import { createColumnHelper, getPaginationRowModel } from "@tanstack/react-table";
import { Pagination } from "./Pagination";

const columnHelper = createColumnHelper<Job>();

const formChildren = ({ Field }: FormRenderContext<StringifyValues<Job>>) => (
  <FormLayout>
    <Field
      name="isActive"
      label="Active"
      type="select"
      options={[
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ]}
    />
    <Field name="name" label="Name" type="text" isRequired={true} rules={{ required: true }} />
    <FormLayout columns={2}>
      <Field name="budgetOriginalCents" label="Original Budget" type="number" step={0.01} />
      <Field name="budgetCurrentCents" label="Current Budget" type="number" step={0.01} />
    </FormLayout>
    <Field
      name="jobType"
      label="Job Type"
      type="select"
      options={[
        { label: "Private", value: JobType.PRIVATE },
        { label: "State", value: JobType.STATE },
        { label: "Federal", value: JobType.FEDERAL },
      ]}
    />
  </FormLayout>
);

interface Props {
  jobs: Job[];
  upsertAction: (job: StringifyValues<Job>) => Promise<void>;
}

export const JobsPage = ({ jobs, upsertAction }: Props) => {
  const pageSize = 10;
  const total = Math.ceil(jobs.length / pageSize);

  const modals = useModals();
  const pagination = usePagination({
    total,
  });

  const formOnSubmit = async (data: StringifyValues<Job>) => {
    await upsertAction({
      ...data,
      budgetOriginalCents: dollarStringToCentsString(data.budgetOriginalCents),
      budgetCurrentCents: dollarStringToCentsString(data.budgetCurrentCents),
    });

    modals.closeAll();
  };

  const columns = [
    columnHelper.accessor("isActive", {
      header: "Status",
      cell: (props) =>
        props.getValue() ? (
          <Badge colorScheme="green">Active</Badge>
        ) : (
          <Badge colorScheme="red">Inactive</Badge>
        ),
    }),
    columnHelper.accessor("name", {
      header: "Name",
    }),
    // TODO: Allow setting field to null.
    columnHelper.accessor("budgetOriginalCents", {
      header: "Original Budget",
      cell: (props) => {
        const value = props.getValue();

        return value && centsToDollarString(value);
      },
    }),
    columnHelper.accessor("budgetCurrentCents", {
      header: "Current Budget",
      cell: (props) => {
        const value = props.getValue();

        return value && centsToDollarString(value);
      },
    }),
    columnHelper.accessor("jobType", {
      header: "Job Type",
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (props) => (
        <Stack direction="row" justifyContent="flex-end">
          <Button
            onClick={() =>
              modals.form({
                title: "Edit Job",
                defaultValues: {
                  timesheetId: props.row.original.timesheetId,
                  jobId: props.row.original.jobId,
                  isActive: props.row.original.isActive.toString(),
                  name: props.row.original.name,
                  budgetOriginalCents: centsToDollarString(
                    props.row.original.budgetOriginalCents || 0,
                  ),
                  budgetCurrentCents: centsToDollarString(
                    props.row.original.budgetCurrentCents || 0,
                  ),
                  jobType: props.row.original.jobType.toString(),
                },
                onSubmit: formOnSubmit,
                children: formChildren,
              })
            }
          >
            Edit
          </Button>
        </Stack>
      ),
    }),
  ];

  return (
    <Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Heading size="md">Jobs</Heading>
        <Button
          onClick={() =>
            modals.form({
              title: "New Job",
              defaultValues: {
                timesheetId: currentTimesheetId(),
                jobId: "",
                isActive: "true",
                name: "",
                budgetOriginalCents: centsToDollarString(0),
                budgetCurrentCents: centsToDollarString(0),
                jobType: JobType.PRIVATE.toString(),
              },
              onSubmit: formOnSubmit,
              children: formChildren,
            })
          }
        >
          New
        </Button>
      </Stack>
      <Card>
        <DataTable
          columns={columns}
          data={jobs}
          getPaginationRowModel={getPaginationRowModel()}
          initialState={{
            sorting: [
              { id: "isActive", desc: true },
              { id: "name", desc: false },
            ],
          }}
          state={{
            pagination: {
              pageIndex: pagination.active - 1,
              pageSize,
            },
          }}
          isSortable={true}
        />
        <Divider />
        <CardFooter alignItems="center" justifyContent="flex-end">
          <Pagination pagination={pagination} />
        </CardFooter>
      </Card>
    </Stack>
  );
};
