"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { initialPagination } from "./constants";
import { AhjNotePaginatedResponseDto } from "@/api";
import { PaginationTable } from "@/components/table/PaginationTable";
import usePagination from "@/hook/usePagination";
import usePaginatedAhjNotesQuery from "@/queries/usePaginatedAhjNotesQuery";
import { AhjNoteTableRowData, ahjNoteTableColumns } from "@/columns/ahj-note";
import PageHeader from "@/components/PageHeader";
interface Props {
  initialAhjNotes: AhjNotePaginatedResponseDto | null;
}

export default function Client({ initialAhjNotes }: Props) {
  const router = useRouter();
  const [pagination, setPagination] = usePagination(
    initialPagination.pageIndex,
    initialPagination.pageSize
  );

  const { data: ahjNotes } = usePaginatedAhjNotesQuery({
    pagination,
    initialData: initialAhjNotes,
  });

  const ahjNoteTableData = useMemo(
    () =>
      ahjNotes?.items.map<AhjNoteTableRowData>((value) => {
        const { fullAhjName, geoId, name, updatedAt } = value;

        return {
          fullName: fullAhjName,
          id: geoId,
          name,
          updatedAt,
        };
      }),
    [ahjNotes?.items]
  );

  const title = "AHJ Notes";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/ahj-notes", name: title }]}
        title={title}
      />
      <PaginationTable
        columns={ahjNoteTableColumns}
        data={ahjNoteTableData ?? []}
        pageCount={ahjNotes?.totalPage ?? -1}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(id) => {
          router.push(`/system-management/ahj-notes/${id}`);
        }}
      />
    </div>
  );
}
