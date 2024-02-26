"use client";
import OrganizationForm from "./OrganizationForm";
import UsersTable from "./UsersTable";
import NewUserByOrganizationSheet from "./NewUserByOrganizationSheet";
import PageHeaderAction from "./PageHeaderAction";
import NewClientCreditDialog from "./NewClientCreditDialog";
import NewVendorCreditDialog from "./NewVendorCreditDialog";
import ClientCreditHistoriesTable from "./ClientCreditsTable";
import VendorCreditHistoriesTable from "./VendorCreditsTable";
import PageHeader from "@/components/PageHeader";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import CollapsibleSection from "@/components/CollapsibleSection";
import useClientCreditQuery from "@/queries/useClientCreditQuery";
import { AffixInput } from "@/components/AffixInput";
import useVendorCreditQuery from "@/queries/useVendorCreditQuery";

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
  const {
    data: clientCredit,
    isLoading: isClientCreditQueryLoading,
    error: clientCreditQueryError,
  } = useClientCreditQuery(organizationId);
  const {
    data: vendorCredit,
    isLoading: isVendorCreditQueryLoading,
    error: vendorCreditQueryError,
  } = useVendorCreditQuery(organizationId);
  useNotFound(organizationQueryError);
  useNotFound(clientCreditQueryError);
  useNotFound(vendorCreditQueryError);

  if (
    isOrganizationQueryLoading ||
    organization == null ||
    isClientCreditQueryLoading ||
    clientCredit == null ||
    isVendorCreditQueryLoading ||
    vendorCredit == null
  ) {
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
        {organization.organizationType !== "administration" && (
          <>
            <CollapsibleSection
              title="Client Credit"
              action={<NewClientCreditDialog organizationId={organizationId} />}
            >
              <AffixInput
                prefixElement={<span className="text-muted-foreground">$</span>}
                value={clientCredit.creditAmount}
                readOnly
              />
              <ClientCreditHistoriesTable organizationId={organizationId} />
            </CollapsibleSection>
            {organization.isVendor && (
              <CollapsibleSection
                title="Vendor Credit"
                action={
                  <NewVendorCreditDialog organizationId={organizationId} />
                }
              >
                <AffixInput
                  prefixElement={
                    <span className="text-muted-foreground">$</span>
                  }
                  value={vendorCredit.creditAmount}
                  readOnly
                />
                <VendorCreditHistoriesTable organizationId={organizationId} />
              </CollapsibleSection>
            )}
          </>
        )}
      </div>
    </div>
  );
}
