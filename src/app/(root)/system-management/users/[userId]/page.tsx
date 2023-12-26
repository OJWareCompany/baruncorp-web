"use client";
import UserForm from "./UserForm";
import NewLicenseDialog from "./NewLicenseDialog";
import LicensesTabs from "./LicensesTabs";
import NewAvailableTaskDialog from "./NewAvailableTaskDialog";
import AvailableTasksTable from "./AvailableTasksTable";
import PositionForm from "./PositionForm";
import PageHeader from "@/components/PageHeader";
import useUserQuery from "@/queries/useUserQuery";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import { BARUNCORP_ORGANIZATION_ID } from "@/lib/constants";

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
        {(user.isVendor ||
          user.organizationId === BARUNCORP_ORGANIZATION_ID) && (
          <>
            <section className="space-y-2">
              <h2 className="h4">Position</h2>
              <PositionForm positionId={user.position?.id ?? ""} />
            </section>
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="h4">Licenses</h2>
                <NewLicenseDialog />
              </div>
              <LicensesTabs user={user} />
            </section>
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="h4">Available Tasks</h2>
                <NewAvailableTaskDialog user={user} />
              </div>
              <AvailableTasksTable user={user} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
