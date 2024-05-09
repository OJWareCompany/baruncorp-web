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
import Image from "next/image";
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
import { getEditorValue } from "@/lib/plate-utils";
import { Badge } from "@/components/ui/badge";
import { openJobNoteFolder } from "@/lib/deeplink";
import { getMentionEditorPlugins } from "@/lib/plate/plugins";
import { useProfileContext } from "@/app/(root)/ProfileProvider";

const mentionEditorPlugins = getMentionEditorPlugins("sm");

const columnHelper = createColumnHelper<JobNoteResponseDto["data"][number]>();

interface Props {
  jobNotes: JobNoteResponseDto;
  pageType: JobDetailPageType;
}

export default function JobNotesTable({ jobNotes, pageType }: Props) {
  const { isBarunCorpMember } = useProfileContext();
  const isHome = pageType === "HOME";

  /**
   * 바른코프 멤버 ✅
   * 바른코프 멤버아닌데, 홈 ❌
   * 바른코프 멤버아닌데, 워크스페이스 ✅
   */
  const isWorker = isBarunCorpMember || !isHome;

  const columns = useMemo(
    () => [
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
        cell: ({ getValue }) => {
          const content = getValue();
          if (content.includes("data:image")) {
            return <Image src={content} alt="Image" />;
          } else {
            const imageData = content.replace(/[\[\]]/g, "");

            if (imageData.includes("data:image")) {
              return <Image src={imageData} alt="Image" />;
            } else {
              return (
                <Plate
                  plugins={mentionEditorPlugins}
                  readOnly
                  value={getEditorValue(content)}
                >
                  <PlateContent />
                </Plate>
              );
            }
          }
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Date Created",
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
                className="h-8 w-8"
                onClick={() => {
                  if (isWorker) {
                    openJobNoteFolder({
                      organization: jobNotes.clientOrganizationName,
                      type: jobNotes.projectType,
                      project: jobNotes.propertyAddress,
                      job: `Job ${jobNotes.jobRequestNumber}`,
                      jobNote: `#${row.original.jobNoteNumber} message`,
                      shareLink: row.original.fileShareLink,
                    });
                    return;
                  }

                  window.open(value, "_blank", "noopener,noreferrer");
                }}
              >
                <FolderOpen className="w-3 h-3" />
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
      isWorker,
    ]
  );

  const table = useReactTable({
    data: jobNotes.data,
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map(
                  (cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ),
                  console.log(row.original.content)
                )}
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
