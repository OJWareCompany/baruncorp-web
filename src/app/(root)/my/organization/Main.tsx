"use client";
import OrganizationForm from "./OrganizationForm";
import UsersTable from "./UsersTable";
import CollapsibleSection from "@/components/CollapsibleSection";
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
      <CollapsibleSection title="Users">
        <UsersTable organization={organization} />
      </CollapsibleSection>
    </div>
  );
}
