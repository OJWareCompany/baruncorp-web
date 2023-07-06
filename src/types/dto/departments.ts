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
  type: string;
  issuingCountryName: string;
}

export type StatesGetResDto = {
  name: string;
  abbreviation: string;
}[];
