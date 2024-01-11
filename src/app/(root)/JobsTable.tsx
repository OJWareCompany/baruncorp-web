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
import useMyOrderedJobsQuery from "@/queries/useMyOrderedJobsQuery";
import {
  FindMyOrderedJobPaginatedHttpControllerFindJobParams,
  JobPaginatedResponseDto,
} from "@/api";
import {
  JobStatusEnum,
  MountingTypeEnum,
  PropertyTypeEnum,
  YesOrNoEnum,
  jobStatuses,
  transformJobStatusEnumWithEmptyStringIntoNullableJobStatusEnum,
  transformMountingTypeEnumWithEmptyStringIntoNullableMountingTypeEnum,
  transformPropertyTypeEnumWithEmptyStringIntoNullablePropertyTypeEnum,
  transformYesOrNoEnumWithEmptyStringIntoNullableBoolean,
} from "@/lib/constants";
import EnumHeader from "@/components/table/EnumHeader";
import { Checkbox } from "@/components/ui/checkbox";
import SearchHeader from "@/components/table/SearchHeader";
import TasksBadge from "@/components/badge/TasksBadge";
import { formatInEST } from "@/lib/utils";
import AdditionalInformationHoverCard from "@/components/hover-card/AdditionalInformationHoverCard";

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
    useState<FindMyOrderedJobPaginatedHttpControllerFindJobParams>();

  const pagination: PaginationState = {
    pageIndex: searchParams.get(encodeURIComponent(`${type} pageIndex`))
      ? Number(searchParams.get(encodeURIComponent(`${type} pageIndex`)))
      : 0,
    pageSize: searchParams.get(encodeURIComponent(`${type} pageSize`))
      ? Number(searchParams.get(encodeURIComponent(`${type} pageSize`)))
      : 10,
  };

  const nameSearchParam =
    searchParams.get(encodeURIComponent(`${type} name`)) ?? "";
  const jobStatusSearchParamParseResult = JobStatusEnum.safeParse(
    searchParams.get(encodeURIComponent(`${type} jobStatus`))
  );
  const jobStatusSearchParam = jobStatusSearchParamParseResult.success
    ? jobStatusSearchParamParseResult.data
    : type === "All"
    ? ""
    : type;
  const propertyTypeSearchParamParseResult = PropertyTypeEnum.safeParse(
    searchParams.get(encodeURIComponent(`${type} propertyType`))
  );
  const propertyTypeSearchParam = propertyTypeSearchParamParseResult.success
    ? propertyTypeSearchParamParseResult.data
    : "";
  const mountingTypeSearchParamParseResult = MountingTypeEnum.safeParse(
    searchParams.get(encodeURIComponent(`${type} mountingType`))
  );
  const mountingTypeSearchParam = mountingTypeSearchParamParseResult.success
    ? mountingTypeSearchParamParseResult.data
    : "";
  const expediteSearchParamParseResult = YesOrNoEnum.safeParse(
    searchParams.get(encodeURIComponent(`${type} expedite`))
  );
  const expediteSearchParam = expediteSearchParamParseResult.success
    ? expediteSearchParamParseResult.data
    : "";

  const params: FindMyOrderedJobPaginatedHttpControllerFindJobParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      jobName: nameSearchParam,
      jobStatus:
        transformJobStatusEnumWithEmptyStringIntoNullableJobStatusEnum.parse(
          jobStatusSearchParam
        ),
      mountingType:
        transformMountingTypeEnumWithEmptyStringIntoNullableMountingTypeEnum.parse(
          mountingTypeSearchParam
        ),
      projectPropertyType:
        transformPropertyTypeEnumWithEmptyStringIntoNullablePropertyTypeEnum.parse(
          propertyTypeSearchParam
        ),
      isExpedited:
        transformYesOrNoEnumWithEmptyStringIntoNullableBoolean.parse(
          expediteSearchParam
        ),
    }),
    [
      expediteSearchParam,
      jobStatusSearchParam,
      mountingTypeSearchParam,
      nameSearchParam,
      pagination.pageIndex,
      pagination.pageSize,
      propertyTypeSearchParam,
    ]
  );

  const { data, isLoading, isFetching } = useMyOrderedJobsQuery(params, true);

  useEffect(() => {
    if (!isFetching) {
      setSyncedParams(params);
    }
  }, [isFetching, params]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("isExpedited", {
        header: () => (
          <EnumHeader
            buttonText="Expedite"
            isFiltered={expediteSearchParam !== ""}
            items={YesOrNoEnum.options}
            selectedValue={expediteSearchParam}
            onItemButtonClick={(value) => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set(
                encodeURIComponent(`${type} expedite`),
                value
              );
              newSearchParams.set(encodeURIComponent(`${type} pageIndex`), "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            onResetButtonClick={() => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete(encodeURIComponent(`${type} expedite`));
              newSearchParams.set(encodeURIComponent(`${type} pageIndex`), "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            isLoading={
              syncedParams != null &&
              params.isExpedited !== syncedParams.isExpedited
            }
          />
        ),
        cell: ({ getValue }) => <Checkbox checked={getValue()} />,
      }),
      columnHelper.accessor("clientInfo.clientOrganizationName", {
        header: "Organization",
      }),
      columnHelper.accessor("jobName", {
        header: () => (
          <SearchHeader
            initialValue={nameSearchParam}
            buttonText="Name"
            onFilterButtonClick={(value) => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set(encodeURIComponent(`${type} name`), value);
              newSearchParams.set(encodeURIComponent(`${type} pageIndex`), "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            isFiltered={nameSearchParam !== ""}
            onResetButtonClick={() => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete(encodeURIComponent(`${type} name`));
              newSearchParams.set(encodeURIComponent(`${type} pageIndex`), "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            isLoading={
              syncedParams != null && params.jobName !== syncedParams.jobName
            }
          />
        ),
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
        header: () => (
          <EnumHeader
            buttonText="Property Type"
            isFiltered={propertyTypeSearchParam !== ""}
            items={PropertyTypeEnum.options}
            onItemButtonClick={(value) => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set(
                encodeURIComponent(`${type} propertyType`),
                value
              );
              newSearchParams.set(encodeURIComponent(`${type} pageIndex`), "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            onResetButtonClick={() => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete(
                encodeURIComponent(`${type} propertyType`)
              );
              newSearchParams.set(encodeURIComponent(`${type} pageIndex`), "0");

              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            selectedValue={propertyTypeSearchParam}
            isLoading={
              syncedParams != null &&
              params.projectPropertyType !== syncedParams.projectPropertyType
            }
          />
        ),
      }),
      columnHelper.accessor("mountingType", {
        header: () => (
          <EnumHeader
            buttonText="Mounting Type"
            isFiltered={mountingTypeSearchParam !== ""}
            items={MountingTypeEnum.options}
            onItemButtonClick={(value) => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set(
                encodeURIComponent(`${type} mountingType`),
                value
              );
              newSearchParams.set(encodeURIComponent(`${type} pageIndex`), "0");
              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            onResetButtonClick={() => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete(
                encodeURIComponent(`${type} mountingType`)
              );
              newSearchParams.set(encodeURIComponent(`${type} pageIndex`), "0");

              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            selectedValue={mountingTypeSearchParam}
            isLoading={
              syncedParams != null &&
              params.mountingType !== syncedParams.mountingType
            }
          />
        ),
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
    expediteSearchParam,
    jobStatusSearchParam,
    mountingTypeSearchParam,
    nameSearchParam,
    params,
    pathname,
    propertyTypeSearchParam,
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
                    router.push(`/jobs/${row.id}`);
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
