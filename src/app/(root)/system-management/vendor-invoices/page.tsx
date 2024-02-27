import VendorInvoicesTable from "./VendorInvoicesTable";
import NewVendorInvoiceSheet from "./NewVendorInvoiceSheet";
import PageHeader from "@/components/PageHeader";
import CollapsibleSection from "@/components/CollapsibleSection";

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
      <div className="space-y-6">
        <CollapsibleSection title="Open">
          <VendorInvoicesTable />
        </CollapsibleSection>
      </div>
    </div>
  );
}
