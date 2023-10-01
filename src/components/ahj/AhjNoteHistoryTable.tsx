import React, { useMemo, useState } from "react";
import { PaginationState } from "@tanstack/react-table";
import { PaginationTable } from "../table/PaginationTable";
import usePaginatedAhjNoteHistoriesQuery from "@/queries/usePaginatedAhjNoteHistoriesQuery";
import {
  AhjNoteHistoryTableRowData,
  ahjNoteHistoryTableColumns,
} from "@/columns/ahj-note-history";

interface Props {
  geoId: string;
  onRowClick?: (historyId: string) => void;
}

export default function AhjNoteHistoryTable({ geoId, onRowClick }: Props) {
  /**
   * State
   */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  /**
   * Query
   */
  const { data: ahjNoteHistories } = usePaginatedAhjNoteHistoriesQuery({
    geoId,
    pagination,
  });

  /**
   * Table
   */
  const ahjNoteHistoryTableData = useMemo(
    () =>
      ahjNoteHistories?.items.map<AhjNoteHistoryTableRowData>((value) => {
        const { id, updatedAt, updatedBy } = value;

        return {
          id: String(id),
          updatedAt,
          updatedBy,
        };
      }),
    [ahjNoteHistories?.items]
  );

  return (
    <PaginationTable
      columns={ahjNoteHistoryTableColumns}
      data={ahjNoteHistoryTableData ?? []}
      onPaginationChange={setPagination}
      pageCount={ahjNoteHistories?.totalPage ?? -1}
      pagination={pagination}
      onRowClick={onRowClick}
    />
  );
}
