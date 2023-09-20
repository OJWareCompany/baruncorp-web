import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AxiosError } from "axios";
import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import React from "react";
import { FieldValues } from "react-hook-form";
import {
  DEFAULT_ERROR_TOAST_DESCRIPTION,
  DEFAULT_ERROR_TOAST_TITLE,
  SERVER_ERROR_TOAST_TITLE,
} from "./constants";
import {
  schemaToConvertFromNullishANSIToANSIWithEmptyString,
  schemaToConvertFromNullishDigitalSignatureTypeToDigitalSignatureTypeWithEmptyString,
  schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString,
  schemaToConvertFromNullishWindExposureToWindExposureWithEmptyString,
  schemaToConvertFromNullishStringToString,
} from "@/lib/constants";
import { AhjNoteResponseDto } from "@/api";

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

/**
 * AHJ
 */
export function getFieldValuesFromAhjNote(
  ahjNote: AhjNoteResponseDto
): FieldValues {
  const { design, electricalEngineering, engineering, general } = ahjNote;

  return {
    // general
    general: {
      name: general.name,
      website: schemaToConvertFromNullishStringToString.parse(general.website),
      specificFormRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          general.specificFormRequired
        ),
      buildingCodes: schemaToConvertFromNullishStringToString.parse(
        general.buildingCodes
      ),
      generalNotes: schemaToConvertFromNullishStringToString.parse(
        general.generalNotes
      ),
      updatedAt: schemaToConvertFromNullishStringToString.parse(
        general.updatedAt
      ),
      updatedBy: schemaToConvertFromNullishStringToString.parse(
        general.updatedBy
      ),
    },
    // design
    design: {
      fireSetBack: schemaToConvertFromNullishStringToString.parse(
        design.fireSetBack
      ),
      utilityNotes: schemaToConvertFromNullishStringToString.parse(
        design.utilityNotes
      ),
      designNotes: schemaToConvertFromNullishStringToString.parse(
        design.designNotes
      ),
      pvMeterRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          design.pvMeterRequired
        ),
      acDisconnectRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          design.acDisconnectRequired
        ),
      centerFed120Percent:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          design.centerFed120Percent
        ),
      deratedAmpacity: schemaToConvertFromNullishStringToString.parse(
        design.deratedAmpacity
      ),
    },
    // structural engineering
    structuralEngineering: {
      iebcAccepted:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          engineering.iebcAccepted
        ),
      structuralObservationRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          engineering.structuralObservationRequired
        ),
      digitalSignatureType:
        schemaToConvertFromNullishDigitalSignatureTypeToDigitalSignatureTypeWithEmptyString.parse(
          engineering.digitalSignatureType
        ),
      windUpliftCalculationRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          engineering.windUpliftCalculationRequired
        ),
      windSpeed: schemaToConvertFromNullishStringToString.parse(
        engineering.windSpeed
      ),
      windExposure:
        schemaToConvertFromNullishWindExposureToWindExposureWithEmptyString.parse(
          engineering.windExposure
        ),
      snowLoadGround: schemaToConvertFromNullishStringToString.parse(
        engineering.snowLoadGround
      ),
      snowLoadFlatRoof: schemaToConvertFromNullishStringToString.parse(
        engineering.snowLoadFlatRoof
      ),
      wetStampsRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          engineering.wetStampsRequired
        ),
      ofWetStamps: schemaToConvertFromNullishStringToString.parse(
        engineering.ofWetStamps
      ),
      wetStampSize: schemaToConvertFromNullishANSIToANSIWithEmptyString.parse(
        engineering.wetStampSize
      ),
      engineeringNotes: schemaToConvertFromNullishStringToString.parse(
        engineering.engineeringNotes
      ),
    },
    // electrical engineering
    electricalEngineering: {
      engineeringNotes: schemaToConvertFromNullishStringToString.parse(
        electricalEngineering.electricalNotes
      ),
    },
  };
}
