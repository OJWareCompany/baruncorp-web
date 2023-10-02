import * as z from "zod";
import {
  ANSIEnumWithEmptyString,
  DigitalSignatureTypeEnumWithEmptyString,
  SelectOptionEnumWithEmptyString,
  WindExposureEnumWithEmptyString,
  transformNullishANSIIntoANSIWithEmptyString,
  transformNullishDigitalSignatureTypeIntoDigitalSignatureTypeWithEmptyString,
  transformNullishSelectOptionIntoSelectOptionWithEmptyString,
  transformNullishWindExposureIntoWindExposureWithEmptyString,
  transformNullishStringIntoString,
  transformStringIntoNullableString,
  transformSelectOptionWithEmptyStringIntoNullableSelectOption,
  transformDigitalSignatureTypeWithEmptyStringIntoNullableDigitalSignatureType,
  transformWindExposureWithEmptyStringIntoNullableWindExposure,
  transformANSIWithEmptyStringIntoNullableANSI,
} from "@/lib/constants";
import {
  AhjNoteResponseDto,
  ProjectAssociatedRegulatoryBodyDto,
  UpdateAhjNoteRequestDto,
} from "@/api";

export const formSchema = z.object({
  // general
  general: z.object({
    name: z.string().trim(),
    website: z.string().trim(),
    specificFormRequired: SelectOptionEnumWithEmptyString,
    generalNotes: z.string().trim(),
    buildingCodes: z.string().trim(),
    updatedBy: z.string().trim(),
    updatedAt: z.string().trim(),
  }),
  // design
  design: z.object({
    fireSetBack: z.string().trim(),
    utilityNotes: z.string().trim(),
    designNotes: z.string().trim(),
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
    windSpeed: z.string().trim(),
    windExposure: WindExposureEnumWithEmptyString,
    snowLoadGround: z.string().trim(),
    snowLoadFlatRoof: z.string().trim(),
    wetStampsRequired: SelectOptionEnumWithEmptyString,
    ofWetStamps: z.string().trim(),
    wetStampSize: ANSIEnumWithEmptyString,
    engineeringNotes: z.string().trim(),
  }),
  // electrical engineering
  electricalEngineering: z.object({
    engineeringNotes: z.string().trim(),
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
      website: transformNullishStringIntoString.parse(ahjNote?.general.website),
      specificFormRequired:
        transformNullishSelectOptionIntoSelectOptionWithEmptyString.parse(
          ahjNote?.general.specificFormRequired
        ),
      buildingCodes: transformNullishStringIntoString.parse(
        ahjNote?.general.buildingCodes
      ),
      generalNotes: transformNullishStringIntoString.parse(
        ahjNote?.general.generalNotes
      ),
      updatedAt: transformNullishStringIntoString.parse(
        ahjNote?.general.updatedAt
      ),
      updatedBy: transformNullishStringIntoString.parse(
        ahjNote?.general.updatedBy
      ),
    },
    // design
    design: {
      fireSetBack: transformNullishStringIntoString.parse(
        ahjNote?.design.fireSetBack
      ),
      utilityNotes: transformNullishStringIntoString.parse(
        ahjNote?.design.utilityNotes
      ),
      designNotes: transformNullishStringIntoString.parse(
        ahjNote?.design.designNotes
      ),
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
      windSpeed: transformNullishStringIntoString.parse(
        ahjNote?.engineering.windSpeed
      ),
      windExposure:
        transformNullishWindExposureIntoWindExposureWithEmptyString.parse(
          ahjNote?.engineering.windExposure
        ),
      snowLoadGround: transformNullishStringIntoString.parse(
        ahjNote?.engineering.snowLoadGround
      ),
      snowLoadFlatRoof: transformNullishStringIntoString.parse(
        ahjNote?.engineering.snowLoadFlatRoof
      ),
      wetStampsRequired:
        transformNullishSelectOptionIntoSelectOptionWithEmptyString.parse(
          ahjNote?.engineering.wetStampsRequired
        ),
      ofWetStamps: transformNullishStringIntoString.parse(
        ahjNote?.engineering.ofWetStamps
      ),
      wetStampSize: transformNullishANSIIntoANSIWithEmptyString.parse(
        ahjNote?.engineering.wetStampSize
      ),
      engineeringNotes: transformNullishStringIntoString.parse(
        ahjNote?.engineering.engineeringNotes
      ),
    },
    // electrical engineering
    electricalEngineering: {
      engineeringNotes: transformNullishStringIntoString.parse(
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
      buildingCodes: transformStringIntoNullableString.parse(
        values.general.buildingCodes
      ),
      generalNotes: transformStringIntoNullableString.parse(
        values.general.generalNotes
      ),
      website: transformStringIntoNullableString.parse(values.general.website),
      specificFormRequired:
        transformSelectOptionWithEmptyStringIntoNullableSelectOption.parse(
          values.general.specificFormRequired
        ),
    },
    design: {
      deratedAmpacity: transformStringIntoNullableString.parse(
        values.design.deratedAmpacity
      ),
      designNotes: transformStringIntoNullableString.parse(
        values.design.designNotes
      ),
      fireSetBack: transformStringIntoNullableString.parse(
        values.design.fireSetBack
      ),
      utilityNotes: transformStringIntoNullableString.parse(
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
      wetStampsRequired:
        transformSelectOptionWithEmptyStringIntoNullableSelectOption.parse(
          values.structuralEngineering.wetStampsRequired
        ),
      digitalSignatureType:
        transformDigitalSignatureTypeWithEmptyStringIntoNullableDigitalSignatureType.parse(
          values.structuralEngineering.digitalSignatureType
        ),
      windExposure:
        transformWindExposureWithEmptyStringIntoNullableWindExposure.parse(
          values.structuralEngineering.windExposure
        ),
      wetStampSize: transformANSIWithEmptyStringIntoNullableANSI.parse(
        values.structuralEngineering.wetStampSize
      ),
      engineeringNotes: transformStringIntoNullableString.parse(
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
      windSpeed: transformStringIntoNullableString.parse(
        values.structuralEngineering.windSpeed
      ),
    },
    electricalEngineering: {
      electricalNotes: transformStringIntoNullableString.parse(
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
