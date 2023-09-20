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
    cell: ({ getValue }) => (
      <p className="w-[168px] whitespace-nowrap overflow-hidden text-ellipsis">
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("propertyFullAddress", {
    header: "Address",
    size: 400,
    cell: ({ getValue }) => (
      <p className="w-[368px] whitespace-nowrap overflow-hidden text-ellipsis">
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("propertyType", {
    header: "Property Type",
    size: 150,
    cell: ({ getValue }) => (
      <p className="w-[118px] whitespace-nowrap overflow-hidden text-ellipsis">
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("propertyOwnerName", {
    header: "Property Owner",
    size: 200,
    cell: ({ getValue }) => {
      const value = getValue();

      if (value == null || value === "") {
        return <p className="text-muted-foreground">-</p>;
      }

      return (
        <p className="w-[168px] whitespace-nowrap overflow-hidden text-ellipsis">
          {value}
        </p>
      );
    },
  }),
  columnHelper.accessor("projectNumber", {
    header: "Project Number",
    size: 200,
    cell: ({ getValue }) => {
      const value = getValue();

      if (value == null || value === "") {
        return <p className="text-muted-foreground">-</p>;
      }

      return (
        <p className="w-[168px] whitespace-nowrap overflow-hidden text-ellipsis">
          {value}
        </p>
      );
    },
  }),
  columnHelper.accessor("numberOfJobs", {
    header: "Number of Jobs",
    size: 150,
    cell: ({ getValue }) => (
      <p className="w-[118px] whitespace-nowrap overflow-hidden text-ellipsis">
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Date Created",
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
