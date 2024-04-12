import { download, generateCsv, mkConfig } from "export-to-csv";
import { ArrowDownToLine } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { getItemsTableExportDataFromLineItems } from "@/app/(root)/JobsTableForMember";
import { JobPaginatedResponseDto } from "@/api/api-spec";
import { cn } from "@/lib/utils";

interface Props {
  data?: JobPaginatedResponseDto;
  className?: string;
  type?: string;
}

export default function DownloadCSVButton({ data, className, type }: Props) {
  const csvConfig = useMemo(() => {
    const filename = type || "All";
    return mkConfig({
      useKeysAsHeaders: true,
      filename: `${filename}`,
    });
  }, [type]);

  return (
    <Button
      variant={"outline"}
      size={"sm"}
      className={(cn("h-[28px] text-xs px-2"), className)}
      onClick={() => {
        const csv = generateCsv(csvConfig)(
          getItemsTableExportDataFromLineItems(data?.items ?? [])
        );
        download(csvConfig)(csv);
      }}
    >
      <ArrowDownToLine className="mr-2 h-4 w-4" />
      Download CSV
    </Button>
  );
}
