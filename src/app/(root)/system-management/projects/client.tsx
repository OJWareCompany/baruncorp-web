"use client";

import { PaginationState, flexRender } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { initialPagination } from "./constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import useProjectsQuery from "@/queries/useProjectsQuery";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { ProjectPaginatedResponseDto } from "@/api";

function PageHeader() {
  return (
    <div className="py-2">
      <Breadcrumb>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} href="/system-management/projects">
            Projects
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <div className="flex justify-between items-center h-9">
        <h3 className="h3">Projects</h3>
      </div>
    </div>
  );
}

const columnHelper =
  createColumnHelper<ProjectPaginatedResponseDto["items"][number]>();

const columns = [
  columnHelper.accessor("organizationName", {
    header: "Organization",
  }),
  columnHelper.accessor("propertyFullAddress", {
    header: "Address",
  }),
  columnHelper.accessor("propertyType", { header: "Property Type", size: 400 }),
  columnHelper.accessor("propertyOwnerName", {
    header: "Property Owner",
    cell: ({ getValue }) => {
      const value = getValue();

      if (value == null) {
        return <span className="text-muted-foreground">-</span>;
      }

      return <span>{value}</span>;
    },
  }),
  columnHelper.accessor("projectNumber", {
    header: "Project Number",
  }),
  columnHelper.accessor("createdAt", {
    header: "Date Created",
    cell: ({ getValue }) => format(new Date(getValue()), "MM-dd-yyyy"),
  }),
];

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

  const projects = paginatedProjects?.items ?? [];
  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.projectId,
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
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className="whitespace-nowrap"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer"
                      onClick={() => {
                        router.push(`/system-management/projects/${row.id}`);
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="whitespace-nowrap">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end px-2 items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
