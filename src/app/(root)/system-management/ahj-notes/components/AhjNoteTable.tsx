import React, { memo, useMemo, useState } from "react";
import {
  PaginationState,
  Table as ReactTable,
  RowData,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import DataTable from "@/components/table/DataTable";
import Pagination from "@/components/table/Pagination";
import { initialPagination } from "./constants";
import useAhjNotesQuery from "@/queries/useAhjNotesQuery";
import { AhjNotePaginatedResponseDto } from "@/api";
import { AhjNoteTableRowData, ahjNoteTableColumns } from "@/columns/ahj-note";

interface Props {
  initialAhjNotes: AhjNotePaginatedResponseDto;
}

function AhjNoteTable({ initialAhjNotes }: Props) {
  /**
   * State
   */
  const [pagination, setPagination] =
    useState<PaginationState>(initialPagination);

  /**
   * Query
   */
  const { data: paginatedAhjNotes } = useAhjNotesQuery({
    pagination,
    initialData: initialAhjNotes,
  });

  /**
   * Table
   */
  const ahjNoteTableRowData = useMemo(
    () =>
      paginatedAhjNotes?.items.map<AhjNoteTableRowData>((value) => {
        const { fullAhjName, geoId, name, updatedAt } = value;

        return {
          fullName: fullAhjName,
          geoId,
          name,
          updatedAt,
        };
      }),
    [paginatedAhjNotes?.items]
  );
  const table = useReactTable({
    data: ahjNoteTableRowData ?? [],
    columns: ahjNoteTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.geoId,
    pageCount: paginatedAhjNotes?.totalPage ?? -1,
    onPaginationChange: setPagination,
    manualPagination: true,
    state: {
      pagination,
    },
  });

  return (
    <div className="space-y-4">
      <DataTable table={table} />
      <Pagination table={table} />
    </div>
  );
}

export default memo(AhjNoteTable) as typeof AhjNoteTable;
