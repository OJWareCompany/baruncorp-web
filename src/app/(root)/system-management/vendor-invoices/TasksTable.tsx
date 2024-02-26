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

const columnHelper =
  createColumnHelper<
    VendorInvoiceLineItemPaginatedResponseDto["items"][number]
  >();

const columns = [
  columnHelper.accessor("assigneeName", {
    header: "assigneeName",
  }),
  columnHelper.accessor("clientOrganizationName", {
    header: "clientOrganizationName",
  }),
  columnHelper.accessor("createdAt", {
    header: "createdAt",
  }),
  columnHelper.accessor("doneAt", {
    header: "doneAt",
  }),
  columnHelper.accessor("isRevision", {
    header: "isRevision",
  }),
  columnHelper.accessor("jobDescription", {
    header: "jobDescription",
  }),
  columnHelper.accessor("projectId", {
    header: "projectId",
  }),
  columnHelper.accessor("projectNumber", {
    header: "projectNumber",
  }),
  columnHelper.accessor("propertyOwnerName", {
    header: "propertyOwnerName",
  }),
  columnHelper.accessor("serviceDescription", {
    header: "serviceDescription",
  }),
  columnHelper.accessor("serviceName", {
    header: "serviceName",
  }),
  columnHelper.accessor("taskExpenseTotal", {
    header: "taskExpenseTotal",
  }),
  columnHelper.accessor("taskId", {
    header: "taskId",
  }),
  columnHelper.accessor("vendorInvoiceId", {
    header: "vendorInvoiceId",
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
