"use client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { endOfDay, format, isWithinInterval, startOfDay } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PtoPaginatedResponseDto } from "@/api/api-spec";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const columnHelper =
  createColumnHelper<PtoPaginatedResponseDto["items"][number]>();

const columns = [
  columnHelper.accessor(
    (row) =>
      `${format(new Date(row.startedAt), "MM-dd-yyyy")} ~ ${format(
        new Date(row.endedAt),
        "MM-dd-yyyy"
      )}`,
    {
      header: "Period",
    }
  ),
  columnHelper.accessor("tenure", {
    header: "Tenure (Year)",
  }),
  columnHelper.accessor("total", {
    header: "Total PTO (Days)",
  }),
  columnHelper.accessor("availablePto", {
    header: "Unused PTO (Days)",
  }),
  columnHelper.accessor((row) => row.total - row.availablePto, {
    header: "Used PTO (Days)",
  }),
  columnHelper.accessor("isPaid", {
    header: "Paid",
    cell: ({ getValue }) => (
      <div className="flex">
        <Checkbox checked={getValue()} />
      </div>
    ),
  }),
];

interface Props {
  ptos: PtoPaginatedResponseDto;
}

export default function HistoryTable({ ptos }: Props) {
  const table = useReactTable({
    data: ptos.items,
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
                className={cn(
                  isWithinInterval(new Date(), {
                    start: startOfDay(new Date(row.original.startedAt)),
                    end: endOfDay(new Date(row.original.endedAt)),
                  }) && "bg-muted/50"
                )}
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
