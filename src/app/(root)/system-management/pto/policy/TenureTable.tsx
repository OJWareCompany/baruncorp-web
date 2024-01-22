"use client";
import * as React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PtoTenurePolicyPaginatedResponseDto } from "@/api";
import usePtoPerTenureQuery from "@/queries/usePtoPerTenureQuery";
import PtoField from "@/components/field/PtoField";

const columnHelper =
  createColumnHelper<PtoTenurePolicyPaginatedResponseDto["items"][number]>();

const columns = [
  columnHelper.accessor("tenure", {
    header: "Tenure (Year)",
  }),
  columnHelper.accessor("total", {
    header: "PTO (Days)",
    cell: ({ row, getValue }) => {
      return <PtoField id={row.id} pto={getValue()} />;
    },
  }),
];

export default function TenureTable() {
  const { data, isLoading } = usePtoPerTenureQuery({
    limit: Number.MAX_SAFE_INTEGER,
  });

  const table = useReactTable({
    data: data?.items.sort((a, b) => a.tenure - b.tenure) ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24">
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
