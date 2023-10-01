"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { initialPagination } from "./constants";

import { OrganizationPaginatedResponseDto } from "@/api";
import { Button } from "@/components/ui/button";
import usePagination from "@/hook/usePagination";
import usePaginatedOrganizationsQuery from "@/queries/usePaginatedOrganizationsQuery";
import {
  OrganizationTableRowData,
  organizationTableColumns,
} from "@/columns/organization";
import { PaginationTable } from "@/components/table/PaginationTable";
import PageHeader from "@/components/PageHeader";
interface Props {
  initialOrganizations: OrganizationPaginatedResponseDto | null;
}

export default function Client({ initialOrganizations }: Props) {
  const router = useRouter();
  const [pagination, setPagination] = usePagination(
    initialPagination.pageIndex,
    initialPagination.pageSize
  );

  const { data: organizations } = usePaginatedOrganizationsQuery({
    pagination,
    initialData: initialOrganizations,
  });

  const organizationTableData = useMemo(
    () =>
      organizations?.items.map<OrganizationTableRowData>((value) => {
        const { email, fullAddress, id, name, phoneNumber } = value;

        return {
          id,
          address: fullAddress,
          email,
          name,
          phoneNumber,
        };
      }),
    [organizations?.items]
  );
  const title = "Organizations";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/organizations", name: title }]}
        title={title}
        action={
          <Button asChild size={"sm"}>
            <Link href="/system-management/organizations/new">
              New Organization
            </Link>
          </Button>
        }
      />
      <PaginationTable
        columns={organizationTableColumns}
        data={organizationTableData ?? []}
        pageCount={organizations?.totalPage ?? -1}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(id) => {
          router.push(`/system-management/organizations/${id}`);
        }}
      />
    </div>
  );
}
