import { format } from "date-fns";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { ArrowDownToLine } from "lucide-react";
import { useMemo } from "react";
import { getLineItemsTableExportDataFromLineItems } from "./JobsTable";
import { Button } from "@/components/ui/button";
import { InvoiceResponseDto } from "@/api/api-spec";

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
        const lineItems = getLineItemsTableExportDataFromLineItems(
          clientInvoice.lineItems
        );
        const formattedLineItems = lineItems.map((item) => ({
          ...item,
          // 필요한 경우 각 필드를 적절히 변환
        }));
        const csv = generateCsv(csvConfig)(formattedLineItems);
        download(csvConfig)(csv);
      }}
    >
      <ArrowDownToLine className="mr-2 h-4 w-4" />
      Download CSV
    </Button>
  );
}
