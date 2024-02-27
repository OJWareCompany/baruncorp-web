import ClientInvoiceDetailPage from "@/components/client-invoice-detail-page/ClientInvoiceDetailPage";

interface Props {
  params: {
    clientInvoiceId: string;
  };
}

export default function Page({ params: { clientInvoiceId } }: Props) {
  return (
    <ClientInvoiceDetailPage
      clientInvoiceId={clientInvoiceId}
      pageType="SYSTEM_MANAGEMENT"
    />
  );
}
