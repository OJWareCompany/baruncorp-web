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

function debugBase64(base64URL: any) {
  var win = window.open();
  win?.document.write(
    '<iframe src="' +
      base64URL +
      '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
  );
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

          // 이미지 데이터가 포함되어 있는지 확인
          if (content.includes("data:image")) {
            const imageDataRegex = /\[data:image\/[^;\]]+\;base64,[^\]]+\]/g;
            const imageDataMatches = Array.from(
              content.matchAll(imageDataRegex)
            );
            let replacedContent = content;

            // 이미지 데이터가 매치된 경우
            imageDataMatches.forEach((imageDataMatch, index) => {
              const imageData = imageDataMatch[0].replace(/^\[|\]$/g, ""); // 대괄호 제거
              const placeholder = `__IMAGE_PLACEHOLDER_${index}__`;
              replacedContent = replacedContent.replace(
                imageDataMatch[0],
                placeholder
              ); // 대괄호 포함된 문자열 대신 placeholder로 대체
            });

            return (
              <div>
                <Plate
                  plugins={mentionEditorPlugins}
                  readOnly
                  value={getEditorValue(replacedContent)}
                >
                  <PlateContent />
                </Plate>
                {imageDataMatches.map((imageDataMatch, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      debugBase64(imageDataMatch[0].replace(/^\[|\]$/g, ""))
                    }
                  >
                    {`__IMAGE_PLACEHOLDER_${index}_`}
                  </button>
                ))}
              </div>
            );
          }

          // 매치되지 않은 경우
          return (
            <Plate
              plugins={mentionEditorPlugins}
              readOnly
              value={getEditorValue(content)}
            >
              <PlateContent />
            </Plate>
          );
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
