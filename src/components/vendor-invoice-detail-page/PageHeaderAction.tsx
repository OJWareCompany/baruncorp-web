import { PDFDownloadLink } from "@react-pdf/renderer";
import { ArrowDownToLine, Loader2 } from "lucide-react";
import React from "react";
import VendorInvoiceDocument from "./VendorInvoiceDocument";
import { Button } from "@/components/ui/button";
import { VendorInvoiceResponseDto } from "@/api/api-spec";
import useVendorInvoiceLineItemsQuery from "@/queries/useVendorInvoiceLineItemsQuery";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import { formatInUTCAsMMMYYYY } from "@/lib/utils";

interface Props {
  vendorInvoice: VendorInvoiceResponseDto;
  //   organization: OrganizationResponseDto;
  //   services: ServicePaginatedResponseDto;
}

export default function PageHeaderAction({
  vendorInvoice,
}: //   organization,
//   services,
Props) {
  const { data: lineItems, isLoading: isVendorInvoiceLineItemsQueryLoading } =
    useVendorInvoiceLineItemsQuery(
      { limit: Number.MAX_SAFE_INTEGER, vendorInvoiceId: vendorInvoice.id },
      true
    );
  const { data: organization, isLoading: isOrganizationQueryLoading } =
    useOrganizationQuery(vendorInvoice.organizationId);

  if (
    lineItems == null ||
    isVendorInvoiceLineItemsQueryLoading ||
    organization == null ||
    isOrganizationQueryLoading
  ) {
    return (
      <Button size={"sm"} disabled={true} variant={"outline"}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Download PDF</span>
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={
        <VendorInvoiceDocument
          vendorInvoice={vendorInvoice}
          lineItems={lineItems.items}
          organization={organization}
        />
      }
      fileName={`[Barun Corp] ${
        vendorInvoice.organizationName
      }, ${formatInUTCAsMMMYYYY(
        vendorInvoice.serviceMonth
      )}, Vendor Invoice.pdf`}
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
