"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { initialPagination } from "./constants";
import { JobPaginatedResponseDto } from "@/api";
import usePagination from "@/hook/usePagination";
import { JobTableRowData, jobTableColumns } from "@/columns/job";
import { PaginationTable } from "@/components/table/PaginationTable";
import PageHeader from "@/components/PageHeader";
import usePaginatedMyActiveJobsQuery from "@/queries/usePaginatedMyActiveJobsQuery";

interface Props {
  initialMyActiveJobs: JobPaginatedResponseDto | null;
}

export default function Client({ initialMyActiveJobs }: Props) {
  const router = useRouter();
  const [pagination, setPagination] = usePagination(
    initialPagination.pageIndex,
    initialPagination.pageSize
  );

  const { data: jobs } = usePaginatedMyActiveJobsQuery({
    pagination,
    initialData: initialMyActiveJobs,
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

  const title = "Home";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader items={[{ href: "/", name: title }]} title={title} />
      <section>
        <h4 className="h4 mb-2">My Active Jobs</h4>
        <PaginationTable
          columns={jobTableColumns}
          data={jobTableData ?? []}
          pageCount={jobs?.totalPage ?? -1}
          pagination={pagination}
          onPaginationChange={setPagination}
          onRowClick={(id) => {
            router.push(`/system-management/jobs/${id}`);
          }}
        />
      </section>
    </div>
  );
}
