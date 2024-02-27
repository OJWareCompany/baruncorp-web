import { PDFDownloadLink } from "@react-pdf/renderer";
import { ArrowDownToLine } from "lucide-react";
import React from "react";
import { format } from "date-fns";
import ClientInvoiceDocument from "./ClientInvoiceDocument";
import { Button } from "@/components/ui/button";
import {
  InvoiceResponseDto,
  OrganizationResponseDto,
  ServicePaginatedResponseDto,
} from "@/api/api-spec";

interface Props {
  clientInvoice: InvoiceResponseDto;
  organization: OrganizationResponseDto;
  services: ServicePaginatedResponseDto;
}

export default function PageHeaderAction({
  clientInvoice,
  organization,
  services,
}: Props) {
  return (
    <PDFDownloadLink
      document={
        <ClientInvoiceDocument
          clientInvoice={clientInvoice}
          organization={organization}
          services={services}
        />
      }
      fileName={`[Barun Corp] ${
        clientInvoice.clientOrganization.name
      }, ${format(
        new Date(clientInvoice.servicePeriodDate.slice(0, 7)),
        "MMM yyyy"
      )}, Client Invoice.pdf`}
      className="inline-flex"
    >
      {({ blob, url, loading, error }) => (
        <Button
          size={"sm"}
          disabled={loading || error != null || url == null}
          variant={"outline"}
        >
          <ArrowDownToLine className="mr-2 h-4 w-4" />
          <span>Download PDF</span>
        </Button>
      )}
    </PDFDownloadLink>
  );
}
