"use client";

import { UpsertEntryAction } from "@/utils/action";
import { secondsToHourString } from "@/utils/time";
import { TZDate } from "@date-fns/tz";
import { Action, Prisma } from "@prisma/client";
import { Banner, LoadingOverlay, LoadingSpinner } from "@saas-ui/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChangeList } from "../ChangeList";

interface Props {
  action: Action;
  actionJson: UpsertEntryAction;
  findFirstAction: (args: Prisma.ActionFindFirstArgs) => Promise<Action | null>;
}

export const UpsertEntryActionJson = ({ action, actionJson, findFirstAction }: Props) => {
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
    previousActionQuery.data && UpsertEntryAction.parse(previousActionQuery.data.actionJson);

  return (
    <ChangeList
      oldObject={previousActionJson && previousActionJson.data}
      newObject={actionJson.data}
      fields={[
        {
          accessor: "timeInSeconds",
          label: "Time In",
          render: (value) => value && format(TZDate.tz("+00:00", value * 1000), "hh:mmaaa"),
        },
        {
          accessor: "timeOutSeconds",
          label: "Time Out",
          render: (value) => value && format(TZDate.tz("+00:00", value * 1000), "hh:mmaaa"),
        },
        {
          accessor: "lunchSeconds",
          label: "Lunch Hours",
          render: (value) => value && secondsToHourString(value),
        },
      ]}
    />
  );
};
