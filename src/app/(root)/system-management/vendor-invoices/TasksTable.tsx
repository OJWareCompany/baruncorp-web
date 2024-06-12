"use client";
import * as React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VendorInvoiceLineItemPaginatedResponseDto } from "@/api/api-spec";
import { Checkbox } from "@/components/ui/checkbox";
import { formatInEST } from "@/lib/utils";

const columnHelper =
  createColumnHelper<
    VendorInvoiceLineItemPaginatedResponseDto["items"][number]
  >();

const columns = [
  columnHelper.accessor("assigneeName", {
    header: "User",
  }),
  columnHelper.accessor("clientOrganizationName", {
    header: "Client Organization",
  }),
  columnHelper.accessor("jobDescription", {
    header: "Job",
  }),
  columnHelper.accessor("serviceName", {
    header: "Scope",
  }),
  columnHelper.accessor("taskName", {
    header: "Task",
    cell: ({ row, getValue }) => {
      // TODO: replace with serviceId
      if (row.original.serviceName === "Other") {
        return row.original.serviceDescription;
      }

      return getValue();
    },
  }),
  columnHelper.accessor((row) => `$${row.taskExpenseTotal}`, {
    header: "Expense Total",
  }),
  columnHelper.accessor("isRevision", {
    header: "Revision",
    cell: ({ getValue }) => (
      <div className="flex">
        <Checkbox checked={getValue()} />
      </div>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Date Created",
    cell: ({ getValue }) => formatInEST(getValue()),
  }),
  columnHelper.accessor("doneAt", {
    header: "Date Done",
    cell: ({ getValue }) => {
      const value = getValue();

      if (value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return formatInEST(value);
    },
  }),
];

interface Props {
  tasks: VendorInvoiceLineItemPaginatedResponseDto;
}

export default function TasksTable({ tasks }: Props) {
  const table = useReactTable({
    data: tasks.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ taskId }) => taskId,
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
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={uuidv4()}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={uuidv4()}>
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
