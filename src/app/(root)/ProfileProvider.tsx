"use client";
import { createContext, useContext, useMemo } from "react";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import useProfileQuery from "@/queries/useProfileQuery";
import PageLoading from "@/components/PageLoading";
import useDepartmentQuery from "@/queries/useDepartmentQuery";

export interface ProfileData {
  isAdmin: boolean;
  isBarunCorpMember: boolean;
  isContractor: boolean;
  isClientCompanyManager: boolean;
  authority: {
    canViewClientInvoice: boolean;
    canViewVendorInvoice: boolean;
    canViewCustomPricing: boolean;
    canViewExpensePricing: boolean;
    canViewScopePrice: boolean;
    canViewTaskCost: boolean;
    canEditTask: boolean;
    canEditLicense: boolean;
    canEditPosition: boolean;
    canSendDeliverables: boolean;
    canEditClientRole: boolean;
    canEditMemberRole: boolean;
  };
}

const ProfileContext = createContext<ProfileData>({
  isAdmin: false,
  isBarunCorpMember: false,
  isContractor: false,
  isClientCompanyManager: false,
  authority: {
    canViewClientInvoice: false,
    canViewVendorInvoice: false,
    canViewCustomPricing: false,
    canViewExpensePricing: false,
    canViewScopePrice: false,
    canViewTaskCost: false,
    canEditTask: false,
    canEditLicense: false,
    canEditPosition: false,
    canSendDeliverables: false,
    canEditClientRole: false,
    canEditMemberRole: false,
  },
});

interface Props {
  children: React.ReactNode;
}

export default function ProfileProvider({ children }: Props) {
  const { data: profile } = useProfileQuery();
  const { data: organization } = useOrganizationQuery(
    profile?.organizationId ?? ""
  );
  const { data: department } = useDepartmentQuery(profile?.departmentId ?? "");

  const value = useMemo<ProfileData>(() => {
    // profile과 organization 받아오는 중
    if (profile == null || organization == null) {
      return {
        isAdmin: false,
        isBarunCorpMember: false,
        isContractor: false,
        isClientCompanyManager: false,
        authority: {
          canViewClientInvoice: false,
          canViewVendorInvoice: false,
          canViewCustomPricing: false,
          canViewExpensePricing: false,
          canViewScopePrice: false,
          canViewTaskCost: false,
          canEditTask: false,
          canEditLicense: false,
          canEditPosition: false,
          canSendDeliverables: false,
          canEditClientRole: false,
          canEditMemberRole: false,
        },
      };
    }

    // uppercase로 사용해달라는 백엔드의 요청이 있었음
    const isAdmin =
      profile.role.toUpperCase() === "SPECIAL ADMIN" ||
      profile.role.toUpperCase() === "ADMIN";
    const isBarunCorpMember =
      organization.organizationType.toUpperCase() === "ADMINISTRATION";
    const isContractor = profile.isVendor;
    const isClientCompanyManager =
      profile.role.toUpperCase() === "CLIENT COMPANY MANAGER";

    // profile 받아왔는데, 소속된 department 없는 경우
    // 혹은 소속된 department가 있는데 department 받아오는 중
    if (profile.departmentId == null || department == null) {
      return {
        isAdmin,
        isBarunCorpMember,
        isContractor,
        isClientCompanyManager,
        authority: {
          canViewClientInvoice: false,
          canViewVendorInvoice: false,
          canViewCustomPricing: false,
          canViewExpensePricing: false,
          canViewScopePrice: false,
          canViewTaskCost: false,
          canEditTask: false,
          canEditLicense: false,
          canEditPosition: false,
          canSendDeliverables: false,
          canEditClientRole: false,
          canEditMemberRole: false,
        },
      };
    }

    // profile 받아왔는데, 소속된 department가 있고 department 받아온 경우
    return {
      isAdmin,
      isBarunCorpMember,
      isContractor,
      isClientCompanyManager,
      authority: {
        canViewClientInvoice: department.viewClientInvoice,
        canViewVendorInvoice: department.viewVendorInvoice,
        canViewCustomPricing: department.viewCustomPricing,
        canViewExpensePricing: department.viewExpensePricing,
        canViewScopePrice: department.viewScopePrice,
        canViewTaskCost: department.viewTaskCost,
        canEditTask: department.editUserTask,
        canEditLicense: department.editUserLicense,
        canEditPosition: department.editUserPosition,
        canSendDeliverables: department.sendDeliverables,
        canEditClientRole: department.editClientRole,
        canEditMemberRole: department.editMemberRole,
      },
    };
  }, [department, organization, profile]);

  const hasDepartment = profile != null && profile.departmentId != null;

  if (
    profile == null ||
    organization == null ||
    (hasDepartment && department == null)
  ) {
    return <PageLoading isPageHeaderPlaceholder={false} />;
  }

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const profileData = useContext(ProfileContext);
  return profileData;
}
