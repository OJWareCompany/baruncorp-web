"use client";
import {
  PaginationState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useProfileContext } from "../../ProfileProvider";
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
import useJobsQuery, { getJobsQueryKey } from "@/queries/useJobsQuery";
import {
  FindJobPaginatedHttpControllerFindJobParams,
  JobPaginatedResponseDto,
} from "@/api/api-spec";
import {
  InTableButtonStyles,
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
  transformYesOrNoEnumWithEmptyStringIntoNullableBoolean,
} from "@/lib/constants";
import { formatInEST } from "@/lib/utils";
import useOnPaginationChange from "@/hook/useOnPaginationChange";
import { Badge } from "@/components/ui/badge";
import useJobsColumnVisibility from "@/hook/useJobsColumnVisibility";
import usePatchJobSendMutation from "@/mutations/usePatchJobSendMutation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LoadingButton from "@/components/LoadingButton";
import { toast } from "@/components/ui/use-toast";
import { InTableButton } from "@/components/ui/intablebutton";
import OpenJobFolderOnWebButton from "@/components/job-detail-page/OpenJobFolderOnWebButton";
import TextCopyButton from "@/components/ui/incopybutton";
import SortDirectionSelectButton from "@/components/table/SortDirectionSelectButton";
import EnumHeader from "@/components/table/EnumHeader";
import SearchHeader from "@/components/table/SearchHeader";
import GlobalSearch from "@/components/table/GlobalSearch";
import DownloadCSVButton from "@/components/table/DownloadCSVButton";
import NewTabTableRow from "@/components/table/NewTabTableRow";
import SortFieldSelectButton from "@/components/table/SortFieldSelectButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const columnHelper =
  createColumnHelper<JobPaginatedResponseDto["items"][number]>();

const TABLE_NAME = "Jobs";
const RELATIVE_PATH = "src/app/(root)/system-management/jobs/JobsTable.tsx";

