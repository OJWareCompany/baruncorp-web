"use client";
import {
  Cell,
  Header,
  PaginationState,
  VisibilityState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  GripHorizontal,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { useProfileContext } from "../../ProfileProvider";
import { useExpandContext } from "../../ExpandProvider";
import {
  ResizeTableCell,
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
import { cn, formatInEST } from "@/lib/utils";
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
import SearchDateHeader from "@/components/table/SearchDateHeader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [reset, setReset] = useState(false);

  const handleResetComplete = () => {
    setReset(false);
  };

  const [alertDialogState, setAlertDialogState] = useState<
    { open: false } | { open: true; jobId: string }
  >({ open: false });

  const {
    authority: { canSendDeliverables },
  } = useProfileContext();
  const COLUMN_SIZES_KEY = `${RELATIVE_PATH}_columnSizes`;

  const [columnSizes, setColumnSizes] = useLocalStorage<Record<string, number>>(
    COLUMN_SIZES_KEY,
    {}
  );

  const saveColumnSize = (columnId: string, size: number) => {
    setColumnSizes((prevSizes) => ({
      ...prevSizes,
      [columnId]: size,
    }));
  };
  const columnVisibilities = useJobsColumnVisibility();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    ...columnVisibilities,
  });

  useEffect(() => {
    if (Object.keys(columnSizes).length > 0) {
      table.setColumnSizing(columnSizes);
    }
  }, []);

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
  const dateSentToClientStartSearchParamName = `${TABLE_NAME}DateSentToClientStart`;
  const dateSentToClientEndSearchParamName = `${TABLE_NAME}DateSentToClientEnd`;

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
  const dateSentToClientStartSearchParam =
    searchParams.get(
      encodeURIComponent(dateSentToClientStartSearchParamName)
    ) ?? "";
  const dateSentToClientEndSearchParam =
    searchParams.get(encodeURIComponent(dateSentToClientEndSearchParamName)) ??
    "";
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

  const params: FindJobPaginatedHttpControllerFindJobParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      jobName: jobNameSearchParam,
      clientOrganizationName: clientOrganizationSearchParam,
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
      dateSentToClientStartSearchParam,
      dateSentToClientEndSearchParam,
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

  const DraggableTableHeader = ({
    header,
  }: {
    header: Header<JobPaginatedResponseDto["items"][number], unknown>;
  }) => {
    const { attributes, isDragging, listeners, setNodeRef, transform } =
      useSortable({
        id: header.column.id,
      });

    const style: CSSProperties = {
      opacity: isDragging ? 0.8 : 1,
      position: "relative",
      transform: CSS.Translate.toString(transform),
      transition: "width transform 0.2s ease-in-outs",
      whiteSpace: "nowrap",
      width: header.column.getSize(),
      zIndex: isDragging ? 1 : 0,
    };

    return table.getRowModel().rows.length > 0 ? (
      <TableHead
        colSpan={header.colSpan}
        ref={setNodeRef}
        style={style}
        className={`relative w-${header.getSize()}`}
      >
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 bottom-0 right-5 w-1 pl-3"
        >
          <GripHorizontal className="w-4 h-4" />
        </div>
        <div
          className={`absolute top-0 bottom-0 right-0 w-1 ${
            isDragging ? "bg-green-300" : ""
          }`}
        />
        <div
          className={`absolute top-0 bottom-0 left-0 w-1 ${
            isDragging ? "bg-green-300" : ""
          }`}
        />

        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          onMouseUp={() =>
            saveColumnSize(header.column.id, header.column.getSize())
          }
          onTouchEnd={() =>
            saveColumnSize(header.column.id, header.column.getSize())
          }
          className={`resizer ${
            header.column.getIsResizing() ? "isResizing" : ""
          }`}
        ></div>
      </TableHead>
    ) : (
      <TableHead key={header.id}>
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
      </TableHead>
    );
  };
  const DragAlongCell = ({
    cell,
  }: {
    cell: Cell<JobPaginatedResponseDto["items"][number], unknown>;
  }) => {
    const { isDragging, setNodeRef, transform } = useSortable({
      id: cell.column.id,
    });

    const style: CSSProperties = {
      opacity: isDragging ? 0.8 : 1,
      transform: CSS.Translate.toString(transform),
      position: "relative",
      transition: "width transform 0.2s ease-in-out",
      width: cell.column.getSize(),
      zIndex: isDragging ? 1 : 0,
    };

    return (
      <ResizeTableCell
        style={style}
        ref={setNodeRef}
        key={cell.id}
        className={`w-${cell.column.getSize()}`}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </ResizeTableCell>
    );
  };

  useEffect(() => {
    if (!isFetching) {
      setSyncedParams(params);
    }
  }, [isFetching, params]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("jobFolderId", {
        size: 85,
        header: "GD",
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
        size: 130,
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
        size: 180,
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
        id: "organization",
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
        size: 450,
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
        size: 85,
        id: "copyJobId",
        enableSorting: false,
        cell: ({ row }) => {
          const value = row.original.jobName;
          return <TextCopyButton JobId={value} />;
        },
      }),
      columnHelper.accessor("jobStatus", {
        size: 150,
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
        size: 180,
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
        size: 280,
        header: () => (
          <>
            <Popover>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
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
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Typing Search</p>
                  </TooltipContent>
                </Tooltip>
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
              </TooltipProvider>
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
      columnHelper.accessor("dateSentToClient", {
        header: () => (
          <SearchDateHeader
            buttonText="Date Sent to Client"
            searchParamOptions={{
              dateSentToClientStartSearchParamName,
              dateSentToClientEndSearchParamName,
            }}
            pageIndexSearchParamName={pageIndexSearchParamName}
          />
        ),
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
    prioritySearchParamName,
    pageIndexSearchParamName,
    syncedParams,
    params.priority,
    params.clientOrganizationName,
    params.jobName,
    params.jobStatus,
    params.taskAssigneeName,
    params.taskName,
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
    dateSentToClientStartSearchParamName,
    dateSentToClientEndSearchParamName,
  ]);

  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((column) => {
      if ((column as any).accessorKey === "clientInfo.clientOrganizationName") {
        return "organization";
      } else {
        return column.id! || (column as any).accessorKey;
      }
    })
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: ({ id }) => id,
    pageCount: data?.totalPage ?? -1,
    onPaginationChange,
    columnResizeMode: "onChange",
    manualPagination: true,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      pagination,
      columnVisibility,
      columnOrder,
    },
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );
  const columnHeaders: { [key: string]: string } = {
    jobFolderId: "Google Drive",
    priority: "Priority",
    dueDate: "Date Due",
    organization: "Organization",
    jobName: "Name",
    copyJobId: "Copy ID",
    jobStatus: "Status",
    assignedTasks: "Task",
    projectPropertyType: "Property Type",
    mountingType: "Mounting Type",
    projectNumber: "Project Number",
    propertyOwner: "Property Owner",
    completedCancelledDate: "Date Completed/Canceled",
    dateSentToClient: "Date Sent to Client",
  };
  const { isSelected: isExpanded } = useExpandContext();

  return (
    <div className="relative space-y-2">
      <GlobalSearch
        searchParamOptions={{
          jobNameSearchParamName: jobNameSearchParamName,
          projectNumberSearchParamName: projectNumberSearchParamName,
          propertyOwnerSearchParamName: propertyOwnerSearchParamName,
        }}
        pageIndexSearchParamName={pageIndexSearchParamName}
      />
      <div
        className={`absolute -top-[1px] ${
          isExpanded
            ? window.innerWidth <= 1600
              ? "ml-[800px]"
              : "ml-[1000px]"
            : "ml-[760px]"
        } w-200`}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"outline"} size={"sm"}>
              Columns Visible
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 max-h-60 overflow-auto p-1">
            <div className="p-0">
              <div
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-accent focus:text-accent-foreground"
                style={{ cursor: "pointer" }}
              >
                <label className="flex items-center w-full cursor-pointer">
                  <input
                    type="checkbox"
                    checked={table.getIsAllColumnsVisible()}
                    onChange={table.getToggleAllColumnsVisibilityHandler()}
                    className="hidden"
                  />
                  <span className="flex items-center justify-center w-4 h-4 mr-2 ">
                    {table.getIsAllColumnsVisible() && (
                      <Check className="h-4 w-4" />
                    )}
                  </span>
                  <span className="flex-1">
                    {table.getIsAllColumnsVisible()
                      ? "Hide All Columns"
                      : "Show All Columns"}
                  </span>
                </label>
              </div>
              {table.getAllLeafColumns().map((column) => {
                return (
                  <div
                    key={column.id}
                    className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50`}
                    style={{ cursor: "pointer" }}
                  >
                    <label className="flex items-center w-full cursor-pointer">
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="hidden"
                      />
                      <span className="flex items-center justify-center w-4 h-4 mr-2 cursor-pointer">
                        {column.getIsVisible() && <Check className="h-4 w-4" />}
                      </span>
                      <span className="flex-1">
                        {columnHeaders[column.id] || column.id}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="rounded-md border overflow-hidden">
          <Table
            {...(table.getRowModel().rows.length > 0
              ? {
                  style: {
                    width: table.getTotalSize(),
                  },
                }
              : {})}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <DraggableTableHeader key={header.id} header={header} />
                    ))}
                  </SortableContext>
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
                      <SortableContext
                        key={cell.id}
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        <DragAlongCell key={cell.id} cell={cell} />
                      </SortableContext>
                    ))}
                  </NewTabTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DndContext>

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
                    searchParams.toString()
                  );
                  newSearchParams.delete(
                    encodeURIComponent(sortFieldSearchParamName)
                  );
                  newSearchParams.delete(
                    encodeURIComponent(sortDirectionSearchParamName)
                  );
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
