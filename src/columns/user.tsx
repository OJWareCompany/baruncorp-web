import { createColumnHelper } from "@tanstack/react-table";
import { UserPaginatedResponseDto } from "@/api";

const columnHelper =
  createColumnHelper<UserPaginatedResponseDto["items"][number]>();

export const userColumns = [
  columnHelper.accessor("organization", {
    header: "Organization",
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
  columnHelper.accessor("email", {
    header: "Email",
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
  columnHelper.accessor("fullName", {
    header: "Full Name",
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
          style={{ width: column.getSize() - 32 }}
          className={`whitespace-nowrap overflow-hidden text-ellipsis`}
        >
          {value}
        </p>
      );
    },
  }),
];

interface UserTableExportData {
  [index: string]: unknown;
  Organization: string;
  Email: string;
  "Full Name": string;
  "Phone Number": string;
}

export function getUserTableExportDataFromUsers(
  users: UserPaginatedResponseDto | undefined
): UserTableExportData[] | undefined {
  return users?.items.map<UserTableExportData>((value) => ({
    Organization: value.organization,
    Email: value.email,
    "Full Name": value.fullName,
    "Phone Number": value.phoneNumber ?? "-",
  }));
}
