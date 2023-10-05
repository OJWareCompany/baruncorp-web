"use client";

import * as React from "react";
import {
  ColumnDef,
  TableOptions,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface BaseTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  onRowClick?: (id: string) => void;
  getRowId: TableOptions<TData>["getRowId"];
  exportData?: {
    [k: string]: unknown;
  }[];
  exportFileName?: string;
}

export default function BaseTable<TData>({
  columns,
  data,
  onRowClick,
  getRowId,
  exportData,
  exportFileName,
}: BaseTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  const isEmpty = table.getRowModel().rows.length === 0;

  const csvConfig = React.useMemo(() => {
    if (exportFileName == null) {
      return null;
    }

    return mkConfig({ useKeysAsHeaders: true, filename: exportFileName });
  }, [exportFileName]);

  return (
    <div className="flex flex-col gap-2">
      {exportData && exportData.length !== 0 && csvConfig != null && (
        <Button
          variant={"outline"}
          className="w-full"
          onClick={() => {
            const csv = generateCsv(csvConfig)(exportData);
            download(csvConfig)(csv);
          }}
        >
          Export
        </Button>
      )}
      <div className="rounded-md border overflow-hidden">
        <Table style={isEmpty ? {} : { minWidth: table.getTotalSize() }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!isEmpty ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(onRowClick != null && "cursor-pointer")}
                  onClick={() => {
                    onRowClick?.(row.id);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
