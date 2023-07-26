import * as z from "zod";
import {
  SelectOptionEnum,
  DigitalSignatureTypeEnum,
  WindExposureEnum,
  ANSIEnum,
} from "@/types/dto/ahjs";

export const SelectOptionEnumWithEmptyString = SelectOptionEnum.or(
  z.literal("")
); // "No" | "Yes" | "See Notes" | ""
export const DigitalSignatureTypeEnumWithEmptyString =
  DigitalSignatureTypeEnum.or(z.literal("")); // "Certified" | "Signed" | ""
export const WindExposureEnumWithEmptyString = WindExposureEnum.or(
  z.literal("")
); // "See Notes" | "B" | "C" | "D" | ""
export const ANSIEnumWithEmptyString = ANSIEnum.or(z.literal("")); // "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | ""

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
