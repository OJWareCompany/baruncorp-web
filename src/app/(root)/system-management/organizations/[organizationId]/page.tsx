"use client";
import OrganizationForm from "./OrganizationForm";
import UsersTable from "./UsersTable";
import NewUserByOrganizationSheet from "./NewUserByOrganizationSheet";
import PageHeaderAction from "./PageHeaderAction";
import NewClientCreditDialog from "./NewClientCreditDialog";
import NewVendorCreditDialog from "./NewVendorCreditDialog";
import PageHeader from "@/components/PageHeader";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import CollapsibleSection from "@/components/CollapsibleSection";
import useOrganizationCreditQuery from "@/queries/useOrganizationCreditQuery";
import { AffixInput } from "@/components/AffixInput";
import useOrganizationVendorCreditQuery from "@/queries/useOrganizationVendorCreditQuery";

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
    data: credit,
    isLoading: isCreditQueryLoading,
    error: creditQueryError,
  } = useOrganizationCreditQuery(organizationId);
  const {
    data: vendorCredit,
    isLoading: isVendorCreditQueryLoading,
    error: vendorCreditQueryError,
  } = useOrganizationVendorCreditQuery(organizationId);
  useNotFound(organizationQueryError);
  useNotFound(creditQueryError);
  useNotFound(vendorCreditQueryError);

  if (
    isOrganizationQueryLoading ||
    organization == null ||
    isCreditQueryLoading ||
    credit == null ||
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
        {organization.organizationType !== "administration" && (
          <>
            <CollapsibleSection
              title="Client Credit"
              action={<NewClientCreditDialog organizationId={organizationId} />}
            >
              <AffixInput
                prefixElement={<span className="text-muted-foreground">$</span>}
                value={credit.creditAmount}
                readOnly
              />
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
              </CollapsibleSection>
            )}
          </>
        )}
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
