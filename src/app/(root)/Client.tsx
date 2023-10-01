"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { initialPagination } from "./constants";
import { JobPaginatedResponseDto } from "@/api";
import usePagination from "@/hook/usePagination";
import PaginatedTable from "@/components/table/PaginatedTable";
import PageHeader from "@/components/PageHeader";
import usePaginatedMyActiveJobsQuery from "@/queries/usePaginatedMyActiveJobsQuery";
import {
  getJobTableExportDataFromJobs,
  jobPaginatedColumns,
} from "@/columns/job";

interface Props {
  initialMyActiveJobs: JobPaginatedResponseDto | null;
}

export default function Client({ initialMyActiveJobs }: Props) {
  const title = "Home";
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
  const { data: jobs } = usePaginatedMyActiveJobsQuery({
    pagination,
    initialData: initialMyActiveJobs,
  });

  /**
   * Table
   */
  const jobTableExportData = useMemo(
    () => getJobTableExportDataFromJobs(jobs),
    [jobs]
  );
  const tableTitle = "My Active Jobs";

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
