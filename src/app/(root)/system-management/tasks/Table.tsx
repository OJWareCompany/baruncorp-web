import { ServiceResponseDto } from "@/api";
import useAllServicesQuery from "@/queries/useAllServicesQuery";

interface Props {
  initialServices: ServiceResponseDto[] | null;
}

export default function Table({ initialServices }: Props) {
  /**
   * Query
   */
  const { data: services } = useAllServicesQuery(initialServices);

  return null;

  //   /**
  //    * Table
  //    */
  //   const projectTableRowData = useMemo(
  //     () =>
  //       paginatedProjects?.items.map<ProjectTableRowData>((value) => {
  //         const {
  //           createdAt,
  //           projectId,
  //           organizationName,
  //           projectNumber,
  //           propertyFullAddress,
  //           propertyOwnerName,
  //           propertyType,
  //           totalOfJobs,
  //         } = value;

  //         return {
  //           createdAt,
  //           id: projectId,
  //           organizationName,
  //           projectNumber,
  //           propertyFullAddress,
  //           propertyOwnerName,
  //           propertyType,
  //           numberOfJobs: totalOfJobs,
  //         };
  //       }),
  //     [paginatedProjects?.items]
  //   );
  //   const table = useReactTable({
  //     data: projectTableRowData ?? [],
  //     columns: projectTableColumns,
  //     getCoreRowModel: getCoreRowModel(),
  //     getRowId: (originalRow) => originalRow.id,
  //     pageCount: paginatedProjects?.totalPage ?? -1,
  //     onPaginationChange: setPagination,
  //     manualPagination: true,
  //     state: {
  //       pagination,
  //     },
  //   });

  //   return (
  //     <div className="space-y-4">
  //       <DataTable
  //         table={table}
  //         onRowClick={(projectId) => {
  //           router.push(`/system-management/projects/${projectId}`);
  //         }}
  //       />
  //       <Pagination table={table} />
  //     </div>
  //   );
}
