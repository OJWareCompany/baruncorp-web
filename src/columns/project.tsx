import { createColumnHelper } from "@tanstack/react-table";

export interface ProjectTableRowData {
  id: string;
  organizationName: string;
  propertyFullAddress: string;
  propertyType: string;
  propertyOwnerName: string | null;
  projectNumber: string | null;
  createdAt: string;
  numberOfJobs: number;
}

const columnHelper = createColumnHelper<ProjectTableRowData>();

export const projectTableColumns = [
  columnHelper.accessor("organizationName", {
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
  columnHelper.accessor("propertyFullAddress", {
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
  columnHelper.accessor("propertyType", {
    header: "Property Type",
    size: 150,
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
          className={`w-[${
            column.getSize() - 32
          }px] whitespace-nowrap overflow-hidden text-ellipsis`}
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
          className={`w-[${
            column.getSize() - 32
          }px] whitespace-nowrap overflow-hidden text-ellipsis`}
        >
          {value}
        </p>
      );
    },
  }),
  columnHelper.accessor("numberOfJobs", {
    header: "Number of Jobs",
    size: 150,
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
  columnHelper.accessor("createdAt", {
    header: "Date Created",
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
          {new Intl.DateTimeFormat("en-US", {
            dateStyle: "short",
            timeStyle: "short",
          }).format(new Date(value))}
        </p>
      );
    },
  }),
];
