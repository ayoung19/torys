"use client";

import { useActionResult } from "@/hooks/useActionResult";
import { secondsToHourString } from "@/utils/time";
import { ActionResult } from "@/utils/types";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { TZDate } from "@date-fns/tz";
import { Employee, Entry, Job, Timesheet } from "@prisma/client";
import { addDays, format, parse, startOfWeek } from "date-fns";
import { useCallback } from "react";
import { TimesheetsDataTable } from "./TimesheetsDataTable";

interface Props {
  deniedEntries: Entry[];
  timesheets: Timesheet[];
  employees: Employee[];
  jobs: Job[];
  approveAction: (jobId: string, dayId: string, entryId: string) => Promise<ActionResult>;
  denyAction: (jobId: string, dayId: string, entryId: string) => Promise<ActionResult>;
}

export const DashboardPage = ({
  deniedEntries,
  timesheets,
  employees,
  jobs,
  approveAction,
  denyAction,
}: Props) => {
  const actionResult = useActionResult();

  const getEmployeeById = useCallback(
    (employeeId: string) => employees.find((employee) => employee.employeeId === employeeId),
    [employees],
  );

  const getJobById = useCallback(
    (jobId: string) => jobs.find((job) => job.jobId === jobId),
    [jobs],
  );

  return (
    <Stack>
      {deniedEntries.length > 0 && (
        <Card mb="4">
          <CardHeader py={3}>
            <Flex justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="bold">
                Overtime Confirmations
              </Text>
            </Flex>
          </CardHeader>
          <CardBody p={0}>
            <Divider />
            <SimpleGrid columns={3} px={4} py={1} bgColor="gray.50">
              <Text fontSize="lg" fontWeight="bold">
                In
              </Text>
              <Text fontSize="lg" fontWeight="bold">
                Out
              </Text>
              <Text fontSize="lg" fontWeight="bold">
                Hours
              </Text>
            </SimpleGrid>
            <Divider />
            <Stack divider={<Divider />} spacing={0}>
              {deniedEntries
                .toSorted((a, b) => a.entryId.localeCompare(b.entryId))
                .toSorted((a, b) =>
                  (getEmployeeById(a.employeeId)?.name || "").localeCompare(
                    getEmployeeById(b.employeeId)?.name || "",
                  ),
                )
                .map((entry) => (
                  <Stack key={entry.entryId} spacing={0} p="4">
                    <Stack direction="row" align="start" justify="space-between">
                      <Text fontSize="lg" fontWeight="bold">
                        {
                          employees.find((employee) => employee.employeeId === entry.employeeId)
                            ?.name
                        }
                      </Text>
                      <Stack direction="row" justify="end" align="center">
                        <Button
                          size="xs"
                          colorScheme="green"
                          onClick={async () =>
                            actionResult(
                              await approveAction(
                                entry.jobId,
                                entry.dayId.toString(),
                                entry.entryId,
                              ),
                            )
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="xs"
                          colorScheme="red"
                          onClick={async () =>
                            actionResult(
                              await denyAction(entry.jobId, entry.dayId.toString(), entry.entryId),
                            )
                          }
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Stack>
                    <Text fontSize="lg" fontStyle="italic">
                      {getJobById(entry.jobId)?.name}
                      <> </>-<> </>
                      {format(
                        addDays(
                          startOfWeek(parse(entry.timesheetId, "yyyy-MM-dd", new Date())),
                          entry.dayId,
                        ),
                        "yyyy-MM-dd",
                      )}
                    </Text>
                    <SimpleGrid columns={3}>
                      <Text
                        fontSize="lg"
                        opacity={
                          entry.timeInSeconds === 0 && entry.timeOutSeconds === 0 ? 0 : undefined
                        }
                      >
                        {format(TZDate.tz("+00:00", entry.timeInSeconds * 1000), "hh:mmaaa")}
                      </Text>
                      <Text
                        fontSize="lg"
                        opacity={
                          entry.timeInSeconds === 0 && entry.timeOutSeconds === 0 ? 0 : undefined
                        }
                      >
                        {format(TZDate.tz("+00:00", entry.timeOutSeconds * 1000), "hh:mmaaa")}
                      </Text>
                      <Text
                        fontSize="lg"
                        opacity={
                          entry.timeInSeconds === 0 && entry.timeOutSeconds === 0 ? 0 : undefined
                        }
                      >
                        {secondsToHourString(
                          entry.timeOutSeconds - entry.timeInSeconds - entry.lunchSeconds,
                        )}
                      </Text>
                    </SimpleGrid>
                  </Stack>
                ))}
            </Stack>
          </CardBody>
        </Card>
      )}
      <TimesheetsDataTable timesheets={timesheets} />
    </Stack>
  );
};
