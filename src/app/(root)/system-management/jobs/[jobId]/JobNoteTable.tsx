"use client";
import * as React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plate, PlateContent } from "@udecode/plate-common";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobNoteResponseDto } from "@/api/api-spec";
import { formatInEST } from "@/lib/utils";
import { mentionEditorPlugins } from "@/lib/plate/plugins";
import { getEditorValue } from "@/lib/plate-utils";
import { Badge } from "@/components/ui/badge";

const columnHelper = createColumnHelper<JobNoteResponseDto["data"][number]>();

const columns = [
  columnHelper.accessor("jobNoteNumber", {
    header: "#",
  }),
  columnHelper.accessor("creatorName", {
    header: "Created By",
  }),
  columnHelper.accessor("senderMail", {
    header: "From",
    cell: ({ row, getValue }) => {
      if (row.original.type === "JobNote") {
        return <p className="text-muted-foreground">-</p>;
      }

      return <Badge variant={"outline"}>{getValue()}</Badge>;
    },
  }),
  columnHelper.accessor("receiverMails", {
    header: "To",
    cell: ({ row, getValue }) => {
      const value = getValue();
      if (row.original.type === "JobNote" || value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return (
        <div className="flex flex-col items-start gap-1">
          {value.map((mail) => (
            <Badge key={mail} variant={"outline"}>
              {mail}
            </Badge>
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor("content", {
    header: "Content",
    cell: ({ getValue }) => (
      <Plate
        plugins={mentionEditorPlugins}
        readOnly
        value={getEditorValue(getValue())}
      >
        <PlateContent />
      </Plate>
    ),
  }),
  columnHelper.accessor("fileShareLink", {
    header: "fileShareLink",
  }),
  // columnHelper.accessor("type", {
  //   header: "type",
  // }),
  columnHelper.accessor("createdAt", {
    header: "Date Created (EST)",
    cell: ({ getValue }) => formatInEST(getValue()),
  }),
];

interface Props {
  jobNotes: JobNoteResponseDto;
}

export default function JobNotesTable({ jobNotes }: Props) {
  const table = useReactTable({
    data: jobNotes.data,
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
          {table.getRowModel().rows?.length ? (
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
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
