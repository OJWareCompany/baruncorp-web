import { createColumnHelper } from "@tanstack/react-table";

export interface OrganizationTableRowData {
  id: string;
  name: string;
  address: string;
  phoneNumber: string | null;
  email: string | null;
}

const columnHelper = createColumnHelper<OrganizationTableRowData>();

export const organizationTableColumns = [
  columnHelper.accessor("name", {
    header: "Name",
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
  columnHelper.accessor("address", {
    header: "Address",
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
  columnHelper.accessor("phoneNumber", {
    header: "Phone Number",
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
    header: "Email Address to Receive Invoice",
    size: 300,
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
];
