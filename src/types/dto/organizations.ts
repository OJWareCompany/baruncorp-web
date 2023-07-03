export type OrganizationsGetResDto = {
  id: string;
  name: string;
  description: string;
  email: string;
  organizationType: string;
  city: string;
  country: string;
  phoneNumber: string;
  postalCode: string;
  stateOrRegion: string;
  street1: string;
  street2: string;
}[];

export type MembersGetResDto = {
  id: string; // TODO: check
  lastName: string;
  firstName: string;
  fullName: string;
  email: string;
  organization: string;
  role: string;
  position: string;
}[];
