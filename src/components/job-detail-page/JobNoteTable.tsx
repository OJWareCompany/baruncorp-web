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

function debugBase64(base64URL: string) {
  window
    .open()
    ?.document.write(
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

          if (content.includes("data:image")) {
            const imageDataRegex =
              /(\w+\.\w+)\n(\[data:image\/[^;]+;base64,[^\]]+\])/g;
            const errorIconRegex =
              /(Error Icon)\n(\[data:image\/[^;]+;base64,[^\]]+\])/g;

            let replacedContent = content;

            let match;
            const images: Array<{
              id: string;
              filename: string;
              imageData: string;
            }> = [];

            const imageIdSet = new Set<string>();
            let imageIdIndex = 0;
            while (
              (match = imageDataRegex.exec(content)) !== null ||
              (match = errorIconRegex.exec(content)) !== null
            ) {
              const [_, filename, imageData] = match;
              const strIndex = String(imageIdIndex).padStart(2, "0");
              const imageId = `#${strIndex}__${filename}`;
              imageIdSet.add(imageId);
              images.push({
                id: imageId,
                filename,
                imageData,
              });
              imageIdIndex++;
            }

            images.forEach((image) => {
              const target = `${image.filename}\n${image.imageData}`;
              replacedContent = replacedContent.replace(target, image.id);
            });

            const editorValue = getEditorValue(replacedContent);
            for (let i = 0; i < editorValue.length; i++) {
              const value = editorValue[i];
              const imageId = value.children[0].text;
              if (typeof imageId === "string" && imageIdSet.has(imageId)) {
                const found = images.find((image) => image.id === imageId);
                if (!found) continue;

                const imageData = found.imageData.replace(/^\[|\]$/g, "");
                const url = new URL(window.location.href);
                const dummyDomain = `${url.protocol}//${url.host}`;

                editorValue[i] = {
                  type: "a",
                  url: dummyDomain, // dummy
                  children: [
                    {
                      text: found.filename,
                    },
                  ],
                  onClick: (event: any) => {
                    event.preventDefault();
                    debugBase64(imageData);
                  },
                };
              }
            }

            return (
              <div>
                <Plate
                  plugins={mentionEditorPlugins}
                  readOnly
                  value={editorValue}
                >
                  <PlateContent />
                </Plate>
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