export default function JobsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [syncedParams, setSyncedParams] =
    useState<FindJobPaginatedHttpControllerFindJobParams>();

  const [alertDialogState, setAlertDialogState] = useState<
    { open: false } | { open: true; jobId: string }
  >({ open: false });

  const {
    authority: { canSendDeliverables },
  } = useProfileContext();

  const {
    mutateAsync: patchSendDeliverablesMutationAsync,
    isPending: isPatchSendDeliverablesMutationPending,
  } = usePatchJobSendMutation();
  const queryClient = useQueryClient();

  const jobStatusSearchParamName = `${TABLE_NAME}JobStatus`;
  const jobNameSearchParamName = `${TABLE_NAME}JobName`;
  const propertyTypeSearchParamName = `${TABLE_NAME}PropertyType`;
  const mountingTypeSearchParamName = `${TABLE_NAME}MountingType`;
  const expediteSearchParamName = `${TABLE_NAME}Expedite`;
  const pageIndexSearchParamName = `${TABLE_NAME}PageIndex`;
  const inReviewSearchParamName = `${TABLE_NAME}InReview`;
  const prioritySearchParamName = `${TABLE_NAME}Priority`;
  const projectNumberSearchParamName = `${TABLE_NAME}ProjectNumber`;
  const propertyOwnerSearchParamName = `${TABLE_NAME}PropertyOwner`;
  const sortDirectionSearchParamName = `${TABLE_NAME}SortDirection`;
  const sortFieldSearchParamName = `${TABLE_NAME}SortField`;
  const taskNameSearchParamName = `${TABLE_NAME}TaskName`;
  const taskAssigneeNameSearchParamName = `${TABLE_NAME}TaskAssigneeName`;
  const clientOrganizationSearchParamName = `${TABLE_NAME}ClientOrganization`;

  const [pageSize, setPageSize] = useLocalStorage<number>(
    `${RELATIVE_PATH}`,
    10
  );
  const pagination: PaginationState = {
    pageIndex: searchParams.get(pageIndexSearchParamName)
      ? Number(searchParams.get(pageIndexSearchParamName))
      : 0,
    pageSize,
  };

  const jobNameSearchParam = searchParams.get(jobNameSearchParamName) ?? "";
  const jobStatusSearchParamParseResult = JobStatusEnum.safeParse(
    searchParams.get(jobStatusSearchParamName)
  );
  const jobStatusSearchParam = jobStatusSearchParamParseResult.success
    ? jobStatusSearchParamParseResult.data
    : "";
  const clientOrganizationSearchParam =
    searchParams.get(encodeURIComponent(clientOrganizationSearchParamName)) ??
    "";
  const taskNameSearchParam =
    searchParams.get(encodeURIComponent(taskNameSearchParamName)) ?? "";
  const taskAssigneeNameSearchParam =
    searchParams.get(encodeURIComponent(taskAssigneeNameSearchParamName)) ?? "";
  const propertyTypeSearchParamParseResult = PropertyTypeEnum.safeParse(
    searchParams.get(propertyTypeSearchParamName)
  );
  const propertyTypeSearchParam = propertyTypeSearchParamParseResult.success
    ? propertyTypeSearchParamParseResult.data
    : "";
  const mountingTypeSearchParamParseResult = MountingTypeEnum.safeParse(
    searchParams.get(mountingTypeSearchParamName)
  );
  const mountingTypeSearchParam = mountingTypeSearchParamParseResult.success
    ? mountingTypeSearchParamParseResult.data
    : "";
  const expediteSearchParamParseResult = YesOrNoEnum.safeParse(
    searchParams.get(expediteSearchParamName)
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

  const sortDirectionSearchParamResult = SortDirectionTypeEnum.safeParse(
    searchParams.get(sortDirectionSearchParamName)
  );
  const sortDirectionSearchParam = sortDirectionSearchParamResult.success
    ? sortDirectionSearchParamResult.data
    : undefined;

  const sortFieldSearchParamResult = SortFieldTypeEnum.safeParse(
    searchParams.get(sortFieldSearchParamName)
  );
  const sortFieldSearchParam = sortFieldSearchParamResult.success
    ? sortFieldSearchParamResult.data
    : undefined;

  const sortDirection =
    sortDirectionSearchParam !== undefined
      ? SortDirectionTypeEnum.parse(sortDirectionSearchParam)
      : undefined;

  const sortField =
    sortFieldSearchParam !== undefined
      ? SortFieldTypeEnum.parse(sortFieldSearchParam)
      : undefined;

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pagination,
    updatePageSize: setPageSize,
  });
  const columnVisibility = useJobsColumnVisibility();

  const params: FindJobPaginatedHttpControllerFindJobParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      jobName: jobNameSearchParam,
      clientOrganizationName: clientOrganizationSearchParam,
      taskName: taskNameSearchParam,
      taskAssigneeName: taskAssigneeNameSearchParam,
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
      projectNumber: projectNumberSearchParam,
      propertyOwner: propertyOwnerSearchParam,
      sortDirection,
      sortField,
    }),
    [
      pagination.pageIndex,
      pagination.pageSize,
      jobNameSearchParam,
      clientOrganizationSearchParam,
      taskNameSearchParam,
      taskAssigneeNameSearchParam,
      jobStatusSearchParam,
      mountingTypeSearchParam,
      propertyTypeSearchParam,
      expediteSearchParam,
      inReviewSearchParam,
      prioritySearchParam,
      projectNumberSearchParam,
      propertyOwnerSearchParam,
      sortDirection,
      sortField,
    ]
  );

  const { data, isLoading, isFetching } = useJobsQuery(params, true);

  useEffect(() => {
    if (!isFetching) {
      setSyncedParams(params);
    }
  }, [isFetching, params]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("jobFolderId", {
        header: "Google Drive",
        enableSorting: false,
        cell: ({ row }) => {
          const job = row.original;
          return (
            <div
              className="flex pl-3"
              onClick={(event) => {
                event.preventDefault();
              }}
            >
              <OpenJobFolderOnWebButton
                job={job}
                className="-ml-3 text-xs h-8 px-2"
              />
            </div>
          );
        },
      }),
      columnHelper.accessor("priority", {
        enableSorting: false,
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
      columnHelper.accessor("dueDate", {
        header: "Date Due",
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return formatInEST(value);
        },
      }),
      columnHelper.accessor("clientInfo.clientOrganizationName", {
        header: () => (
          <SearchHeader
            buttonText="Organization"
            searchParamName={clientOrganizationSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            isLoading={
              syncedParams != null &&
              params.clientOrganizationName !==
                syncedParams.clientOrganizationName
            }
          />
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("jobName", {
        enableSorting: false,
        header: () => {
          return (
            <SearchHeader
              buttonText="Name"
              searchParamName={jobNameSearchParamName}
              pageIndexSearchParamName={pageIndexSearchParamName}
              isLoading={
                syncedParams != null && params.jobName !== syncedParams.jobName
              }
            />
          );
        },
      }),
      columnHelper.display({
        id: "copyJobId",
        enableSorting: false,
        cell: ({ row }) => {
          const value = row.original.jobName;
          return <TextCopyButton JobId={value} />;
        },
      }),
      columnHelper.accessor("jobStatus", {
        enableSorting: false,
        header: () => (
          <EnumHeader
            buttonText="Status"
            searchParamName={jobStatusSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            zodEnum={JobStatusEnum}
            isLoading={
              syncedParams != null &&
              params.jobStatus !== syncedParams.jobStatus
            }
          />
        ),
        cell: ({ getValue, row }) => {
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
      columnHelper.display({
        id: "sendDeliverables",
        enableSorting: false,
        cell: ({ row }) => {
          const value = row.original.jobStatus;
          const dateSentToClient = row.original.dateSentToClient;
          const status = jobStatuses[value];
          if (
            canSendDeliverables &&
            (status.value === "Completed" ||
              status.value === "Canceled (Invoice)")
          ) {
            return (
              <InTableButton
                size={"default"}
                variant={"outline"}
                className={InTableButtonStyles(dateSentToClient)}
                onClick={() => {
                  setAlertDialogState({ open: true, jobId: row.id });
                }}
              >
                {dateSentToClient !== null ? (
                  <span>Resend Deliverables</span>
                ) : (
                  <span>Send Deliverables</span>
                )}
              </InTableButton>
            );
          }
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
                  className="-ml-2 focus-visible:ring-0 whitespace-nowrap text-xs h-8 px-2"
                >
                  Task
                  <ChevronsUpDown className="h-3 w-3 ml-1.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="grid w-30 gap-2 place-items-center">
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
        enableSorting: false,
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
        enableSorting: false,
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
        enableSorting: false,
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
        enableSorting: false,
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
        enableSorting: false,
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
  }, [
    prioritySearchParamName,
    pageIndexSearchParamName,
    syncedParams,
    params.priority,
    params.clientOrganizationName,
    params.jobName,
    params.jobStatus,
    params.taskName,
    params.taskAssigneeName,
    params.projectPropertyType,
    params.mountingType,
    params.projectNumber,
    params.propertyOwner,
    clientOrganizationSearchParamName,
    jobNameSearchParamName,
    jobStatusSearchParamName,
    canSendDeliverables,
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
    getSortedRowModel: getSortedRowModel(),
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
      <GlobalSearch
        searchParamOptions={{
          jobNameSearchParamName: jobNameSearchParamName,
          projectNumberSearchParamName: projectNumberSearchParamName,
          propertyOwnerSearchParamName: propertyOwnerSearchParamName,
        }}
        pageIndexSearchParamName={pageIndexSearchParamName}
      />
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
                  href={`/system-management/jobs/${row.id}`}
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
              <DownloadCSVButton data={data} className="mr-2" />
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
              />
              <SortDirectionSelectButton
                searchParamName={sortDirectionSearchParamName}
                pageIndexSearchParamName={pageIndexSearchParamName}
                zodEnum={SortDirectionTypeEnum}
              />
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={() => {
                  const newSearchParams = new URLSearchParams();
                  newSearchParams.set(
                    encodeURIComponent(pageIndexSearchParamName),
                    "0"
                  );
                  router.push(`${pathname}?${newSearchParams.toString()}`, {
                    scroll: false,
                  });
                }}
              >
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
              isLoading={isPatchSendDeliverablesMutationPending}
              onClick={() => {
                if (!alertDialogState.open) {
                  return;
                }
                patchSendDeliverablesMutationAsync({
                  jobId: alertDialogState.jobId,
                })
                  .then(() => {
                    toast({ title: "Success" });
                    queryClient.invalidateQueries({
                      queryKey: getJobsQueryKey({}),
                    });
                    setAlertDialogState({ open: false });
                  })
                  .catch((error: AxiosError<ErrorResponseData>) => {
                    switch (error.response?.status) {
                      case 400:
                        if (error.response.data.errorCode.includes("20809")) {
                          toast({
                            title: "Job is already sent to client.",
                            variant: "destructive",
                          });
                          return;
                        }
                    }

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
    </div>
  );
}
