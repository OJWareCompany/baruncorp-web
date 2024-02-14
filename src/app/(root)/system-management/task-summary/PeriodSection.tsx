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
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { endOfDay, startOfMonth } from "date-fns";
import { z } from "zod";
import PeriodDatePicker from "./PeriodDatePicker";
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
import SearchHeader from "@/components/table/SearchHeader";
import useOnPaginationChange from "@/hook/useOnPaginationChange";
import useAssignedTasksSummaryDoneQuery from "@/queries/useAssignedTasksSummaryDoneQuery";
import NumberOfTasksHoverCard from "@/components/hover-card/NumberOfTasksHoverCard";
import CollapsibleSection from "@/components/CollapsibleSection";
import {
  AssignedTaskSummaryDonePaginatedResponseDto,
  FindAssignedTaskSummaryDonePaginatedHttpControllerGetParams,
} from "@/api/api-spec";

const columnHelper =
  createColumnHelper<
    AssignedTaskSummaryDonePaginatedResponseDto["items"][number]
  >();

const TABLE_NAME = "Period";

export default function PeriodSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [syncedParams, setSyncedParams] =
    useState<FindAssignedTaskSummaryDonePaginatedHttpControllerGetParams>();
  console.log("period section");

  const userNameSearchParamName = `${TABLE_NAME}userName`;
  const orgNameSearchParamName = `${TABLE_NAME}orgName`;
  const fromDateSearchParamName = `${TABLE_NAME}fromDate`;
  const toDateSearchParamName = `${TABLE_NAME}toDate`;
  const pageIndexSearchParamName = `${TABLE_NAME}pageIndex`;
  const pageSizeSearchParamName = `${TABLE_NAME}pageSize`;
  const pagination: PaginationState = {
    pageIndex: searchParams.get(pageIndexSearchParamName)
      ? Number(searchParams.get(pageIndexSearchParamName))
      : 0,
    pageSize: searchParams.get(pageSizeSearchParamName)
      ? Number(searchParams.get(pageSizeSearchParamName))
      : 10,
  };
  const nameSearchParam = searchParams.get(userNameSearchParamName) ?? "";
  const orgNameSearchParam = searchParams.get(orgNameSearchParamName) ?? "";

  const currentDate = new Date();
  const initialFromDate = startOfMonth(currentDate);
  const initialToDate = endOfDay(currentDate);

  const fromDateSearchParamParseResult = z
    .date()
    .safeParse(
      new Date(
        searchParams.get(encodeURIComponent(fromDateSearchParamName)) ?? ""
      )
    );
  const fromDateData = fromDateSearchParamParseResult.success
    ? fromDateSearchParamParseResult.data
    : initialFromDate;
  const fromDateSearchParam = fromDateSearchParamParseResult.success
    ? fromDateSearchParamParseResult.data.toISOString()
    : initialFromDate.toISOString();

  const toDateSearchParamParseResult = z
    .date()
    .safeParse(
      new Date(
        searchParams.get(encodeURIComponent(toDateSearchParamName)) ?? ""
      )
    );
  const toDateData = toDateSearchParamParseResult.success
    ? toDateSearchParamParseResult.data
    : initialToDate;
  const toDateSearchParam = toDateSearchParamParseResult.success
    ? toDateSearchParamParseResult.data.toISOString()
    : initialToDate.toISOString();

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pageSizeSearchParamName,
    pagination,
  });

  const params: FindAssignedTaskSummaryDonePaginatedHttpControllerGetParams =
    useMemo(
      () => ({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        userName: nameSearchParam,
        organizationName: orgNameSearchParam,
        startedAt: fromDateSearchParam,
        endedAt: toDateSearchParam,
      }),
      [
        fromDateSearchParam,
        nameSearchParam,
        orgNameSearchParam,
        pagination.pageIndex,
        pagination.pageSize,
        toDateSearchParam,
      ]
    );

  const { data, isLoading, isFetching } = useAssignedTasksSummaryDoneQuery(
    params,
    true
  );

  useEffect(() => {
    if (!isFetching) {
      setSyncedParams(params);
    }
  }, [isFetching, params]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("organizationName", {
        header: () => (
          <SearchHeader
            buttonText="Organization"
            searchParamName={orgNameSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            isLoading={
              syncedParams != null &&
              params.organizationName !== syncedParams.organizationName
            }
          />
        ),
      }),
      columnHelper.accessor("userName", {
        header: () => (
          <SearchHeader
            buttonText="Name"
            searchParamName={userNameSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            isLoading={
              syncedParams != null && params.userName !== syncedParams.userName
            }
          />
        ),
      }),
      columnHelper.accessor("completedAssignedTaskCount", {
        header: "# of Tasks Completed",
        cell: ({ getValue, row }) => {
          return (
            <NumberOfTasksHoverCard
              count={getValue()}
              userId={row.original.userId}
              status={"Completed"}
            />
          );
        },
      }),
      columnHelper.accessor("canceledAssignedTaskCount", {
        header: "# of Tasks Canceled",
      }),
      columnHelper.accessor("doneAssignedTaskCount", {
        header: "# of Tasks",
        cell: ({ getValue, row }) => {
          return (
            <NumberOfTasksHoverCard
              count={getValue()}
              userId={row.original.userId}
            />
          );
        },
      }),
    ];
  }, [
    orgNameSearchParamName,
    pageIndexSearchParamName,
    params.organizationName,
    params.userName,
    syncedParams,
    userNameSearchParamName,
  ]);

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ userId }) => userId,
    pageCount: data?.totalPage ?? -1,
    onPaginationChange,
    manualPagination: true,
    state: {
      pagination,
    },
  });

  return (
    <CollapsibleSection
      title="Task Summary by Period"
      action={
        <PeriodDatePicker
          value={{ from: fromDateData, to: toDateData }}
          onChange={(newValue) => {
            const newSearchParams = new URLSearchParams(
              searchParams.toString()
            );

            if (newValue == null) {
              newSearchParams.set(
                encodeURIComponent(fromDateSearchParamName),
                fromDateData.toISOString()
              );
              newSearchParams.set(
                encodeURIComponent(toDateSearchParamName),
                fromDateData.toISOString()
              );
              newSearchParams.set(
                encodeURIComponent(pageIndexSearchParamName),
                "0"
              );
            } else {
              if (newValue.from != null) {
                newSearchParams.set(
                  encodeURIComponent(fromDateSearchParamName),
                  newValue.from.toISOString()
                );
                newSearchParams.set(
                  encodeURIComponent(pageIndexSearchParamName),
                  "0"
                );
              }

              if (newValue.to != null) {
                newSearchParams.set(
                  encodeURIComponent(toDateSearchParamName),
                  newValue.to.toISOString()
                );
                newSearchParams.set(
                  encodeURIComponent(pageIndexSearchParamName),
                  "0"
                );
              }
            }

            router.replace(`${pathname}?${newSearchParams.toString()}`, {
              scroll: false,
            });
          }}
        />
      }
    >
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
    </CollapsibleSection>
  );
}