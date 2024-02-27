"use client";
import { format } from "date-fns";
import React from "react";
import { useSession } from "next-auth/react";
import VendorInvoiceForm from "./VendorInvoiceForm";
import PaymentsTable from "./PaymentsTable";
import PaymentDialog from "./PaymentDialog";
import TasksSection from "./TasksSection";
import PageHeaderAction from "./PageHeaderAction";
import PageHeader from "@/components/PageHeader";
import useVendorInvoiceQuery from "@/queries/useVendorInvoiceQuery";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import CollapsibleSection from "@/components/CollapsibleSection";
import { VendorInvoiceResponseDto } from "@/api/api-spec";

function getPageHeader({
  pageType,
  vendorInvoice,
}: {
  pageType: InvoiceDetailPageType;
  vendorInvoice: VendorInvoiceResponseDto;
}) {
  switch (pageType) {
    case "INVOICES":
      return (
        <PageHeader
          items={[
            {
              href: "/invoices",
              name: "Invoices",
            },
            {
              href: "/invoices?type=Vendor",
              name: "Vendor",
            },
            {
              href: `/invoices/vendor/${vendorInvoice.id}}`,
              name: `${vendorInvoice.organizationName}, ${format(
                new Date(vendorInvoice.serviceMonth.slice(0, 7)),
                "MMM yyyy"
              )}`,
            },
          ]}
          action={<PageHeaderAction vendorInvoice={vendorInvoice} />}
        />
      );
    case "SYSTEM_MANAGEMENT":
      return (
        <PageHeader
          items={[
            {
              href: "/system-management/vendor-invoices",
              name: "Vendor Invoices",
            },
            {
              href: `/system-management/vendor-invoices/${vendorInvoice.id}}`,
              name: `${vendorInvoice.organizationName}, ${format(
                new Date(vendorInvoice.serviceMonth.slice(0, 7)),
                "MMM yyyy"
              )}`,
            },
          ]}
          action={<PageHeaderAction vendorInvoice={vendorInvoice} />}
        />
      );
  }
}

interface Props {
  vendorInvoiceId: string;
  pageType: InvoiceDetailPageType;
}

export default function VendorInvoiceDetailPage({
  vendorInvoiceId,
  pageType,
}: Props) {
  const { data: session } = useSession();

  const isBarunCorpMember = session?.isBarunCorpMember ?? false;

  const {
    data: vendorInvoice,
    isLoading: isVendorInvoiceQueryLoading,
    error: vendorInvoiceQueryError,
  } = useVendorInvoiceQuery(vendorInvoiceId);
  useNotFound(vendorInvoiceQueryError);

  if (isVendorInvoiceQueryLoading || vendorInvoice == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      {getPageHeader({ pageType, vendorInvoice })}
      <div className="space-y-6">
        <section>
          <VendorInvoiceForm vendorInvoice={vendorInvoice} />
        </section>
        <CollapsibleSection
          title="Payments"
          action={
            isBarunCorpMember && <PaymentDialog vendorInvoice={vendorInvoice} />
          }
        >
          <PaymentsTable vendorInvoice={vendorInvoice} />
        </CollapsibleSection>
        <TasksSection vendorInvoice={vendorInvoice} pageType={pageType} />
      </div>
    </div>
  );
}
