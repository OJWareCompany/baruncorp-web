import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React, { ForwardedRef, MutableRefObject } from "react";
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

export function formatInNewDateEST(date: Date | string) {
  return formatInTimeZone(date, "America/New_York", "MM-dd-yyyy, p");
}

export function formatInEST(date: Date | string) {
  return formatInTimeZone(date, "America/New_York", "MM-dd-yyyy, p");
}

export function formatInESTAsMMMYYYY(date: Date | string) {
  return formatInTimeZone(date, "America/New_York", "MMM yyyy");
}

export function formatInUTCAsMMMYYYY(date: Date | string) {
  return formatInTimeZone(date, "Etc/UTC", "MMM yyyy");
}

export function formatInUTCAsYYYYMM(date: Date | string) {
  return formatInTimeZone(date, "Etc/UTC", "yyyy-MM");
}

export function formatInUTCAsMMddyyyy(date: Date | string) {
  return formatInTimeZone(date, "Etc/UTC", "MM-dd-yyyy");
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

export function stringToHexCode(str: string) {
  // Simple hash function to convert string to a number
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert the hash to a 6-digit hex code
  let hex = (hash & 0xffffff).toString(16).toUpperCase();
  // Ensure it's 6 digits by padding with leading zeros if necessary
  return hex.padStart(6, "0");
}

export function isMutableRefObject<T>(
  ref: ForwardedRef<T>
): ref is MutableRefObject<T> {
  if (typeof ref === "function" || ref == null) {
    return false;
  }

  return true;
}

export function isValidServerErrorCode(errorCode: string | string[]): boolean {
  // 파일 서버 에러 코드인 경우
  if (errorCode instanceof String) return true;
  // 바른코프 서버 에러 코드인 경우
  if (
    errorCode instanceof Array &&
    errorCode.filter((value) => value != null).length !== 0
  )
    return true;
  return false;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function convertToTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}
