import { format } from "date-fns";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { ArrowDownToLine } from "lucide-react";
import { useMemo } from "react";
import { getLineItemTableExportDataFromLineItem } from "./JobsTable";
import { Button } from "@/components/ui/button";
import { InvoiceResponseDto } from "@/api";

interface Props {
  clientInvoice: InvoiceResponseDto;
}

export default function DownloadCSVButton({ clientInvoice }: Props) {
  const csvConfig = useMemo(() => {
    return mkConfig({
      useKeysAsHeaders: true,
      filename: `${clientInvoice.clientOrganization.name}, ${format(
        new Date(clientInvoice.servicePeriodDate.slice(0, 7)),
        "MMM yyyy"
      )}`,
    });
  }, [clientInvoice.clientOrganization.name, clientInvoice.servicePeriodDate]);

  return (
    <Button
      variant={"outline"}
      size={"sm"}
      className="h-[28px] text-xs px-2"
      onClick={() => {
        const csv = generateCsv(csvConfig)(
          getLineItemTableExportDataFromLineItem(clientInvoice.lineItems)
        );
        download(csvConfig)(csv);
      }}
    >
      <ArrowDownToLine className="mr-2 h-4 w-4" />
      Download CSV
    </Button>
  );
}
