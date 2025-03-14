"use client";

import { selectedActionAtom } from "@/states/atoms";
import { ActionJson } from "@/utils/action";
import { Badge, Card, CardFooter, Divider, Grid, GridItem, Stack, Text } from "@chakra-ui/react";
import { usePagination } from "@mantine/hooks";
import { Action, Employee, Entry, Job, Prisma } from "@prisma/client";
import { DataTable } from "@saas-ui/react";
import {
  createColumnHelper,
  getFilteredRowModel,
  getPaginationRowModel,
  Table,
} from "@tanstack/react-table";
import { addDays, format, parse, startOfWeek } from "date-fns";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { match } from "ts-pattern";
import { DayDayPrimaryKeyCompoundUniqueInputSchema } from "../../prisma/generated/zod";
import { UpdateDayActionJson } from "./action/UpdateDayActionJson";
import { UpsertAccountActionJson } from "./action/UpsertAccountActionJson";
import { UpsertEmployeeActionJson } from "./action/UpsertEmployeeActionJson";
import { UpsertJobActionJson } from "./action/UpsertJobActionJson";
import { Pagination } from "./Pagination";
import { ShowHideButton } from "./ShowHideButton";

const columnHelper = createColumnHelper<Action>();

interface Props {
  actions: Action[];
  employees: Employee[];
  jobs: Job[];
  entries: Entry[];
  accountIdToUsername: Record<string, string>;
  findFirstAction: (args: Prisma.ActionFindFirstArgs) => Promise<Action | null>;
}

export const AuditLogPage = ({
  actions,
  employees,
  jobs,
  accountIdToUsername,
  findFirstAction,
}: Props) => {
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
    columnHelper.accessor("actionType", {
      header: "Action",
    }),
    columnHelper.accessor("targetId", {
      header: "Target",
      cell: (props) =>
        match(props.row.original.actionType)
          .with("upsert-account", () => accountIdToUsername[props.getValue()])
          .with(
            "upsert-employee",
            () => employees.find((employee) => employee.employeeId == props.getValue())?.name,
          )
          .with("upsert-job", () => jobs.find((job) => job.jobId == props.getValue())?.name)
          .with("update-day", () => {
            const dayPrimaryKey = DayDayPrimaryKeyCompoundUniqueInputSchema.parse(
              JSON.parse(props.getValue()),
            );

            return `${jobs.find((job) => job.jobId === dayPrimaryKey.jobId)?.name} - ${format(
              addDays(
                startOfWeek(parse(dayPrimaryKey.timesheetId, "yyyy-MM-dd", new Date())),
                dayPrimaryKey.dayId,
              ),
              "EEEE, MM/dd",
            )}`;
          })
          .otherwise(() => <Badge>Unknown</Badge>),
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
          <Card p="4">
            {selectedActionJson ? (
              match(selectedActionJson)
                .with({ type: "upsert-account" }, (actionJson) => (
                  <UpsertAccountActionJson
                    action={selectedAction}
                    actionJson={actionJson}
                    findFirstAction={findFirstAction}
                  />
                ))
                .with({ type: "upsert-employee" }, (actionJson) => (
                  <UpsertEmployeeActionJson
                    action={selectedAction}
                    actionJson={actionJson}
                    findFirstAction={findFirstAction}
                  />
                ))
                .with({ type: "upsert-job" }, (actionJson) => (
                  <UpsertJobActionJson
                    action={selectedAction}
                    actionJson={actionJson}
                    findFirstAction={findFirstAction}
                  />
                ))
                .with({ type: "update-day" }, (actionJson) => (
                  <UpdateDayActionJson
                    action={selectedAction}
                    actionJson={actionJson}
                    findFirstAction={findFirstAction}
                  />
                ))
                .exhaustive()
            ) : (
              <Text fontSize="md" textAlign="center">
                No row selected.
              </Text>
            )}
          </Card>
        </GridItem>
      </Grid>
    </Stack>
  );
};
