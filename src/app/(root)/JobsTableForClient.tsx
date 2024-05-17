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
  ChevronsUpDown,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
} from "@/api/api-spec";
import {
  JobPriorityEnum,
  JobStatusEnum,
  MountingTypeEnum,
  PropertyTypeEnum,
  SortDirectionTypeEnum,
  SortFieldTypeEnum,
  YesOrNoEnum,
  jobPriorities,
  jobStatuses,
  transformJobPriorityEnumWithEmptyStringIntoNullableJobPriorityEnum,
  transformJobStatusEnumWithEmptyStringIntoNullableJobStatusEnum,
  transformMountingTypeEnumWithEmptyStringIntoNullableMountingTypeEnum,
  transformPropertyTypeEnumWithEmptyStringIntoNullablePropertyTypeEnum,
  transformSortDirectionTypeEnumWithEmptyStringIntoNullableSortDirectionTypeEnum,
  transformSortFieldTypeEnumWithEmptyStringIntoNullableSortFieldTypeEnum,
  transformYesOrNoEnumWithEmptyStringIntoNullableBoolean,
} from "@/lib/constants";
import useOnPaginationChange from "@/hook/useOnPaginationChange";
import useJobsColumnVisibility from "@/hook/useJobsColumnVisibility";
import NewTabTableRow from "@/components/table/NewTabTableRow";
import DownloadCSVButton from "@/components/table/DownloadCSVButton";
import SortDirectionSelectButton from "@/components/table/SortDirectionSelectButton";
import SortFieldSelectButton from "@/components/table/SortFieldSelectButton";
import { cn, formatInEST } from "@/lib/utils";
import SearchHeader from "@/components/table/SearchHeader";
import EnumHeader from "@/components/table/EnumHeader";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import TextCopyButton from "@/components/ui/incopybutton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const columnHelper =
  createColumnHelper<JobPaginatedResponseDto["items"][number]>();

const TABLE_NAME = "JobsForClient";
const RELATIVE_PATH = "src/app/(root)/JobsTableForClient.tsx";

interface Props {
  type: "All" | JobStatusEnum;
}

