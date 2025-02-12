"use client";

import { useActionResult } from "@/hooks/useActionResult";
import { currentTimesheetId } from "@/utils/date";
import {
  DEFAULT_TIME_IN_SECONDS,
  DEFAULT_TIME_OUT_SECONDS,
  hourStringToSecondsString,
  secondsToHourString,
} from "@/utils/time";
import { ActionResult, StringifyValues } from "@/utils/types";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  IconButton,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { TZDate } from "@date-fns/tz";
import { Day, Employee, Entry, EntryConfirmationStatus, Job, Timesheet } from "@prisma/client";
import {
  Controller,
  FormLayout,
  Link,
  Property,
  PropertyLabel,
  PropertyList,
  PropertyValue,
  useModals,
} from "@saas-ui/react";
import { addDays, format, parse, startOfWeek } from "date-fns";
import { useCallback } from "react";
import { FiTrash } from "react-icons/fi";
import { match } from "ts-pattern";
import { TimeInput } from "./TimeInput";

interface Props {
  timesheet: Timesheet;
  job: Job;
  day: Day;
  entries: Entry[];
  employees: Employee[];
  editorUsername: string | null;
  createEntry: (employeeId: string) => Promise<ActionResult>;
  updateEntry: (
    body: Pick<
      StringifyValues<Entry>,
      "entryId" | "timeInSeconds" | "timeOutSeconds" | "lunchSeconds"
    >,
  ) => Promise<ActionResult>;
  deleteEntry: (entryId: string) => Promise<ActionResult>;
  copyCrew: () => Promise<ActionResult>;
  updateDay: (body: Pick<StringifyValues<Day>, "description">) => Promise<ActionResult>;
  getConfirmations: () => Promise<ActionResult>;
}

