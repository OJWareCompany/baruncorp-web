import ClientInvoicesTable from "./ClientInvoicesTable";
import NewClientInvoiceSheet from "./NewClientInvoiceSheet";
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
      <ClientInvoicesTable />
    </div>
  );
}
