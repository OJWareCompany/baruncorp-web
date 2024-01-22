"use client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PtoPaginatedResponseDto } from "@/api";
import { Checkbox } from "@/components/ui/checkbox";

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
    cell: ({ getValue }) => <Checkbox checked={getValue()} />,
  }),
];

interface Props {
  items: PtoPaginatedResponseDto["items"];
}

export default function PreviousTable({ items }: Props) {
  const table = useReactTable({
    data: items,
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
