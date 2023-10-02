import { createColumnHelper } from "@tanstack/react-table";
import { AhjNoteHistoryPaginatedResponseDto } from "@/api";
import { formatDateTime } from "@/lib/utils";

const columnHelper =
  createColumnHelper<AhjNoteHistoryPaginatedResponseDto["items"][number]>();

export const ahjNoteHistoryColumns = [
  columnHelper.accessor("updatedBy", {
    header: "Modified By",
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
    header: "Date Modified",
    size: 400,
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

interface AhjNoteHistoryTableExportData {
  [index: string]: unknown;
  "Modified By": string;
  "Date Modified": string;
}

export function getAhjNoteHistoryTableExportDataFromAhjNoteHistories(
  ahjNoteHistories: AhjNoteHistoryPaginatedResponseDto | undefined
): AhjNoteHistoryTableExportData[] | undefined {
  return ahjNoteHistories?.items.map<AhjNoteHistoryTableExportData>(
    (value) => ({
      "Modified By": value.updatedBy,
      "Date Modified": formatDateTime(value.updatedAt),
    })
  );
}
