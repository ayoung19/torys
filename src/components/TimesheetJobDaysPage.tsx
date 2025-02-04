"use client";

import { currentTimesheetId } from "@/utils/date";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Card,
  CardBody,
  Stack,
} from "@chakra-ui/react";
import { Day, Job, Timesheet } from "@prisma/client";
import { Link } from "@saas-ui/react";
import { addDays, format, parse, startOfWeek } from "date-fns";

interface Props {
  timesheet: Timesheet;
  job: Job;
  days: Day[];
}

export const TimesheetJobDaysPage = ({ timesheet, job, days }: Props) => {
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

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href={`/timesheets/${timesheet.timesheetId}/${job.jobId}`}>
            {job.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      {days
        .toSorted((a, b) => a.dayId - b.dayId)
        .map((day) => (
          <Card key={day.dayId}>
            <CardBody>
              <Link
                color="blue.500"
                fontWeight="bold"
                href={`/timesheets/${timesheet.timesheetId}/${job.jobId}/${day.dayId}`}
              >
                {format(
                  addDays(
                    startOfWeek(parse(timesheet.timesheetId, "yyyy-MM-dd", new Date())),
                    day.dayId,
                  ),
                  "EEEE, MM/dd",
                )}
              </Link>
            </CardBody>
          </Card>
        ))}
    </Stack>
  );
};
