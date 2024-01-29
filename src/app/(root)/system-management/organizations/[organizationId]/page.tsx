"use client";
import OrganizationForm from "./OrganizationForm";
import UsersTable from "./UsersTable";
import NewUserByOrganizationSheet from "./NewUserByOrganizationSheet";
import PageHeaderAction from "./PageHeaderAction";
import PageHeader from "@/components/PageHeader";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import CollapsibleSection from "@/components/CollapsibleSection";

interface Props {
  params: {
    organizationId: string;
  };
}

export default function Page({ params: { organizationId } }: Props) {
  const {
    data: organization,
    isLoading: isOrganizationQueryLoading,
    error: organizationQueryError,
  } = useOrganizationQuery(organizationId);
  useNotFound(organizationQueryError);

  if (isOrganizationQueryLoading || organization == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/organizations", name: "Organizations" },
          {
            href: `/system-management/organizations/${organizationId}`,
            name: organization.name,
          },
        ]}
        action={<PageHeaderAction organization={organization} />}
      />
      <div className="space-y-6">
        <section>
          <OrganizationForm organization={organization} />
        </section>
        <CollapsibleSection
          title="Users"
          action={
            <NewUserByOrganizationSheet organizationId={organizationId} />
          }
        >
          <UsersTable organization={organization} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
