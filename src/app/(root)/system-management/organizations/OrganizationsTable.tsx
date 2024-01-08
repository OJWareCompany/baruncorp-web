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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
} from "@/api";
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

const columnHelper =
  createColumnHelper<OrganizationPaginatedResponseDto["items"][number]>();

export default function OrganizationsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [syncedParams, setSyncedParams] =
    useState<FindOrganizationPaginatedHttpControllerGetOrganizationPaginatedParams>();

  const pagination: PaginationState = {
    pageIndex: searchParams.get("pageIndex")
      ? Number(searchParams.get("pageIndex"))
      : 0,
    pageSize: searchParams.get("pageSize")
      ? Number(searchParams.get("pageSize"))
      : 10,
  };
  const addressSearchParam = searchParams.get("address") ?? "";
  const nameSearchParam = searchParams.get("name") ?? "";
  const emailSearchParam = searchParams.get("email") ?? "";
  const phoneNumberSearchParam = searchParams.get("phoneNumber") ?? "";
  const vendorSearchParamParseResult = YesOrNoEnum.safeParse(
    searchParams.get("vendor")
  );
  const vendorSearchParam = vendorSearchParamParseResult.success
    ? vendorSearchParamParseResult.data
    : "";

  const params: FindOrganizationPaginatedHttpControllerGetOrganizationPaginatedParams =
    useMemo(
      () => ({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        fullAddress: addressSearchParam,
        name: nameSearchParam,
        phoneNumber: phoneNumberSearchParam,
        email: emailSearchParam,
        isVendor:
          transformYesOrNoEnumWithEmptyStringIntoNullableBoolean.parse(
            vendorSearchParam
          ),
      }),
      [
        addressSearchParam,
        emailSearchParam,
        nameSearchParam,
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
            initialValue={nameSearchParam}
            buttonText="Name"
            onFilterButtonClick={(value) => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set("name", value);
              newSearchParams.set("pageIndex", "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            isFiltered={nameSearchParam !== ""}
            onResetButtonClick={() => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete("name");
              newSearchParams.set("pageIndex", "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            isLoading={
              syncedParams != null && params.name !== syncedParams.name
            }
          />
        ),
      }),
      columnHelper.accessor("fullAddress", {
        header: () => (
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
            initialValue={emailSearchParam}
            buttonText="Email Address to Receive Invoice"
            onFilterButtonClick={(value) => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set("email", value);
              newSearchParams.set("pageIndex", "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            isFiltered={emailSearchParam !== ""}
            onResetButtonClick={() => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete("email");
              newSearchParams.set("pageIndex", "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
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
            initialValue={phoneNumberSearchParam}
            buttonText="Phone Number"
            onFilterButtonClick={(value) => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set("phoneNumber", value);
              newSearchParams.set("pageIndex", "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            isFiltered={phoneNumberSearchParam !== ""}
            onResetButtonClick={() => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete("phoneNumber");
              newSearchParams.set("pageIndex", "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
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
            isFiltered={vendorSearchParam !== ""}
            items={YesOrNoEnum.options}
            onItemButtonClick={(value) => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set("vendor", value);
              newSearchParams.set("pageIndex", "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            onResetButtonClick={() => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete("vendor");
              newSearchParams.set("pageIndex", "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            selectedValue={vendorSearchParam}
            isLoading={
              syncedParams != null && params.isVendor !== syncedParams.isVendor
            }
          />
        ),
        cell: ({ getValue }) => <Checkbox checked={getValue()} />,
      }),
    ];
  }, [
    addressSearchParam,
    emailSearchParam,
    nameSearchParam,
    params,
    pathname,
    phoneNumberSearchParam,
    router,
    searchParams,
    syncedParams,
    vendorSearchParam,
  ]);

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
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
                    router.push(`/system-management/organizations/${row.id}`);
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
