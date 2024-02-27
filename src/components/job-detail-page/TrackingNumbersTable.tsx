"use client";
import {
  PaginationState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { useSession } from "next-auth/react";
import EditTrackingNumberDialog from "./EditTrackingNumberDialog";
import { useAlertDialogDataDispatch } from "./AlertDialogDataProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FindIntegratedOrderModificationHistoryPaginatedHttpControllerGetParams,
  TrackingNumbersPaginatedResponseDto,
  JobResponseDto,
  TrackingNumbersResponseDto,
} from "@/api/api-spec";
import { formatInEST } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useOnPaginationChange from "@/hook/useOnPaginationChange";
import useTrackingNumbersQuery from "@/queries/useTrackingNumbersQuery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columnHelper =
  createColumnHelper<TrackingNumbersPaginatedResponseDto["items"][number]>();

const TABLE_NAME = "TrackingNumbers";

interface InternalTableProps {
  job: JobResponseDto;
  pageType: JobDetailPageType;
  modifyTrackingNumber: (initialValue: TrackingNumbersResponseDto) => void;
  deleteTrackingNumber: (trackingNumberId: string) => void;
}

function InternalTable({
  job,
  pageType,
  modifyTrackingNumber,
  deleteTrackingNumber,
}: InternalTableProps) {
  const searchParams = useSearchParams();

  const pageIndexSearchParamName = `${TABLE_NAME}PageIndex`;
  const pageSizeSearchParamName = `${TABLE_NAME}PageSize`;

  const pagination: PaginationState = {
    pageIndex: searchParams.get(pageIndexSearchParamName)
      ? Number(searchParams.get(pageIndexSearchParamName))
      : 0,
    pageSize: searchParams.get(pageSizeSearchParamName)
      ? Number(searchParams.get(pageSizeSearchParamName))
      : 10,
  };

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pageSizeSearchParamName,
    pagination,
  });

  const params: FindIntegratedOrderModificationHistoryPaginatedHttpControllerGetParams =
    useMemo(
      () => ({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        jobId: job.id,
      }),
      [job.id, pagination.pageIndex, pagination.pageSize]
    );

  const { data, isLoading } = useTrackingNumbersQuery(params, true);

  const columns = useMemo(
    () => [
      columnHelper.accessor("courierName", {
        header: "Courier",
      }),
      columnHelper.accessor("trackingNumber", {
        header: "Tracking Number",
        cell: ({ row, getValue }) => (
          <a
            className="underline"
            href={row.original.trackingNumberUri}
            target="_blank"
            rel="noopener noreferrer"
          >
            {getValue()}
          </a>
        ),
      }),
      columnHelper.accessor("createdBy", {
        header: "Created By",
      }),
      columnHelper.accessor("createdAt", {
        header: "Date Created",
        cell: ({ getValue }) => formatInEST(getValue()),
      }),
      columnHelper.display({
        id: "action",
        cell: ({ row }) => {
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"ghost"} size={"icon"} className="h-8 w-8">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      modifyTrackingNumber(row.original);
                    }}
                  >
                    Modify
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      deleteTrackingNumber(row.id);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [deleteTrackingNumber, modifyTrackingNumber]
  );
  const { data: session } = useSession();

  const isBarunCorpMember = session?.isBarunCorpMember ?? false;
  const isHome = pageType === "HOME";

  /**
   * 바른코프 멤버 ✅
   * 바른코프 멤버아닌데, 홈 ❌
   * 바른코프 멤버아닌데, 워크스페이스 ✅
   */
  const isWorker = isBarunCorpMember || !isHome;

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
    pageCount: data?.totalPage ?? -1,
    onPaginationChange,
    manualPagination: true,
    state: {
      pagination,
      columnVisibility: {
        action: isWorker,
      },
    },
  });

  return (
    <div className="space-y-2">
      <div className="rounded-md border overflow-hidden">
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
  );
}

export type EditDialogState =
  | { open: false }
  | { open: true; initialValue: TrackingNumbersResponseDto };

interface Props {
  job: JobResponseDto;
  pageType: JobDetailPageType;
}

export default function TrackingNumbersTable({ job, pageType }: Props) {
  const [editDialogState, setEditDialogState] = useState<EditDialogState>({
    open: false,
  });
  const dispatch = useAlertDialogDataDispatch();

  return (
    <>
      <InternalTable
        job={job}
        modifyTrackingNumber={(initialValue) => {
          setEditDialogState({ open: true, initialValue });
        }}
        deleteTrackingNumber={(trackingNumberId) => {
          dispatch({
            type: "DELETE_TRACKING_NUMBER",
            jobId: job.id,
            trackingNumberId,
          });
        }}
        pageType={pageType}
      />
      <EditTrackingNumberDialog
        state={editDialogState}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            return;
          }

          setEditDialogState({ open: newOpen });
        }}
      />
    </>
  );
}
