import React, { useMemo, useState } from "react";
import { PaginationState } from "@tanstack/react-table";
import PaginatedTable from "../table/PaginatedTable";
import usePaginatedAhjNoteHistoriesQuery from "@/queries/usePaginatedAhjNoteHistoriesQuery";
import {
  ahjNoteHistoryColumns,
  getAhjNoteHistoryTableExportDataFromAhjNoteHistories,
} from "@/columns/ahjNoteHistory";

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
  const ahjNoteHistoryTableExportData = useMemo(
    () =>
      getAhjNoteHistoryTableExportDataFromAhjNoteHistories(ahjNoteHistories),
    [ahjNoteHistories]
  );

  return (
    <PaginatedTable
      columns={ahjNoteHistoryColumns}
      data={ahjNoteHistories?.items ?? []}
      exportData={ahjNoteHistoryTableExportData ?? []}
      exportFileName="AHJ Note Histories"
      onPaginationChange={setPagination}
      pageCount={ahjNoteHistories?.totalPage ?? -1}
      pagination={pagination}
      onRowClick={onRowClick}
      getRowId={({ id }) => String(id)}
    />
  );
}
