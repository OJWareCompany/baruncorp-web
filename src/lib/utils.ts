import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AxiosError } from "axios";
import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import React from "react";
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

export function getAddressFieldMap(address: GeocodeFeature) {
  const resource = new Map<string, string>();

  address.context.forEach((element) => {
    const key = element.id.split(".")[0];
    const value = element.text;
    resource.set(key, value);
  });

  return {
    street1: address.text ?? "",
    street2: "",
    city: resource.get("place") ?? "",
    stateOrRegion: resource.get("region") ?? "",
    postalCode: resource.get("postcode") ?? "",
    country: resource.get("country") ?? "",
  };
}

export function getValidChildren(children: React.ReactNode) {
  return React.Children.toArray(children).filter((child) =>
    React.isValidElement(child)
  ) as React.ReactElement[];
}
