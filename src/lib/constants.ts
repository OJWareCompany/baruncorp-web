import {
  CheckCircle2,
  CircleDot,
  PauseCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";
import { z } from "zod";

export const DEFAULT_ERROR_TOAST_TITLE = "Something went wrong";
export const DEFAULT_ERROR_TOAST_DESCRIPTION =
  "Please try again in a few minutes. If the problem persists, please contact the Barun Corp Manager.";
export const SERVER_ERROR_TOAST_TITLE = "Server error";

/**
 * "" => null
 * "  " => null
 * "  abc  " => "abc"
 * "abc" => "abc"
 */
export const schemaToConvertFromStringToNullableString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v));

/**
 * undefined => ""
 * null => ""
 * 3 => "3"
 * "" => ""
 * "  " => ""
 * "  abc  " => "abc"
 * "abc" => "abc"
 */
export const schemaToConvertFromNullishStringToString = z.coerce
  .string()
  .trim()
  .nullish()
  .transform((v) => v ?? "");

export const statuses = [
  {
    value: "Not Started",
    Icon: CircleDot,
    color: "text-neutral-700",
  },
  {
    value: "In Progress",
    Icon: PlayCircle,
    color: "text-blue-700",
  },
  {
    value: "Completed",
    Icon: CheckCircle2,
    color: "text-green-700",
  },
  {
    value: "On Hold",
    Icon: PauseCircle,
    color: "text-orange-700",
  },
  {
    value: "Canceled",
    Icon: XCircle,
    color: "text-violet-700",
  },
];
