export type PositionsGetResDto = {
  id: string;
  name: string;
  job: string;
  department: string;
}[];

export interface UserPositionPostReqDto {
  userId: string;
  positionId: string;
}

export interface UserPositionDeleteReqDto {
  userId: string;
  positionId: string;
}

export interface UserLicensePostReqDto {
  userId: string;
  type: "Electrical" | "Structural"; // TODO: constants로 만들어 사용하기
  issuingCountryName: string;
  abbreviation: string;
  priority: number;
  issuedDate: string;
  expiryDate: string;
}

export interface UserLicenseDeleteReqDto {
  userId: string;
  type: "Electrical" | "Structural";
  issuingCountryName: string;
}

export type StatesGetResDto = {
  stateName: string;
  abbreviation: string;
  geoId: string;
  stateCode: null;
  ansiCode: null;
  stateLongName: null;
}[];

export type ServicesGetResDto = {
  id: string;
  name: string;
  description: string;
}[];

export interface UserServicePostReqDto {
  userId: string;
  serviceId: string;
}

export interface UserServiceDeleteReqDto {
  userId: string;
  serviceId: string;
}
