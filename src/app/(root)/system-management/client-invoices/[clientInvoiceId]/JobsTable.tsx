"use client";
import * as React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceResponseDto, LineItem } from "@/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import RowItemsContainer from "@/components/RowItemsContainer";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import { AffixInput } from "@/components/AffixInput";
import { formatInEST } from "@/lib/utils";

const columnHelper =
  createColumnHelper<InvoiceResponseDto["lineItems"][number]>();

const columns = [
  columnHelper.accessor("clientOrganization.name", {
    header: "Organization",
  }),
  columnHelper.accessor("description", {
    header: "Description",
  }),
  columnHelper.accessor("propertyType", {
    header: "Property Type",
  }),
  columnHelper.accessor("mountingType", {
    header: "Mounting Type",
  }),
  columnHelper.accessor("billingCodes", {
    header: "Billing Codes",
    cell: ({ getValue, column }) => {
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
    header: "Has Revision Task",
    cell: ({ getValue, column }) => (
      <div className="flex">
        <Checkbox checked={getValue()} />
      </div>
    ),
  }),
  columnHelper.accessor("taskSizeForRevision", {
    header: "Major / Minor",
    cell: ({ getValue, column }) => {
      const value = getValue();

      if (value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return value;
    },
  }),
  columnHelper.accessor("price", {
    header: "Price",
    cell: ({ getValue, column }) => `$${getValue()}`,
  }),
  columnHelper.accessor("pricingType", {
    header: "Pricing Type",
  }),
  columnHelper.accessor("state", {
    header: "State",
  }),
  columnHelper.accessor("dateSentToClient", {
    header: "Date Sent to Client (EST)",
    cell: ({ getValue }) => formatInEST(getValue()),
  }),
  columnHelper.accessor("taskSubtotal", {
    header: "Subtotal",
  }),
];

interface LineItemTableExportData {
  [index: string]: unknown;
  Organization: string;
  Description: string;
  "Property Type": string;
  "Mounting Type": string;
  "Billing Codes": string;
  "Has Revision Task": boolean;
  "Major / Minor": string;
  Price: string;
  "Pricing Type": string;
  State: string;
  "Date Sent to Client": string;
  Subtotal: string;
}

export function getLineItemTableExportDataFromLineItem(
  lineItem: LineItem[]
): LineItemTableExportData[] {
  return lineItem.map<LineItemTableExportData>((value) => ({
    Organization: value.clientOrganization.name,
    Description: value.description,
    "Property Type": value.propertyType,
    "Mounting Type": value.mountingType,
    "Billing Codes": value.billingCodes.map((value) => `(${value})`).join(" "),
    "Has Revision Task": value.isContainsRevisionTask,
    "Major / Minor": value.taskSizeForRevision ?? "-",
    Price: `$${value.price}`,
    "Pricing Type": value.pricingType,
    State: value.state,
    "Date Sent to Client": formatInEST(value.dateSentToClient),
    Subtotal: String(value.taskSubtotal),
  }));
}

interface Props {
  clientInvoice: InvoiceResponseDto;
}

export default function JobsTable({ clientInvoice }: Props) {
  const router = useRouter();
  const table = useReactTable({
    data: clientInvoice.lineItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ jobId }) => jobId,
  });

  return (
    <div className="flex flex-col gap-2">
      <RowItemsContainer>
        <Item>
          <Label>Subtotal</Label>
          <AffixInput
            prefixElement={<span className="text-muted-foreground">$</span>}
            value={String(clientInvoice.subtotal)}
            disabled
          />
        </Item>
        <Item>
          <Label>Discount</Label>
          <AffixInput
            prefixElement={<span className="text-muted-foreground">$</span>}
            value={
              clientInvoice.discount ? String(clientInvoice.discount) : "-"
            }
            disabled
          />
        </Item>
        <Item>
          <Label>Total</Label>
          <AffixInput
            prefixElement={<span className="text-muted-foreground">$</span>}
            value={String(clientInvoice.total)}
            disabled
          />
        </Item>
      </RowItemsContainer>
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    router.push(`/system-management/jobs/${row.id}`);
                  }}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
