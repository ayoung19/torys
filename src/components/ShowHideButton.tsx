"use client";

import { selectedActionAtom } from "@/states/atoms";
import { Button } from "@chakra-ui/react";
import { Action } from "@prisma/client";
import { useAtom } from "jotai";

interface Props {
  action: Action;
}

export const ShowHideButton = ({ action }: Props) => {
  const [selectedAction, setSelectedAction] = useAtom(selectedActionAtom);

  return action.id === selectedAction?.id ? (
    <Button onClick={() => setSelectedAction(undefined)}>Hide</Button>
  ) : (
    <Button onClick={() => setSelectedAction(action)}>Show</Button>
  );
};
