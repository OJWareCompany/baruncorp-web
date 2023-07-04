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
  id: string;
  lastName: string;
  firstName: string;
  fullName: string;
  email: string;
  organization: string;
  position?: {
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

// export type MemberGetResDto = {
//   id: string;
//   lastName: string;
//   firstName: string;
//   fullName: string;
//   email: string;
//   organization: string;
//   position: {
//     name: string | null;
//     description: string | null;
//     department: string | null;
//   };
//   licenses: {
//     abbreviation: string;
//     issuingCountryName: string;
//     expiryDate: string | null;
//     issuedDate: string | null;
//     priority: number;
//     type: string;
//     userName: string;
//   }[];
//   role: string;
// };
