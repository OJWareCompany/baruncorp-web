"use client";
import {
  PaginationState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FindVendorInvoicePaginatedHttpControllerGetParams,
  VendorInvoicePaginatedResponseDto,
} from "@/api/api-spec";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useVendorInvoicesQuery from "@/queries/useVendorInvoicesQuery";
import SearchHeader from "@/components/table/SearchHeader";
import useOnPaginationChange from "@/hook/useOnPaginationChange";
import {
  formatInEST,
  formatInUTCAsMMMYYYY,
  formatInUTCAsMMddyyyy,
} from "@/lib/utils";
import InvoiceNotesHoverCard from "@/components/hover-card/InvoiceNotesHoverCard";
import NewTabTableRow from "@/components/table/NewTabTableRow";

const columnHelper =
  createColumnHelper<VendorInvoicePaginatedResponseDto["items"][number]>();

const TABLE_NAME = "VendorInvoices";
const RELATIVE_PATH =
  "src/app/(root)/system-management/vendor-invoices/VendorInvoicesTable.tsx";

export default function VendorInvoicesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [syncedParams, setSyncedParams] =
    useState<FindVendorInvoicePaginatedHttpControllerGetParams>();

  const orgNameSearchParamName = `${TABLE_NAME}OrgName`;
  const pageIndexSearchParamName = `${TABLE_NAME}PageIndex`;

  const [pageSize, setPageSize] = useLocalStorage<number>(
    `${RELATIVE_PATH}`,
    10
  );
  const pagination: PaginationState = {
    pageIndex: searchParams.get(encodeURIComponent(pageIndexSearchParamName))
      ? Number(searchParams.get(encodeURIComponent(pageIndexSearchParamName)))
      : 0,
    pageSize,
  };
  const orgNameSearchParam =
    searchParams.get(encodeURIComponent(orgNameSearchParamName)) ?? "";

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pagination,
    updatePageSize: setPageSize,
  });

  const params: FindVendorInvoicePaginatedHttpControllerGetParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      organizationName: orgNameSearchParam,
    }),
    [orgNameSearchParam, pagination.pageIndex, pagination.pageSize]
  );

  const { data, isLoading, isFetching } = useVendorInvoicesQuery(params, true);

  useEffect(() => {
    if (!isFetching) {
      setSyncedParams(params);
    }
  }, [isFetching, params]);

  const columns = useMemo(
    () => [
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
      columnHelper.accessor("serviceMonth", {
        header: "Service Period Month",
        cell: ({ getValue }) => formatInUTCAsMMMYYYY(getValue()),
      }),
      columnHelper.accessor("invoiceDate", {
        header: "Invoice Date",
        cell: ({ getValue }) => formatInUTCAsMMddyyyy(getValue()),
      }),
      columnHelper.accessor("terms", {
        header: "Terms",
      }),
      columnHelper.accessor("dueDate", {
        header: "Due Date",
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return formatInUTCAsMMddyyyy(value);
        },
      }),
      columnHelper.accessor((row) => `$${row.subTotal}`, {
        header: "Subtotal",
      }),
      columnHelper.accessor((row) => `$${row.total}`, {
        header: "Total",
      }),
      columnHelper.accessor((row) => `$${row.invoiceTotalDifference}`, {
        header: "Total Difference",
      }),
      columnHelper.accessor("internalTotalBalanceDue", {
        header: "Internal Total Balance Due",
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return `$${value}`;
        },
      }),
      columnHelper.accessor("note", {
        header: "Notes",
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return <InvoiceNotesHoverCard value={value} />;
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Date Created",
        cell: ({ getValue }) => formatInEST(getValue()),
      }),
    ],
    [
      orgNameSearchParamName,
      pageIndexSearchParamName,
      params.organizationName,
      syncedParams,
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
                <NewTabTableRow
                  key={row.id}
                  href={`/system-management/vendor-invoices/${row.id}`}
                  data-state={row.getIsSelected() && "selected"}
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
                </NewTabTableRow>
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
