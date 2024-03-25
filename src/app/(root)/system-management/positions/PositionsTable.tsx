"use client";
import * as React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PositionPaginatedResponseDto } from "@/api/api-spec";
import usePositionsQuery from "@/queries/usePositionsQuery";
import { Badge } from "@/components/ui/badge";
import NewTabTableRow from "@/components/table/NewTabTableRow";

const columnHelper =
  createColumnHelper<PositionPaginatedResponseDto["items"][number]>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("maxAssignedTasksLimit", {
    header: "Maximum Number of Tasks Held",
  }),
  columnHelper.accessor("tasks", {
    header: "Tasks",
    cell: ({ getValue, column }) => {
      return (
        <div className="flex flex-wrap gap-1">
          {getValue().map((value) => (
            <Badge key={value.taskId} variant={"outline"}>
              {value.taskName}
            </Badge>
          ))}
        </div>
      );
    },
  }),
];

export default function PositionsTable() {
  const router = useRouter();
  const { data, isLoading } = usePositionsQuery({
    limit: Number.MAX_SAFE_INTEGER,
  });

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
  });

  return (
    <div className="rounded-md border overflow-hidden">
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
              <NewTabTableRow
                key={row.id}
                href={`/system-management/positions/${row.id}`}
                data-state={row.getIsSelected() && "selected"}
                className="cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </NewTabTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
