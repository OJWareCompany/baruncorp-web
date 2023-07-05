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
