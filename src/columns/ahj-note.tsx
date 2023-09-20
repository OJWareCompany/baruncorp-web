import { createColumnHelper } from "@tanstack/react-table";

export interface AhjNoteTableRowData {
  geoId: string;
  name: string;
  fullName: string;
  updatedAt: string;
}

const columnHelper = createColumnHelper<AhjNoteTableRowData>();

export const ahjNoteTableColumns = [
  columnHelper.accessor("name", {
    header: "Name",
    size: 400,
    cell: ({ getValue }) => (
      <p className="w-[168px] whitespace-nowrap overflow-hidden text-ellipsis">
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("fullName", {
    header: "Full Name",
    size: 400,
    cell: ({ getValue }) => (
      <p className="w-[368px] whitespace-nowrap overflow-hidden text-ellipsis">
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("updatedAt", {
    header: "Date Updated",
    size: 200,
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
