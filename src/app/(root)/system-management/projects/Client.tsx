"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { initialPagination } from "./constants";
import { ProjectPaginatedResponseDto } from "@/api";
import usePagination from "@/hook/usePagination";
import usePaginatedProjectsQuery from "@/queries/usePaginatedProjectsQuery";
import { ProjectTableRowData, projectTableColumns } from "@/columns/project";
import { PaginationTable } from "@/components/table/PaginationTable";
import PageHeader from "@/components/PageHeader";

interface Props {
  initialProjects: ProjectPaginatedResponseDto | null;
}

export default function Client({ initialProjects }: Props) {
  const router = useRouter();
  const [pagination, setPagination] = usePagination(
    initialPagination.pageIndex,
    initialPagination.pageSize
  );

  const { data: projects } = usePaginatedProjectsQuery({
    pagination,
    initialData: initialProjects,
  });

  const projectTableData = useMemo(
    () =>
      projects?.items.map<ProjectTableRowData>((value) => {
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
    [projects?.items]
  );

  const title = "Projects";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/projects", name: title }]}
        title={title}
      />
      <PaginationTable
        columns={projectTableColumns}
        data={projectTableData ?? []}
        pageCount={projects?.totalPage ?? -1}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(id) => {
          router.push(`/system-management/projects/${id}`);
        }}
      />
    </div>
  );
}
