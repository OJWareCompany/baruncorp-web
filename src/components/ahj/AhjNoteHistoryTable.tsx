import React, { useMemo, useState } from "react";
import {
  PaginationState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { initialPagination } from "./constants";
import AhjNoteHistorySheet from "./AhjNoteHistorySheet";
import DataTable from "@/components/table/DataTable";
import Pagination from "@/components/table/Pagination";
import usePaginatedAhjNoteHistoriesQuery from "@/queries/usePaginatedAhjNoteHistoriesQuery";
import {
  AhjNoteHistoryTableRowData,
  ahjNoteHistoryTableColumns,
} from "@/columns/ahj-note-history";

interface Props {
  geoId: string;
}

export default function AhjNoteHistoryTable({ geoId }: Props) {
  /**
   * State
   */
  const [pagination, setPagination] =
    useState<PaginationState>(initialPagination);
  const [ahjHistorySheetState, setAhjHistorySheetState] = useState<{
    id?: string;
    open: boolean;
  }>({ open: false });

  /**
   * Query
   */
  const { data: paginatedAhjNoteHistories } = usePaginatedAhjNoteHistoriesQuery(
    {
      geoId,
      pagination,
    }
  );

  /**
   * Table
   */
  const ahjNoteHistoryTableRowData = useMemo(
    () =>
      paginatedAhjNoteHistories?.items.map<AhjNoteHistoryTableRowData>(
        (value) => {
          const { id, updatedAt, updatedBy } = value;

          return {
            id: String(id),
            updatedAt,
            updatedBy,
          };
        }
      ),
    [paginatedAhjNoteHistories?.items]
  );
  const table = useReactTable({
    data: ahjNoteHistoryTableRowData ?? [],
    columns: ahjNoteHistoryTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
    pageCount: paginatedAhjNoteHistories?.totalPage ?? -1,
    onPaginationChange: setPagination,
    manualPagination: true,
    state: {
      pagination,
    },
  });

  return (
    <>
      <div className="space-y-4">
        <DataTable
          table={table}
          onRowClick={(historyId) => {
            setAhjHistorySheetState({ open: true, id: historyId });
          }}
        />
        <Pagination table={table} />
      </div>
      <AhjNoteHistorySheet
        {...ahjHistorySheetState}
        onOpenChange={(open) => {
          if (!open) {
            setAhjHistorySheetState({ open });
          }
        }}
      />
    </>
  );
}
