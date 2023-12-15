"use client";

import OrganizationForm from "./OrganizationForm";
import UsersTable from "./UsersTable";
import PageLoading from "@/components/PageLoading";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import useProfileQuery from "@/queries/useProfileQuery";

export default function Main() {
  const { data: profile, isLoading: isProfileQueryLoading } = useProfileQuery();
  const { data: organization, isLoading: isOrganizationQueryLoading } =
    useOrganizationQuery(profile?.organizationId ?? "");

  if (
    isProfileQueryLoading ||
    profile == null ||
    isOrganizationQueryLoading ||
    organization == null
  ) {
    return <PageLoading isPageHeaderPlaceholder={false} />;
  }

  return (
    <div className="space-y-6">
      <section>
        <OrganizationForm organization={organization} />
      </section>
      <section className="space-y-2">
        <h2 className="h4">Users</h2>
        <UsersTable organization={organization} />
      </section>
    </div>
  );
}
