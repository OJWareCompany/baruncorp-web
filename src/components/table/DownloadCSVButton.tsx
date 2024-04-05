// import { download, generateCsv, mkConfig } from "export-to-csv";
// import { ArrowDownToLine } from "lucide-react";
// import { useMemo } from "react";
// import { Button } from "@/components/ui/button";
// import { getItemsTableExportDataFromLineItems } from "@/app/(root)/JobsTableForMember";
// import { JobPaginatedResponseDto } from "@/api/api-spec";

// interface Props {
//   jobsTable: JobPaginatedResponseDto;
// }

// export default function DownloadCSVButton({ jobsTable }: Props) {
//   const csvConfig = useMemo(() => {
//     return mkConfig({
//       useKeysAsHeaders: true,
//       filename: `${jobsTable.jobName}, `,
//     });
//   }, [jobsTable.jobName]);

//   return (
//     <Button
//       variant={"outline"}
//       size={"sm"}
//       className="h-[28px] text-xs px-2"
//       onClick={() => {
//         const csv = generateCsv(csvConfig)(
//           getItemsTableExportDataFromLineItems(jobsTable)
//         );
//         download(csvConfig)(csv);
//       }}
//     >
//       <ArrowDownToLine className="mr-2 h-4 w-4" />
//       Download CSV
//     </Button>
//   );
// }
