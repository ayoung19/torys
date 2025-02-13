"use client";

import { useActionResult } from "@/hooks/useActionResult";
import { ActionResult, StringifyValues } from "@/utils/types";
import { Badge, Button, Card, CardFooter, Divider, Stack, Text } from "@chakra-ui/react";
import { usePagination } from "@mantine/hooks";
import { Account, AccountType } from "@prisma/client";
import { DataTable, FormLayout, FormRenderContext, SearchInput, useModals } from "@saas-ui/react";
import {
  createColumnHelper,
  getFilteredRowModel,
  getPaginationRowModel,
  Table,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { Pagination } from "./Pagination";

const columnHelper = createColumnHelper<Account>();

interface Props {
  actor: Account | null;
  accounts: Account[];
  accountIdToUsername: Record<string, string>;
  upsertAccountAction: (account: StringifyValues<Account>) => Promise<ActionResult>;
}

export const AccountsPage = ({
  // actor,
  accounts,
  accountIdToUsername,
  upsertAccountAction,
}: Props) => {
  const accountIds = accounts.map(({ accountId }) => accountId);

  const modals = useModals();
  const actionResult = useActionResult();

  const [search, setSearch] = useState("");
  const [length, setLength] = useState(accounts.length);

  const pageSize = 10;
  const total = Math.ceil(length / pageSize);
  const pagination = usePagination({
    total,
  });

  useEffect(() => {
    pagination.first();
  }, [length]);

  const tableRef = useRef<Table<Account>>(null);

  const formChildren = ({ Field, formState }: FormRenderContext<StringifyValues<Account>>) => (
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
        renderValue={
          formState.defaultValues?.accountId
            ? () => accountIdToUsername[formState.defaultValues?.accountId || ""]
            : undefined
        }
        label="Username"
        type="select"
        options={Object.entries(accountIdToUsername)
          .map(([accountId, username]) => ({
            label: username,
            value: accountId,
          }))
          .filter((option) => !accountIds.includes(option.value))}
        isReadOnly={!!formState.defaultValues?.accountId}
        isDisabled={!!formState.defaultValues?.accountId}
        isRequired={true}
        rules={{ required: true }}
      />
      <Field name="phoneNumber" label="Phone Number" type="text" />
      <Field
        name="accountType"
        label="Role"
        type="select"
        options={[
          { label: "Developer", value: AccountType.DEV },
          { label: "Admin", value: AccountType.ADMIN },
          { label: "Coordinator", value: AccountType.COORDINATOR },
          { label: "Foreman", value: AccountType.FOREMAN },
        ]}
        isRequired={true}
        rules={{ required: true }}
      />
    </FormLayout>
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
    columnHelper.accessor((row) => accountIdToUsername[row.accountId], {
      header: "Username",
    }),
    columnHelper.accessor("phoneNumber", {
      header: "Phone Number",
    }),
    columnHelper.accessor("accountType", {
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
                  accountType: props.row.original.accountType.toString(),
                },
                onSubmit: async (data) => actionResult(await upsertAccountAction(data)),
                children: formChildren,
              })
            }
            // TODO: Lock down views.
            // isDisabled={!canActorModifyAccount(actor, props.row.original)}
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
            All Accounts
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="gray.400">
            {accounts.length}
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
                title: "New Account",
                defaultValues: {
                  accountId: "",
                  isActive: "true",
                  phoneNumber: "",
                  accountType: "",
                },
                onSubmit: async (data) => actionResult(await upsertAccountAction(data)),
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
          data={accounts}
          getPaginationRowModel={getPaginationRowModel()}
          getFilteredRowModel={getFilteredRowModel()}
          initialState={{
            sorting: [{ id: "isActive", desc: true }],
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
