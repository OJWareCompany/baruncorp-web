"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { initialPagination } from "./constants";
import PageHeader from "@/components/PageHeader";
import PaginatedTable from "@/components/table/PaginatedTable";
import usePagination from "@/hook/usePagination";
import usePaginatedAhjNotesQuery from "@/queries/usePaginatedAhjNotesQuery";
import {
  ahjNoteColumns,
  getAhjNoteTableExportDataFromAhjNotes,
} from "@/columns/ahjNote";
import PageLoading from "@/components/PageLoading";

const title = "AHJ Notes";

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
  const { data: ahjNotes, isLoading: isAhjNotesQueryLoading } =
    usePaginatedAhjNotesQuery({
      pagination,
    });

  /**
   * Table
   */
  const ahjNoteTableExportData = useMemo(
    () => getAhjNoteTableExportDataFromAhjNotes(ahjNotes),
    [ahjNotes]
  );

  if (isAhjNotesQueryLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/ahj-notes", name: title }]}
        title={title}
      />
      <PaginatedTable
        columns={ahjNoteColumns}
        data={ahjNotes?.items ?? []}
        exportData={ahjNoteTableExportData ?? []}
        exportFileName={title}
        pageCount={ahjNotes?.totalPage ?? -1}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(id) => {
          router.push(`/system-management/ahj-notes/${id}`);
        }}
        getRowId={({ geoId }) => geoId}
      />
    </div>
  );
}
