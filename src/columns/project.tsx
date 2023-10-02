import { createColumnHelper } from "@tanstack/react-table";
import { ProjectPaginatedResponseDto } from "@/api";
import { formatDateTime } from "@/lib/utils";

const columnHelper =
  createColumnHelper<ProjectPaginatedResponseDto["items"][number]>();

export const projectColumns = [
  columnHelper.accessor("organizationName", {
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
  columnHelper.accessor("propertyFullAddress", {
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
  columnHelper.accessor("propertyType", {
    header: "Property Type",
    size: 150,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("propertyOwnerName", {
    header: "Property Owner",
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
  columnHelper.accessor("projectNumber", {
    header: "Project Number",
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
  columnHelper.accessor("totalOfJobs", {
    header: "Number of Jobs",
    size: 150,
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

interface ProjectTableExportData {
  [index: string]: unknown;
  Organization: string;
  Address: string;
  "Property Type": string;
  "Property Owner": string;
  "Project Number": string;
  "Number of Jobs": number;
  "Date Created": string;
}

export function getProjectTableExportDataFromProjects(
  projects: ProjectPaginatedResponseDto | undefined
): ProjectTableExportData[] | undefined {
  return projects?.items.map<ProjectTableExportData>((value) => ({
    Organization: value.organizationName,
    Address: value.propertyFullAddress,
    "Property Type": value.propertyType,
    "Property Owner": value.propertyOwnerName ?? "-",
    "Project Number": value.projectNumber ?? "-",
    "Number of Jobs": value.totalOfJobs,
    "Date Created": formatDateTime(value.createdAt),
  }));
}
