import { ActionResult } from "@/utils/types";
import { useModals, useSnackbar } from "@saas-ui/react";
import { match } from "ts-pattern";

export const useActionResult = () => {
  const modals = useModals();
  const snackbar = useSnackbar({ position: "top" });

  return (actionResult: ActionResult) => {
    if (actionResult !== null) {
      match(actionResult.status)
        .with("success", () => snackbar.success(actionResult.message))
        .with("info", () => snackbar.info(actionResult.message))
        .with("error", () => snackbar.error(actionResult.message))
        .exhaustive();
    } else {
      modals.closeAll();
    }
  };
};
