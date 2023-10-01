"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { initialPagination } from "./constants";
import { JobPaginatedResponseDto } from "@/api";
import usePagination from "@/hook/usePagination";
import usePaginatedJobsQuery from "@/queries/usePaginatedJobsQuery";
import { JobTableRowData, jobTableColumns } from "@/columns/job";
import PaginatedTable from "@/components/table/PaginatedTable";
import PageHeader from "@/components/PageHeader";

interface Props {
  initialJobs: JobPaginatedResponseDto | null;
}

export default function Client({ initialJobs }: Props) {
  const router = useRouter();
  const [pagination, setPagination] = usePagination(
    initialPagination.pageIndex,
    initialPagination.pageSize
  );

  const { data: jobs } = usePaginatedJobsQuery({
    pagination,
    initialData: initialJobs,
  });

  const jobTableData = useMemo(
    () =>
      jobs?.items.map<JobTableRowData>((value) => {
        const {
          id,
          additionalInformationFromClient,
          isExpedited,
          clientInfo: { clientOrganizationName, clientUserName },
          jobRequestNumber,
          jobStatus,
          mountingType,
          assignedTasks,
          propertyFullAddress,
          receivedAt,
        } = value;

        return {
          id,
          additionalInformation: additionalInformationFromClient,
          clientUserName,
          organizationName: clientOrganizationName,
          isExpedited,
          jobRequestNumber,
          jobStatus,
          mountingType,
          tasks: assignedTasks.map<JobTableRowData["tasks"][number]>(
            (value) => {
              const { assignTaskId, assigneeName, status, taskName } = value;

              return { id: assignTaskId, assigneeName, name: taskName, status };
            }
          ),
          propertyFullAddress,
          receivedAt,
        };
      }),
    [jobs?.items]
  );

  const title = "Jobs";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/jobs", name: title }]}
        title={title}
      />
      <PaginatedTable
        columns={jobTableColumns}
        data={jobTableData ?? []}
        pageCount={jobs?.totalPage ?? -1}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(id) => {
          router.push(`/system-management/jobs/${id}`);
        }}
      />
    </div>
  );
}
