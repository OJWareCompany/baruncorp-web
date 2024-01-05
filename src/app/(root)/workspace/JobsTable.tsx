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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useMyJobsQuery from "@/queries/useMyJobsQuery";
import {
  FindJobPaginatedHttpControllerFindJobParams,
  JobPaginatedResponseDto,
} from "@/api";
import { Checkbox } from "@/components/ui/checkbox";
import {
  JobStatusEnum,
  jobStatuses,
  transformJobStatusEnumWithEmptyStringIntoNullableJobStatusEnum,
} from "@/lib/constants";
import TasksBadge from "@/components/badge/TasksBadge";
import AdditionalInformationHoverCard from "@/components/hover-card/AdditionalInformationHoverCard";
import { formatInEST } from "@/lib/utils";
import EnumHeader from "@/components/table/EnumHeader";

const columnHelper =
  createColumnHelper<JobPaginatedResponseDto["items"][number]>();

interface Props {
  type: "All" | JobStatusEnum;
}

export default function JobsTable({ type }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [syncedParams, setSyncedParams] =
    useState<FindJobPaginatedHttpControllerFindJobParams>();

  const pagination: PaginationState = {
    pageIndex: searchParams.get(encodeURIComponent(`${type} pageIndex`))
      ? Number(searchParams.get(encodeURIComponent(`${type} pageIndex`)))
      : 0,
    pageSize: searchParams.get(encodeURIComponent(`${type} pageSize`))
      ? Number(searchParams.get(encodeURIComponent(`${type} pageSize`)))
      : 10,
  };
  const jobStatusSearchParamParseResult = JobStatusEnum.safeParse(
    searchParams.get(encodeURIComponent(`${type} jobStatus`))
  );
  const jobStatusSearchParam = jobStatusSearchParamParseResult.success
    ? jobStatusSearchParamParseResult.data
    : type === "All"
    ? ""
    : type;

  const params: FindJobPaginatedHttpControllerFindJobParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      jobStatus:
        transformJobStatusEnumWithEmptyStringIntoNullableJobStatusEnum.parse(
          jobStatusSearchParam
        ),
    }),
    [jobStatusSearchParam, pagination.pageIndex, pagination.pageSize]
  );

  const { data, isLoading, isFetching } = useMyJobsQuery(params, true);

  useEffect(() => {
    if (!isFetching) {
      setSyncedParams(params);
    }
  }, [isFetching, params]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("isExpedited", {
        header: "Expedite",
        cell: ({ getValue }) => <Checkbox checked={getValue()} />,
      }),
      columnHelper.accessor("clientInfo.clientOrganizationName", {
        header: "Organization",
      }),
      columnHelper.accessor("jobName", {
        header: "Name",
      }),
      columnHelper.accessor("jobStatus", {
        header: () => (
          <EnumHeader
            buttonText="Status"
            isFiltered={jobStatusSearchParam !== ""}
            items={JobStatusEnum.options}
            onItemButtonClick={(value) => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set(
                encodeURIComponent(`${type} jobStatus`),
                value
              );
              newSearchParams.set(encodeURIComponent(`${type} pageIndex`), "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            onResetButtonClick={() => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete(encodeURIComponent(`${type} jobStatus`));
              newSearchParams.set(encodeURIComponent(`${type} pageIndex`), "0");

              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            selectedValue={jobStatusSearchParam}
            isLoading={
              syncedParams != null &&
              params.jobStatus !== syncedParams.jobStatus
            }
          />
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          const status = jobStatuses[value];

          return (
            <div className={`flex items-center`}>
              <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
              <span className="whitespace-nowrap">{status.value}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("assignedTasks", {
        header: "Tasks",
        cell: ({ getValue }) => <TasksBadge tasks={getValue()} />,
      }),
      columnHelper.accessor("projectPropertyType", {
        header: "Property Type",
      }),
      columnHelper.accessor("mountingType", {
        header: "Mounting Type",
      }),
      columnHelper.accessor("additionalInformationFromClient", {
        header: "Additional Information",
        cell: ({ getValue }) => {
          const value = getValue();
          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return <AdditionalInformationHoverCard value={value} />;
        },
      }),
      columnHelper.accessor("clientInfo.clientUserName", {
        header: "Client User",
      }),
      columnHelper.accessor("receivedAt", {
        header: "Date Received (EST)",
        cell: ({ getValue }) => formatInEST(getValue()),
      }),
    ];
  }, [
    jobStatusSearchParam,
    params,
    pathname,
    router,
    searchParams,
    syncedParams,
    type,
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
        newSearchParams.set(
          encodeURIComponent(`${type} pageIndex`),
          String(pageIndex)
        );
        newSearchParams.set(
          encodeURIComponent(`${type} pageSize`),
          String(pageSize)
        );
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
                    router.push(`/workspace/jobs/${row.id}`);
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
