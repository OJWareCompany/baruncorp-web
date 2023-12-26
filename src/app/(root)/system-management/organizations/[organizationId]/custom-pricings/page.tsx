"use client";
import NewCustomPricingSheet from "./NewCustomPricingSheet";
import CustomPricingsTable from "./CustomPricingsTable";
import PageHeader from "@/components/PageHeader";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";

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
          {
            href: `/system-management/organizations/${organizationId}/custom-pricings`,
            name: "Custom Pricings",
          },
        ]}
        action={<NewCustomPricingSheet />}
      />
      <CustomPricingsTable organization={organization} />
    </div>
  );
}
