"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { initialPagination } from "./constants";
import { AhjNotePaginatedResponseDto } from "@/api";
import PaginatedTable from "@/components/table/PaginatedTable";
import usePagination from "@/hook/usePagination";
import usePaginatedAhjNotesQuery from "@/queries/usePaginatedAhjNotesQuery";
import {
  ahjNoteColumns,
  getAhjNoteTableExportDataFromAhjNotes,
} from "@/columns/ahjNote";
import PageHeader from "@/components/PageHeader";
interface Props {
  initialAhjNotes: AhjNotePaginatedResponseDto | null;
}

export default function Client({ initialAhjNotes }: Props) {
  const title = "AHJ Notes";
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
  const { data: ahjNotes } = usePaginatedAhjNotesQuery({
    pagination,
    initialData: initialAhjNotes,
  });

  /**
   * Table
   */
  const ahjNoteTableExportData = useMemo(
    () => getAhjNoteTableExportDataFromAhjNotes(ahjNotes),
    [ahjNotes]
  );

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
