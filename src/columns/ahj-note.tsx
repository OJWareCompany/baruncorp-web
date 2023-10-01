import { createColumnHelper } from "@tanstack/react-table";

export interface AhjNoteTableRowData {
  id: string;
  name: string;
  fullName: string;
  updatedAt: string;
}

const columnHelper = createColumnHelper<AhjNoteTableRowData>();

export const ahjNoteTableColumns = [
  columnHelper.accessor("name", {
    header: "Name",
    size: 400,
    cell: ({ getValue, column }) => (
      <p
        className={`w-[${
          column.getSize() - 32
        }px] whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("fullName", {
    header: "Full Name",
    size: 400,
    cell: ({ getValue, column }) => (
      <p
        className={`w-[${
          column.getSize() - 32
        }px] whitespace-nowrap overflow-hidden text-ellipsis`}
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
        className={`w-[${
          column.getSize() - 32
        }px] whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {new Intl.DateTimeFormat("en-US", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(getValue()))}
      </p>
    ),
  }),
];
