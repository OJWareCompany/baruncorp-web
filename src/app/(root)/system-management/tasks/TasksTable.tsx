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
import { TaskPaginatedResponseFields } from "@/api/api-spec";
import useTasksQuery from "@/queries/useTasksQuery";
import { Badge } from "@/components/ui/badge";

const columnHelper = createColumnHelper<TaskPaginatedResponseFields>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("licenseType", {
    header: "License Type",
  }),
  columnHelper.accessor("serviceName", {
    header: "Scope",
  }),
  columnHelper.accessor("taskPositions", {
    header: "Positions",
    cell: ({ getValue }) => {
      return (
        <div className="flex flex-wrap gap-1">
          {getValue().map((value) => (
            <Badge key={value.positionId} variant={"outline"}>
              {value.positionName}
            </Badge>
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor("prerequisiteTask", {
    header: "Prerequisite Tasks",
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

export default function TasksTable() {
  const router = useRouter();
  const { data, isLoading } = useTasksQuery({
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
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => {
                  router.push(`/system-management/tasks/${row.id}`);
                }}
                className="cursor-pointer"
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
