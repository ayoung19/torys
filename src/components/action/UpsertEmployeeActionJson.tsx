"use client";

import { UpsertEmployeeAction } from "@/utils/action";
import { centsToDollarString } from "@/utils/currency";
import { Badge } from "@chakra-ui/react";
import { Action, Prisma } from "@prisma/client";
import { Banner, LoadingOverlay, LoadingSpinner } from "@saas-ui/react";
import { useQuery } from "@tanstack/react-query";
import { ChangeList } from "../ChangeList";

interface Props {
  action: Action;
  actionJson: UpsertEmployeeAction;
  findFirstAction: (args: Prisma.ActionFindFirstArgs) => Promise<Action | null>;
}

export const UpsertEmployeeActionJson = ({ action, actionJson, findFirstAction }: Props) => {
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
    previousActionQuery.data && UpsertEmployeeAction.parse(previousActionQuery.data.actionJson);

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
          accessor: "displayId",
          label: "ID",
          render: (value) => value,
        },
        {
          accessor: "name",
          label: "Name",
          render: (value) => value,
        },
        {
          accessor: "phoneNumber",
          label: "Phone Number",
          render: (value) => value,
        },
        {
          accessor: "fringeCode",
          label: "Fringe Code",
          render: (value) => value,
        },
        {
          accessor: "ratePrivateCentsPerHour",
          label: "Private",
          render: (value) => centsToDollarString(value),
        },
        {
          accessor: "rateDavisBaconCentsPerHour",
          label: "Davis Bacon",
          render: (value) => centsToDollarString(value),
        },
        {
          accessor: "rateDavisBaconOvertimeCentsPerHour",
          label: "Davis Bacon OT",
          render: (value) => centsToDollarString(value),
        },
      ]}
    />
  );
};
