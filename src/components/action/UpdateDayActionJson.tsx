"use client";

import { UpdateDayAction } from "@/utils/action";
import { Action, Prisma } from "@prisma/client";
import { Banner, LoadingOverlay, LoadingSpinner } from "@saas-ui/react";
import { useQuery } from "@tanstack/react-query";
import { ChangeList } from "../ChangeList";

interface Props {
  action: Action;
  actionJson: UpdateDayAction;
  findFirstAction: (args: Prisma.ActionFindFirstArgs) => Promise<Action | null>;
}

export const UpdateDayActionJson = ({ action, actionJson, findFirstAction }: Props) => {
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
    previousActionQuery.data && UpdateDayAction.parse(previousActionQuery.data.actionJson);

  return (
    <ChangeList
      oldObject={previousActionJson ? previousActionJson.data : { description: "" }}
      newObject={actionJson.data}
      fields={[
        {
          accessor: "description",
          label: "Description",
          render: (value) => value,
        },
      ]}
    />
  );
};
