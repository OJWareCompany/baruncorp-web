"use client";
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
    case "PROFILE":
      return (
        <PageHeader items={[{ href: "/my/profile", name: "My Profile" }]} />
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

  const { isBarunCorpMember: isSignedInUserBarunCorpMember } =
    useProfileContext();

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
              />
            </CollapsibleSection>
            <CollapsibleSection
              title="Licenses"
              action={<NewLicenseDialog userId={user.id} />}
            >
              <LicensesTabs user={user} />
            </CollapsibleSection>
            <CollapsibleSection
              title="Available Tasks"
              action={
                <NewAvailableTaskDialog
                  user={user}
                  organization={organization}
                />
              }
            >
              <AvailableTasksTable user={user} organization={organization} />
            </CollapsibleSection>
          </>
        )}
      </div>
    </div>
  );
}
