"use client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plate, PlateContent } from "@udecode/plate-common";
import { FolderOpen } from "lucide-react";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
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
import { openJobNoteFolder } from "@/lib/deeplink";

const columnHelper = createColumnHelper<JobNoteResponseDto["data"][number]>();

interface Props {
  jobNotes: JobNoteResponseDto;
  pageType: PageType;
}

export default function JobNotesTable({ jobNotes, pageType }: Props) {
  const { data: session } = useSession();

  const isBarunCorpMember = session?.isBarunCorpMember ?? false;
  const isHome = pageType === "HOME";

  /**
   * 바른코프 멤버 ✅
   * 바른코프 멤버아닌데, 홈 ❌
   * 바른코프 멤버아닌데, 워크스페이스 ✅
   */
  const notForClient = isBarunCorpMember || !isHome;

  const columns = useMemo(
    () => [
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
      columnHelper.accessor("createdAt", {
        header: "Date Created (EST)",
        cell: ({ getValue }) => formatInEST(getValue()),
      }),
      columnHelper.accessor("fileShareLink", {
        header: "",
        cell: ({ getValue, row }) => {
          const value = getValue();

          if (value == null) {
            return;
          }

          return (
            <div className="text-right">
              <Button
                size={"icon"}
                variant={"ghost"}
                className="h-9 w-9"
                onClick={() => {
                  if (notForClient) {
                    openJobNoteFolder({
                      organization: jobNotes.clientOrganizationName,
                      type: jobNotes.projectType,
                      project: jobNotes.propertyAddress,
                      job: `Job ${jobNotes.jobRequestNumber}`,
                      jobNote: `#${row.original.jobNoteNumber} message`,
                    });
                    return;
                  }

                  window.open(value, "_blank", "noopener,noreferrer");
                }}
              >
                <FolderOpen className="w-4 h-4" />
              </Button>
            </div>
          );
        },
      }),
    ],
    [
      jobNotes.clientOrganizationName,
      jobNotes.jobRequestNumber,
      jobNotes.projectType,
      jobNotes.propertyAddress,
      notForClient,
    ]
  );

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
