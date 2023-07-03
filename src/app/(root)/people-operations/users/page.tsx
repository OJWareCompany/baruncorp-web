"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { MembersGetResDto } from "@/types/dto/organizations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import useMembersQuery from "@/queries/useMembersQuery";

export const columns: ColumnDef<MembersGetResDto[number]>[] = [
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild>
            <Link href={`/people-operations/users/${row.id}`}>View detail</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "email",
    header: "Email Address",
  },
  {
    accessorKey: "organization",
    header: "Organization",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
];

export default function Page() {
  const { data } = useMembersQuery();

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
