import * as z from "zod";
import { Value } from "@udecode/plate-common";
import {
  getEditorValue,
  transformEditorValueToStringOrNull,
} from "./plate-utils";
import {
  ANSIEnumWithEmptyString,
  DigitalSignatureTypeEnumWithEmptyString,
  SelectOptionEnumWithEmptyString,
  transformNullishANSIIntoANSIWithEmptyString,
  transformNullishDigitalSignatureTypeIntoDigitalSignatureTypeWithEmptyString,
  transformNullishSelectOptionIntoSelectOptionWithEmptyString,
  transformNullishStringIntoString,
  transformStringIntoNullableString,
  transformSelectOptionWithEmptyStringIntoNullableSelectOption,
  transformDigitalSignatureTypeWithEmptyStringIntoNullableDigitalSignatureType,
  transformANSIWithEmptyStringIntoNullableANSI,
} from "@/lib/constants";
import {
  AhjNoteResponseDto,
  ProjectAssociatedRegulatoryBodyDto,
  UpdateAhjNoteRequestDto,
} from "@/api/api-spec";

export const formSchema = z.object({
  // general
  general: z.object({
    name: z.string().trim(),
    website: z.custom<Value>(),
    specificFormRequired: SelectOptionEnumWithEmptyString,
    structuralStampRequired: SelectOptionEnumWithEmptyString,
    electricalStampRequired: SelectOptionEnumWithEmptyString,
    wetStampRequired: SelectOptionEnumWithEmptyString,
    generalNotes: z.custom<Value>(),
    buildingCodes: z.custom<Value>(),
    updatedBy: z.string().trim(),
    updatedAt: z.string().trim(),
  }),
  // design
  design: z.object({
    fireSetBack: z.custom<Value>(),
    utilityNotes: z.custom<Value>(),
    designNotes: z.custom<Value>(),
    pvMeterRequired: SelectOptionEnumWithEmptyString,
    acDisconnectRequired: SelectOptionEnumWithEmptyString,
    centerFed120Percent: SelectOptionEnumWithEmptyString,
    deratedAmpacity: z.string().trim(),
  }),
  // structural engineering
  structuralEngineering: z.object({
    iebcAccepted: SelectOptionEnumWithEmptyString,
    structuralObservationRequired: SelectOptionEnumWithEmptyString,
    digitalSignatureType: DigitalSignatureTypeEnumWithEmptyString,
    windUpliftCalculationRequired: SelectOptionEnumWithEmptyString,
    windSpeedRiskCatFirst: z.string().trim(),
    windSpeedRiskCatSecond: z.string().trim(),
    snowLoadGround: z.string().trim(),
    snowLoadFlatRoof: z.string().trim(),
    ofWetStamps: z.string().trim(),
    wetStampSize: ANSIEnumWithEmptyString,
    engineeringNotes: z.custom<Value>(),
  }),
  // electrical engineering
  electricalEngineering: z.object({
    engineeringNotes: z.custom<Value>(),
  }),
});

export type FieldValues = z.infer<typeof formSchema>;

