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

export interface OrganizationsPostReqDto {
  organizationType: string;
  // organizationType: "client" | "individual" | "outsourcing";
  name: string;
  description: string;
  phoneNumber: string;
  email: string;
  street1: string;
  street2: string;
  city: string;
  stateOrRegion: string;
  postalCode: string;
  country: string;
}

export interface OrganizationsPostResDto {
  id: string;
  organizationType: string;
  // organizationType: "client" | "individual" | "outsourcing";
  name: string;
  description: string;
  phoneNumber: string;
  email: string;
  street1: string;
  street2: string;
  city: string;
  stateOrRegion: string;
  postalCode: string;
  country: string;
}
