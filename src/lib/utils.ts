import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import React from "react";
import { format } from "date-fns";

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

export function formatDateTime(dateTimeString: string) {
  if (typeof dateTimeString !== "string") {
    return "-";
  }

  return format(new Date(dateTimeString), "MM-dd-yyyy, p");
}
