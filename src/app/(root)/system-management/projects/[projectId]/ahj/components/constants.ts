import * as z from "zod";
import { PaginationState } from "@tanstack/react-table";

export const SelectOptionEnum = z.enum(["No", "Yes", "See Notes"]);
export const WindExposureEnum = z.enum(["B", "C", "D", "See Notes"]);
export const DigitalSignatureTypeEnum = z.enum(["Certified", "Signed"]);
export const ANSIEnum = z.enum([
  "ANSI A (8.5x11 INCH)",
  "ANSI B (11x17 INCH)",
  "ANSI D (22x34 INCH)",
  "ARCH D (24x36 INCH)",
  "See Notes",
]);
export const TypesEnum = z.enum([
  "STATE",
  "COUNTY",
  "COUNTY SUBDIVISIONS",
  "PLACE",
]);

export const SelectOptionEnumWithEmptyString = SelectOptionEnum.or(
  z.literal("")
); // "No" | "Yes" | "See Notes" | ""
export const DigitalSignatureTypeEnumWithEmptyString =
  DigitalSignatureTypeEnum.or(z.literal("")); // "Certified" | "Signed" | ""
export const WindExposureEnumWithEmptyString = WindExposureEnum.or(
  z.literal("")
); // "See Notes" | "B" | "C" | "D" | ""
export const ANSIEnumWithEmptyString = ANSIEnum.or(z.literal("")); // "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | ""

// "No" | "Yes" | "See Notes" | null => "No" | "Yes" | "See Notes" | ""
export const schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString =
  SelectOptionEnum.nullish().transform((v) => v ?? "");
// "No" | "Yes" | "See Notes" | "" => "No" | "Yes" | "See Notes" | null
export const schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption =
  SelectOptionEnumWithEmptyString.transform((v) => (v === "" ? null : v));

// "Certified" | "Signed" | null => "Certified" | "Signed" | ""
export const schemaToConvertFromNullishDigitalSignatureTypeToDigitalSignatureTypeWithEmptyString =
  DigitalSignatureTypeEnum.nullish().transform((v) => v ?? "");
// "Certified" | "Signed" | "" => "Certified" | "Signed" | null
export const schemaToConvertFromDigitalSignatureTypeWithEmptyStringToNullableDigitalSignatureType =
  DigitalSignatureTypeEnumWithEmptyString.transform((v) =>
    v === "" ? null : v
  );

// "See Notes" | "B" | "C" | "D" | null => "See Notes" | "B" | "C" | "D" | ""
export const schemaToConvertFromNullishWindExposureToWindExposureWithEmptyString =
  WindExposureEnum.nullish().transform((v) => v ?? "");
// "See Notes" | "B" | "C" | "D" | "" => "See Notes" | "B" | "C" | "D" | null
export const schemaToConvertFromWindExposureWithEmptyStringToNullableWindExposure =
  WindExposureEnumWithEmptyString.transform((v) => (v === "" ? null : v));

// "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | null
// => "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | ""
export const schemaToConvertFromNullishANSIToANSIWithEmptyString =
  ANSIEnum.nullish().transform((v) => v ?? "");
// "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | ""
// => "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | null
export const schemaToConvertFromANSIWithEmptyStringToNullableANSI =
  ANSIEnumWithEmptyString.transform((v) => (v === "" ? null : v));

export const initialPagination: PaginationState = {
  pageIndex: 0,
  pageSize: 5,
};
