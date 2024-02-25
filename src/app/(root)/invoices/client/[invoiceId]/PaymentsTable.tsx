import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { InvoiceResponseDto } from "@/api/api-spec";
import { AffixInput } from "@/components/AffixInput";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import { formatInEST } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const columnHelper =
  createColumnHelper<InvoiceResponseDto["payments"][number]>();

interface Props {
  clientInvoice: InvoiceResponseDto;
}

export default function PaymentsTable({ clientInvoice }: Props) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("paymentMethod", {
        header: "Payment Method",
      }),
      columnHelper.accessor((row) => `$${row.amount}`, {
        header: "Amount",
      }),
      columnHelper.accessor("notes", {
        header: "Notes",
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null || value === "") {
            return <p className="text-muted-foreground">-</p>;
          }

          return value;
        },
      }),
      columnHelper.accessor("paymentDate", {
        header: "Payment Date",
        cell: ({ getValue }) => formatInEST(getValue()),
      }),
      columnHelper.accessor("canceledAt", {
        header: "Date Canceled",
        cell: ({ getValue, column }) => {
          const value = getValue();

          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return formatInEST(value);
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: clientInvoice.payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
  });

  return (
    <div className="flex flex-col gap-2">
      <Item>
        <Label>Total</Label>
        <AffixInput
          prefixElement={<span className="text-muted-foreground">$</span>}
          value={clientInvoice.totalOfPayment}
          disabled
        />
      </Item>
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
