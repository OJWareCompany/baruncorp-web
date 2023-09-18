"use client";

import { PaginationState } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { initialPagination } from "./constants";

import useProjectsQuery from "@/queries/useProjectsQuery";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { ProjectPaginatedResponseDto } from "@/api";
import DataTable from "@/components/table/DataTable";
import Pagination from "@/components/table/Pagination";
import { ProjectTableRowData, projectTableColumns } from "@/columns/project";

function PageHeader() {
  const title = "Projects";

  return (
    <div className="py-2">
      <Breadcrumb>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} href="/system-management/projects">
            {title}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <div className="flex justify-between items-center h-9">
        <h3 className="h3">{title}</h3>
      </div>
    </div>
  );
}
interface Props {
  initialProjects: ProjectPaginatedResponseDto;
}

export default function Client({ initialProjects }: Props) {
  const router = useRouter();

  /**
   * State
   */
  const [pagination, setPagination] =
    useState<PaginationState>(initialPagination);

  /**
   * Query
   */
  const { data: paginatedProjects } = useProjectsQuery({
    pagination,
    initialData: initialProjects,
  });

  /**
   * Table
   */
  const projectTableRowData = useMemo(
    () =>
      paginatedProjects?.items.map<ProjectTableRowData>((value) => {
        const {
          createdAt,
          projectId,
          organizationName,
          projectNumber,
          propertyFullAddress,
          propertyOwnerName,
          propertyType,
        } = value;

        return {
          createdAt,
          id: projectId,
          organizationName,
          projectNumber,
          propertyFullAddress,
          propertyOwnerName,
          propertyType,
        };
      }),
    [paginatedProjects?.items]
  );
  const table = useReactTable({
    data: projectTableRowData ?? [],
    columns: projectTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
    pageCount: paginatedProjects?.totalPage ?? -1,
    onPaginationChange: setPagination,
    manualPagination: true,
    state: {
      pagination,
    },
  });

  return (
    <>
      <PageHeader />
      <div className="py-4">
        <div className="space-y-4">
          <DataTable
            table={table}
            onRowClick={(projectId) => {
              router.push(`/system-management/projects/${projectId}`);
            }}
          />
          <Pagination table={table} />
        </div>
      </div>
    </>
  );
}
