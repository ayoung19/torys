"use client";

import { currentTimesheetId } from "@/utils/date";
import { hourStringToSecondsString, secondsToHourString } from "@/utils/time";
import { StringifyValues } from "@/utils/types";
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
  createEntry: (employeeId: string) => Promise<void>;
  updateEntry: (
    body: Pick<
      StringifyValues<Entry>,
      "entryId" | "timeInSeconds" | "timeOutSeconds" | "lunchSeconds"
    >,
  ) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  copyCrew: () => Promise<void>;
  updateDay: (body: Pick<StringifyValues<Day>, "description">) => Promise<void>;
  getConfirmations: () => Promise<void>;
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

  const getEmployeeById = useCallback(
    (employeeId: string) => employees.find((employee) => employee.employeeId === employeeId),
    [employees],
  );

  return (
    <Stack>
      <Breadcrumb mb="2">
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
                  onSubmit: async (data) => {
                    await createEntry(data.employeeId);

                    modals.closeAll();
                  },
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
            {entries
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
                      <Button
                        colorScheme="blue"
                        variant="link"
                        fontSize="lg"
                        onClick={() =>
                          modals.form({
                            title: "Edit Crew Member",
                            defaultValues: {
                              timeInSeconds: entry.timeInSeconds.toString(),
                              timeOutSeconds: entry.timeOutSeconds.toString(),
                              lunchSeconds: secondsToHourString(entry.lunchSeconds),
                            },
                            onSubmit: async (data) => {
                              // TODO: Notify conflicts.
                              await updateEntry({
                                entryId: entry.entryId,
                                ...data,
                                lunchSeconds: hourStringToSecondsString(data.lunchSeconds),
                              });

                              modals.closeAll();
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
                  <Stack align="end" spacing={0}>
                    <IconButton
                      aria-label="Delete entry"
                      colorScheme="red"
                      size="xs"
                      icon={<FiTrash />}
                      onClick={() => deleteEntry(entry.entryId)}
                    />
                  </Stack>
                </SimpleGrid>
              ))}
            <Stack px={4} py={3} spacing={3}>
              <Flex justify="space-between">
                <Button
                  colorScheme="blue"
                  onClick={() =>
                    modals.form({
                      title: "Set Crew Time",
                      defaultValues: {
                        timeInSeconds: "0",
                        timeOutSeconds: "0",
                        lunchSeconds: secondsToHourString(0),
                      },
                      onSubmit: async (data) => {
                        // TODO: Notify conflicts.
                        await Promise.allSettled(
                          entries.map((entry) =>
                            updateEntry({
                              entryId: entry.entryId,
                              ...data,
                              lunchSeconds: hourStringToSecondsString(data.lunchSeconds),
                            }),
                          ),
                        );

                        modals.closeAll();
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
                <Button colorScheme="orange" onClick={() => copyCrew()}>
                  Copy Crew
                </Button>
              </Flex>
              <Button colorScheme="purple" onClick={() => getConfirmations()}>
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
                  onSubmit: async (data) => {
                    await updateDay(data);

                    modals.closeAll();
                  },
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
            <Property alignItems="start" mb="4">
              <PropertyLabel p={0}>Description</PropertyLabel>
              <PropertyValue>{day.description}</PropertyValue>
            </Property>
            <Property>
              <PropertyLabel p={0}>Status</PropertyLabel>
              <PropertyValue>
                {/* TODO: Job completion status. */}
                <Badge colorScheme="orange">In Progress</Badge>
              </PropertyValue>
            </Property>
          </PropertyList>
        </CardBody>
      </Card>
    </Stack>
  );
};
