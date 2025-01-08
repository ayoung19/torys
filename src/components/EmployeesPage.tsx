"use client";

import { centsToDollarString, dollarStringToCentsString } from "@/utils/currency";
import { currentTimesheetId } from "@/utils/date";
import { StringifyValues } from "@/utils/types";
import { Badge, Button, Card, CardFooter, Divider, Heading, Stack } from "@chakra-ui/react";
import { usePagination } from "@mantine/hooks";
import { Employee } from "@prisma/client";
import { DataTable, FormLayout, FormRenderContext, useModals } from "@saas-ui/react";
import { createColumnHelper, getPaginationRowModel } from "@tanstack/react-table";
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
    <FormLayout columns={2}>
      <Field
        name="rateResidentialCentsPerHour"
        label="Residential"
        type="number"
        step={0.01}
        min={0}
      />
      <Field
        name="rateCommercialCentsPerHour"
        label="Commercial"
        type="number"
        step={0.01}
        min={0}
      />
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
    <Field name="rateDriveTimeCentsPerHour" label="Drive Time" type="number" step={0.01} min={0} />
  </FormLayout>
);

interface Props {
  employees: Employee[];
  upsertAction: (employee: StringifyValues<Employee>) => Promise<void>;
}

export const EmployeesPage = ({ employees, upsertAction }: Props) => {
  const pageSize = 10;
  const total = Math.ceil(employees.length / pageSize);

  const modals = useModals();
  const pagination = usePagination({
    total,
  });

  const formOnSubmit = async (data: StringifyValues<Employee>) => {
    await upsertAction({
      ...data,
      rateResidentialCentsPerHour: dollarStringToCentsString(data.rateResidentialCentsPerHour),
      rateCommercialCentsPerHour: dollarStringToCentsString(data.rateCommercialCentsPerHour),
      rateDavisBaconCentsPerHour: dollarStringToCentsString(data.rateDavisBaconCentsPerHour),
      rateDavisBaconOvertimeCentsPerHour: dollarStringToCentsString(
        data.rateDavisBaconOvertimeCentsPerHour,
      ),
      rateDriveTimeCentsPerHour: dollarStringToCentsString(data.rateDriveTimeCentsPerHour),
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
    columnHelper.accessor("displayId", {
      header: "ID",
    }),
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("phoneNumber", {
      header: "Phone Number",
    }),
    columnHelper.accessor("rateResidentialCentsPerHour", {
      header: "Residential",
      cell: (props) => centsToDollarString(props.getValue()),
    }),
    columnHelper.accessor("rateCommercialCentsPerHour", {
      header: "Commercial",
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
    columnHelper.accessor("rateDriveTimeCentsPerHour", {
      header: "Drive Time",
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
                  rateResidentialCentsPerHour: centsToDollarString(
                    props.row.original.rateResidentialCentsPerHour,
                  ),
                  rateCommercialCentsPerHour: centsToDollarString(
                    props.row.original.rateCommercialCentsPerHour,
                  ),
                  rateDavisBaconCentsPerHour: centsToDollarString(
                    props.row.original.rateDavisBaconCentsPerHour,
                  ),
                  rateDavisBaconOvertimeCentsPerHour: centsToDollarString(
                    props.row.original.rateDavisBaconOvertimeCentsPerHour,
                  ),
                  rateDriveTimeCentsPerHour: centsToDollarString(
                    props.row.original.rateDriveTimeCentsPerHour,
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
    <Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Heading size="md">Employees</Heading>
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
                rateResidentialCentsPerHour: centsToDollarString(0),
                rateCommercialCentsPerHour: centsToDollarString(0),
                rateDavisBaconCentsPerHour: centsToDollarString(0),
                rateDavisBaconOvertimeCentsPerHour: centsToDollarString(0),
                rateDriveTimeCentsPerHour: centsToDollarString(0),
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
          data={employees}
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
