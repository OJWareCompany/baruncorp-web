"use client";
import {
  PaginationState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import TasksInProgressDetailSheet from "./TasksInProgressDetailSheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FindAssignedTaskSummaryInProgressPaginatedHttpControllerGetParams,
  AssignedTaskSummaryInProgressPaginatedResponseDto,
} from "@/api/api-spec";
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
import useAssignedTasksSummaryInProgressQuery from "@/queries/useAssignedTasksSummaryInProgressQuery";
import { Badge } from "@/components/ui/badge";

const columnHelper =
  createColumnHelper<
    AssignedTaskSummaryInProgressPaginatedResponseDto["items"][number]
  >();

const TABLE_NAME = "InProgress";

export type SheetState =
  | { open: false }
  | {
      open: true;
      userId: string;
    };

export default function InProgressTable() {
  const [sheetState, setSheetState] = useState<SheetState>({ open: false });

  const searchParams = useSearchParams();
  const [syncedParams, setSyncedParams] =
    useState<FindAssignedTaskSummaryInProgressPaginatedHttpControllerGetParams>();

  const userNameSearchParamName = `${TABLE_NAME}userName`;
  const orgNameSearchParamName = `${TABLE_NAME}orgName`;
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

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pageSizeSearchParamName,
    pagination,
  });

  const params: FindAssignedTaskSummaryInProgressPaginatedHttpControllerGetParams =
    useMemo(
      () => ({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        userName: nameSearchParam,
        organizationName: orgNameSearchParam,
      }),
      [
        nameSearchParam,
        orgNameSearchParam,
        pagination.pageIndex,
        pagination.pageSize,
      ]
    );

  const { data, isLoading, isFetching } =
    useAssignedTasksSummaryInProgressQuery(params, true);

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
      columnHelper.accessor("inProgressAssignedTaskCount", {
        header: "# of Tasks In Progress",
        cell: ({ getValue, row }) => {
          const value = getValue();
          if (value === 0) {
            return value;
          }

          return (
            <Badge
              variant={"outline"}
              onClick={() => {
                setSheetState({
                  open: true,
                  userId: row.original.userId,
                });
              }}
              className="cursor-pointer"
            >
              {value}
            </Badge>
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
    <>
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
      <TasksInProgressDetailSheet
        state={sheetState}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            return;
          }

          setSheetState({ open: newOpen });
        }}
      />
    </>
  );
}
