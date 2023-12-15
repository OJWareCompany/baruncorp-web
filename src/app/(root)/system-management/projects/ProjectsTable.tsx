"use client";
import {
  PaginationState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Loader2,
  RotateCw,
} from "lucide-react";
import { useMemo } from "react";
import { Trigger as SelectPrimitiveTrigger } from "@radix-ui/react-select";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectPaginatedResponseDto } from "@/api";
import { Button } from "@/components/ui/button";
import { formatInEST } from "@/lib/utils";
import SearchHeader from "@/components/table/SearchHeader";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PropertyTypeEnum,
  PropertyTypeEnumWithEmptyString,
  transformPropertyTypeEnumWithEmptyStringIntoNullablePropertyTypeEnum,
} from "@/lib/constants";
import useProjectsQuery from "@/queries/useProjectsQuery";

const columnHelper =
  createColumnHelper<ProjectPaginatedResponseDto["items"][number]>();

export default function ProjectsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pagination: PaginationState = {
    pageIndex: searchParams.get("pageIndex")
      ? Number(searchParams.get("pageIndex"))
      : 0,
    pageSize: searchParams.get("pageSize")
      ? Number(searchParams.get("pageSize"))
      : 10,
  };
  const addressSearchParam = searchParams.get("address") ?? "";
  const organizationSearchParam = searchParams.get("organization") ?? "";
  const propertyTypeSearchParam =
    (searchParams.get("propertyType") as z.infer<
      typeof PropertyTypeEnumWithEmptyString
    >) ?? "";

  const { data, isLoading } = useProjectsQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    propertyFullAddress: addressSearchParam,
    organizationName: organizationSearchParam,
    propertyType:
      transformPropertyTypeEnumWithEmptyStringIntoNullablePropertyTypeEnum.parse(
        propertyTypeSearchParam
      ),
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("organizationName", {
        header: () => {
          return (
            <SearchHeader
              initialValue={organizationSearchParam}
              buttonText="Organization"
              onFilterButtonClick={(value) => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set("organization", value);
                newSearchParams.set("pageIndex", "0");
                router.replace(`${pathname}?${newSearchParams.toString()}`, {
                  scroll: false,
                });
              }}
              isFiltered={organizationSearchParam !== ""}
              onResetButtonClick={() => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete("organization");
                newSearchParams.set("pageIndex", "0");
                router.replace(`${pathname}?${newSearchParams.toString()}`, {
                  scroll: false,
                });
              }}
            />
          );
        },
      }),
      columnHelper.accessor("propertyFullAddress", {
        header: () => {
          return (
            <SearchHeader
              initialValue={addressSearchParam}
              buttonText="Address"
              onFilterButtonClick={(value) => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set("address", value);
                newSearchParams.set("pageIndex", "0");
                router.replace(`${pathname}?${newSearchParams.toString()}`, {
                  scroll: false,
                });
              }}
              isFiltered={addressSearchParam !== ""}
              onResetButtonClick={() => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete("address");
                newSearchParams.set("pageIndex", "0");
                router.replace(`${pathname}?${newSearchParams.toString()}`, {
                  scroll: false,
                });
              }}
            />
          );
        },
      }),
      columnHelper.accessor("propertyType", {
        header: () => {
          return (
            <div className="flex">
              <Select
                value={propertyTypeSearchParam}
                onValueChange={(value) => {
                  const newSearchParams = new URLSearchParams(searchParams);
                  newSearchParams.set("propertyType", value);
                  newSearchParams.set("pageIndex", "0");
                  router.replace(`${pathname}?${newSearchParams.toString()}`, {
                    scroll: false,
                  });
                }}
              >
                <SelectPrimitiveTrigger asChild>
                  <Button
                    size={"sm"}
                    variant={"ghost"}
                    className="-ml-3 focus-visible:ring-0 whitespace-nowrap"
                  >
                    Propery Type
                    <ChevronsUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </SelectPrimitiveTrigger>
                <SelectContent>
                  <SelectGroup className="font-normal">
                    {PropertyTypeEnum.options.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {propertyTypeSearchParam !== "" && (
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  className="h-9 w-9"
                  onClick={() => {
                    const newSearchParams = new URLSearchParams(searchParams);
                    newSearchParams.delete("propertyType");
                    newSearchParams.set("pageIndex", "0");

                    router.replace(
                      `${pathname}?${newSearchParams.toString()}`,
                      {
                        scroll: false,
                      }
                    );
                  }}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("propertyOwnerName", {
        header: "Property Owner",
        cell: ({ getValue }) => {
          const value = getValue();
          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return value;
        },
      }),
      columnHelper.accessor("projectNumber", {
        header: "Project Number",
        cell: ({ getValue }) => {
          const value = getValue();
          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return value;
        },
      }),
      columnHelper.accessor("totalOfJobs", {
        header: "Number of Jobs",
      }),
      columnHelper.accessor("createdAt", {
        header: "Date Created (EST)",
        cell: ({ getValue }) => formatInEST(getValue()),
      }),
    ],
    [
      addressSearchParam,
      pathname,
      propertyTypeSearchParam,
      router,
      searchParams,
    ]
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ projectId }) => projectId,
    pageCount: data?.totalPage ?? -1,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const { pageIndex, pageSize } = updater(pagination);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("pageIndex", String(pageIndex));
        newSearchParams.set("pageSize", String(pageSize));
        router.replace(`${pathname}?${newSearchParams.toString()}`, {
          scroll: false,
        });
      }
    },
    manualPagination: true,
    state: {
      pagination,
    },
  });

  return (
    <div className="space-y-2">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    router.push(`/system-management/projects/${row.id}`);
                  }}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end items-center">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
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
                {[5, 10, 25, 50, 100].map((pageSize) => (
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8 w-8"
              size={"icon"}
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8"
              size={"icon"}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8"
              size={"icon"}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8"
              size={"icon"}
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
  );
}
