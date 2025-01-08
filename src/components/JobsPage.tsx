"use client";

import { centsToDollarString, dollarStringToCents } from "@/utils/currency";
import { currentTimesheetId } from "@/utils/date";
import { StringifyValues } from "@/utils/types";
import { Badge, Button, Card, CardFooter, Divider, Heading, Stack } from "@chakra-ui/react";
import { usePagination } from "@mantine/hooks";
import { Job, OvertimeType, RateType } from "@prisma/client";
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
      name="rateType"
      label="Payrate"
      type="select"
      options={[
        { label: "Residential", value: RateType.RESIDENTIAL },
        { label: "Commercial", value: RateType.COMMERCIAL },
        { label: "Davis Bacon", value: RateType.DAVIS_BACON },
        { label: "Drive Time", value: RateType.DRIVE_TIME },
      ]}
    />
    <Field
      name="overtimeType"
      label="OT Type"
      type="select"
      options={[
        { label: "Daily", value: OvertimeType.DAILY },
        { label: "Weekly", value: OvertimeType.WEEKLY },
      ]}
    />
  </FormLayout>
);

interface Props {
  jobs: Job[];
  upsertAction: (job: StringifyValues<Job>) => void;
}

export const JobsPage = ({ jobs, upsertAction }: Props) => {
  const pageSize = 10;
  const total = Math.ceil(jobs.length / pageSize);

  const modals = useModals();
  const pagination = usePagination({
    total,
  });

  const formOnSubmit = (data: StringifyValues<Job>) => {
    upsertAction({
      ...data,
      budgetOriginalCents: dollarStringToCents(data.budgetOriginalCents),
      budgetCurrentCents: dollarStringToCents(data.budgetCurrentCents),
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
    columnHelper.accessor("rateType", {
      header: "Payrate",
    }),
    columnHelper.accessor("overtimeType", {
      header: "OT Type",
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
                  rateType: props.row.original.rateType.toString(),
                  overtimeType: props.row.original.overtimeType.toString(),
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
                rateType: RateType.RESIDENTIAL.toString(),
                overtimeType: OvertimeType.DAILY.toString(),
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
            sorting: [{ id: "isActive", desc: true }],
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
