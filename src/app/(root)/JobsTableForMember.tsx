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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogTitle,
} from "@radix-ui/react-alert-dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  FindMyOrderedJobPaginatedHttpControllerFindJobParams,
  JobPaginatedResponseDto,
} from "@/api/api-spec";
import {
  JobPriorityEnum,
  JobStatusEnum,
  MountingTypeEnum,
  PropertyTypeEnum,
  YesOrNoEnum,
  jobPriorities,
  jobStatuses,
  transformJobPriorityEnumWithEmptyStringIntoNullableJobPriorityEnum,
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
import useOnPaginationChange from "@/hook/useOnPaginationChange";
import { Badge } from "@/components/ui/badge";
import useJobsColumnVisibility from "@/hook/useJobsColumnVisibility";
import useJobsQuery, { getJobsQueryKey } from "@/queries/useJobsQuery";
import {
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import LoadingButton from "@/components/LoadingButton";
import usePatchJobSendMutation from "@/mutations/usePatchJobSendMutation";
import { toast } from "@/components/ui/use-toast";

const columnHelper =
  createColumnHelper<JobPaginatedResponseDto["items"][number]>();

const TABLE_NAME = "JobsForMember";
const RELATIVE_PATH = "src/app/(root)/JobsTableForMember.tsx";

interface Props {
  type: "All" | JobStatusEnum;
}

export default function JobsTableForMember({ type }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [syncedParams, setSyncedParams] =
    useState<FindMyOrderedJobPaginatedHttpControllerFindJobParams>();
  const [alertDialogState, setAlertDialogState] = useState<
    { open: false } | { open: true; jobId: string }
  >({ open: false });

  const {
    mutateAsync: patchSendDeliverablesMutationAsync,
    isPending: isPatchSendDeliverablesMutationPending,
  } = usePatchJobSendMutation();
  const queryClient = useQueryClient();

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
  const jobStatusSearchParamParseResult = JobStatusEnum.safeParse(
    searchParams.get(encodeURIComponent(jobStatusSearchParamName))
  );
  const jobStatusSearchParam = jobStatusSearchParamParseResult.success
    ? jobStatusSearchParamParseResult.data
    : type === "All"
    ? ""
    : type;
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

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pagination,
    updatePageSize: setPageSize,
  });
  const columnVisibility = useJobsColumnVisibility();

  const params: FindMyOrderedJobPaginatedHttpControllerFindJobParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      jobName: jobNameSearchParam,
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
    }),
    [
      pagination.pageIndex,
      pagination.pageSize,
      jobNameSearchParam,
      jobStatusSearchParam,
      mountingTypeSearchParam,
      propertyTypeSearchParam,
      expediteSearchParam,
      inReviewSearchParam,
      prioritySearchParam,
      projectNumberSearchParam,
      propertyOwnerSearchParam,
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
      columnHelper.accessor("isExpedited", {
        header: () => (
          <EnumHeader
            buttonText="Expedite"
            searchParamName={expediteSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            zodEnum={YesOrNoEnum}
            isLoading={
              syncedParams != null &&
              params.isExpedited !== syncedParams.isExpedited
            }
          />
        ),
        cell: ({ getValue }) => (
          <div className="flex">
            <Checkbox checked={getValue()} />
          </div>
        ),
      }),
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
      columnHelper.accessor("clientInfo.clientOrganizationName", {
        header: "Organization",
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
      columnHelper.accessor("jobStatus", {
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
            defaultValue={type === "All" ? null : type}
          />
        ),
        cell: ({ getValue, row }) => {
          const value = getValue();
          const status = jobStatuses[value];

          return (
            <div className="flex">
              <div className={`flex items-center`}>
                <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
                <span className="whitespace-nowrap">{status.value}</span>
              </div>
              {(status.value === "Completed" ||
                status.value === "Canceled (Invoice)") && (
                <Button
                  size={"default"}
                  variant={"outline"}
                  className="ml-5 "
                  onClick={(event) => {
                    event.stopPropagation();
                    setAlertDialogState({ open: true, jobId: row.id });
                  }}
                >
                  <span>Send Deliverables</span>
                </Button>
              )}
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
        header: "Date Received",
        cell: ({ getValue }) => formatInEST(getValue()),
      }),
      columnHelper.accessor("dueDate", {
        header: "Date Due",
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return formatInEST(value);
        },
      }),
      columnHelper.accessor("completedCancelledDate", {
        header: "Date Completed/Canceled",
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return formatInEST(value);
        },
      }),
      columnHelper.accessor("dateSentToClient", {
        header: "Date Sent to Client",
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return formatInEST(value);
        },
      }),
    ];
  }, [
    expediteSearchParamName,
    pageIndexSearchParamName,
    syncedParams,
    params.isExpedited,
    params.inReview,
    params.priority,
    params.jobName,
    params.jobStatus,
    params.projectPropertyType,
    params.mountingType,
    params.projectNumber,
    params.propertyOwner,
    inReviewSearchParamName,
    prioritySearchParamName,
    jobNameSearchParamName,
    jobStatusSearchParamName,
    type,
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
