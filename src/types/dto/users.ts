export interface ProfileGetResDto {
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
export interface ProfilePatchResDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: number;
}

export interface InvitationsPostReqDto {
  email: string;
  organizationName: string;
}

export interface InvitationsPostResDto {
  code: string;
  email: string;
  role: string;
  organizationId: string;
}
