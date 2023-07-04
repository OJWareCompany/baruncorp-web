"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

import { ServicesGetResDto } from "@/types/dto/service";
import useServicesQuery from "@/queries/useServicesQuery";
import { cn } from "@/lib/utils";

type TableColumn = ServicesGetResDto[number];

const columnHelper = createColumnHelper<TableColumn>();

const columns = [
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <span className={cn(!value && "text-muted-foreground")}>
          {!value ? "-" : value}
        </span>
      );
    },
  }),
];

export default function Page() {
  const { data: services } = useServicesQuery();
  return (
    <div>
      <h1 className="h3 mb-4">Services</h1>
      <DataTable
        columns={columns}
        data={services ?? []}
        getRowId={(originalRow) => originalRow.id}
      />
    </div>
  );
}
