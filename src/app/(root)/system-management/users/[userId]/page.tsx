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

interface Props {
  params: {
    userId: string;
  };
}

export default function Page({ params: { userId } }: Props) {
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

  if (
    isUserQueryLoading ||
    user == null ||
    isOrganizationQueryLoading ||
    organization == null
  ) {
    return <PageLoading />;
  }

  const status = userStatuses[user.status];
  const isOrganizationBarunCorp =
    organization.organizationType.toUpperCase() === "ADMINISTRATION";
  const isContractor = user.isVendor;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/users", name: "Users" },
          {
            href: `/system-management/users/${userId}}`,
            name: user.fullName,
          },
        ]}
      />
      <div className="space-y-6">
        <section>
          <UserForm user={user} organization={organization} />
        </section>
        <CollapsibleSection
          title="Status"
          action={<StatusSectionHeaderAction user={user} />}
        >
          <div className="flex h-10 px-3 py-2 rounded-md text-sm border border-input bg-background flex-1">
            <div className="flex items-center flex-1 gap-2">
              <status.Icon className={`w-4 h-4 ${status.color}`} />
              <span>{status.value}</span>
            </div>
          </div>
        </CollapsibleSection>
        {isOrganizationBarunCorp && (
          <CollapsibleSection title="Department">
            <DepartmentForm user={user} />
          </CollapsibleSection>
        )}
        {(isContractor || isOrganizationBarunCorp) && (
          <>
            <CollapsibleSection title="Position">
              <PositionForm positionId={user.position?.id ?? ""} />
            </CollapsibleSection>
            <CollapsibleSection title="Licenses" action={<NewLicenseDialog />}>
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
