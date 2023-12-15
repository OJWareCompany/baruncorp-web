"use client";
import PageHeader from "@/components/PageHeader";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import PageLoading from "@/components/PageLoading";
import useExpensePricingQuery from "@/queries/useExpensePricingQuery";
import useTaskQuery from "@/queries/useTaskQuery";

interface Props {
  params: {
    organizationId: string;
    taskId: string;
  };
}

export default function Page({ params: { organizationId, taskId } }: Props) {
  const { data: organization, isLoading: isOrganizationQueryLoading } =
    useOrganizationQuery(organizationId);
  const { data: expensePricing, isLoading: isExpensePricingQueryLoading } =
    useExpensePricingQuery(organizationId, taskId);
  const { data: task, isLoading: isTaskQueryLoading } = useTaskQuery(
    expensePricing?.taskId ?? ""
  );

  if (
    isOrganizationQueryLoading ||
    organization == null ||
    isExpensePricingQueryLoading ||
    expensePricing == null ||
    isTaskQueryLoading ||
    task == null
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
            href: `/system-management/organizations/${organizationId}/expense-pricings`,
            name: "Expense Pricings",
          },
          {
            href: `/system-management/organizations/${organizationId}/expense-pricings/${taskId}`,
            name: task.name,
          },
        ]}
      />
      {/* <ExpensePricingForm
        expensePricing={expensePricing}
        organization={organization}
      /> */}
    </div>
  );
}