export const TimesheetJobDayPage = ({
  timesheet,
  job,
  day,
  entries,
  employees,
  editorUsername,
  createEntry,
  updateEntry,
  deleteEntry,
  copyCrew,
  updateDay,
  getConfirmations,
}: Props) => {
  const modals = useModals();
  const actionResult = useActionResult();

  const getEmployeeById = useCallback(
    (employeeId: string) => employees.find((employee) => employee.employeeId === employeeId),
    [employees],
  );

  return (
    <Stack>
      <Breadcrumb mb="2" flexWrap="wrap">
        <BreadcrumbItem>
          <BreadcrumbLink
            as={Link}
            color="blue.500"
            href={
              timesheet.timesheetId === currentTimesheetId()
                ? "/timesheets"
                : `/timesheets/${timesheet.timesheetId}`
            }
          >
            All Timesheets
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink
            as={Link}
            color="blue.500"
            href={`/timesheets/${timesheet.timesheetId}/${job.jobId}`}
          >
            {job.name}
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href={`/timesheets/${timesheet.timesheetId}/${job.jobId}/${day.dayId}`}>
            {format(
              addDays(
                startOfWeek(parse(timesheet.timesheetId, "yyyy-MM-dd", new Date())),
                day.dayId,
              ),
              "EEEE, MM/dd",
            )}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      {editorUsername !== null && (
        <Alert status="info">
          <AlertIcon />
          <AlertDescription>
            <b>{editorUsername}</b> has made changes to this timesheet.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader py={3}>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="bold">
              Crew
            </Text>
            <Button
              colorScheme="green"
              onClick={() =>
                modals.form({
                  title: "Add Crew Member",
                  defaultValues: {
                    employeeId: "",
                  },
                  onSubmit: async (data) => actionResult(await createEntry(data.employeeId)),
                  children: ({ Field }) => (
                    <FormLayout>
                      <Field
                        name="employeeId"
                        label="Employee"
                        type="select"
                        options={[{ label: "- Select Crew Member -", value: "" }].concat(
                          employees
                            .filter((employee) => employee.isActive)
                            .toSorted((a, b) => a.name.localeCompare(b.name))
                            .map((employee) => ({
                              label: employee.name,
                              value: employee.employeeId,
                            })),
                        )}
                      />
                    </FormLayout>
                  ),
                })
              }
            >
              Add
            </Button>
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
            {entries
              .toSorted((a, b) => a.entryId.localeCompare(b.entryId))
              .toSorted((a, b) =>
                (getEmployeeById(a.employeeId)?.name || "").localeCompare(
                  getEmployeeById(b.employeeId)?.name || "",
                ),
              )
              .map((entry) => (
                <Stack key={entry.entryId} spacing={0} p="4">
                  <Stack direction="row" align="start" justify="space-between">
                    <Stack direction="row" align="center" spacing="2">
                      <Button
                        colorScheme="blue"
                        variant="link"
                        fontSize="lg"
                        onClick={() =>
                          modals.form({
                            title: "Edit Crew Member",
                            defaultValues: {
                              timeInSeconds: (entry.timeInSeconds === 0 &&
                              entry.timeOutSeconds === 0
                                ? DEFAULT_TIME_IN_SECONDS
                                : entry.timeInSeconds
                              ).toString(),
                              timeOutSeconds: (entry.timeInSeconds === 0 &&
                              entry.timeOutSeconds === 0
                                ? DEFAULT_TIME_OUT_SECONDS
                                : entry.timeOutSeconds
                              ).toString(),
                              lunchSeconds: secondsToHourString(entry.lunchSeconds),
                            },
                            onSubmit: async (data) =>
                              actionResult(
                                await updateEntry({
                                  entryId: entry.entryId,
                                  ...data,
                                  lunchSeconds: hourStringToSecondsString(data.lunchSeconds),
                                }),
                              ),
                            children: ({ Field, control }) => (
                              <FormLayout>
                                <Controller
                                  name="timeInSeconds"
                                  control={control}
                                  render={({ field }) => (
                                    <TimeInput
                                      label="Time In"
                                      value={field.value}
                                      onChange={field.onChange}
                                    />
                                  )}
                                />
                                <Controller
                                  name="timeOutSeconds"
                                  control={control}
                                  render={({ field }) => (
                                    <TimeInput
                                      label="Time Out"
                                      value={field.value}
                                      onChange={field.onChange}
                                    />
                                  )}
                                />
                                <Field
                                  name="lunchSeconds"
                                  label="Lunch Hours"
                                  type="number"
                                  step={0.5}
                                  min={0}
                                />
                              </FormLayout>
                            ),
                          })
                        }
                      >
                        {
                          employees.find((employee) => employee.employeeId === entry.employeeId)
                            ?.name
                        }
                      </Button>
                      {match(entry.entryConfirmationStatus)
                        .with(EntryConfirmationStatus.UNINITIALIZED, () => <Badge>Not Sent</Badge>)
                        .with(EntryConfirmationStatus.AWAITING, () => (
                          <Badge colorScheme="orange">Awaiting Confirmation</Badge>
                        ))
                        .with(EntryConfirmationStatus.CONFIRMED, () => (
                          <Badge colorScheme="green">Confirmed</Badge>
                        ))
                        .exhaustive()}
                      {/* TODO: Add badge for approval status. */}
                    </Stack>
                    <Stack direction="row" justify="end" align="center">
                      <IconButton
                        aria-label="Delete entry"
                        colorScheme="red"
                        size="xs"
                        icon={<FiTrash />}
                        onClick={async () => actionResult(await deleteEntry(entry.entryId))}
                      />
                    </Stack>
                  </Stack>
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
            <Stack px={4} py={3} spacing={3}>
              <Flex justify="space-between">
                <Button
                  colorScheme="blue"
                  onClick={() =>
                    modals.form({
                      title: "Set Crew Time",
                      defaultValues: {
                        timeInSeconds: DEFAULT_TIME_IN_SECONDS.toString(),
                        timeOutSeconds: DEFAULT_TIME_OUT_SECONDS.toString(),
                        lunchSeconds: secondsToHourString(0),
                      },
                      onSubmit: async (data) => {
                        const results = await Promise.all(
                          entries.map((entry) =>
                            updateEntry({
                              entryId: entry.entryId,
                              ...data,
                              lunchSeconds: hourStringToSecondsString(data.lunchSeconds),
                            }),
                          ),
                        );

                        results.forEach((result) => actionResult(result));
                      },
                      children: ({ Field, control }) => (
                        <FormLayout>
                          <Controller
                            name="timeInSeconds"
                            control={control}
                            render={({ field }) => (
                              <TimeInput
                                label="Time In"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                          <Controller
                            name="timeOutSeconds"
                            control={control}
                            render={({ field }) => (
                              <TimeInput
                                label="Time Out"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                          <Field
                            name="lunchSeconds"
                            label="Lunch Hours"
                            type="number"
                            step={0.5}
                            min={0}
                          />
                        </FormLayout>
                      ),
                    })
                  }
                >
                  Set All
                </Button>
                <Button colorScheme="orange" onClick={async () => actionResult(await copyCrew())}>
                  Copy Crew
                </Button>
              </Flex>
              <Button
                colorScheme="purple"
                onClick={async () => actionResult(await getConfirmations())}
              >
                Get Confirmations
              </Button>
            </Stack>
          </Stack>
        </CardBody>
      </Card>
      <Card>
        <CardHeader py={3}>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="bold">
              Details
            </Text>
            <Button
              onClick={() =>
                modals.form({
                  title: "Edit Details",
                  defaultValues: {
                    description: day.description,
                  },
                  onSubmit: async (data) => actionResult(await updateDay(data)),
                  children: ({ Field }) => (
                    <FormLayout>
                      <Field name="description" label="Description" type="textarea" />
                    </FormLayout>
                  ),
                })
              }
            >
              Edit
            </Button>
          </Flex>
        </CardHeader>
        <Divider />
        <CardBody>
          <PropertyList>
            <Property alignItems="start">
              <PropertyLabel p={0}>Description</PropertyLabel>
              <PropertyValue>{day.description}</PropertyValue>
            </Property>
            {/* TODO: Job completion status. */}
            {/* <Property>
              <PropertyLabel p={0}>Status</PropertyLabel>
              <PropertyValue>
                <Badge colorScheme="orange">In Progress</Badge>
              </PropertyValue>
            </Property> */}
          </PropertyList>
        </CardBody>
      </Card>
    </Stack>
  );
};
