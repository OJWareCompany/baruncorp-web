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

export type CommonOption = "Yes" | "No" | "See Notes";
export type DigitalSignatureType = "Certified" | "Signed";
export type WindExposure = "B" | "C" | "D" | "See Notes";
export type WetStampSize =
  | "ANSI A (8.5x11 INCH)"
  | "ANSI B (11x17 INCH)"
  | "ANSI C (22x34 INCH)"
  | "ANSI D (24x36 INCH)"
  | "See Notes";

export interface General {
  name?: string;
  type?: string;
  website?: string;
  specificFormRequired?: CommonOption;
  generalNotes?: string;
  buildingCodes?: string;
  modifiedBy?: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface Design {
  fireSetBack?: string;
  utilityNotes?: string;
  designNotes?: string;
  pvMeterRequired?: CommonOption;
  acDisconnectRequired?: CommonOption;
  centerFed120Percent?: CommonOption;
  deratedAmpacity?: string;
}

export interface Engineering {
  engineeringNotes?: string;
  iebcAccepted?: CommonOption;
  structuralObservationRequired?: CommonOption;
  windUpliftCalculationRequired?: CommonOption;
  wetStampsRequired?: CommonOption;
  digitalSignatureType?: DigitalSignatureType;
  windExposure?: WindExposure;
  wetStampSize?: WetStampSize;
  windSpeed?: string;
  snowLoadGround?: string;
  snowLoadFlatRoof?: string;
  snowLoadSlopedRoof?: string; // 퀵베이스 상에서 ahj form에는 존재하지 않음 (테이블 ui에 존재)
  ofWetStamps?: string;
}

export interface ElectricalEngineering {
  electricalNotes?: string;
}

export interface AhjGetResDto {
  id: string;
  general: General;
  design: Design;
  engineering: Engineering;
  electricalEngineering: ElectricalEngineering;
}

export interface AhjPutReqDto {
  general: General;
  design: Design;
  engineering: Engineering;
  electricalEngineering: ElectricalEngineering;
}
