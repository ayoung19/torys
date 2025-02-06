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
import { Employee, Entry, Job } from "@prisma/client";
import { format } from "date-fns";
import { useCallback } from "react";

interface Props {
  deniedEntries: Entry[];
  employees: Employee[];
  jobs: Job[];
  approveAction: (jobId: string, dayId: string, entryId: string) => Promise<ActionResult>;
  denyAction: (jobId: string, dayId: string, entryId: string) => Promise<ActionResult>;
}

export const DashboardPage = ({
  deniedEntries,
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
        <Card>
          <CardHeader py={3}>
            <Flex justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="bold">
                Overtime Confirmations
              </Text>
            </Flex>
          </CardHeader>
          <CardBody p={0}>
            <Divider />
            <SimpleGrid columns={4} px={4} py={1} bgColor="gray.50">
              <Text fontSize="lg" fontWeight="bold">
                In
              </Text>
              <Text fontSize="lg" fontWeight="bold">
                Out
              </Text>
              <Text fontSize="lg" fontWeight="bold">
                Hours
              </Text>
              <Text fontSize="lg" fontWeight="bold"></Text>
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
                  <SimpleGrid key={entry.entryId} columns={4} p={4}>
                    <Stack justify="end" align="start" spacing={0}>
                      <Stack direction="row" align="center" spacing="2">
                        <Text fontSize="lg" fontWeight="bold">
                          {
                            employees.find((employee) => employee.employeeId === entry.employeeId)
                              ?.name
                          }
                        </Text>
                        <Text fontSize="lg" fontStyle="italic">
                          {getJobById(entry.jobId)?.name}
                        </Text>
                      </Stack>
                      <Text
                        fontSize="lg"
                        opacity={
                          entry.timeInSeconds === 0 && entry.timeOutSeconds === 0 ? 0 : undefined
                        }
                      >
                        {format(TZDate.tz("+00:00", entry.timeInSeconds * 1000), "hh:mmaaa")}
                      </Text>
                    </Stack>
                    <Stack justify="end" align="start" spacing={0}>
                      <Text
                        fontSize="lg"
                        opacity={
                          entry.timeInSeconds === 0 && entry.timeOutSeconds === 0 ? 0 : undefined
                        }
                      >
                        {format(TZDate.tz("+00:00", entry.timeOutSeconds * 1000), "hh:mmaaa")}
                      </Text>
                    </Stack>
                    <Stack justify="end" align="start" spacing={0}>
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
                    </Stack>
                    <Stack direction="row" justify="end" align="center">
                      <Button
                        colorScheme="green"
                        onClick={async () =>
                          actionResult(
                            await approveAction(entry.jobId, entry.dayId.toString(), entry.entryId),
                          )
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        colorScheme="red"
                        onClick={async () =>
                          actionResult(
                            await denyAction(entry.jobId, entry.dayId.toString(), entry.entryId),
                          )
                        }
                      >
                        Deny
                      </Button>
                    </Stack>
                  </SimpleGrid>
                ))}
            </Stack>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
};
