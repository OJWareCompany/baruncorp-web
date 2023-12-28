import { PDFDownloadLink } from "@react-pdf/renderer";
import { ArrowDownToLine } from "lucide-react";
import React from "react";
import InvoiceDocument from "./InvoiceDocument";
import { Button } from "@/components/ui/button";
import { InvoiceResponseDto, OrganizationResponseDto } from "@/api";

interface Props {
  clientInvoice: InvoiceResponseDto;
  organization: OrganizationResponseDto;
}

export default function PageHeaderAction({
  clientInvoice,
  organization,
}: Props) {
  return (
    <PDFDownloadLink
      document={
        <InvoiceDocument
          clientInvoice={clientInvoice}
          organization={organization}
        />
      }
      fileName="invoice.pdf"
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
