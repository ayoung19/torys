import { Action } from "@prisma/client";
import { atom } from "jotai";

export const selectedActionAtom = atom<Action>();