export default function JobsTableForClient({ type }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [syncedParams, setSyncedParams] =
    useState<FindMyOrderedJobPaginatedHttpControllerFindJobParams>();
  const [reset, setReset] = useState(false);

  const handleResetComplete = () => {
    setReset(false);
  };

  const jobStatusSearchParamName = `${TABLE_NAME}${type}JobStatus`;
  const jobNameSearchParamName = `${TABLE_NAME}${type}JobName`;
  const propertyTypeSearchParamName = `${TABLE_NAME}${type}PropertyType`;
  const mountingTypeSearchParamName = `${TABLE_NAME}${type}MountingType`;
  const expediteSearchParamName = `${TABLE_NAME}${type}Expedite`;
  const pageIndexSearchParamName = `${TABLE_NAME}${type}PageIndex`;
  const inReviewSearchParamName = `${TABLE_NAME}${type}InReview`;
  const prioritySearchParamName = `${TABLE_NAME}${type}Priority`;
  const projectNumberSearchParamName = `${TABLE_NAME}${type}ProjectNumber`;
  const propertyOwnerSearchParamName = `${TABLE_NAME}${type}PropertyOwner`;
  const globalJobNameSearchParamName = `${TABLE_NAME}JobName`;
  const globalProjectNumberSearchParamName = `${TABLE_NAME}ProjectNumber`;
  const globalPropertyOwnerSearchParamName = `${TABLE_NAME}PropertyOwner`;
  const globalPageIndexSearchParamName = `${TABLE_NAME}PageIndex`;
  const sortDirectionSearchParamName = `${TABLE_NAME}SortDirection`;
  const sortFieldSearchParamName = `${TABLE_NAME}SortField`;
  const taskNameSearchParamName = `${TABLE_NAME}TaskName`;
  const taskAssigneeNameSearchParamName = `${TABLE_NAME}${type}TaskAssigneeName`;
  const dateSentToClientStartSearchParamName = `${TABLE_NAME}${type}DateSentToClientStart`;
  const dateSentToClientEndSearchParamName = `${TABLE_NAME}${type}DateSentToClientEnd`;

  const [pageSize, setPageSize] = useLocalStorage<number>(
    `${RELATIVE_PATH}_${type}`,
    10
  );
  const pagination: PaginationState = {
    pageIndex: searchParams.get(encodeURIComponent(pageIndexSearchParamName))
      ? Number(searchParams.get(encodeURIComponent(pageIndexSearchParamName)))
      : 0,
    pageSize,
  };
  const jobNameSearchParam =
    searchParams.get(encodeURIComponent(jobNameSearchParamName)) ?? "";
  const taskNameSearchParam =
    searchParams.get(encodeURIComponent(taskNameSearchParamName)) ?? "";
  const taskAssigneeNameSearchParam =
    searchParams.get(encodeURIComponent(taskAssigneeNameSearchParamName)) ?? "";
  const jobStatusSearchParamParseResult = JobStatusEnum.safeParse(
    searchParams.get(encodeURIComponent(jobStatusSearchParamName))
  );
  const jobStatusSearchParam = jobStatusSearchParamParseResult.success
    ? jobStatusSearchParamParseResult.data
    : type === "All"
    ? ""
    : type;
  const dateSentToClientStartSearchParam =
    searchParams.get(
      encodeURIComponent(dateSentToClientStartSearchParamName)
    ) ?? "";
  const dateSentToClientEndSearchParam =
    searchParams.get(encodeURIComponent(dateSentToClientEndSearchParamName)) ??
    "";
  const propertyTypeSearchParamParseResult = PropertyTypeEnum.safeParse(
    searchParams.get(encodeURIComponent(propertyTypeSearchParamName))
  );
  const propertyTypeSearchParam = propertyTypeSearchParamParseResult.success
    ? propertyTypeSearchParamParseResult.data
    : "";
  const mountingTypeSearchParamParseResult = MountingTypeEnum.safeParse(
    searchParams.get(encodeURIComponent(mountingTypeSearchParamName))
  );
  const mountingTypeSearchParam = mountingTypeSearchParamParseResult.success
    ? mountingTypeSearchParamParseResult.data
    : "";
  const expediteSearchParamParseResult = YesOrNoEnum.safeParse(
    searchParams.get(encodeURIComponent(expediteSearchParamName))
  );
  const expediteSearchParam = expediteSearchParamParseResult.success
    ? expediteSearchParamParseResult.data
    : "";
  const inReviewSearchParamParseResult = YesOrNoEnum.safeParse(
    searchParams.get(encodeURIComponent(inReviewSearchParamName))
  );
  const inReviewSearchParam = inReviewSearchParamParseResult.success
    ? inReviewSearchParamParseResult.data
    : "";
  const prioritySearchParamParseResult = JobPriorityEnum.safeParse(
    searchParams.get(encodeURIComponent(prioritySearchParamName))
  );
  const prioritySearchParam = prioritySearchParamParseResult.success
    ? prioritySearchParamParseResult.data
    : "";
  const projectNumberSearchParam =
    searchParams.get(encodeURIComponent(projectNumberSearchParamName)) ?? "";
  const propertyOwnerSearchParam =
    searchParams.get(encodeURIComponent(propertyOwnerSearchParamName)) ?? "";
  const globalJobNameSearchParam =
    searchParams.get(encodeURIComponent(globalJobNameSearchParamName)) ?? "";
  const globalProjectNumberSearchParam =
    searchParams.get(encodeURIComponent(globalProjectNumberSearchParamName)) ??
    "";
  const globalPropertyOwnerSearchParam =
    searchParams.get(encodeURIComponent(globalPropertyOwnerSearchParamName)) ??
    "";
  const globalPagination: PaginationState = {
    pageIndex: searchParams.get(
      encodeURIComponent(globalPageIndexSearchParamName)
    )
      ? Number(
          searchParams.get(encodeURIComponent(globalPageIndexSearchParamName))
        )
      : 0,
    pageSize,
  };
  const sortDirectionSearchParamResult = SortDirectionTypeEnum.safeParse(
    searchParams.get(sortDirectionSearchParamName)
  );
  const sortDirectionSearchParam = sortDirectionSearchParamResult.success
    ? sortDirectionSearchParamResult.data
    : "";
  const sortFieldSearchParamResult = SortFieldTypeEnum.safeParse(
    searchParams.get(sortFieldSearchParamName)
  );
  const sortFieldSearchParam = sortFieldSearchParamResult.success
    ? sortFieldSearchParamResult.data
    : "";

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pagination,
    updatePageSize: setPageSize,
  });
  const columnVisibility = useJobsColumnVisibility();

  const params: FindMyOrderedJobPaginatedHttpControllerFindJobParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1 || globalPagination.pageIndex + 1,
      limit: pagination.pageSize || globalPagination.pageSize,
      jobName: jobNameSearchParam || globalJobNameSearchParam,
      taskName: taskNameSearchParam,
      taskAssigneeName: taskAssigneeNameSearchParam,
      dateSentToClientStart: dateSentToClientStartSearchParam,
      dateSentToClientEnd: dateSentToClientEndSearchParam,
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
      inReview:
        transformYesOrNoEnumWithEmptyStringIntoNullableBoolean.parse(
          inReviewSearchParam
        ),
      priority:
        transformJobPriorityEnumWithEmptyStringIntoNullableJobPriorityEnum.parse(
          prioritySearchParam
        ),
      projectNumber: projectNumberSearchParam || globalProjectNumberSearchParam,
      propertyOwner: propertyOwnerSearchParam || globalPropertyOwnerSearchParam,
      sortDirection:
        transformSortDirectionTypeEnumWithEmptyStringIntoNullableSortDirectionTypeEnum.parse(
          sortDirectionSearchParam
        ),
      sortField:
        transformSortFieldTypeEnumWithEmptyStringIntoNullableSortFieldTypeEnum.parse(
          sortFieldSearchParam
        ),
    }),
    [
      pagination.pageIndex,
      pagination.pageSize,
      globalPagination.pageIndex,
      globalPagination.pageSize,
      jobNameSearchParam,
      globalJobNameSearchParam,
      taskNameSearchParam,
      taskAssigneeNameSearchParam,
      dateSentToClientStartSearchParam,
      dateSentToClientEndSearchParam,
      jobStatusSearchParam,
      mountingTypeSearchParam,
      propertyTypeSearchParam,
      expediteSearchParam,
      inReviewSearchParam,
      prioritySearchParam,
      projectNumberSearchParam,
      globalProjectNumberSearchParam,
      propertyOwnerSearchParam,
      globalPropertyOwnerSearchParam,
      sortDirectionSearchParam,
      sortFieldSearchParam,
    ]
  );

  const { data, isLoading, isFetching } = useMyOrderedJobsQuery(params, true);

  useEffect(() => {
    if (!isFetching) {
      setSyncedParams(params);
    }
  }, [isFetching, params]);

  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.accessor("inReview", {
        header: () => (
          <EnumHeader
            buttonText="In Review"
            searchParamName={inReviewSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            zodEnum={YesOrNoEnum}
            isLoading={
              syncedParams != null && params.inReview !== syncedParams.inReview
            }
          />
        ),
        cell: ({ getValue }) => (
          <div className="flex">
            <Checkbox checked={getValue()} />
          </div>
        ),
      }),
      columnHelper.accessor("priority", {
        header: () => (
          <EnumHeader
            buttonText="Priority"
            searchParamName={prioritySearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            zodEnum={JobPriorityEnum}
            isLoading={
              syncedParams != null && params.priority !== syncedParams.priority
            }
          />
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          const status = jobPriorities[value];

          return <Badge className={`${status.color}`}>{status.value}</Badge>;
        },
      }),
      columnHelper.accessor("jobName", {
        header: () => (
          <SearchHeader
            buttonText="Name"
            searchParamName={jobNameSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            isLoading={
              syncedParams != null && params.jobName !== syncedParams.jobName
            }
          />
        ),
      }),
      columnHelper.display({
        id: "copyJobId",
        cell: ({ row }) => {
          const value = row.original.jobName;
          return <TextCopyButton JobId={value} />;
        },
      }),
      columnHelper.accessor("jobStatus", {
        header: () =>
          type !== "All" ? (
            "Status"
          ) : (
            <EnumHeader
              buttonText="Status"
              searchParamName={jobStatusSearchParamName}
              pageIndexSearchParamName={pageIndexSearchParamName}
              zodEnum={JobStatusEnum}
              isLoading={
                syncedParams != null &&
                params.jobStatus !== syncedParams.jobStatus
              }
              defaultValue={type === "All" ? null : type}
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
        header: () => (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  className={cn(
                    "-ml-2 focus-visible:ring-0 whitespace-nowrap text-xs h-8 px-2",
                    (params.taskAssigneeName || params.taskName) &&
                      "underline decoration-2 underline-offset-2"
                  )}
                >
                  Task
                  <ChevronsUpDown className="h-3 w-3 ml-1.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="grid w-[150px] gap-1 pl-5">
                <SearchHeader
                  buttonText="Task Name"
                  searchParamName={taskNameSearchParamName}
                  pageIndexSearchParamName={pageIndexSearchParamName}
                  isLoading={
                    syncedParams != null &&
                    params.taskName !== syncedParams.taskName
                  }
                />
                <SearchHeader
                  buttonText="Task Assignee"
                  searchParamName={taskAssigneeNameSearchParamName}
                  pageIndexSearchParamName={pageIndexSearchParamName}
                  isLoading={
                    syncedParams != null &&
                    params.taskAssigneeName !== syncedParams.taskAssigneeName
                  }
                />
              </PopoverContent>
            </Popover>
          </>
        ),
        cell: ({ getValue, row }) => {
          const tasks = row.original.assignedTasks;
          return (
            <div>
              {tasks.map((task) => {
                const status = jobStatuses[task.status];

                return (
                  <Badge
                    variant={"outline"}
                    className="flex items-center py-1 "
                    key={task.id}
                  >
                    {status && (
                      <status.Icon
                        className={`w-4 h-4 mr-2 flex-shrink-0 ${status.color}`}
                      />
                    )}
                    <div className="flex flex-col">
                      <p className="font-medium">{task.taskName}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.assigneeName ?? "-"}
                      </p>
                    </div>
                  </Badge>
                );
              })}
            </div>
          );
        },
      }),
      columnHelper.accessor("projectPropertyType", {
        header: () => (
          <EnumHeader
            buttonText="Property Type"
            searchParamName={propertyTypeSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            zodEnum={PropertyTypeEnum}
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
            searchParamName={mountingTypeSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            zodEnum={MountingTypeEnum}
            isLoading={
              syncedParams != null &&
              params.mountingType !== syncedParams.mountingType
            }
          />
        ),
      }),
      columnHelper.accessor("projectNumber", {
        header: () => (
          <SearchHeader
            buttonText="Project Number"
            searchParamName={projectNumberSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            isLoading={
              syncedParams != null &&
              params.projectNumber !== syncedParams.projectNumber
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
      columnHelper.accessor("propertyOwner", {
        header: () => (
          <SearchHeader
            buttonText="Property Owner"
            searchParamName={propertyOwnerSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            isLoading={
              syncedParams != null &&
              params.propertyOwner !== syncedParams.propertyOwner
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
    ];
    if (type !== "In Progress") {
      baseColumns.push(
        columnHelper.accessor<"completedCancelledDate", string>(
          "completedCancelledDate",
          {
            header: "Date Completed/Canceled",
            cell: ({ getValue }) => {
              const value = getValue();
              if (value == null) {
                return <p className="text-muted-foreground">-</p>;
              }
              return formatInEST(value);
            },
          }
        ),
        columnHelper.accessor<"dateSentToClient", string>("dateSentToClient", {
          header: "Date Sent to Client",
          // header: () =>
          //   type === "All" ||
          //   type === "Completed" ||
          //   type === "Canceled (Invoice)" ? (
          //     <SearchDateHeader
          //       buttonText="Date Sent to Client"
          //       searchParamOptions={{
          //         dateSentToClientStartSearchParamName,
          //         dateSentToClientEndSearchParamName,
          //       }}
          //       pageIndexSearchParamName={pageIndexSearchParamName}
          //     />
          //   ) : (
          //     "Date Sent to Client"
          //   ),
          cell: ({ getValue }) => {
            const value = getValue();
            if (value == null) {
              return <p className="text-muted-foreground">-</p>;
            }
            return formatInEST(value);
          },
        })
      );
    }
    return baseColumns;
  }, [
    type,
    inReviewSearchParamName,
    pageIndexSearchParamName,
    syncedParams,
    params.inReview,
    params.priority,
    params.jobName,
    params.jobStatus,
    params.taskAssigneeName,
    params.taskName,
    params.projectPropertyType,
    params.mountingType,
    params.projectNumber,
    params.propertyOwner,
    prioritySearchParamName,
    jobNameSearchParamName,
    jobStatusSearchParamName,
    taskNameSearchParamName,
    taskAssigneeNameSearchParamName,
    propertyTypeSearchParamName,
    mountingTypeSearchParamName,
    projectNumberSearchParamName,
    propertyOwnerSearchParamName,
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
      columnVisibility,
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
                  href={`/jobs/${row.id}`}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={
                    (row.original.isExpedited ? "bg-yellow-100 " : "") +
                    (row.original.inReview ? "bg-violet-100 " : "") +
                    (row.original.isExpedited && row.original.inReview
                      ? "bg-blue-100"
                      : "")
                  }
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
            {table.getRowModel().rows.length === 0 ? null : (
              <DownloadCSVButton data={data} type={type} className="mr-2" />
            )}
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
          {table.getRowModel().rows.length === 0 ? null : (
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Sort Page</p>
              <SortFieldSelectButton
                searchParamName={sortFieldSearchParamName}
                pageIndexSearchParamName={pageIndexSearchParamName}
                zodEnum={SortFieldTypeEnum}
                reset={reset}
                onResetComplete={handleResetComplete}
              />
              <SortDirectionSelectButton
                searchParamName={sortDirectionSearchParamName}
                pageIndexSearchParamName={pageIndexSearchParamName}
                zodEnum={SortDirectionTypeEnum}
                reset={reset}
                onResetComplete={handleResetComplete}
              />
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={() => {
                  const newSearchParams = new URLSearchParams(
                    window.location.search
                  );
                  newSearchParams.delete(sortFieldSearchParamName);
                  newSearchParams.delete(sortDirectionSearchParamName);
                  newSearchParams.set(
                    encodeURIComponent(pageIndexSearchParamName),
                    "0"
                  );
                  router.push(`${pathname}?${newSearchParams.toString()}`, {
                    scroll: false,
                  });
                  setReset(true);
                }}
              >
                <RotateCcw className="mr-2 w-3 h-3" />
                Reset
              </Button>
            </div>
          )}
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
