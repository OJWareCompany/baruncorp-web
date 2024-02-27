import ClientInvoiceDetailPage from "@/components/client-invoice-detail-page/ClientInvoiceDetailPage";

interface Props {
  params: {
    invoiceId: string;
  };
}

export default function Page({ params: { invoiceId } }: Props) {
  return (
    <ClientInvoiceDetailPage clientInvoiceId={invoiceId} pageType="INVOICES" />
  );
}
