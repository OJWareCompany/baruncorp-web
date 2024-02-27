import VendorInvoiceDetailPage from "@/components/vendor-invoice-detail-page/VendorInvoiceDetailPage";

interface Props {
  params: {
    invoiceId: string;
  };
}

export default function Page({ params: { invoiceId } }: Props) {
  return (
    <VendorInvoiceDetailPage vendorInvoiceId={invoiceId} pageType="INVOICES" />
  );
}
