import { z } from "zod";

export type AhjsGetResDto = {
  pageSize: number;
  totalCount: number;
  totalPage: number;
  items: {
    geoId: string;
    name: string;
    fullAhjName: string;
    modifiedBy: string | null;
    modifiedAt: string | null;
    createdAt: string | null;
  }[];
};

export const SelectOptionEnum = z.enum(["No", "Yes", "See Notes"]);
type SelectOption = z.infer<typeof SelectOptionEnum>;

export const ANSIEnum = z.enum([
  "ANSI A (8.5x11 INCH)",
  "ANSI B (11x17 INCH)",
  "ANSI D (22x34 INCH)",
  "ARCH D (24x36 INCH)",
  "See Notes",
]);
type ANSI = z.infer<typeof ANSIEnum>;

export const WindExposureEnum = z.enum(["B", "C", "D", "See Notes"]);
type WindExposure = z.infer<typeof WindExposureEnum>;

export const DigitalSignatureTypeEnum = z.enum(["Certified", "Signed"]);
type DigitalSignatureType = z.infer<typeof DigitalSignatureTypeEnum>;

export const TypesEnum = z.enum([
  "STATE",
  "COUNTY",
  "COUNTY SUBDIVISIONS",
  "PLACE",
]);
type Types = z.infer<typeof TypesEnum>;

interface General {
  name: string;
  website: string | null;
  specificFormRequired: SelectOption | null;
  generalNotes: string | null;
  buildingCodes: string | null;
  updatedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  type: Types | null;
}

interface Design {
  fireSetBack: string | null;
  utilityNotes: string | null;
  designNotes: string | null;
  pvMeterRequired: SelectOption | null;
  acDisconnectRequired: SelectOption | null;
  centerFed120Percent: SelectOption | null;
  deratedAmpacity: string | null;
}

interface Engineering {
  engineeringNotes: string | null;
  iebcAccepted: SelectOption | null;
  structuralObservationRequired: SelectOption | null;
  windUpliftCalculationRequired: SelectOption | null;
  wetStampsRequired: SelectOption | null;
  digitalSignatureType: DigitalSignatureType | null;
  windExposure: WindExposure | null;
  wetStampSize: ANSI | null;
  windSpeed: string | null;
  snowLoadGround: string | null;
  snowLoadFlatRoof: string | null;
  snowLoadSlopedRoof: string | null;
  ofWetStamps: string | null;
}

interface ElectricalEngineering {
  electricalNotes: string | null;
}

export interface AhjGetResDto {
  id: string;
  general: General;
  design: Design;
  engineering: Engineering;
  electricalEngineering: ElectricalEngineering;
}

export interface AhjPutReqDto {
  general: Omit<
    General,
    "name" | "createdAt" | "updatedBy" | "updatedAt" | "type"
  >;
  design: Design;
  engineering: Omit<Engineering, "snowLoadSlopedRoof">;
  electricalEngineering: ElectricalEngineering;
}
