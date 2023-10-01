import { AhjNotePaginatedResponseDto } from "@/api";
import { formatDateTime } from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper =
  createColumnHelper<AhjNotePaginatedResponseDto["items"][number]>();

export const ahjNoteColumns = [
  columnHelper.accessor("name", {
    header: "Name",
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
  columnHelper.accessor("fullAhjName", {
    header: "Full Name",
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
  columnHelper.accessor("updatedAt", {
    header: "Date Updated",
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

interface AhjNoteTableExportData {
  [index: string]: unknown;
  Name: string;
  "Full Name": string;
  "Date Updated": string;
}

export function getAhjNoteTableExportDataFromAhjNotes(
  ahjNotes: AhjNotePaginatedResponseDto | undefined
): AhjNoteTableExportData[] | undefined {
  return ahjNotes?.items.map<AhjNoteTableExportData>((value) => ({
    Name: value.name,
    "Full Name": value.fullAhjName,
    "Date Updated": formatDateTime(value.updatedAt),
  }));
}
