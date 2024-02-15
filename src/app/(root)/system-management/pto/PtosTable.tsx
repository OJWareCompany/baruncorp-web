"use client";
import {
  PaginationState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FindPtoPaginatedHttpControllerGetParams,
  PtoPaginatedResponseDto,
} from "@/api/api-spec";
import { Checkbox } from "@/components/ui/checkbox";
import usePtosQuery, { getPtosQueryKey } from "@/queries/usePtosQuery";
import SearchHeader from "@/components/table/SearchHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import EnumHeader from "@/components/table/EnumHeader";
import {
  YesOrNoEnum,
  transformYesOrNoEnumWithEmptyStringIntoNullableBoolean,
} from "@/lib/constants";
import TotalPtoField from "@/components/field/TotalPtoField";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import usePatchPtoPayMutation from "@/mutations/usePatchPtoPayMutation";
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
import useOnPaginationChange from "@/hook/useOnPaginationChange";

const columnHelper =
  createColumnHelper<PtoPaginatedResponseDto["items"][number]>();

const TABLE_NAME = "PTOs";

export default function PtosTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [syncedParams, setSyncedParams] =
    useState<FindPtoPaginatedHttpControllerGetParams>();
  const [alertDialogState, setAlertDialogState] = useState<
    { open: false } | { open: true; ptoId: string; isPaid: boolean }
  >({ open: false });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const userNameSearchParamName = `${TABLE_NAME}UserName`;
  const paidSearchParamName = `${TABLE_NAME}Paid`;
  const pageIndexSearchParamName = `${TABLE_NAME}PageIndex`;
  const pageSizeSearchParamName = `${TABLE_NAME}PageSize`;
  const pagination: PaginationState = {
    pageIndex: searchParams.get(encodeURIComponent(pageIndexSearchParamName))
      ? Number(searchParams.get(encodeURIComponent(pageIndexSearchParamName)))
      : 0,
    pageSize: searchParams.get(encodeURIComponent(pageSizeSearchParamName))
      ? Number(searchParams.get(encodeURIComponent(pageSizeSearchParamName)))
      : 10,
  };
  const userNameSearchParam =
    searchParams.get(encodeURIComponent(userNameSearchParamName)) ?? "";
  const paidSearchParamParseResult = YesOrNoEnum.safeParse(
    searchParams.get(encodeURIComponent(paidSearchParamName))
  );
  const paidSearchParam = paidSearchParamParseResult.success
    ? paidSearchParamParseResult.data
    : "";

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pageSizeSearchParamName,
    pagination,
  });

  const params: FindPtoPaginatedHttpControllerGetParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      userName: userNameSearchParam,
      isPaid:
        transformYesOrNoEnumWithEmptyStringIntoNullableBoolean.parse(
          paidSearchParam
        ) ?? undefined,
    }),
    [
      userNameSearchParam,
      pagination.pageIndex,
      pagination.pageSize,
      paidSearchParam,
    ]
  );

  const { data, isLoading, isFetching } = usePtosQuery({
    params,
    isKeepPreviousData: true,
  });
  const { mutateAsync } = usePatchPtoPayMutation();

  useEffect(() => {
    if (!isFetching) {
      setSyncedParams(params);
    }
  }, [isFetching, params]);

  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (row) =>
          `${format(new Date(row.startedAt), "MM-dd-yyyy")} ~ ${format(
            new Date(row.endedAt),
            "MM-dd-yyyy"
          )}`,
        {
          header: "Period",
        }
      ),
      columnHelper.accessor(
        (row) => `${row.userFirstName} ${row.userLastName}`,
        {
          id: "fullName",
          header: () => (
            <SearchHeader
              buttonText="Name"
              searchParamName={userNameSearchParamName}
              pageIndexSearchParamName={pageIndexSearchParamName}
              isLoading={
                syncedParams != null &&
                params.userName !== syncedParams.userName
              }
            />
          ),
        }
      ),
      columnHelper.accessor("tenure", {
        header: "Tenure (Year)",
      }),
      columnHelper.accessor("total", {
        header: "Total PTO (Days)",
        cell: ({ row, getValue }) => {
          return <TotalPtoField id={row.id} pto={getValue()} />;
        },
      }),
      columnHelper.accessor("availablePto", {
        header: "Unused PTO (Days)",
      }),
      columnHelper.accessor((row) => row.total - row.availablePto, {
        header: "Used PTO (Days)",
      }),
      columnHelper.accessor("isPaid", {
        header: () => (
          <EnumHeader
            buttonText="Paid"
            searchParamName={paidSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            zodEnum={YesOrNoEnum}
            isLoading={
              syncedParams != null && params.isPaid !== syncedParams.isPaid
            }
          />
        ),
        cell: ({ getValue }) => <Checkbox checked={getValue()} />,
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
                  {row.original.isPaid ? (
                    <DropdownMenuItem
                      onClick={() => {
                        setAlertDialogState({
                          open: true,
                          ptoId: row.id,
                          isPaid: false,
                        });
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      Change to Unpaid
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => {
                        setAlertDialogState({
                          open: true,
                          ptoId: row.id,
                          isPaid: true,
                        });
                      }}
                    >
                      Change to Paid
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [
      userNameSearchParamName,
      pageIndexSearchParamName,
      syncedParams,
      params.userName,
      params.isPaid,
      paidSearchParamName,
    ]
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

                mutateAsync({
                  isPaid: alertDialogState.isPaid,
                  ptoId: alertDialogState.ptoId,
                })
                  .then(() => {
                    queryClient.invalidateQueries({
                      queryKey: getPtosQueryKey({}),
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
    </div>
  );
}
