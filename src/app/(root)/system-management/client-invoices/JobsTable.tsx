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

const columnHelper =
  createColumnHelper<JobToInvoiceResponseDto["items"][number]>();

const columns = [
  columnHelper.accessor("clientInfo.clientOrganizationName", {
    header: "Organization",
  }),
  // columnHelper.accessor("", {
  //   header: "Description",
  // }),
  // columnHelper.accessor("propertyType", {
  //   header: "Property Type",
  // }),
  // columnHelper.accessor("mountingType", {
  //   header: "Mounting Type",
  // }),
  // columnHelper.accessor("billingCodes", {
  //   header: "Billing Codes",
  //   cell: ({ getValue }) => {
  //     return (
  //       <div className="flex flex-wrap gap-1">
  //         {getValue().map((value) => (
  //           <Badge key={value} variant={"outline"}>
  //             {value}
  //           </Badge>
  //         ))}
  //       </div>
  //     );
  //   },
  // }),
  // columnHelper.accessor("isContainsRevisionTask", {
  //   header: "Has Revision Task",
  //   cell: ({ getValue }) => (
  //     <div className="flex">
  //       <Checkbox checked={getValue()} />
  //     </div>
  //   ),
  // }),
  // columnHelper.accessor("taskSizeForRevision", {
  //   header: "Major / Minor",
  //   cell: ({ getValue, column }) => {
  //     const value = getValue();

  //     if (value == null) {
  //       return <p className="text-muted-foreground">-</p>;
  //     }

  //     return value;
  //   },
  // }),
  // columnHelper.accessor((row) => `$${row.price}`, {
  //   header: "Price",
  // }),
  // columnHelper.accessor("pricingType", {
  //   header: "Pricing Type",
  // }),
  // columnHelper.accessor("state", {
  //   header: "State",
  // }),
  // columnHelper.accessor("dateSentToClient", {
  //   header: "Date Sent to Client (EST)",
  //   cell: ({ getValue }) => {

  //   },
  // }),
  // columnHelper.accessor("taskSubtotal", {
  //   header: "Subtotal",
  // }),
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
