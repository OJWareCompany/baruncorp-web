import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AxiosError } from "axios";
import {
  DEFAULT_ERROR_TOAST_DESCRIPTION,
  DEFAULT_ERROR_TOAST_TITLE,
  SERVER_ERROR_TOAST_TITLE,
} from "./constants";

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

export function getTitleAndDescFromStatusCode(statusCode: number | undefined): {
  title: string;
  description: string;
} {
  let title = DEFAULT_ERROR_TOAST_TITLE;
  if (statusCode === 500) {
    title = SERVER_ERROR_TOAST_TITLE;
  }

  return {
    title,
    description: DEFAULT_ERROR_TOAST_DESCRIPTION,
  };
}

export function isAxiosErrorWithErrorResponseData(
  error: AxiosError
): error is AxiosError<ErrorResponseData> {
  return (
    (error as AxiosError<ErrorResponseData>).response?.data.errorCode !==
    undefined
  );
}
