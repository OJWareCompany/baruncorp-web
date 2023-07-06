"use client";

import { createColumnHelper } from "@tanstack/react-table";
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

type TableColumn = OrganizationsGetResDto[number] & { address: string };

const columnHelper = createColumnHelper<TableColumn>();

const columns = [
  columnHelper.accessor("organizationType", { header: "Type" }),
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("address", { header: "Address" }),
  columnHelper.accessor("phoneNumber", { header: "Phone" }),
  columnHelper.accessor("email", { header: "Email" }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: ({ getValue }) => (
      <span className="whitespace-pre-wrap">{getValue()}</span>
    ),
  }),
];

export default function Page() {
  const { data } = useOrganizationsQuery();

  const organizations = data?.map((org) => {
    const { street1, street2, city, stateOrRegion, postalCode, country } = org;
    const streetPart = [street1, street2].filter(Boolean).join(" ")?.trim();
    const cityPart = city?.trim();
    const etcPart = [stateOrRegion, postalCode, country]
      .filter(Boolean)
      .join(" ")
      .trim();
    const address = [streetPart, cityPart, etcPart].filter(Boolean).join(", ");
    return { ...org, address };
  });

  return (
    <div>
      <h1 className="h3 mb-4">Organizations</h1>
      <DataTable
        columns={columns}
        data={organizations ?? []}
        getRowId={(originalRow) => originalRow.id}
      />
    </div>
  );
}
