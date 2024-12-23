"use client";

import { canActorModifyAccount } from "@/utils/account";
import { StringifyValues } from "@/utils/types";
import { Badge, Button, Card, CardFooter, Divider, Heading, Stack } from "@chakra-ui/react";
import { usePagination } from "@mantine/hooks";
import { Account } from "@prisma/client";
import { DataTable, FormLayout, useModals } from "@saas-ui/react";
import { createColumnHelper, getPaginationRowModel } from "@tanstack/react-table";
import { Pagination } from "./Pagination";

const columnHelper = createColumnHelper<Account>();

interface Props {
  actor: Account;
  accounts: Account[];
  accountIdToUsername: Record<string, string>;
  upsertAccountAction: (account: StringifyValues<Account>) => void;
}

export const AccountsPage = ({
  actor,
  accounts,
  accountIdToUsername,
  upsertAccountAction,
}: Props) => {
  const accountIds = accounts.map(({ accountId }) => accountId);

  const pageSize = 10;
  const total = Math.ceil(accounts.length / pageSize);

  const modals = useModals();
  const pagination = usePagination({
    total,
  });

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
    columnHelper.accessor((row) => accountIdToUsername[row.accountId], {
      header: "Username",
    }),
    columnHelper.accessor("phoneNumber", {
      header: "Phone Number",
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (props) => props.getValue(),
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
                title: "Edit Account",
                defaultValues: {
                  accountId: props.row.original.accountId,
                  isActive: props.row.original.isActive.toString(),
                  phoneNumber: props.row.original.phoneNumber,
                  role: props.row.original.role,
                },
                onSubmit: (data) => {
                  upsertAccountAction(data);
                  modals.closeAll();
                },
                children: ({ Field, watch }) => (
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
                    <Field
                      name="accountId"
                      renderValue={() => accountIdToUsername[watch("accountId")]}
                      label="Username"
                      type="select"
                      options={Object.entries(accountIdToUsername)
                        .map(([accountId, username]) => ({
                          label: username,
                          value: accountId,
                        }))
                        .filter((option) => !accountIds.includes(option.value))}
                      isReadOnly={true}
                      isDisabled={true}
                    />
                    <Field name="phoneNumber" label="Phone Number" type="text" />
                    <Field
                      name="role"
                      label="Role"
                      type="select"
                      options={[
                        { label: "Developer", value: "dev" },
                        { label: "Admin", value: "admin" },
                        { label: "Coordinator", value: "coordinator" },
                        { label: "Foreman", value: "foreman" },
                      ]}
                      isRequired={true}
                      rules={{ required: true }}
                    />
                  </FormLayout>
                ),
              })
            }
            isDisabled={!canActorModifyAccount(actor, props.row.original)}
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
        <Heading size="md">Accounts</Heading>
        <Button
          onClick={() =>
            modals.form({
              title: "New Account",
              defaultValues: {
                accountId: "",
                isActive: "true",
                phoneNumber: "",
                role: "",
              },
              onSubmit: (data) => {
                upsertAccountAction(data), modals.closeAll();
              },
              children: ({ Field }) => (
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
                  <Field
                    name="accountId"
                    label="Username"
                    type="select"
                    options={Object.entries(accountIdToUsername)
                      .map(([accountId, username]) => ({
                        label: username,
                        value: accountId,
                      }))
                      .filter((option) => !accountIds.includes(option.value))}
                    isRequired={true}
                    rules={{ required: true }}
                  />
                  <Field name="phoneNumber" label="Phone Number" type="text" />
                  <Field
                    name="role"
                    label="Role"
                    type="select"
                    options={[
                      { label: "Developer", value: "dev" },
                      { label: "Admin", value: "admin" },
                      { label: "Coordinator", value: "coordinator" },
                      { label: "Foreman", value: "foreman" },
                    ]}
                    isRequired={true}
                    rules={{ required: true }}
                  />
                </FormLayout>
              ),
            })
          }
        >
          New
        </Button>
      </Stack>
      <Card>
        <DataTable
          columns={columns}
          data={accounts}
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
