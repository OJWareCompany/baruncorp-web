"use client";

import React, { memo, useEffect, useMemo, useState } from "react";
import {
  PaginationState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { initialPagination } from "./constants";


import DataTable from "@/components/table/DataTable";
import Pagination from "@/components/table/Pagination";
import useAhjNotesQuery from "@/queries/useAhjNotesQuery";
import { AhjNotePaginatedResponseDto } from "@/api";
import { AhjNoteTableRowData, ahjNoteTableColumns } from "@/columns/ahj-note";

interface Props {
  initialAhjNotes: AhjNotePaginatedResponseDto;
}

function AhjNoteTable({ initialAhjNotes }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageIndex = searchParams.get("pageIndex");
  const pageSize = searchParams.get("pageSize");

  /**
   * State
   */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: pageIndex ? Number(pageIndex) : initialPagination.pageIndex,
    pageSize: pageSize ? Number(pageSize) : initialPagination.pageSize,
  });

  /**
   * Query
   */
  const { data: paginatedAhjNotes } = useAhjNotesQuery({
    pagination,
    initialData: initialAhjNotes,
  });

  /**
   * useEffect
   */
  useEffect(() => {
    router.push(
      `${pathname}?pageIndex=${pagination.pageIndex}&pageSize=${pagination.pageSize}`
    );
  }, [pagination.pageIndex, pagination.pageSize, pathname, router]);

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
      <DataTable
        table={table}
        onRowClick={(geoId) => {
          router.push(`/system-management/ahj-notes/${geoId}`);
        }}
      />
      <Pagination table={table} />
    </div>
  );
}

export default memo(AhjNoteTable) as typeof AhjNoteTable;
