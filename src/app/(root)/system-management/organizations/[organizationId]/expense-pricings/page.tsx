"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ExpensePricingsTable from "./ExpensePricingsTable";
import NewExpensePricingSheet from "./NewExpensePricingSheet";
import PageHeader from "@/components/PageHeader";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import { useToast } from "@/components/ui/use-toast";
// import NewExpensePricingSheet from "./NewExpensePricingSheet";

interface Props {
  params: {
    organizationId: string;
  };
}

export default function Page({ params: { organizationId } }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    data: organization,
    isLoading: isOrganizationQueryLoading,
    error: organizationQueryError,
  } = useOrganizationQuery(organizationId);
  useNotFound(organizationQueryError);

  useEffect(() => {
    if (organization == null) {
      return;
    }

    // 조직이 바른코프이면 튕기게 한다. 바른코프는 expense pricing을 가질 수 없다.
    if (organization.organizationType === "administration") {
      router.push("/");
      toast({
        title: "Invalid access",
        variant: "destructive",
      });
    }
  }, [organization, router, toast]);

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
            href: `/system-management/organizations/${organizationId}/expense-pricings`,
            name: "Expense Pricings",
          },
        ]}
        action={<NewExpensePricingSheet />}
      />
      <ExpensePricingsTable organization={organization} />
    </div>
  );
}
