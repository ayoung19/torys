"use client";

import { useActionResult } from "@/hooks/useActionResult";
import { centsToDollarString, dollarStringToCentsString } from "@/utils/currency";
import { currentTimesheetId } from "@/utils/date";
import { ActionResult, Nullable, StringifyValues } from "@/utils/types";
import {
  Badge,
  Button,
  Card,
  CardFooter,
  Divider,
  FormControl,
  FormLabel,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import { usePagination } from "@mantine/hooks";
import { Job, JobType } from "@prisma/client";
import { DataTable, FormLayout, FormRenderContext, SearchInput, useModals } from "@saas-ui/react";
import {
  createColumnHelper,
  getFilteredRowModel,
  getPaginationRowModel,
  Table,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { Pagination } from "./Pagination";

const columnHelper = createColumnHelper<Job>();

const formChildren = ({ Field, watch, setValue }: FormRenderContext<StringifyValues<Job>>) => (
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
      <Stack>
        <FormControl display="flex" alignItems="center" justifyContent="space-between">
          <FormLabel margin={0}>Original Budget</FormLabel>
          <Switch
            isChecked={watch("budgetOriginalCents") !== "\n"}
            onChange={(e) =>
              e.target.checked
                ? setValue("budgetOriginalCents", "0.00")
                : setValue("budgetOriginalCents", "\n")
            }
          />
        </FormControl>
        <Field
          name="budgetOriginalCents"
          type="number"
          step={0.01}
          isDisabled={watch("budgetOriginalCents") === "\n"}
        />
      </Stack>
      <Stack>
        <FormControl display="flex" alignItems="center" justifyContent="space-between">
          <FormLabel margin={0}>Current Budget</FormLabel>
          <Switch
            isChecked={watch("budgetCurrentCents") !== "\n"}
            onChange={(e) =>
              e.target.checked
                ? setValue("budgetCurrentCents", "0.00")
                : setValue("budgetCurrentCents", "\n")
            }
          />
        </FormControl>
        <Field
          name="budgetCurrentCents"
          type="number"
          step={0.01}
          isDisabled={watch("budgetCurrentCents") === "\n"}
        />
      </Stack>
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
  upsertAction: (
    job: Nullable<StringifyValues<Job>, "budgetOriginalCents" | "budgetCurrentCents">,
  ) => Promise<ActionResult>;
}

export const JobsPage = ({ jobs, upsertAction }: Props) => {
  const modals = useModals();
  const actionResult = useActionResult();

  const [search, setSearch] = useState("");
  const [length, setLength] = useState(jobs.length);

  const pageSize = 10;
  const total = Math.ceil(length / pageSize);
  const pagination = usePagination({
    total,
  });

  useEffect(() => {
    pagination.first();
  }, [length]);

  const tableRef = useRef<Table<Job>>(null);

  const formOnSubmit = async (data: StringifyValues<Job>) =>
    actionResult(
      await upsertAction({
        ...data,
        budgetOriginalCents:
          data.budgetOriginalCents === "\n"
            ? null
            : dollarStringToCentsString(data.budgetOriginalCents),
        budgetCurrentCents:
          data.budgetCurrentCents === "\n"
            ? null
            : dollarStringToCentsString(data.budgetCurrentCents),
      }),
    );

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
    columnHelper.accessor("oldJobId", {
      header: "ID",
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
                  budgetOriginalCents:
                    props.row.original.budgetOriginalCents === null
                      ? "\n"
                      : centsToDollarString(props.row.original.budgetOriginalCents),
                  budgetCurrentCents:
                    props.row.original.budgetCurrentCents === null
                      ? "\n"
                      : centsToDollarString(props.row.original.budgetCurrentCents),
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
    <Stack spacing="4">
      <Stack direction="row" justify="space-between" align="center">
        <Stack direction="row" align="center">
          <Text fontSize="xl" fontWeight="bold">
            All Jobs
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="gray.400">
            {jobs.length}
          </Text>
        </Stack>
        <Stack direction="row" align="center">
          <SearchInput
            placeholder="Search"
            size="sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onReset={() => setSearch("")}
          />
          <Button
            onClick={() =>
              modals.form({
                title: "New Job",
                defaultValues: {
                  timesheetId: currentTimesheetId(),
                  jobId: "",
                  isActive: "true",
                  name: "",
                  budgetOriginalCents: "\n",
                  budgetCurrentCents: "\n",
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
      </Stack>
      <Card>
        <DataTable
          instanceRef={tableRef}
          columns={columns}
          data={jobs}
          getPaginationRowModel={getPaginationRowModel()}
          getFilteredRowModel={getFilteredRowModel()}
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
            globalFilter: search,
          }}
          onStateChange={() => setLength(tableRef.current?.getFilteredRowModel().rows.length || 0)}
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
