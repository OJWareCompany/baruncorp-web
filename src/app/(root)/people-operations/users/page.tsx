"use client";

import { createColumnHelper } from "@tanstack/react-table";
import React from "react";
import { MoreHorizontal, Pen } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import useUsersQuery from "@/queries/useUsersQuery";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UsersGetResDto } from "@/types/dto/users";

const columnHelper = createColumnHelper<UsersGetResDto[number]>();

const columns = [
  columnHelper.accessor("email", { header: "Email Address" }),
  columnHelper.accessor("fullName", { header: "Full Name" }),
  columnHelper.accessor("organization", { header: "Organization" }),
  columnHelper.accessor((row) => row.position?.name, {
    id: "position",
    header: "Position",
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <span className={cn(value == null && "text-muted-foreground")}>
          {value ?? "-"}
        </span>
      );
    },
  }),
  columnHelper.accessor((row) => row.licenses, {
    id: "licenses",
    header: () => (
      <div>
        <div>Licenses</div>
        <div className="text-xs">(abbreviataion / type / priority)</div>
      </div>
    ),
    cell: ({ getValue }) => {
      const licenses = getValue();

      if (licenses.length === 0) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <div className="flex flex-col items-start gap-1">
          {licenses.map((license) => {
            const { abbreviation, type, priority } = license;
            const value = `${abbreviation} / ${type} / ${priority}`;
            return (
              <Badge variant={"secondary"} key={value}>
                {value}
              </Badge>
            );
          })}
        </div>
      );
    },
  }),
  columnHelper.accessor("role", {
    header: "Role",
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <span className={cn(value == null && "text-muted-foreground")}>
          {value ?? "-"}
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
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/people-operations/users/${row.id}`}>
              <Pen className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Edit
            </Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
              <Trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Delete
            </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
];

export default function Page() {
  const { data } = useUsersQuery();

  return (
    <div>
      <h1 className="h3 mb-4">Users</h1>
      <DataTable
        columns={columns}
        data={data ?? []}
        getRowId={(originalRow) => originalRow.id}
      />
    </div>
  );
}
