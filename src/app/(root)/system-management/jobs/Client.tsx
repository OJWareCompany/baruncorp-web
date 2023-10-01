"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { initialPagination } from "./constants";
import { JobPaginatedResponseDto } from "@/api";
import usePagination from "@/hook/usePagination";
import usePaginatedJobsQuery from "@/queries/usePaginatedJobsQuery";
import PaginatedTable from "@/components/table/PaginatedTable";
import PageHeader from "@/components/PageHeader";
import {
  getJobTableExportDataFromJobs,
  jobPaginatedColumns,
} from "@/columns/job";

interface Props {
  initialJobs: JobPaginatedResponseDto | null;
}

export default function Client({ initialJobs }: Props) {
  const title = "Jobs";
  const router = useRouter();

  /**
   * State
   */
  const [pagination, setPagination] = usePagination(
    initialPagination.pageIndex,
    initialPagination.pageSize
  );

  /**
   * Query
   */
  const { data: jobs } = usePaginatedJobsQuery({
    pagination,
    initialData: initialJobs,
  });

  /**
   * Table
   */
  const jobTableExportData = useMemo(
    () => getJobTableExportDataFromJobs(jobs),
    [jobs]
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/jobs", name: title }]}
        title={title}
      />
      <PaginatedTable
        columns={jobPaginatedColumns}
        data={jobs?.items ?? []}
        exportData={jobTableExportData ?? []}
        exportFileName={title}
        pageCount={jobs?.totalPage ?? -1}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(id) => {
          router.push(`/system-management/jobs/${id}`);
        }}
        getRowId={({ id }) => id}
      />
    </div>
  );
}
