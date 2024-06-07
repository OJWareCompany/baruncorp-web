"use client";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ClientInvoicesTable from "../system-management/client-invoices/ClientInvoicesTable";
import OverdueClientInvoicesTable from "../system-management/client-invoices/OverdueClientInvoicesTable";
import RootClientInvoicesTable from "./RootClientInvoicesTable";
import RootOverdueClientInvoicesTable from "./RootOverdueClientInvoicesTable";
import VendorInvoicesTable from "./VendorInvoicesTable";
import PageHeader from "@/components/PageHeader";
import CollapsibleSection from "@/components/CollapsibleSection";
import PageLoading from "@/components/PageLoading";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useProfileQuery from "@/queries/useProfileQuery";

const TypeEnum = z.enum(["Client", "Vendor"]);
type TypeEnum = z.infer<typeof TypeEnum>;

export default function Page() {
  const { data: session } = useSession();
  const { data: organization, isLoading: isOrganizationQueryLoading } =
    useOrganizationQuery(session?.organizationId ?? "");
  const { data: profile } = useProfileQuery();
  const management = profile?.departmentName === "Management";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (session == null || isOrganizationQueryLoading || organization == null) {
    return <PageLoading />;
  }

  const pageHeader = (
    <PageHeader
      items={[
        {
          href: "/invoices",
          name: "Invoices",
        },
      ]}
    />
  );

  const clientInvoices = (
    <>
      <CollapsibleSection title="Open (Issued)">
        <RootClientInvoicesTable
          type="Issued"
          organizationId={session.organizationId}
        />
      </CollapsibleSection>
      <CollapsibleSection title="Overdue">
        <RootOverdueClientInvoicesTable
          organizationId={session.organizationId}
        />
      </CollapsibleSection>
      <CollapsibleSection title="Paid">
        <RootClientInvoicesTable
          type="Paid"
          organizationId={session.organizationId}
        />
      </CollapsibleSection>
    </>
  );

  const managementClientInvoices = (
    <>
      <CollapsibleSection title="Open (Issued)">
        <ClientInvoicesTable type="Issued" />
      </CollapsibleSection>
      <CollapsibleSection title="Overdue">
        <OverdueClientInvoicesTable />
      </CollapsibleSection>
      <CollapsibleSection title="Paid">
        <ClientInvoicesTable type="Paid" />
      </CollapsibleSection>
    </>
  );

  const vendorInvoices = (
    <CollapsibleSection title="Open (Issued)">
      <VendorInvoicesTable organizationId={session.organizationId} />
    </CollapsibleSection>
  );

  if (organization.isVendor) {
    const typeSearchParamParseResult = TypeEnum.safeParse(
      searchParams.get("type")
    );
    const typeSearchParam = typeSearchParamParseResult.success
      ? typeSearchParamParseResult.data
      : TypeEnum.Values.Client;

    return (
      <div className="flex flex-col">
        {pageHeader}
        <Tabs
          value={typeSearchParam}
          onValueChange={(value) => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("type", value);
            router.replace(`${pathname}?${newSearchParams.toString()}`, {
              scroll: false,
            });
          }}
        >
          <TabsList>
            {TypeEnum.options.map((value) => (
              <TabsTrigger key={value} value={value}>
                {value}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={TypeEnum.Values.Client}>
            <div className="mt-4">{clientInvoices}</div>
          </TabsContent>
          <TabsContent value={TypeEnum.Values.Vendor}>
            <div className="mt-4">{vendorInvoices}</div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pageHeader}
      <div className="space-y-6">
        {management ? managementClientInvoices : clientInvoices}
      </div>
    </div>
  );
}