export function getFieldValuesFromAhjNote(
  ahjNote?: AhjNoteResponseDto
): FieldValues {
  return {
    // general
    general: {
      name: transformNullishStringIntoString.parse(ahjNote?.general.name),
      website: getEditorValue(ahjNote?.general.website),
      specificFormRequired:
        transformNullishSelectOptionIntoSelectOptionWithEmptyString.parse(
          ahjNote?.general.specificFormRequired
        ),
      structuralStampRequired:
        transformNullishSelectOptionIntoSelectOptionWithEmptyString.parse(
          ahjNote?.general.structuralStampRequired
        ),
      electricalStampRequired:
        transformNullishSelectOptionIntoSelectOptionWithEmptyString.parse(
          ahjNote?.general.electricalStampRequired
        ),
      wetStampRequired:
        transformNullishSelectOptionIntoSelectOptionWithEmptyString.parse(
          ahjNote?.general.wetStampRequired
        ),
      buildingCodes: getEditorValue(ahjNote?.general.buildingCodes),
      generalNotes: getEditorValue(ahjNote?.general.generalNotes),
      updatedAt: transformNullishStringIntoString.parse(
        ahjNote?.general.updatedAt
      ),
      updatedBy: transformNullishStringIntoString.parse(
        ahjNote?.general.updatedBy
      ),
    },
    // design
    design: {
      fireSetBack: getEditorValue(ahjNote?.design.fireSetBack),
      utilityNotes: getEditorValue(ahjNote?.design.utilityNotes),
      designNotes: getEditorValue(ahjNote?.design.designNotes),
      pvMeterRequired:
        transformNullishSelectOptionIntoSelectOptionWithEmptyString.parse(
          ahjNote?.design.pvMeterRequired
        ),
      acDisconnectRequired:
        transformNullishSelectOptionIntoSelectOptionWithEmptyString.parse(
          ahjNote?.design.acDisconnectRequired
        ),
      centerFed120Percent:
        transformNullishSelectOptionIntoSelectOptionWithEmptyString.parse(
          ahjNote?.design.centerFed120Percent
        ),
      deratedAmpacity: transformNullishStringIntoString.parse(
        ahjNote?.design.deratedAmpacity
      ),
    },
    // structural engineering
    structuralEngineering: {
      iebcAccepted:
        transformNullishSelectOptionIntoSelectOptionWithEmptyString.parse(
          ahjNote?.engineering.iebcAccepted
        ),
      structuralObservationRequired:
        transformNullishSelectOptionIntoSelectOptionWithEmptyString.parse(
          ahjNote?.engineering.structuralObservationRequired
        ),
      digitalSignatureType:
        transformNullishDigitalSignatureTypeIntoDigitalSignatureTypeWithEmptyString.parse(
          ahjNote?.engineering.digitalSignatureType
        ),
      windUpliftCalculationRequired:
        transformNullishSelectOptionIntoSelectOptionWithEmptyString.parse(
          ahjNote?.engineering.windUpliftCalculationRequired
        ),
      windSpeedRiskCatFirst: transformNullishStringIntoString.parse(
        ahjNote?.engineering.windSpeedRiskCatFirst
      ),
      windSpeedRiskCatSecond: transformNullishStringIntoString.parse(
        ahjNote?.engineering.windSpeedRiskCatSecond
      ),
      snowLoadGround: transformNullishStringIntoString.parse(
        ahjNote?.engineering.snowLoadGround
      ),
      snowLoadFlatRoof: transformNullishStringIntoString.parse(
        ahjNote?.engineering.snowLoadFlatRoof
      ),
      ofWetStamps: transformNullishStringIntoString.parse(
        ahjNote?.engineering.ofWetStamps
      ),
      wetStampSize: transformNullishANSIIntoANSIWithEmptyString.parse(
        ahjNote?.engineering.wetStampSize
      ),
      engineeringNotes: getEditorValue(ahjNote?.engineering.engineeringNotes),
    },
    // electrical engineering
    electricalEngineering: {
      engineeringNotes: getEditorValue(
        ahjNote?.electricalEngineering.electricalNotes
      ),
    },
  };
}

