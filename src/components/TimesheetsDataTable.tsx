"use client";

import { Box, Button, Card, CardFooter, Divider, Stack, Text } from "@chakra-ui/react";
import { usePagination } from "@mantine/hooks";
import { Timesheet } from "@prisma/client";
import { DataTable, Link, SearchInput } from "@saas-ui/react";
import {
  createColumnHelper,
  getFilteredRowModel,
  getPaginationRowModel,
  Table,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { Pagination } from "./Pagination";

const columnHelper = createColumnHelper<Timesheet>();

interface Props {
  timesheets: Timesheet[];
}

export const TimesheetsDataTable = ({ timesheets }: Props) => {
  const tableRef = useRef<Table<Timesheet>>(null);

  const [search, setSearch] = useState("");
  const [length, setLength] = useState(timesheets.length);

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
      cell: (props) => (
        <Link color="blue.500" fontWeight="semibold" href={`/timesheets/${props.getValue()}`}>
          {props.getValue()}
        </Link>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (props) => (
        <Stack direction="row" justify="flex-end">
          <Button
            onClick={() =>
              window.open(`/api/timesheets/${props.row.original.timesheetId}/by-employee`)
            }
          >
            Review By Employee
          </Button>
          <Button
            onClick={() => window.open(`/api/timesheets/${props.row.original.timesheetId}/by-job`)}
          >
            Review By Job
          </Button>
          <Button
            onClick={() => window.open(`/api/timesheets/${props.row.original.timesheetId}/epi`)}
          >
            Download EPI File
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
            All Timesheets
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="gray.400">
            {timesheets.length}
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
          data={timesheets}
          getPaginationRowModel={getPaginationRowModel()}
          getFilteredRowModel={getFilteredRowModel()}
          initialState={{
            sorting: [{ id: "timesheetId", desc: true }],
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
