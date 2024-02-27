import VendorInvoiceDetailPage from "@/components/vendor-invoice-detail-page/VendorInvoiceDetailPage";

interface Props {
  params: {
    vendorInvoiceId: string;
  };
}

export default function Page({ params: { vendorInvoiceId } }: Props) {
  return (
    <VendorInvoiceDetailPage
      vendorInvoiceId={vendorInvoiceId}
      pageType="SYSTEM_MANAGEMENT"
    />
  );
}
