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
import { JobToInvoiceResponseDto } from "@/api/api-spec";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatInEST } from "@/lib/utils";

const columnHelper =
  createColumnHelper<JobToInvoiceResponseDto["items"][number]>();

const columns = [
  columnHelper.display({
    header: "#",
    id: "#",
    cell: ({ row }) => row.index + 1,
  }),
  columnHelper.accessor("jobName", {
    header: "Description",
  }),
  columnHelper.accessor("projectPropertyType", {
    header: "Property Type",
  }),
  columnHelper.accessor("billingCodes", {
    header: "Billing Codes",
    cell: ({ getValue }) => {
      return (
        <div className="flex flex-wrap gap-1">
          {getValue().map((value) => (
            <Badge key={value} variant={"outline"}>
              {value}
            </Badge>
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor("isContainsRevisionTask", {
    header: "Contains Revision Task",
    cell: ({ getValue }) => (
      <div className="flex">
        <Checkbox checked={getValue()} />
      </div>
    ),
  }),
  columnHelper.accessor((row) => `$${row.price}`, {
    header: "Price",
  }),
  columnHelper.accessor((row) => `$${row.taskSubtotal}`, {
    header: "Task Subtotal",
  }),
  columnHelper.accessor("pricingType", {
    header: "Pricing Type",
    cell: ({ getValue }) => {
      const value = getValue();

      if (value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return value;
    },
  }),
  columnHelper.accessor("revisionSize", {
    header: "Revision Size",
    cell: ({ getValue }) => {
      const value = getValue();

      if (value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return value;
    },
  }),
  columnHelper.accessor("eeChangeScope", {
    header: "EE Change Scope",
    cell: ({ getValue }) => {
      const value = getValue();

      if (value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return value;
    },
  }),
  columnHelper.accessor("structuralRevisionScope", {
    header: "Structural Revision Scope",
    cell: ({ getValue }) => {
      const value = getValue();

      if (value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return value;
    },
  }),
  columnHelper.accessor("designRevisionScope", {
    header: "Design Revision Scope",
    cell: ({ getValue }) => {
      const value = getValue();

      if (value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return value;
    },
  }),
  columnHelper.accessor("completedCancelledDate", {
    header: "Date Completed/Canceled",
    cell: ({ getValue }) => {
      const value = getValue();

      if (value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return formatInEST(value);
    },
  }),
  columnHelper.accessor("dateSentToClient", {
    header: "Date Sent to Client",
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
  jobs: JobToInvoiceResponseDto;
}

export default function JobsTable({ jobs }: Props) {
  const table = useReactTable({
    data: jobs.items,
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
