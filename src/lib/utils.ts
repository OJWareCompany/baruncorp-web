import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";
import { format, startOfDay } from "date-fns";
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";
import { Value } from "@udecode/plate-common";
import { Node } from "slate";

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

export function formatInEST(date: string) {
  return formatInTimeZone(date, "America/New_York", "MM-dd-yyyy, p");
}

export function isEditorValueEmpty(value: Value): boolean {
  const textContent = value
    .filter((node) => Node.isNode(node))
    .map((node) => Node.string(node))
    .join("")
    .trim();

  return textContent === "";
}

export function getEditorValue(string: string): Value {
  try {
    const parsed = JSON.parse(string);
    return parsed;
  } catch {
    return string
      .split("\n")
      .map((value) => ({ type: "p", children: [{ text: value.trim() }] }));
  }
}

export function getISOStringForStartOfDayInUTC(date: Date) {
  return zonedTimeToUtc(startOfDay(date), "Etc/UTC").toISOString();
}
