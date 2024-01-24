import ClientInvoicesTable from "./ClientInvoicesTable";
import NewClientInvoiceSheet from "./NewClientInvoiceSheet";
import OverdueClientInvoicesTable from "./OverdueClientInvoicesTable";
import ClientsWithOutstandingBalancesTable from "./ClientsWithOutstandingBalancesTable";
import PageHeader from "@/components/PageHeader";

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
      <section>
        <h4 className="h4 mb-2">All</h4>
        <ClientInvoicesTable type="All" />
      </section>
      <section>
        <h4 className="h4 mb-2">Unissued</h4>
        <ClientInvoicesTable type="Unissued" />
      </section>
      <section>
        <h4 className="h4 mb-2">Open (Issued)</h4>
        <ClientInvoicesTable type="Issued" />
      </section>
      <section>
        <h4 className="h4 mb-2">Overdue</h4>
        <OverdueClientInvoicesTable />
      </section>
      <section>
        <h4 className="h4 mb-2">Paid</h4>
        <ClientInvoicesTable type="Paid" />
      </section>
      <section>
        <h4 className="h4 mb-2">Clients With Outstanding Balances</h4>
        <ClientsWithOutstandingBalancesTable />
      </section>
    </div>
  );
}
