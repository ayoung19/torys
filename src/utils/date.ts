import { TZDate } from "@date-fns/tz";
import { endOfWeek, format } from "date-fns";

export const currentTimesheetId = () =>
  format(endOfWeek(TZDate.tz("Pacific/Honolulu")), "yyyy-MM-dd");
