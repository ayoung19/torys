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
import { Job, Timesheet } from "@prisma/client";
import { Link } from "@saas-ui/react";

interface Props {
  timesheet: Timesheet;
  jobs: Job[];
}

export const TimesheetJobsPage = ({ timesheet, jobs }: Props) => {
  return (
    <Stack>
      <Breadcrumb mb="2" flexWrap="wrap">
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink
            href={
              timesheet.timesheetId === currentTimesheetId()
                ? "/timesheets"
                : `/timesheets/${timesheet.timesheetId}`
            }
          >
            All Timesheets
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      {jobs
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .map((job) => (
          <Card key={job.jobId}>
            <CardBody>
              <Link
                color="blue.500"
                fontWeight="bold"
                href={`/timesheets/${timesheet.timesheetId}/${job.jobId}`}
              >
                {job.name}
              </Link>
            </CardBody>
          </Card>
        ))}
    </Stack>
  );
};
