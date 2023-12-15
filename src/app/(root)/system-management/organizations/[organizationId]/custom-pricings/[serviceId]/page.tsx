"use client";
import CustomPricingForm from "./CustomPricingForm";
import PageHeader from "@/components/PageHeader";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import PageLoading from "@/components/PageLoading";
import useCustomPricingQuery from "@/queries/useCustomPricingQuery";
import useServiceQuery from "@/queries/useServiceQuery";

interface Props {
  params: {
    organizationId: string;
    serviceId: string;
  };
}

export default function Page({ params: { organizationId, serviceId } }: Props) {
  const { data: organization, isLoading: isOrganizationQueryLoading } =
    useOrganizationQuery(organizationId);
  const { data: customPricing, isLoading: isCustomPricingQueryLoading } =
    useCustomPricingQuery(organizationId, serviceId);
  const { data: service, isLoading: isServiceQueryLoading } = useServiceQuery(
    customPricing?.serviceId ?? ""
  );

  if (
    isOrganizationQueryLoading ||
    organization == null ||
    isCustomPricingQueryLoading ||
    customPricing == null ||
    isServiceQueryLoading ||
    service == null
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
          {
            href: `/system-management/organizations/${organizationId}/custom-pricings`,
            name: "Custom Pricings",
          },
          {
            href: `/system-management/organizations/${organizationId}/custom-pricings/${serviceId}`,
            name: service.name,
          },
        ]}
      />
      <CustomPricingForm
        customPricing={customPricing}
        organization={organization}
      />
    </div>
  );
}
