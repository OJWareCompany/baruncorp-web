"use client";
import {
  PaginationState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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
  FindOrganizationPaginatedHttpControllerGetOrganizationPaginatedParams,
  OrganizationPaginatedResponseDto,
} from "@/api/api-spec";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import useOrganizationsQuery from "@/queries/useOrganizationsQuery";
import SearchHeader from "@/components/table/SearchHeader";
import EnumHeader from "@/components/table/EnumHeader";
import {
  YesOrNoEnum,
  transformYesOrNoEnumWithEmptyStringIntoNullableBoolean,
} from "@/lib/constants";
import useOnPaginationChange from "@/hook/useOnPaginationChange";
import NewTabTableRow from "@/components/table/NewTabTableRow";

const columnHelper =
  createColumnHelper<OrganizationPaginatedResponseDto["items"][number]>();

const TABLE_NAME = "Organizations";
const RELATIVE_PATH =
  "src/app/(root)/system-management/organizations/OrganizationsTable.tsx";

export default function OrganizationsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [syncedParams, setSyncedParams] =
    useState<FindOrganizationPaginatedHttpControllerGetOrganizationPaginatedParams>();

  const emailSearchParamName = `${TABLE_NAME}Email`;
  const orgNameSearchParamName = `${TABLE_NAME}OrgName`;
  const addressSearchParamName = `${TABLE_NAME}Address`;
  const phoneNumberSearchParamName = `${TABLE_NAME}PhoneNumber`;
  const vendorSearchParamName = `${TABLE_NAME}Vendor`;
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
  const addressSearchParam = searchParams.get(addressSearchParamName) ?? "";
  const orgNameSearchParam = searchParams.get(orgNameSearchParamName) ?? "";
  const emailSearchParam = searchParams.get(emailSearchParamName) ?? "";
  const phoneNumberSearchParam =
    searchParams.get(phoneNumberSearchParamName) ?? "";
  const vendorSearchParamParseResult = YesOrNoEnum.safeParse(
    searchParams.get(vendorSearchParamName)
  );
  const vendorSearchParam = vendorSearchParamParseResult.success
    ? vendorSearchParamParseResult.data
    : "";

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pagination,
    updatePageSize: setPageSize,
  });

  const params: FindOrganizationPaginatedHttpControllerGetOrganizationPaginatedParams =
    useMemo(
      () => ({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        fullAddress: addressSearchParam,
        name: orgNameSearchParam,
        phoneNumber: phoneNumberSearchParam,
        invoiceRecipientEmail: emailSearchParam,
        isVendor:
          transformYesOrNoEnumWithEmptyStringIntoNullableBoolean.parse(
            vendorSearchParam
          ),
      }),
      [
        addressSearchParam,
        emailSearchParam,
        orgNameSearchParam,
        pagination.pageIndex,
        pagination.pageSize,
        phoneNumberSearchParam,
        vendorSearchParam,
      ]
    );

  const { data, isLoading, isFetching } = useOrganizationsQuery(params, true);

  useEffect(() => {
    if (!isFetching) {
      setSyncedParams(params);
    }
  }, [isFetching, params]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("name", {
        header: () => (
          <SearchHeader
            buttonText="Name"
            searchParamName={orgNameSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            isLoading={
              syncedParams != null && params.name !== syncedParams.name
            }
          />
        ),
      }),
      columnHelper.accessor("fullAddress", {
        header: () => (
          <SearchHeader
            buttonText="Address"
            searchParamName={addressSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            isLoading={
              syncedParams != null &&
              params.fullAddress !== syncedParams.fullAddress
            }
          />
        ),
      }),
      columnHelper.accessor("invoiceRecipientEmail", {
        header: () => (
          <SearchHeader
            buttonText="Email Address to Receive Invoice"
            searchParamName={emailSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            isLoading={
              syncedParams != null && params.email !== syncedParams.email
            }
          />
        ),
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return value;
        },
      }),
      columnHelper.accessor("phoneNumber", {
        header: () => (
          <SearchHeader
            buttonText="Phone Number"
            searchParamName={phoneNumberSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            isLoading={
              syncedParams != null &&
              params.phoneNumber !== syncedParams.phoneNumber
            }
          />
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return value;
        },
      }),
      columnHelper.accessor("isVendor", {
        header: () => (
          <EnumHeader
            buttonText="Vendor"
            searchParamName={vendorSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            zodEnum={YesOrNoEnum}
            isLoading={
              syncedParams != null && params.isVendor !== syncedParams.isVendor
            }
          />
        ),
        cell: ({ getValue }) => (
          <div className="flex">
            <Checkbox checked={getValue()} />
          </div>
        ),
      }),
      columnHelper.accessor("isDelinquent", {
        header: "Delinquent",
        cell: ({ getValue }) => (
          <div className="flex">
            <Checkbox checked={getValue()} />
          </div>
        ),
      }),
    ];
  }, [
    addressSearchParamName,
    emailSearchParamName,
    orgNameSearchParamName,
    pageIndexSearchParamName,
    params.email,
    params.fullAddress,
    params.isVendor,
    params.name,
    params.phoneNumber,
    phoneNumberSearchParamName,
    syncedParams,
    vendorSearchParamName,
  ]);

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
                  href={`/system-management/organizations/${row.id}`}
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
