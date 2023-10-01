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
  getOrganizationTableExportDataFromOrganizations,
  organizationColumns,
} from "@/columns/organization";
import PaginatedTable from "@/components/table/PaginatedTable";
import PageHeader from "@/components/PageHeader";
interface Props {
  initialOrganizations: OrganizationPaginatedResponseDto | null;
}

export default function Client({ initialOrganizations }: Props) {
  const title = "Organizations";
  const router = useRouter();

  /**
   * State
   */
  const [pagination, setPagination] = usePagination(
    initialPagination.pageIndex,
    initialPagination.pageSize
  );

  /**
   * Query
   */
  const { data: organizations } = usePaginatedOrganizationsQuery({
    pagination,
    initialData: initialOrganizations,
  });

  /**
   * Table
   */
  const organizationTableExportData = useMemo(
    () => getOrganizationTableExportDataFromOrganizations(organizations),
    [organizations]
  );

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
      <PaginatedTable
        columns={organizationColumns}
        data={organizations?.items ?? []}
        exportData={organizationTableExportData ?? []}
        exportFileName={title}
        pageCount={organizations?.totalPage ?? -1}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(id) => {
          router.push(`/system-management/organizations/${id}`);
        }}
        getRowId={({ id }) => id}
      />
    </div>
  );
}
