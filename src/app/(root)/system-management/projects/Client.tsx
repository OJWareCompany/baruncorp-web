"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { initialPagination } from "./constants";
import { ProjectPaginatedResponseDto } from "@/api";
import usePagination from "@/hook/usePagination";
import usePaginatedProjectsQuery from "@/queries/usePaginatedProjectsQuery";
import {
  getProjectTableExportDataFromProjects,
  projectColumns,
} from "@/columns/project";
import PaginatedTable from "@/components/table/PaginatedTable";
import PageHeader from "@/components/PageHeader";

interface Props {
  initialProjects: ProjectPaginatedResponseDto | null;
}

export default function Client({ initialProjects }: Props) {
  const title = "Projects";
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
  const { data: projects } = usePaginatedProjectsQuery({
    pagination,
    initialData: initialProjects,
  });

  /**
   * Table
   */
  const projectTableExportData = useMemo(
    () => getProjectTableExportDataFromProjects(projects),
    [projects]
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/projects", name: title }]}
        title={title}
      />
      <PaginatedTable
        columns={projectColumns}
        data={projects?.items ?? []}
        exportData={projectTableExportData ?? []}
        exportFileName={title}
        pageCount={projects?.totalPage ?? -1}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(id) => {
          router.push(`/system-management/projects/${id}`);
        }}
        getRowId={({ projectId }) => projectId}
      />
    </div>
  );
}
