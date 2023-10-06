import { createColumnHelper } from "@tanstack/react-table";
import { OrganizationPaginatedResponseDto } from "@/api";

const columnHelper =
  createColumnHelper<OrganizationPaginatedResponseDto["items"][number]>();

export const organizationColumns = [
  columnHelper.accessor("name", {
    header: "Name",
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
  columnHelper.accessor("fullAddress", {
    header: "Address",
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
  columnHelper.accessor("email", {
    header: "Email Address to Receive Invoice",
    size: 300,
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
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
];

interface OrganizationTableExportData {
  [index: string]: unknown;
  Name: string;
  Address: string;
  "Email Address to Receive Invoice": string;
  "Phone Number": string;
}

export function getOrganizationTableExportDataFromOrganizations(
  organizations: OrganizationPaginatedResponseDto | undefined
): OrganizationTableExportData[] | undefined {
  return organizations?.items.map<OrganizationTableExportData>((value) => ({
    Name: value.name,
    Address: value.fullAddress,
    "Email Address to Receive Invoice": value.email ?? "-",
    "Phone Number": value.phoneNumber ?? "-",
  }));
}
