"use client";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ClientInvoicesTable from "./ClientInvoicesTable";
import OverdueClientInvoicesTable from "./OverdueClientInvoicesTable";
import PageHeader from "@/components/PageHeader";
import CollapsibleSection from "@/components/CollapsibleSection";
import PageLoading from "@/components/PageLoading";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TypeEnum = z.enum(["Client", "Vendor"]);
type TypeEnum = z.infer<typeof TypeEnum>;

export default function Page() {
  const { data: session } = useSession();
  const { data: organization, isLoading: isOrganizationQueryLoading } =
    useOrganizationQuery(session?.organizationId ?? "");
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
        <ClientInvoicesTable
          type="Issued"
          organizationId={session.organizationId}
        />
      </CollapsibleSection>
      <CollapsibleSection title="Overdue">
        <OverdueClientInvoicesTable organizationId={session.organizationId} />
      </CollapsibleSection>
      <CollapsibleSection title="Paid">
        <ClientInvoicesTable
          type="Paid"
          organizationId={session.organizationId}
        />
      </CollapsibleSection>
    </>
  );

  // const vendorInvoices = <>🚧 Work In Progress 🚧</>;

  // if (organization.isVendor) {
  //   const typeSearchParamParseResult = TypeEnum.safeParse(
  //     searchParams.get("type")
  //   );
  //   const typeSearchParam = typeSearchParamParseResult.success
  //     ? typeSearchParamParseResult.data
  //     : TypeEnum.Values.Client;

  //   return (
  //     <div className="flex flex-col">
  //       {pageHeader}
  //       <Tabs
  //         value={typeSearchParam}
  //         onValueChange={(value) => {
  //           const newSearchParams = new URLSearchParams(searchParams);
  //           newSearchParams.set("type", value);
  //           router.replace(`${pathname}?${newSearchParams.toString()}`, {
  //             scroll: false,
  //           });
  //         }}
  //       >
  //         <TabsList>
  //           {TypeEnum.options.map((value) => (
  //             <TabsTrigger key={value} value={value}>
  //               {value}
  //             </TabsTrigger>
  //           ))}
  //         </TabsList>
  //         <TabsContent value={TypeEnum.Values.Client}>
  //           <div className="mt-4">{clientInvoices}</div>
  //         </TabsContent>
  //         <TabsContent value={TypeEnum.Values.Vendor}>
  //           <div className="mt-4">{vendorInvoices}</div>
  //         </TabsContent>
  //       </Tabs>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-4">
      {pageHeader}
      <div className="space-y-6">{clientInvoices}</div>
    </div>
  );
}
