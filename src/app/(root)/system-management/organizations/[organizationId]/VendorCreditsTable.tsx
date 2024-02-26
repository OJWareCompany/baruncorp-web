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
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FindVendorCreditTransactionPaginatedHttpControllerGetParams,
  VendorCreditTransactionPaginatedResponseDto,
} from "@/api/api-spec";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useOnPaginationChange from "@/hook/useOnPaginationChange";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import LoadingButton from "@/components/LoadingButton";
import useVendorCreditHistoriesQuery, {
  getVendorCreditHistoriesQueryKey,
} from "@/queries/useVendorCreditHistoriesQuery";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatInEST } from "@/lib/utils";
import usePatchVendorCreditCancelMutation from "@/mutations/usePatchVendorCreditCancelMutation";
import { getVendorCreditQueryKey } from "@/queries/useVendorCreditQuery";

const columnHelper =
  createColumnHelper<
    VendorCreditTransactionPaginatedResponseDto["items"][number]
  >();

interface Props {
  organizationId: string;
}

const TABLE_NAME = "VendorCreditHistories";

export default function VendorCreditHistoriesTable({ organizationId }: Props) {
  const [alertDialogState, setAlertDialogState] = useState<
    { open: false } | { open: true; id: string }
  >({ open: false });
  const searchParams = useSearchParams();
  const {
    mutateAsync: patchVendorCreditCancelMutateAsync,
    isPending: isPatchVendorCreditCancelMutationPending,
  } = usePatchVendorCreditCancelMutation();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const pageIndexSearchParamName = `${TABLE_NAME}PageIndex`;
  const pageSizeSearchParamName = `${TABLE_NAME}PageSize`;
  const pagination: PaginationState = {
    pageIndex: searchParams.get(pageIndexSearchParamName)
      ? Number(searchParams.get(pageIndexSearchParamName))
      : 0,
    pageSize: searchParams.get(pageSizeSearchParamName)
      ? Number(searchParams.get(pageSizeSearchParamName))
      : 5,
  };

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pageSizeSearchParamName,
    pagination,
  });

  const params: FindVendorCreditTransactionPaginatedHttpControllerGetParams =
    useMemo(
      () => ({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        vendorOrganizationId: organizationId,
      }),
      [organizationId, pagination.pageIndex, pagination.pageSize]
    );

  const { data, isLoading } = useVendorCreditHistoriesQuery(params, true);

  const columns = useMemo(
    () => [
      columnHelper.accessor("createdBy", {
        header: "Created By",
      }),
      columnHelper.accessor("creditTransactionType", {
        header: "Type",
        cell: ({ row, getValue }) => {
          const value = getValue();
          const { relatedVendorInvoiceId } = row.original;
          if (relatedVendorInvoiceId == null) {
            return value;
          }

          return (
            <Link
              href={`/system-management/vendor-invoices/${relatedVendorInvoiceId}`}
              className="underline"
            >
              {value}
            </Link>
          );
        },
      }),
      columnHelper.accessor((row) => `$${row.amount}`, {
        header: "Amount",
      }),
      columnHelper.accessor("transactionDate", {
        header: "Transaction Date",
        cell: ({ getValue }) => formatInEST(getValue()),
      }),
      columnHelper.accessor("canceledAt", {
        header: "Date Canceled",
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return formatInEST(value);
        },
      }),
      columnHelper.display({
        id: "action",
        cell: ({ row }) => {
          const isCanceled = row.original.canceledAt != null;

          if (isCanceled) {
            return (
              <div className="text-right">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button variant={"ghost"} size={"icon"} className="w-9 h-9">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Canceled</TooltipContent>
                </Tooltip>
              </div>
            );
          }

          return (
            <div className="text-right">
              <div
                className="inline-flex"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="h-9 w-9"
                  onClick={() => {
                    setAlertDialogState({
                      open: true,
                      id: row.id,
                    });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        },
      }),
    ],
    []
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
    <>
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
            <LoadingButton
              isLoading={isPatchVendorCreditCancelMutationPending}
              onClick={() => {
                if (!alertDialogState.open) {
                  return;
                }

                patchVendorCreditCancelMutateAsync({
                  vendorCreditTransactionId: alertDialogState.id,
                })
                  .then(() => {
                    queryClient.invalidateQueries({
                      queryKey: getVendorCreditQueryKey(organizationId),
                    });
                    queryClient.invalidateQueries({
                      queryKey: getVendorCreditHistoriesQueryKey({
                        vendorOrganizationId: organizationId,
                      }),
                    });
                    setAlertDialogState({ open: false });
                    toast({ title: "Success" });
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
            </LoadingButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
