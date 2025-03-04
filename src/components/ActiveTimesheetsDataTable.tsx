"use client";

import { Badge, Box, Card, CardFooter, Divider, Stack, Text } from "@chakra-ui/react";
import { usePagination } from "@mantine/hooks";
import { Prisma } from "@prisma/client";
import { DataTable, Link, SearchInput } from "@saas-ui/react";
import {
  createColumnHelper,
  getFilteredRowModel,
  getPaginationRowModel,
  Table,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { Pagination } from "./Pagination";

const columnHelper = createColumnHelper<
  Prisma.JobGetPayload<{
    include: {
      days: true;
    };
  }>
>();

interface Props {
  jobsWithDays: Prisma.JobGetPayload<{
    include: {
      days: true;
    };
  }>[];
  accountIdToUsername: Record<string, string>;
}

export const ActiveTimesheetsDataTable = ({ jobsWithDays, accountIdToUsername }: Props) => {
  const tableRef = useRef<
    Table<
      Prisma.JobGetPayload<{
        include: {
          days: true;
        };
      }>
    >
  >(null);

  const [search, setSearch] = useState("");
  const [length, setLength] = useState(jobsWithDays.length);

  const pageSize = 10;
  const total = Math.ceil(length / pageSize);
  const pagination = usePagination({
    total,
  });

  useEffect(() => {
    pagination.first();
  }, [length]);

  const columns = [
    columnHelper.accessor("timesheetId", {
      header: "Week End",
    }),
    columnHelper.accessor("name", {
      header: "Job Name",
      cell: (props) => (
        <Link
          color="blue.500"
          fontWeight="semibold"
          href={`/timesheets/${props.row.original.timesheetId}/${props.row.original.jobId}`}
        >
          {props.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("jobType", {
      header: "Job Type",
    }),
    columnHelper.accessor(
      (row) =>
        accountIdToUsername[
          row.days.toSorted((a, b) => a.dayId - b.dayId).findLast((day) => day.editorId)
            ?.editorId || ""
        ],
      {
        header: "Last Edited By",
      },
    ),
    columnHelper.accessor("isActive", {
      header: "Status",
      cell: (props) =>
        props.getValue() ? (
          <Badge colorScheme="orange">In Progress</Badge>
        ) : (
          <Badge colorScheme="green">Completed</Badge>
        ),
    }),
  ];

  return (
    <Stack spacing="4">
      <Stack direction="row" justify="space-between" align="center">
        <Stack direction="row" align="center">
          <Text fontSize="xl" fontWeight="bold">
            Active Timesheets
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="gray.400">
            {jobsWithDays.length}
          </Text>
        </Stack>
        <Box>
          <SearchInput
            placeholder="Search"
            size="sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onReset={() => setSearch("")}
          />
        </Box>
      </Stack>
      <Card>
        <DataTable
          instanceRef={tableRef}
          columns={columns}
          data={jobsWithDays}
          getPaginationRowModel={getPaginationRowModel()}
          getFilteredRowModel={getFilteredRowModel()}
          initialState={{
            sorting: [{ id: "name", desc: false }],
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
