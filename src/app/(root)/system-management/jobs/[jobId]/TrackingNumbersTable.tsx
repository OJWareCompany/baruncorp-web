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
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import EditTrackingNumberDialog from "./EditTrackingNumberDialog";
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
import useTrackingNumbersQuery, {
  getTrackingNumbersQueryKey,
} from "@/queries/useTrackingNumbersQuery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import useDeleteTrackingNumberMutation from "@/mutations/useDeleteTrackingNumberMutation";

const columnHelper =
  createColumnHelper<TrackingNumbersPaginatedResponseDto["items"][number]>();

const TABLE_NAME = "TrackingNumbers";

interface InternalTableProps {
  job: JobResponseDto;
  modifyTrackingNumber: (initialValue: TrackingNumbersResponseDto) => void;
  deleteTrackingNumber: (trackingNumberId: string) => void;
}

function InternalTable({
  job,
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
            href={row.original.trackingNumberUri}
            target="_blank"
            className="underline"
          >
            {getValue()}
          </a>
        ),
      }),
      columnHelper.accessor("createdBy", {
        header: "Created By",
      }),
      columnHelper.accessor("createdAt", {
        header: "Date Created (EST)",
        cell: ({ getValue }) => formatInEST(getValue()),
      }),
      columnHelper.display({
        id: "action",
        cell: ({ row }) => {
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"ghost"} size={"icon"} className="h-9 w-9">
                    <MoreHorizontal className="w-4 h-4" />
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
}

export default function TrackingNumbersTable({ job }: Props) {
  const [alertDialogState, setAlertDialogState] = useState<
    { open: false } | { open: true; trackingNumberId: string }
  >({ open: false });
  const [editDialogState, setEditDialogState] = useState<EditDialogState>({
    open: false,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutateAsync: deleteTrackingNumberMutateAsync } =
    useDeleteTrackingNumberMutation();

  return (
    <>
      <InternalTable
        job={job}
        modifyTrackingNumber={(initialValue) => {
          setEditDialogState({ open: true, initialValue });
        }}
        deleteTrackingNumber={(trackingNumberId) => {
          setAlertDialogState({ open: true, trackingNumberId });
        }}
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
      <AlertDialog
        open={alertDialogState.open}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            return;
          }

          setAlertDialogState({ open: newOpen });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!alertDialogState.open) {
                  return;
                }

                deleteTrackingNumberMutateAsync({
                  trackingNumberId: alertDialogState.trackingNumberId,
                })
                  .then(() => {
                    toast({ title: "Success" });
                    queryClient.invalidateQueries({
                      queryKey: getTrackingNumbersQueryKey({ jobId: job.id }),
                    });
                  })
                  .catch((error: AxiosError<ErrorResponseData>) => {
                    if (
                      error.response &&
                      error.response.data.errorCode.filter(
                        (value) => value != null
                      ).length !== 0
                    ) {
                      toast({
                        title: error.response.data.message,
                        variant: "destructive",
                      });
                      return;
                    }
                  });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
