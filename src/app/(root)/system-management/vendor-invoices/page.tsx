import VendorInvoicesTable from "./VendorInvoicesTable";
import NewVendorInvoiceSheet from "./NewVendorInvoiceSheet";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          {
            href: "/system-management/vendor-invoices",
            name: "Vendor Invoices",
          },
        ]}
        action={<NewVendorInvoiceSheet />}
      />
      <VendorInvoicesTable />
    </div>
  );
}
