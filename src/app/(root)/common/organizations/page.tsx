"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import useOrganizationControllerFindAllQuery from "@/queries/useOrganizationControllerFindAllQuery";
import { OrganizationResponseDto } from "@/api";

const columnHelper = createColumnHelper<OrganizationResponseDto>();

const columns = [
  columnHelper.accessor("organizationType", { header: "Type" }),
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor(
    (row) => {
      const { street1, street2, city, stateOrRegion, postalCode, country } =
        row;
      const streetPart = [street1, street2].filter(Boolean).join(" ")?.trim();
      const cityPart = city?.trim();
      const etcPart = [stateOrRegion, postalCode, country]
        .filter(Boolean)
        .join(" ")
        .trim();
      return [streetPart, cityPart, etcPart].filter(Boolean).join(", ");
    },
    { header: "Address" }
  ),
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
  const { data: organizations } = useOrganizationControllerFindAllQuery();

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
