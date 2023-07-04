"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import useOrganizationsQuery from "@/queries/useOrganizationsQuery";
import { OrganizationsGetResDto } from "@/types/dto/organizations";

export const columns: ColumnDef<OrganizationsGetResDto[number]>[] = [
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
            <p>No Actions</p>
            {/* <Link href={`/people-operations/users/${row.id}`}>View detail</Link> */}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
];

export default function Page() {
  const { data } = useOrganizationsQuery();

  const organizations = data?.map((org) => {
    const {
      street1,
      street2,
      city,
      stateOrRegion,
      postalCode,
      country,
      organizationType,
    } = org;
    const streetPart = [street1, street2].filter(Boolean).join(" ")?.trim();
    const cityPart = city?.trim();
    const etcPart = [stateOrRegion, postalCode, country]
      .filter(Boolean)
      .join(" ")
      .trim();
    const address = [streetPart, cityPart, etcPart].filter(Boolean).join(", ");

    return { ...org, address, type: organizationType };
  });
  return (
    <div>
      <h1 className="h3 mb-4">Users</h1>
      <DataTable
        columns={columns}
        data={organizations ?? []}
        getRowId={(originalRow) => originalRow.id}
      />
    </div>
  );
}
