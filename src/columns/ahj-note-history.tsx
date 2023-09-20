import { createColumnHelper } from "@tanstack/react-table";

export interface AhjNoteHistoryTableRowData {
  id: string;
  updatedAt: string;
  updatedBy: string;
}

const columnHelper = createColumnHelper<AhjNoteHistoryTableRowData>();

export const ahjNoteHistoryTableColumns = [
  columnHelper.accessor("updatedBy", {
    header: "Modified By",
    size: 400,
    cell: ({ getValue }) => (
      <p className="w-[368px] whitespace-nowrap overflow-hidden text-ellipsis">
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("updatedAt", {
    header: "Date Modified",
    size: 400,
    cell: ({ getValue }) => (
      <p className="w-[168px] whitespace-nowrap overflow-hidden text-ellipsis">
        {new Intl.DateTimeFormat("en-US", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(getValue()))}
      </p>
    ),
  }),
];
