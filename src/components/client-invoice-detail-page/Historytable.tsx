"use client";
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
import { InvoiceResponseDto } from "@/api/api-spec";
import { formatInEST } from "@/lib/utils";
import useClientInvoiceHistoriesQuery from "@/queries/useClientInvoiceHistoriresQuery";

const columnHelper =
  createColumnHelper<InvoiceResponseDto["issueHistory"][number]>();

const columns = [
  columnHelper.accessor((row) => `${row.issuedByUserName}`, {
    header: "Issued By User",
  }),
  columnHelper.accessor((row) => `${row.to}`, {
    header: "To",
  }),
  columnHelper.accessor((row) => `${row.cc.join(", ")}`, {
    header: "Cc",
    cell: ({ getValue }) => {
      const value = getValue();
      if (value == null || value.length === 0) {
        return <p className="text-muted-foreground">-</p>;
      }
      return value;
    },
  }),
  columnHelper.accessor((row) => `${row.issuedAt}`, {
    header: "Issued At",
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
  clientInvoice: InvoiceResponseDto;
}

export default function HistoryTable({ clientInvoice }: Props) {
  const { data, isLoading } = useClientInvoiceHistoriesQuery(clientInvoice.id);

  const table = useReactTable({
    data: data?.issueHistory ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-2">
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
