"use client";

import { useActionResult } from "@/hooks/useActionResult";
import { centsToDollarString, dollarStringToCentsString } from "@/utils/currency";
import { currentTimesheetId } from "@/utils/date";
import { ActionResult, StringifyValues } from "@/utils/types";
import { Badge, Button, Card, CardFooter, Divider, Stack, Text } from "@chakra-ui/react";
import { usePagination } from "@mantine/hooks";
import { Employee } from "@prisma/client";
import { DataTable, FormLayout, FormRenderContext, SearchInput, useModals } from "@saas-ui/react";
import {
  createColumnHelper,
  getFilteredRowModel,
  getPaginationRowModel,
  Table,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { Pagination } from "./Pagination";

const columnHelper = createColumnHelper<Employee>();

const formChildren = ({ Field }: FormRenderContext<StringifyValues<Employee>>) => (
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
    <Field name="displayId" label="ID" type="text" isRequired={true} rules={{ required: true }} />
    <Field name="name" label="Name" type="text" isRequired={true} rules={{ required: true }} />
    <Field name="phoneNumber" label="Phone Number" type="text" />
    <Field name="fringeCode" label="Fringe Code" type="text" />
    <Field name="ratePrivateCentsPerHour" label="Private" type="number" step={0.01} min={0} />
    <Field
      name="rateDavisBaconCentsPerHour"
      label="Davis Bacon"
      type="number"
      step={0.01}
      min={0}
    />
    <Field
      name="rateDavisBaconOvertimeCentsPerHour"
      label="Davis Bacon OT"
      type="number"
      step={0.01}
      min={0}
    />
  </FormLayout>
);

interface Props {
  employees: Employee[];
  upsertAction: (employee: StringifyValues<Employee>) => Promise<ActionResult>;
}

export const EmployeesPage = ({ employees, upsertAction }: Props) => {
  const modals = useModals();
  const actionResult = useActionResult();

  const [search, setSearch] = useState("");
  const [length, setLength] = useState(employees.length);

  const pageSize = 10;
  const total = Math.ceil(length / pageSize);
  const pagination = usePagination({
    total,
  });

  useEffect(() => {
    pagination.first();
  }, [length]);

  const tableRef = useRef<Table<Employee>>(null);

  const formOnSubmit = async (data: StringifyValues<Employee>) =>
    actionResult(
      await upsertAction({
        ...data,
        ratePrivateCentsPerHour: dollarStringToCentsString(data.ratePrivateCentsPerHour),
        rateDavisBaconCentsPerHour: dollarStringToCentsString(data.rateDavisBaconCentsPerHour),
        rateDavisBaconOvertimeCentsPerHour: dollarStringToCentsString(
          data.rateDavisBaconOvertimeCentsPerHour,
        ),
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
    columnHelper.accessor("displayId", {
      header: "ID",
    }),
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("phoneNumber", {
      header: "Phone Number",
    }),
    columnHelper.accessor("fringeCode", {
      header: "Fringe Code",
    }),
    columnHelper.accessor("ratePrivateCentsPerHour", {
      header: "Private",
      cell: (props) => centsToDollarString(props.getValue()),
    }),
    columnHelper.accessor("rateDavisBaconCentsPerHour", {
      header: "Davis Bacon",
      cell: (props) => centsToDollarString(props.getValue()),
    }),
    columnHelper.accessor("rateDavisBaconOvertimeCentsPerHour", {
      header: "Davis Bacon OT",
      cell: (props) => centsToDollarString(props.getValue()),
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
                title: "Edit Employee",
                defaultValues: {
                  timesheetId: props.row.original.timesheetId,
                  employeeId: props.row.original.employeeId,
                  isActive: props.row.original.isActive.toString(),
                  displayId: props.row.original.displayId,
                  name: props.row.original.name,
                  phoneNumber: props.row.original.phoneNumber,
                  fringeCode: props.row.original.fringeCode,
                  ratePrivateCentsPerHour: centsToDollarString(
                    props.row.original.ratePrivateCentsPerHour,
                  ),
                  rateDavisBaconCentsPerHour: centsToDollarString(
                    props.row.original.rateDavisBaconCentsPerHour,
                  ),
                  rateDavisBaconOvertimeCentsPerHour: centsToDollarString(
                    props.row.original.rateDavisBaconOvertimeCentsPerHour,
                  ),
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
            All Employees
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="gray.400">
            {employees.length}
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
                title: "New Employee",
                defaultValues: {
                  timesheetId: currentTimesheetId(),
                  employeeId: "",
                  isActive: "true",
                  displayId: "",
                  name: "",
                  phoneNumber: "",
                  fringeCode: "",
                  ratePrivateCentsPerHour: centsToDollarString(0),
                  rateDavisBaconCentsPerHour: centsToDollarString(0),
                  rateDavisBaconOvertimeCentsPerHour: centsToDollarString(0),
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
          data={employees}
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