export function getUpdateAhjNoteRequestDtoFromFieldValues(
  values: FieldValues
): UpdateAhjNoteRequestDto {
  return {
    general: {
      buildingCodes: transformEditorValueToStringOrNull(
        values.general.buildingCodes
      ),
      generalNotes: transformEditorValueToStringOrNull(
        values.general.generalNotes
      ),
      website: transformEditorValueToStringOrNull(values.general.website),
      specificFormRequired:
        transformSelectOptionWithEmptyStringIntoNullableSelectOption.parse(
          values.general.specificFormRequired
        ),
      structuralStampRequired:
        transformSelectOptionWithEmptyStringIntoNullableSelectOption.parse(
          values.general.structuralStampRequired
        ),
      electricalStampRequired:
        transformSelectOptionWithEmptyStringIntoNullableSelectOption.parse(
          values.general.electricalStampRequired
        ),
      wetStampRequired:
        transformSelectOptionWithEmptyStringIntoNullableSelectOption.parse(
          values.general.wetStampRequired
        ),
    },
    design: {
      deratedAmpacity: transformStringIntoNullableString.parse(
        values.design.deratedAmpacity
      ),
      designNotes: transformEditorValueToStringOrNull(
        values.design.designNotes
      ),
      fireSetBack: transformEditorValueToStringOrNull(
        values.design.fireSetBack
      ),
      utilityNotes: transformEditorValueToStringOrNull(
        values.design.utilityNotes
      ),
      pvMeterRequired:
        transformSelectOptionWithEmptyStringIntoNullableSelectOption.parse(
          values.design.pvMeterRequired
        ),
      acDisconnectRequired:
        transformSelectOptionWithEmptyStringIntoNullableSelectOption.parse(
          values.design.acDisconnectRequired
        ),
      centerFed120Percent:
        transformSelectOptionWithEmptyStringIntoNullableSelectOption.parse(
          values.design.centerFed120Percent
        ),
    },
    engineering: {
      iebcAccepted:
        transformSelectOptionWithEmptyStringIntoNullableSelectOption.parse(
          values.structuralEngineering.iebcAccepted
        ),
      structuralObservationRequired:
        transformSelectOptionWithEmptyStringIntoNullableSelectOption.parse(
          values.structuralEngineering.structuralObservationRequired
        ),
      windUpliftCalculationRequired:
        transformSelectOptionWithEmptyStringIntoNullableSelectOption.parse(
          values.structuralEngineering.windUpliftCalculationRequired
        ),
      digitalSignatureType:
        transformDigitalSignatureTypeWithEmptyStringIntoNullableDigitalSignatureType.parse(
          values.structuralEngineering.digitalSignatureType
        ),
      wetStampSize: transformANSIWithEmptyStringIntoNullableANSI.parse(
        values.structuralEngineering.wetStampSize
      ),
      engineeringNotes: transformEditorValueToStringOrNull(
        values.structuralEngineering.engineeringNotes
      ),
      ofWetStamps: transformStringIntoNullableString.parse(
        values.structuralEngineering.ofWetStamps
      ),
      snowLoadFlatRoof: transformStringIntoNullableString.parse(
        values.structuralEngineering.snowLoadFlatRoof
      ),
      snowLoadGround: transformStringIntoNullableString.parse(
        values.structuralEngineering.snowLoadGround
      ),
      windSpeedRiskCatFirst: transformStringIntoNullableString.parse(
        values.structuralEngineering.windSpeedRiskCatFirst
      ),
      windSpeedRiskCatSecond: transformStringIntoNullableString.parse(
        values.structuralEngineering.windSpeedRiskCatSecond
      ),
    },
    electricalEngineering: {
      electricalNotes: transformEditorValueToStringOrNull(
        values.electricalEngineering.engineeringNotes
      ),
    },
  };
}

type ProjectAssociatedRegulatoryBodyArray = {
  type: string;
  name: string;
  geoId: string;
}[];

export function transformProjectAssociatedRegulatoryBodyIntoArray(
  projectAssociatedRegulatoryBody: ProjectAssociatedRegulatoryBodyDto
): ProjectAssociatedRegulatoryBodyArray {
  if (projectAssociatedRegulatoryBody == null) {
    return [];
  }

  const array: ProjectAssociatedRegulatoryBodyArray = [];

  if (projectAssociatedRegulatoryBody.placeId != null) {
    array.push({
      type: "place",
      name: "Place",
      geoId: projectAssociatedRegulatoryBody.placeId,
    });
  }
  if (projectAssociatedRegulatoryBody.countySubdivisionsId != null) {
    array.push({
      type: "countySubdivision",
      name: "County Subdivision",
      geoId: projectAssociatedRegulatoryBody.countySubdivisionsId,
    });
  }
  if (projectAssociatedRegulatoryBody.countyId != null) {
    array.push({
      type: "county",
      name: "County",
      geoId: projectAssociatedRegulatoryBody.countyId,
    });
  }
  if (projectAssociatedRegulatoryBody.stateId != null) {
    array.push({
      type: "state",
      name: "State",
      geoId: projectAssociatedRegulatoryBody.stateId,
    });
  }

  return array;
}

export const states = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyomin",
];
