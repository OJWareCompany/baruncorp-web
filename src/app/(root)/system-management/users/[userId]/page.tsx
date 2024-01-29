"use client";
import UserForm from "./UserForm";
import NewLicenseDialog from "./NewLicenseDialog";
import LicensesTabs from "./LicensesTabs";
import NewAvailableTaskDialog from "./NewAvailableTaskDialog";
import AvailableTasksTable from "./AvailableTasksTable";
import PositionForm from "./PositionForm";
import StatusSectionHeaderAction from "./StatusSectionHeaderAction";
import PageHeader from "@/components/PageHeader";
import useUserQuery from "@/queries/useUserQuery";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import { BARUNCORP_ORGANIZATION_ID, userStatuses } from "@/lib/constants";
import CollapsibleSection from "@/components/CollapsibleSection";

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
  useNotFound(userQueryError);

  if (isUserQueryLoading || user == null) {
    return <PageLoading />;
  }

  const status = userStatuses[user.status];

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
          <UserForm user={user} />
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
        {(user.isVendor ||
          user.organizationId === BARUNCORP_ORGANIZATION_ID) && (
          <>
            <CollapsibleSection title="Position">
              <PositionForm positionId={user.position?.id ?? ""} />
            </CollapsibleSection>
            <CollapsibleSection title="Licenses" action={<NewLicenseDialog />}>
              <LicensesTabs user={user} />
            </CollapsibleSection>
            <CollapsibleSection
              title="Available Tasks"
              action={<NewAvailableTaskDialog user={user} />}
            >
              <AvailableTasksTable user={user} />
            </CollapsibleSection>
          </>
        )}
      </div>
    </div>
  );
}
