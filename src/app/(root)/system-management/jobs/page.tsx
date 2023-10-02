"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { initialPagination } from "./constants";
import PageHeader from "@/components/PageHeader";
import usePagination from "@/hook/usePagination";
import usePaginatedJobsQuery from "@/queries/usePaginatedJobsQuery";
import PaginatedTable from "@/components/table/PaginatedTable";
import {
  getJobTableExportDataFromJobs,
  jobPaginatedColumns,
} from "@/columns/job";
import PageLoading from "@/components/PageLoading";

const title = "Jobs";

export default function Page() {
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
  const { data: jobs, isLoading: isJobsQueryLoading } = usePaginatedJobsQuery({
    pagination,
  });

  /**
   * Table
   */
  const jobTableExportData = useMemo(
    () => getJobTableExportDataFromJobs(jobs),
    [jobs]
  );

  if (isJobsQueryLoading) {
    return <PageLoading />;
  }

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
        exportFileName="Jobs"
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
