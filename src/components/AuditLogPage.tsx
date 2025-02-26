"use client";

import { selectedActionAtom } from "@/states/atoms";
import { ActionJson } from "@/utils/action";
import { Card, CardFooter, Divider, Grid, GridItem, Stack, Text } from "@chakra-ui/react";
import { usePagination } from "@mantine/hooks";
import { Action } from "@prisma/client";
import { DataTable } from "@saas-ui/react";
import {
  createColumnHelper,
  getFilteredRowModel,
  getPaginationRowModel,
  Table,
} from "@tanstack/react-table";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { Pagination } from "./Pagination";
import { ShowHideButton } from "./ShowHideButton";

const columnHelper = createColumnHelper<Action>();

interface Props {
  actions: Action[];
  accountIdToUsername: Record<string, string>;
}

export const AuditLogPage = ({ actions, accountIdToUsername }: Props) => {
  const [search] = useState("");
  const [length, setLength] = useState(actions.length);
  const selectedAction = useAtomValue(selectedActionAtom);
  const selectedActionJson = selectedAction && ActionJson.parse(selectedAction.actionJson);

  const pageSize = 10;
  const total = Math.ceil(length / pageSize);
  const pagination = usePagination({
    total,
  });

  useEffect(() => {
    pagination.first();
  }, [length]);

  const tableRef = useRef<Table<Action>>(null);
  const columns = [
    columnHelper.accessor("timestamp", {
      header: "Timestamp",
      cell: (props) =>
        props
          .getValue()
          .toLocaleString("en-US", { timeZone: "Pacific/Honolulu", timeZoneName: "short" }),
    }),
    columnHelper.accessor((row) => accountIdToUsername[row.actorId], {
      header: "Actor",
    }),
    // TODO: Create UI for this.
    // columnHelper.accessor("targetId", {
    //   header: "Target",
    // }),
    columnHelper.accessor("actionType", {
      header: "Action",
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (props) => (
        <Stack direction="row" justifyContent="flex-end">
          <ShowHideButton action={props.row.original} />
        </Stack>
      ),
    }),
  ];

  return (
    <Stack spacing="4">
      <Stack direction="row" justify="space-between" align="center">
        <Stack direction="row" align="center">
          <Text fontSize="xl" fontWeight="bold">
            Audit Log
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="gray.400">
            {actions.length}
          </Text>
        </Stack>
        <Stack direction="row" align="center">
          {/* TODO: Make search work. */}
          {/* <SearchInput
            placeholder="Search"
            size="sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onReset={() => setSearch("")}
          /> */}
        </Stack>
      </Stack>
      <Grid gridTemplateColumns="repeat(12, 1fr)" gap={8}>
        <GridItem colSpan={8}>
          <Card>
            <DataTable
              instanceRef={tableRef}
              columns={columns}
              data={actions}
              getPaginationRowModel={getPaginationRowModel()}
              getFilteredRowModel={getFilteredRowModel()}
              initialState={{
                sorting: [{ id: "timestamp", desc: true }],
              }}
              state={{
                pagination: {
                  pageIndex: pagination.active - 1,
                  pageSize,
                },
                globalFilter: search,
              }}
              onStateChange={() =>
                setLength(tableRef.current?.getFilteredRowModel().rows.length || 0)
              }
              isSortable={true}
            />
            <Divider />
            <CardFooter alignItems="center" justifyContent="flex-end">
              <Pagination pagination={pagination} />
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem colSpan={4}>
          <Card>
            {selectedActionJson ? (
              <Text as="pre">{JSON.stringify(selectedActionJson, null, 2)}</Text>
            ) : (
              <Text textAlign="center">No row selected.</Text>
            )}
          </Card>
        </GridItem>
      </Grid>
    </Stack>
  );
};
