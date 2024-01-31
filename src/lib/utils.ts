import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";
import { format, startOfDay } from "date-fns";
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";
import { utcToZonedTime } from "date-fns-tz";
import { getLocalTimeZone } from "@internationalized/date";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertCamelCaseToTitleCase(string: string) {
  /**
   * e.g.
   * - convertCamelCaseToTitleCase("hi") === "Hi"
   * - convertCamelCaseToTitleCase("hiThere") === "Hi There"
   */

  return (
    string
      // insert a space before all caps
      .replace(/([A-Z])/g, " $1")
      // uppercase the first character
      .replace(/^./, (substring) => substring.toUpperCase())
  );
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function getValidChildren(children: React.ReactNode) {
  return React.Children.toArray(children).filter((child) =>
    React.isValidElement(child)
  ) as React.ReactElement[];
}

export function formatDateTime(dateTimeString: string) {
  if (typeof dateTimeString !== "string" && dateTimeString === "") {
    return "-";
  }

  return format(new Date(dateTimeString), "MM-dd-yyyy, p");
}

export function formatInEST(date: Date | string) {
  return formatInTimeZone(date, "America/New_York", "MM-dd-yyyy, p");
}

export function getISOStringForStartOfDayInUTC(date: Date) {
  return zonedTimeToUtc(startOfDay(date), "Etc/UTC").toISOString();
}

export function getDiffHoursFromLocalToEST() {
  const timezone1 = "America/New_York";
  const timezone2 = getLocalTimeZone();

  // Use the current date/time or any specific date/time
  const now = new Date();

  // Convert the date to each timezone
  const timeInZone1 = utcToZonedTime(now, timezone1);
  const timeInZone2 = utcToZonedTime(now, timezone2);

  // Convert the timezone-adjusted dates to timestamps
  const timestamp1 = timeInZone1.getTime();
  const timestamp2 = timeInZone2.getTime();

  // Calculate the difference in hours
  const differenceInHours = (timestamp2 - timestamp1) / (1000 * 60 * 60);

  return differenceInHours;
}
