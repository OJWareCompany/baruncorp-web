export interface ProfileGetResDto {
  id: string;
  lastName: string;
  firstName: string;
  fullName: string;
  email: string;
  organization: string;
  position?: {
    id: string | null;
    name: string | null;
    description: string | null;
    department: string | null;
  };
  licenses: {
    abbreviation: string;
    issuingCountryName: string;
    expiryDate: string | null;
    issuedDate: string | null;
    priority: number;
    type: string;
    userName: string;
  }[];
  role: string | null;
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

export type UsersGetResDto = {
  id: string;
  lastName: string;
  firstName: string;
  fullName: string;
  email: string;
  organization: string;
  position?: {
    id: string | null;
    name: string | null;
    description: string | null;
    department: string | null;
  };
  licenses: {
    abbreviation: string;
    issuingCountryName: string;
    expiryDate: string | null;
    issuedDate: string | null;
    priority: number;
    type: string;
    userName: string;
  }[];
  role: string | null;
}[];
