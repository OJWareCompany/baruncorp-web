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
import { InvoiceResponseDto, JobResponseDto } from "@/api/api-spec";
import RowItemsContainer from "@/components/RowItemsContainer";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import { AffixInput } from "@/components/AffixInput";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatInEST } from "@/lib/utils";

const columnHelper =
  createColumnHelper<InvoiceResponseDto["lineItems"][number]>();

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

interface LineItemTableExportData {
  [index: string]: unknown;
  "#": string;
  Description: string;
  "Property Type": string;
  "Billing Codes": string;
  "Contains Revision Task": boolean;
  Price: string;
  "Task Subtotal": string;
  "Pricing Type": string;
  revisionSize: string;
  eeChangeScope: string;
  structuralRevisionScope: string;
  designRevisionScope: string;
  "Date Completed/Canceled": string;
  "Date Sent to Client": string;
}

export function getLineItemsTableExportDataFromLineItems(
  lineItem: JobResponseDto[]
): LineItemTableExportData[] {
  return lineItem.map<LineItemTableExportData>((value, index) => ({
    "#": String(index + 1),
    Description: value.jobName,
    "Property Type": value.projectPropertyType,
    "Billing Codes": value.billingCodes.join(", "),
    "Contains Revision Task": value.isContainsRevisionTask,
    Price: `$${value.price}`,
    "Task Subtotal": `$${value.taskSubtotal}`,
    "Pricing Type": value.pricingType ?? "-",
    revisionSize: value.revisionSize ?? "-",
    eeChangeScope: value.eeChangeScope ?? "-",
    structuralRevisionScope: value.structuralRevisionScope ?? "-",
    designRevisionScope: value.designRevisionScope ?? "-",
    "Date Completed/Canceled": value.completedCancelledDate
      ? formatInEST(value.completedCancelledDate)
      : "-",
    "Date Sent to Client": value.dateSentToClient
      ? formatInEST(value.dateSentToClient)
      : "-",
  }));
}

function getJobDetailUrl({
  pageType,
  jobId,
}: {
  pageType: InvoiceDetailPageType;
  jobId: string;
}) {
  switch (pageType) {
    case "INVOICES":
      return `/jobs/${jobId}`;
    case "SYSTEM_MANAGEMENT":
      return `/system-management/jobs/${jobId}`;
  }
}

interface Props {
  clientInvoice: InvoiceResponseDto;
  pageType: InvoiceDetailPageType;
}

export default function JobsTable({ clientInvoice, pageType }: Props) {
  const router = useRouter();
  const table = useReactTable({
    data: clientInvoice.lineItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
  });

  return (
    <div className="flex flex-col gap-2">
      <RowItemsContainer>
        <Item>
          <Label>Subtotal</Label>
          <AffixInput
            prefixElement={<span className="text-muted-foreground">$</span>}
            value={String(clientInvoice.subtotal)}
            readOnly
          />
        </Item>
        <Item>
          <Label>Discount</Label>
          <AffixInput
            prefixElement={<span className="text-muted-foreground">$</span>}
            value={
              clientInvoice.discount ? String(clientInvoice.discount) : "-"
            }
            readOnly
          />
        </Item>
        <Item>
          <Label>Total</Label>
          <AffixInput
            prefixElement={<span className="text-muted-foreground">$</span>}
            value={String(clientInvoice.total)}
            readOnly
          />
        </Item>
      </RowItemsContainer>
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
                    router.push(getJobDetailUrl({ jobId: row.id, pageType }));
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
