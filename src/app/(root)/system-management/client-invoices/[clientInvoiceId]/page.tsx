"use client";
import { format } from "date-fns";
import React from "react";
import ClientInvoiceForm from "./ClientInvoiceForm";
import ClientInvoiceStatus from "./ClientInvoiceStatus";
import JobsTable from "./JobsTable";
import PageHeaderAction from "./PageHeaderAction";
import DownloadCSVButton from "./DownloadCSVButton";
import PaymentsTable from "./PaymentsTable";
import PaymentDialog from "./PaymentDialog";
import IssueButton from "./IssueButton";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import useClientInvoiceQuery from "@/queries/useClientInvoiceQuery";
import useNotFound from "@/hook/useNotFound";
import PageLoading from "@/components/PageLoading";
import PageHeader from "@/components/PageHeader";
import CollapsibleSection from "@/components/CollapsibleSection";
import useServicesQuery from "@/queries/useServicesQuery";

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
  const {
    data: services,
    isLoading: isServicesQueryLoading,
    error: servicesQueryError,
  } = useServicesQuery({
    limit: Number.MAX_SAFE_INTEGER,
  });
  useNotFound(clientInvoiceQueryError);
  useNotFound(organizationQueryError);
  useNotFound(servicesQueryError);

  if (
    isClientInvoiceQueryLoading ||
    clientInvoice == null ||
    isOrganizationQueryLoading ||
    organization == null ||
    isServicesQueryLoading ||
    services == null
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
            services={services}
          />
        }
      />
      <div className="space-y-6">
        <section>
          <ClientInvoiceForm clientInvoice={clientInvoice} />
        </section>
        <CollapsibleSection
          title="Status"
          action={
            <IssueButton
              organization={organization}
              clientInvoice={clientInvoice}
              services={services}
            />
          }
        >
          <ClientInvoiceStatus clientInvoice={clientInvoice} />
        </CollapsibleSection>
        {clientInvoice.status !== "Unissued" && (
          <CollapsibleSection
            title="Payments"
            action={<PaymentDialog organizationId={organization.id} />}
          >
            <PaymentsTable clientInvoice={clientInvoice} />
          </CollapsibleSection>
        )}
        <CollapsibleSection
          title="Jobs"
          action={<DownloadCSVButton clientInvoice={clientInvoice} />}
        >
          <JobsTable clientInvoice={clientInvoice} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
