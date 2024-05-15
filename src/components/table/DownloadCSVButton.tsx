import { download, generateCsv, mkConfig } from "export-to-csv";
import { ArrowDownToLine } from "lucide-react";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const csvConfig = useMemo(() => {
    const jobStatus = type || "All";
    let pageName = pathname;
    if (pathname === "/") {
      pageName = "home";
    } else if (pathname === "/system-management/jobs") {
      pageName = "jobs";
    }
    return mkConfig({
      useKeysAsHeaders: true,
      filename: `${pageName}-${jobStatus}`,
    });
  }, [pathname, type]);

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
      <ArrowDownToLine className="mr-2 h-3 w-3" />
      Download CSV
    </Button>
  );
}
