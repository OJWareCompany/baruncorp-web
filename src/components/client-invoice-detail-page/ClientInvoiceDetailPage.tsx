"use client";
import React from "react";
import ClientInvoiceForm from "./ClientInvoiceForm";
import ClientInvoiceStatus from "./ClientInvoiceStatus";
import JobsTable from "./JobsTable";
import PageHeaderAction from "./PageHeaderAction";
import DownloadCSVButton from "./DownloadCSVButton";
import PaymentsTable from "./PaymentsTable";
import PaymentDialog from "./PaymentDialog";
import IssueButton from "./IssueButton";
import HistoryTable from "./HistoryTable";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import useClientInvoiceQuery from "@/queries/useClientInvoiceQuery";
import useNotFound from "@/hook/useNotFound";
import PageLoading from "@/components/PageLoading";
import PageHeader from "@/components/PageHeader";
import CollapsibleSection from "@/components/CollapsibleSection";
import useServicesQuery from "@/queries/useServicesQuery";
import {
  InvoiceResponseDto,
  OrganizationResponseDto,
  ServicePaginatedResponseDto,
} from "@/api/api-spec";
import { useProfileContext } from "@/app/(root)/ProfileProvider";
import { formatInUTCAsMMMYYYY } from "@/lib/utils";

function getPageHeader({
  pageType,
  clientInvoice,
  organization,
  services,
}: {
  pageType: InvoiceDetailPageType;
  clientInvoice: InvoiceResponseDto;
  organization: OrganizationResponseDto;
  services: ServicePaginatedResponseDto;
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
              href: "/invoices?type=Client",
              name: "Client",
            },
            {
              href: `/invoices/client/${clientInvoice.id}}`,
              name: `${
                clientInvoice.clientOrganization.name
              }, ${formatInUTCAsMMMYYYY(clientInvoice.servicePeriodDate)}`,
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
      );
    case "SYSTEM_MANAGEMENT":
      return (
        <PageHeader
          items={[
            {
              href: "/system-management/client-invoices",
              name: "Client Invoices",
            },
            {
              href: `/system-management/client-invoices/${clientInvoice.id}}`,
              name: `${
                clientInvoice.clientOrganization.name
              }, ${formatInUTCAsMMMYYYY(clientInvoice.servicePeriodDate)}`,
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
      );
  }
}

interface Props {
  clientInvoiceId: string;
  pageType: InvoiceDetailPageType;
}

export default function ClientInvoiceDetailPage({
  clientInvoiceId,
  pageType,
}: Props) {
  const { isBarunCorpMember } = useProfileContext();

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
      {getPageHeader({ pageType, clientInvoice, organization, services })}
      <div className="space-y-6">
        <section>
          <ClientInvoiceForm clientInvoice={clientInvoice} />
        </section>
        <CollapsibleSection
          title="Status"
          action={
            isBarunCorpMember && (
              <IssueButton
                organization={organization}
                clientInvoice={clientInvoice}
                services={services}
              />
            )
          }
        >
          <ClientInvoiceStatus clientInvoice={clientInvoice} />
        </CollapsibleSection>
        {clientInvoice.status !== "Unissued" && (
          <CollapsibleSection
            title="Payments"
            action={
              isBarunCorpMember && (
                <PaymentDialog clientInvoice={clientInvoice} />
              )
            }
          >
            <PaymentsTable clientInvoice={clientInvoice} />
          </CollapsibleSection>
        )}
        <CollapsibleSection
          title="Jobs"
          action={<DownloadCSVButton clientInvoice={clientInvoice} />}
        >
          <JobsTable clientInvoice={clientInvoice} pageType={pageType} />
        </CollapsibleSection>
        <CollapsibleSection title="History">
          <HistoryTable clientInvoice={clientInvoice} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
