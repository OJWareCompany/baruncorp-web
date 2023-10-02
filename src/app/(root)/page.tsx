"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { initialPagination } from "./constants";
import PageHeader from "@/components/PageHeader";
import usePaginatedMyActiveJobsQuery from "@/queries/usePaginatedMyActiveJobsQuery";
import {
  getJobTableExportDataFromJobs,
  jobPaginatedColumns,
} from "@/columns/job";
import usePagination from "@/hook/usePagination";
import PaginatedTable from "@/components/table/PaginatedTable";
import PageLoading from "@/components/PageLoading";

const title = "Home";
const tableTitle = "My Active Jobs";

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
  const { data: jobs, isLoading: isJobsQueryLoading } =
    usePaginatedMyActiveJobsQuery({
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
      <PageHeader items={[{ href: "/", name: title }]} title={title} />
      <section>
        <h4 className="h4 mb-2">{tableTitle}</h4>
        <PaginatedTable
          columns={jobPaginatedColumns}
          data={jobs?.items ?? []}
          exportData={jobTableExportData ?? []}
          exportFileName={tableTitle}
          pageCount={jobs?.totalPage ?? -1}
          pagination={pagination}
          onPaginationChange={setPagination}
          onRowClick={(id) => {
            router.push(`/system-management/jobs/${id}`);
          }}
          getRowId={({ id }) => id}
        />
      </section>
    </div>
  );
}
