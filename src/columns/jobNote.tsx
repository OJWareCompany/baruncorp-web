import { createColumnHelper } from "@tanstack/react-table";
import { JobNoteListResponseDto } from "@/api";
import { formatDateTime } from "@/lib/utils";

const columnHelper =
  createColumnHelper<JobNoteListResponseDto["notes"][number]>();

export const jobNoteColumns = [
  columnHelper.accessor("content", {
    header: "Content",
    size: 400,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("commenterName", {
    header: "Commenter",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Date Created",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {formatDateTime(getValue())}
      </p>
    ),
  }),
];
