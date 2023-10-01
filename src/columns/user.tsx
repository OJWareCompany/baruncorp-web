import { createColumnHelper } from "@tanstack/react-table";

export interface UserTableRowData {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  organization: string;
}

const columnHelper = createColumnHelper<UserTableRowData>();

export const userTableColumns = [
  columnHelper.accessor("organization", {
    header: "Organization",
    size: 200,
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
  columnHelper.accessor("email", {
    header: "Email",
    size: 200,
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
    size: 200,
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
  columnHelper.accessor("phoneNumber", {
    header: "Phone Number",
    size: 200,
    cell: ({ getValue, column }) => {
      const value = getValue();

      if (value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return (
        <p
          className={`w-[${
            column.getSize() - 32
          }px] whitespace-nowrap overflow-hidden text-ellipsis`}
        >
          {value}
        </p>
      );
    },
  }),
];
