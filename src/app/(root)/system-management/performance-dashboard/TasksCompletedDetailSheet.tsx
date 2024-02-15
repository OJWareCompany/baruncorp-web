"use client";
import { DialogProps } from "@radix-ui/react-dialog";
import {
  PaginationState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SheetState } from "./TasksCompletedSection";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssignedTaskSummaryDetailPaginatedResponseDto } from "@/api/api-spec";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useAssignedTasksSummaryDetailsQuery from "@/queries/useAssignedTasksSummaryDetailsQuery";

const columnHelper =
  createColumnHelper<
    AssignedTaskSummaryDetailPaginatedResponseDto["items"][number]
  >();

const columns = [
  columnHelper.accessor("taskName", {
    header: "Task",
  }),
  columnHelper.accessor("jobName", {
    header: "Job",
  }),
];

interface Props extends DialogProps {
  state: SheetState;
  fromDate: string;
  toDate: string;
}

export default function TasksCompletedDetailSheet({
  state,
  fromDate,
  toDate,
  ...dialogProps
}: Props) {
  const router = useRouter();
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const { data, isLoading } = useAssignedTasksSummaryDetailsQuery({
    params: {
      userId: state.open ? state.userId : "",
      status: "Completed",
      startedAt: fromDate,
      endedAt: toDate,
      page: pageIndex + 1,
      limit: pageSize,
    },
    enabled: state.open,
    keepPreviousData: true,
  });

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: data?.totalPage ?? -1,
    onPaginationChange: setPagination,
    manualPagination: true,
    state: {
      pagination,
    },
  });

  useEffect(() => {
    if (state.open) {
      setPagination({ pageIndex: 0, pageSize: 10 });
    }
  }, [state.open]);

  return (
    <Sheet {...dialogProps} open={state.open}>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>Tasks Completed</SheetTitle>
        </SheetHeader>
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
                        router.push(
                          `/system-management/jobs/${row.original.jobId}`
                        );
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
      </SheetContent>
    </Sheet>
  );
}
