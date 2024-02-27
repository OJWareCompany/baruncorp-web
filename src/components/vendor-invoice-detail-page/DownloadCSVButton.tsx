import { format } from "date-fns";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { ArrowDownToLine } from "lucide-react";
import { useMemo } from "react";
import { getLineItemsTableExportDataFromLineItems } from "./TasksSection";
import { Button } from "@/components/ui/button";
import {
  VendorInvoiceLineItemResponse,
  VendorInvoiceResponseDto,
} from "@/api/api-spec";

interface Props {
  vendorInvoice: VendorInvoiceResponseDto;
  lineItems: VendorInvoiceLineItemResponse[];
}

export default function DownloadCSVButton({ vendorInvoice, lineItems }: Props) {
  const csvConfig = useMemo(() => {
    return mkConfig({
      useKeysAsHeaders: true,
      filename: `${vendorInvoice.organizationName}, ${format(
        new Date(vendorInvoice.serviceMonth.slice(0, 7)),
        "MMM yyyy"
      )}`,
    });
  }, [vendorInvoice.organizationName, vendorInvoice.serviceMonth]);

  return (
    <Button
      variant={"outline"}
      size={"sm"}
      className="h-[28px] text-xs px-2"
      onClick={() => {
        const csv = generateCsv(csvConfig)(
          getLineItemsTableExportDataFromLineItems(lineItems)
        );
        download(csvConfig)(csv);
      }}
    >
      <ArrowDownToLine className="mr-2 h-4 w-4" />
      Download CSV
    </Button>
  );
}
