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
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FindUsersHttpControllerGetFindUsersParams,
  OrganizationResponseDto,
  UserPaginatedResponseDto,
} from "@/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useUsersQuery from "@/queries/useUsersQuery";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BARUNCORP_ORGANIZATION_ID,
  YesOrNoEnum,
  transformYesOrNoEnumWithEmptyStringIntoNullableBoolean,
  userStatuses,
} from "@/lib/constants";
import SearchHeader from "@/components/table/SearchHeader";
import EnumHeader from "@/components/table/EnumHeader";
import UserActionField from "@/components/field/UserActionField";

const columnHelper =
  createColumnHelper<UserPaginatedResponseDto["items"][number]>();

interface Props {
  organization: OrganizationResponseDto;
}

export default function UsersTable({ organization }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [syncedParams, setSyncedParams] =
    useState<FindUsersHttpControllerGetFindUsersParams>();

  const pagination: PaginationState = {
    pageIndex: searchParams.get("pageIndex")
      ? Number(searchParams.get("pageIndex"))
      : 0,
    pageSize: searchParams.get("pageSize")
      ? Number(searchParams.get("pageSize"))
      : 10,
  };
  const nameSearchParam = searchParams.get("name") ?? "";
  const emailSearchParam = searchParams.get("email") ?? "";
  const contractorSearchParamParseResult = YesOrNoEnum.safeParse(
    searchParams.get("contractor")
  );
  const contractorSearchParam = contractorSearchParamParseResult.success
    ? contractorSearchParamParseResult.data
    : "";

  const params: FindUsersHttpControllerGetFindUsersParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      organizationId: organization.id,
      userName: nameSearchParam,
      email: emailSearchParam,
      isContractor:
        transformYesOrNoEnumWithEmptyStringIntoNullableBoolean.parse(
          contractorSearchParam
        ),
    }),
    [
      contractorSearchParam,
      emailSearchParam,
      nameSearchParam,
      organization.id,
      pagination.pageIndex,
      pagination.pageSize,
    ]
  );

  const { data, isLoading, isFetching } = useUsersQuery(params, true);

  useEffect(() => {
    if (!isFetching) {
      setSyncedParams(params);
    }
  }, [isFetching, params]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("fullName", {
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
              syncedParams != null && params.userName !== syncedParams.userName
            }
          />
        ),
      }),
      columnHelper.accessor("email", {
        header: () => (
          <SearchHeader
            initialValue={emailSearchParam}
            buttonText="Email"
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
      }),
      columnHelper.accessor("phoneNumber", {
        header: "Phone Number",
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
            buttonText="Contractor"
            isFiltered={contractorSearchParam !== ""}
            items={YesOrNoEnum.options}
            onItemButtonClick={(value) => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set("contractor", value);
              newSearchParams.set("pageIndex", "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            onResetButtonClick={() => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete("contractor");
              newSearchParams.set("pageIndex", "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            selectedValue={contractorSearchParam}
            isLoading={
              syncedParams != null &&
              params.isContractor !== syncedParams.isContractor
            }
          />
        ),
        cell: ({ getValue, row }) => {
          if (row.original.organizationId === BARUNCORP_ORGANIZATION_ID) {
            return <p className="text-muted-foreground">-</p>;
          }

          return <Checkbox checked={getValue()} />;
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => {
          const value = getValue();
          const status = userStatuses[value];

          return (
            <div className={`flex items-center`}>
              <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
              <span className="whitespace-nowrap">{status.value}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("dateOfJoining", {
        header: "Date of Joining",
        cell: ({ getValue }) => {
          const value = getValue();
          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return format(new Date(value), "MM-dd-yyyy");
        },
      }),
      columnHelper.display({
        id: "action",
        cell: ({ row }) => {
          const { status, email, organizationId } = row.original;
          return (
            <UserActionField
              email={email}
              status={status}
              organizationId={organizationId}
            />
          );
        },
      }),
    ],
    [
      contractorSearchParam,
      emailSearchParam,
      nameSearchParam,
      params,
      pathname,
      router,
      searchParams,
      syncedParams,
    ]
  );

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
      columnVisibility: {
        dateOfJoining: organization.id === BARUNCORP_ORGANIZATION_ID,
      },
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
                    router.push(`/system-management/users/${row.id}`);
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
