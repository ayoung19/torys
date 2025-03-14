"use client";

import { UpsertJobAction } from "@/utils/action";
import { centsToDollarString } from "@/utils/currency";
import { secondsToHourString } from "@/utils/time";
import { Badge } from "@chakra-ui/react";
import { Action, Prisma } from "@prisma/client";
import { Banner, LoadingOverlay, LoadingSpinner } from "@saas-ui/react";
import { useQuery } from "@tanstack/react-query";
import { ChangeList } from "../ChangeList";

interface Props {
  action: Action;
  actionJson: UpsertJobAction;
  findFirstAction: (args: Prisma.ActionFindFirstArgs) => Promise<Action | null>;
}

export const UpsertJobActionJson = ({ action, actionJson, findFirstAction }: Props) => {
  const previousActionQuery = useQuery({
    queryKey: [
      "action",
      {
        orderBy: {
          timestamp: "desc",
        },
        where: {
          timestamp: {
            lt: action.timestamp,
          },
          targetId: action.targetId,
          actionType: action.actionType,
        },
      },
    ],
    queryFn: () =>
      findFirstAction({
        orderBy: {
          timestamp: "desc",
        },
        where: {
          timestamp: {
            lt: action.timestamp,
          },
          targetId: action.targetId,
          actionType: action.actionType,
        },
      }),
    retry: 0,
  });

  if (previousActionQuery.isPending) {
    return (
      <LoadingOverlay>
        <LoadingSpinner />
      </LoadingOverlay>
    );
  }

  if (previousActionQuery.isError) {
    return <Banner status="error">{String(previousActionQuery.error)}</Banner>;
  }

  const previousActionJson =
    previousActionQuery.data && UpsertJobAction.parse(previousActionQuery.data.actionJson);

  return (
    <ChangeList
      oldObject={previousActionJson && previousActionJson.data}
      newObject={actionJson.data}
      fields={[
        {
          accessor: "isActive",
          label: "Status",
          render: (value) =>
            value ? (
              <Badge colorScheme="green">Active</Badge>
            ) : (
              <Badge colorScheme="red">Inactive</Badge>
            ),
        },
        {
          accessor: "oldJobId",
          label: "ID",
          render: (value) => value,
        },
        {
          accessor: "name",
          label: "Name",
          render: (value) => value,
        },
        {
          accessor: "budgetOriginalCents",
          label: "Original Budget",
          render: (value) => value && centsToDollarString(value),
        },
        {
          accessor: "budgetCurrentCents",
          label: "Current Budget",
          render: (value) => value && centsToDollarString(value),
        },
        {
          accessor: "originalLaborSeconds",
          label: "Original Man Hours",
          render: (value) => value && secondsToHourString(value),
        },
        {
          accessor: "currentLaborSeconds",
          label: "Current Man Hours",
          render: (value) => value && secondsToHourString(value),
        },
        {
          accessor: "jobType",
          label: "Job Type",
          render: (value) => value,
        },
      ]}
    />
  );
};
