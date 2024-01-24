import ClientInvoicesTable from "./ClientInvoicesTable";
import NewClientInvoiceSheet from "./NewClientInvoiceSheet";
import OverdueClientInvoicesTable from "./OverdueClientInvoicesTable";
import ClientsWithOutstandingBalancesTable from "./ClientsWithOutstandingBalancesTable";
import PageHeader from "@/components/PageHeader";
import CollapsibleSection from "@/components/CollapsibleSection";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          {
            href: "/system-management/client-invoices",
            name: "Client Invoices",
          },
        ]}
        action={<NewClientInvoiceSheet />}
      />
      <CollapsibleSection title="All">
        <ClientInvoicesTable type="All" />
      </CollapsibleSection>
      <CollapsibleSection title="Unissued">
        <ClientInvoicesTable type="Unissued" />
      </CollapsibleSection>
      <CollapsibleSection title="Open (Issued)">
        <ClientInvoicesTable type="Issued" />
      </CollapsibleSection>
      <CollapsibleSection title="Overdue">
        <OverdueClientInvoicesTable />
      </CollapsibleSection>
      <CollapsibleSection title="Paid">
        <ClientInvoicesTable type="Paid" />
      </CollapsibleSection>
      <CollapsibleSection title="Clients With Outstanding Balances">
        <ClientsWithOutstandingBalancesTable />
      </CollapsibleSection>
    </div>
  );
}
