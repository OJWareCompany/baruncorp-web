"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal, Pen } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { AhjsGetResDto } from "@/types/dto/ahjs";
import useAhjsQuery from "@/queries/useAhjsQuery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TableColumn = AhjsGetResDto["items"][number];

const columnHelper = createColumnHelper<TableColumn>();

const columns = [
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("fullAhjName", { header: "Full AHJ Name" }),
  columnHelper.accessor("createdAt", {
    header: "Created At",
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <span className={cn(!value && "text-muted-foreground")}>
          {!value ? "-" : value}
        </span>
      );
    },
  }),
  columnHelper.accessor("modifiedAt", {
    header: "Modified At",
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <span className={cn(!value && "text-muted-foreground")}>
          {!value ? "-" : value}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/project-management/ahjs/${row.id}`}>
              <Pen className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Edit
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
];

export default function Page() {
  const { data } = useAhjsQuery();
  return (
    <div>
      <h1 className="h3 mb-4">AHJs</h1>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        getRowId={(originalRow) => originalRow.geoId}
      />
    </div>
  );
}
