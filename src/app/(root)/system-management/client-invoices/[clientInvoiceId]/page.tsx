"use client";
import { format } from "date-fns";
import React from "react";
import ClientInvoiceForm from "./ClientInvoiceForm";
import ClientInvoiceStatus from "./ClientInvoiceStatus";
import JobsTable from "./JobsTable";
import PageHeaderAction from "./PageHeaderAction";
import DownloadCSVButton from "./DownloadCSVButton";
import PaymentsTable from "./PaymentsTable";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import useClientInvoiceQuery from "@/queries/useClientInvoiceQuery";
import useNotFound from "@/hook/useNotFound";
import PageLoading from "@/components/PageLoading";
import PageHeader from "@/components/PageHeader";

interface Props {
  params: {
    clientInvoiceId: string;
  };
}

export default function Page({ params: { clientInvoiceId } }: Props) {
  const {
    data: clientInvoice,
    isLoading: isClientInvoiceQueryLoading,
    error: clientInvoiceQueryError,
  } = useClientInvoiceQuery(clientInvoiceId);
  const {
    data: organization,
    isLoading: isOrganizationQueryLoading,
    error: organizationQueryError,
  } = useOrganizationQuery(clientInvoice?.clientOrganization.id ?? "");
  useNotFound(clientInvoiceQueryError);
  useNotFound(organizationQueryError);

  if (
    isClientInvoiceQueryLoading ||
    clientInvoice == null ||
    isOrganizationQueryLoading ||
    organization == null
  ) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          {
            href: "/system-management/client-invoices",
            name: "Client Invoices",
          },
          {
            href: `/system-management/client-invoices/${clientInvoiceId}}`,
            name: `${clientInvoice.clientOrganization.name}, ${format(
              new Date(clientInvoice.servicePeriodDate.slice(0, 7)),
              "MMM yyyy"
            )}`,
          },
        ]}
        action={
          <PageHeaderAction
            clientInvoice={clientInvoice}
            organization={organization}
          />
        }
      />
      <div className="space-y-6">
        <section>
          <ClientInvoiceForm clientInvoice={clientInvoice} />
        </section>
        <section className="space-y-2">
          <h2 className="h4">Status</h2>
          <ClientInvoiceStatus
            organization={organization}
            clientInvoice={clientInvoice}
          />
        </section>
        {clientInvoice.status !== "Unissued" && (
          <section>
            <h2 className="h4 mb-2">Payments</h2>
            <PaymentsTable clientInvoice={clientInvoice} />
          </section>
        )}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="h4">Jobs</h2>
            <DownloadCSVButton clientInvoice={clientInvoice} />
          </div>
          <JobsTable clientInvoice={clientInvoice} />
        </section>
      </div>
    </div>
  );
}
