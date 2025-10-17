"use client";

import { currentTimesheetId } from "@/utils/date";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Card,
  CardBody,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useLocalStorage } from "@mantine/hooks";
import { Job, Timesheet } from "@prisma/client";
import { Link } from "@saas-ui/react";
import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";

interface Props {
  timesheet: Timesheet;
  jobs: Job[];
}

export const TimesheetJobsPage = ({ timesheet, jobs }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useLocalStorage({
    key: "timesheets-show-inactive-jobs",
    defaultValue: false,
  });

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        // Filter by active status
        if (!showInactive && !job.isActive) {
          return false;
        }
        // Filter by search query
        if (searchQuery && !job.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        return true;
      })
      .toSorted((a, b) => a.name.localeCompare(b.name));
  }, [jobs, showInactive, searchQuery]);

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

      <Flex gap={4} align="center" flexWrap="wrap">
        <InputGroup flex="1" minW="200px">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="white"
          />
        </InputGroup>

        <Flex align="center" gap={2}>
          <Switch
            id="show-inactive"
            isChecked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          <Text
            as="label"
            htmlFor="show-inactive"
            cursor="pointer"
            fontSize="sm"
            whiteSpace="nowrap"
          >
            Show inactive jobs
          </Text>
        </Flex>
      </Flex>

      {filteredJobs.length === 0 ? (
        <Card>
          <CardBody>
            <Text color="gray.500" textAlign="center">
              No jobs found
            </Text>
          </CardBody>
        </Card>
      ) : (
        filteredJobs.map((job) => (
          <Card key={job.jobId}>
            <CardBody>
              <Flex align="center" gap={2}>
                <Link
                  color="blue.500"
                  fontWeight="bold"
                  href={`/timesheets/${timesheet.timesheetId}/${job.jobId}`}
                  flex="1"
                >
                  {job.name}
                </Link>
                {!job.isActive && (
                  <Text fontSize="xs" color="gray.500" fontStyle="italic">
                    Inactive
                  </Text>
                )}
              </Flex>
            </CardBody>
          </Card>
        ))
      )}
    </Stack>
  );
};
