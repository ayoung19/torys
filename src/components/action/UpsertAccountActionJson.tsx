"use client";

import { UpsertAccountAction } from "@/utils/action";
import { Badge } from "@chakra-ui/react";
import { Action, Prisma } from "@prisma/client";
import { Banner, LoadingOverlay, LoadingSpinner } from "@saas-ui/react";
import { useQuery } from "@tanstack/react-query";
import { ChangeList } from "../ChangeList";

interface Props {
  action: Action;
  actionJson: UpsertAccountAction;
  findFirstAction: (args: Prisma.ActionFindFirstArgs) => Promise<Action | null>;
}

export const UpsertAccountActionJson = ({ action, actionJson, findFirstAction }: Props) => {
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
    previousActionQuery.data && UpsertAccountAction.parse(previousActionQuery.data.actionJson);

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
          accessor: "phoneNumber",
          label: "Phone Number",
          render: (value) => value,
        },
        {
          accessor: "accountType",
          label: "Role",
          render: (value) => value,
        },
      ]}
    />
  );
};
