"use client";
import { useSession } from "next-auth/react";
import UserForm from "./UserForm";
import NewLicenseDialog from "./NewLicenseDialog";
import LicensesTabs from "./LicensesTabs";
import NewAvailableTaskDialog from "./NewAvailableTaskDialog";
import AvailableTasksTable from "./AvailableTasksTable";
import PositionForm from "./PositionForm";
import StatusSectionHeaderAction from "./StatusSectionHeaderAction";
import DepartmentForm from "./DepartmentForm";
import PageHeader from "@/components/PageHeader";
import useUserQuery from "@/queries/useUserQuery";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import { userStatuses } from "@/lib/constants";
import CollapsibleSection from "@/components/CollapsibleSection";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import { UserResponseDto } from "@/api/api-spec";
import { useProfileContext } from "@/app/(root)/ProfileProvider";

function getPageHeader({
  pageType,
  user,
}: {
  pageType: UserDetailPageType;
  user: UserResponseDto;
}) {
  switch (pageType) {
    case "MY_PROFILE":
      return (
        <PageHeader items={[{ href: "/my/profile", name: "My Profile" }]} />
      );
    case "MY_ORGANIZATION":
      return (
        <PageHeader
          items={[
            { href: "/my/organization", name: "My Organization" },
            { href: `/my/organization/users${user.id}`, name: user.fullName },
          ]}
        />
      );
    case "SYSTEM_MANAGEMENT":
      return (
        <PageHeader
          items={[
            { href: "/system-management/users", name: "Users" },
            {
              href: `/system-management/users/${user.id}}`,
              name: user.fullName,
            },
          ]}
        />
      );
  }
}

interface Props {
  userId: string;
  pageType: UserDetailPageType;
}

export default function UserDetailPage({ userId, pageType }: Props) {
  const { data: session } = useSession();
  const {
    data: user,
    isLoading: isUserQueryLoading,
    error: userQueryError,
  } = useUserQuery(userId);
  const {
    data: organization,
    isLoading: isOrganizationQueryLoading,
    error: organizationQueryError,
  } = useOrganizationQuery(user?.organizationId ?? "");
  useNotFound(userQueryError);
  useNotFound(organizationQueryError);

  const {
    isBarunCorpMember: isSignedInUserBarunCorpMember,
    authority: { canEditPosition, canEditLicense, canEditTask },
  } = useProfileContext();

  if (
    isUserQueryLoading ||
    user == null ||
    isOrganizationQueryLoading ||
    organization == null
  ) {
    return <PageLoading />;
  }

  const status = userStatuses[user.status];
  const isTargetUserOrganizationBarunCorp =
    organization.organizationType.toUpperCase() === "ADMINISTRATION";
  const isTargetUserContractor = user.isVendor;

  const isMine = session?.id === user.id;
  const isMyOrganization = session?.organizationId === organization.id;

  // 수정하려는 사람이 본인이면 무조건 가능
  // 권한이 있으면 무조건 가능
  // 수정하려는 사람의 조직이 baruncorp가 아니고, 그 사람의 조직이 나의 조직과 같으면 가능 (외주 조직에 속한 사람이 자신의 조직원들 보는 경우)
  const canEditUserPosition =
    isMine ||
    canEditPosition ||
    (!isTargetUserOrganizationBarunCorp && isMyOrganization);
  const canEditUserLicense =
    isMine ||
    canEditLicense ||
    (!isTargetUserOrganizationBarunCorp && isMyOrganization);
  const canEditUserTask =
    isMine ||
    canEditTask ||
    (!isTargetUserOrganizationBarunCorp && isMyOrganization);

  return (
    <div className="flex flex-col gap-4">
      {getPageHeader({ pageType, user })}
      <div className="space-y-6">
        <section>
          <UserForm
            user={user}
            organization={organization}
            pageType={pageType}
          />
        </section>
        <CollapsibleSection
          title="Status"
          action={
            isSignedInUserBarunCorpMember && (
              <StatusSectionHeaderAction user={user} />
            )
          }
        >
          <div className="flex h-10 px-3 py-2 rounded-md text-sm border border-input bg-background flex-1">
            <div className="flex items-center flex-1 gap-2">
              <status.Icon className={`w-4 h-4 ${status.color}`} />
              <span>{status.value}</span>
            </div>
          </div>
        </CollapsibleSection>
        {isTargetUserOrganizationBarunCorp && (
          <CollapsibleSection title="Department">
            <DepartmentForm user={user} />
          </CollapsibleSection>
        )}
        {(isTargetUserContractor || isTargetUserOrganizationBarunCorp) && (
          <>
            <CollapsibleSection title="Position">
              <PositionForm
                positionId={user.position?.id ?? ""}
                userId={user.id}
                disabled={!canEditUserPosition}
              />
            </CollapsibleSection>
            <CollapsibleSection
              title="Licenses"
              action={
                canEditUserLicense && <NewLicenseDialog userId={user.id} />
              }
            >
              <LicensesTabs user={user} disabled={!canEditUserLicense} />
            </CollapsibleSection>
            <CollapsibleSection
              title="Available Tasks"
              action={
                canEditUserTask && (
                  <NewAvailableTaskDialog
                    user={user}
                    organization={organization}
                  />
                )
              }
            >
              <AvailableTasksTable
                user={user}
                organization={organization}
                disabled={!canEditUserTask}
              />
            </CollapsibleSection>
          </>
        )}
      </div>
    </div>
  );
}
