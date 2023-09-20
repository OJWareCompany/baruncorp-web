import React, { useMemo, useState } from "react";
import {
  PaginationState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useRouter } from "next/navigation";
import { initialPagination } from "./constants";


import DataTable from "@/components/table/DataTable";
import Pagination from "@/components/table/Pagination";
import {
  ProjectPaginatedResponseDto,
} from "@/api";
import useProjectsQuery from "@/queries/useProjectsQuery";
import { ProjectTableRowData, projectTableColumns } from "@/columns/project";

interface Props {
  initialProjects: ProjectPaginatedResponseDto;
}

export default function ProjectTable({ initialProjects }: Props) {
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
          totalOfJobs,
        } = value;

        return {
          createdAt,
          id: projectId,
          organizationName,
          projectNumber,
          propertyFullAddress,
          propertyOwnerName,
          propertyType,
          numberOfJobs: totalOfJobs,
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
    <div className="space-y-4">
      <DataTable
        table={table}
        onRowClick={(jobId) => {
          router.push(`/system-management/jobs/${jobId}`);
        }}
      />
      <Pagination table={table} />
    </div>
  );
}
