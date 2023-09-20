import React, { useMemo } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { useRouter } from "next/navigation";
import DataTable from "@/components/table/DataTable";
import { JobResponseDto } from "@/api";
import { JobTableRowData, jobTableColumns } from "@/columns/job";

interface Props {
  jobs: JobResponseDto[];
}

export default function JobTable({ jobs }: Props) {
  const router = useRouter();

  const jobTableData = useMemo(
    () =>
      jobs.map<JobTableRowData>((value) => {
        const {
          id,
          additionalInformationFromClient,
          isExpedited,
          clientInfo: { clientOrganizationName, clientUserName },
          jobRequestNumber,
          jobStatus,
          mountingType,
          orderedTasks,
          propertyFullAddress,
          receivedAt,
        } = value;

        return {
          id: id,
          additionalInformation: additionalInformationFromClient,
          clientUserName,
          organizationName: clientOrganizationName,
          isExpedited,
          jobRequestNumber,
          jobStatus,
          mountingType,
          orderedTasks: orderedTasks.map<
            JobTableRowData["orderedTasks"][number]
          >((value) => {
            const {
              id,
              assignee: { name: assigneeName },
              taskName,
              taskStatus,
            } = value;

            return { id, assigneeName, name: taskName, status: taskStatus };
          }),
          propertyFullAddress,
          receivedAt,
        };
      }),
    [jobs]
  );
  const table = useReactTable({
    data: jobTableData ?? [],
    columns: jobTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
  });

  return (
    <DataTable
      table={table}
      onRowClick={(jobId) => {
        router.push(`/system-management/jobs/${jobId}`);
      }}
    />
  );
}
