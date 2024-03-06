"use client";
import { createContext, useContext, useMemo } from "react";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import useProfileQuery from "@/queries/useProfileQuery";

export interface ProfileData {
  isInitialized: boolean;
  isAdmin: boolean;
  isBarunCorpMember: boolean;
  isContractor: boolean;
}

const ProfileContext = createContext<ProfileData>({
  isInitialized: false,
  isAdmin: false,
  isBarunCorpMember: false,
  isContractor: false,
});

interface Props {
  children: React.ReactNode;
}

export default function ProfileProvider({ children }: Props) {
  const { data: profile } = useProfileQuery();
  const { data: organization } = useOrganizationQuery(
    profile?.organizationId ?? ""
  );

  const value = useMemo<ProfileData>(() => {
    if (profile == null || organization == null) {
      return {
        isInitialized: false,
        isAdmin: false,
        isBarunCorpMember: false,
        isContractor: false,
      };
    }

    return {
      isInitialized: true,
      // uppercase로 사용해달라는 백엔드의 요청이 있었음
      isAdmin:
        profile.role.toUpperCase() === "SPECIAL ADMIN" ||
        profile.role.toUpperCase() === "ADMIN",
      isBarunCorpMember:
        organization.organizationType.toUpperCase() === "ADMINISTRATION",
      isContractor: profile.isVendor,
    };
  }, [organization, profile]);

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const profileData = useContext(ProfileContext);
  return profileData;
}
