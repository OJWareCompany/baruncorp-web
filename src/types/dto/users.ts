export interface ProfileGetResDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: number;
}
export interface ProfilePatchResDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: number;
}

export interface ProfilePatchReqDto {
  firstName: string;
  lastName: string;
}
