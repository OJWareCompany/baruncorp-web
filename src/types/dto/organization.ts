export interface OrganizationPostReqDto {
  organizationType: string;
  // organizationType: "client" | "individual" | "outsourcing"; // TODO 추후 개선
  name: string;
  description: string;
  phoneNumber: string; // TODO 제약 추가
  email: string;
  street1: string;
  street2: string;
  city: string;
  stateOrRegion: string;
  postalCode: string; // TODO 여섯 자리로 제약 추가
  country: string;
}

export interface OrganizationPostResDto {
  id: string;
  organizationType: string;
  // organizationType: "client" | "individual" | "outsourcing"; // TODO 추후 개선
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
