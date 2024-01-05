"use client";
import {
  ExpandedState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronsDown,
  CornerDownRight,
} from "lucide-react";
import AssigneeField from "./AssigneeField";
import PriceField from "@/components/field/PriceField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobResponseDto, ProjectResponseDto } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  JobStatusEnum,
  OrderedServiceStatusEnum,
  jobStatuses,
  orderedServiceStatuses,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import SizeForRevisionField from "@/components/field/SizeForRevisionField";
import DurationField from "@/components/field/DurationField";
import AssignedTaskActionField from "@/components/field/AssignedTaskActionField";
import OrderedServiceActionField from "@/components/field/OrderedServiceActionField";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Data {
  id: string;
  name: string;
  description: string | null;
  status: JobStatusEnum | OrderedServiceStatusEnum;
  price: number | null;
  sizeForRevision: "Major" | "Minor" | null;
  duration: number | null;
  isRevision: boolean;
  assigneeId: string | null;
  serviceId: string | null;
  isActive: boolean;
  prerequisiteTasks: string[] | null;
  subRows?: Data[];
  // basePrice: number | null;
}

const columnHelper = createColumnHelper<Data>();

interface Props {
  job: JobResponseDto;
  project: ProjectResponseDto;
}

export default function TasksTable({ job, project }: Props) {
  console.log("🚀 ~ file: TasksTable.tsx:182 ~ TasksTable ~ job:", job);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const data = useMemo(
    () =>
      job.orderedServices.map<Data>((value) => {
        const {
          status,
          description,
          serviceName,
          price,
          orderedServiceId,
          serviceId,
          sizeForRevision,
          isRevision,
          // basePrice,
        } = value;

        const filteredAssignedTasks = job.assignedTasks.filter(
          (value) => value.orderedServiceId === orderedServiceId
        );

        return {
          description,
          id: orderedServiceId,
          name: serviceName,
          price,
          sizeForRevision:
            project.propertyType === "Residential" ? sizeForRevision : null,
          duration: filteredAssignedTasks.reduce<number | null>((prev, cur) => {
            if (cur.duration != null) {
              if (prev == null) {
                return cur.duration;
              }

              return prev + cur.duration;
            }

            return prev;
          }, null),
          isRevision,
          status,
          assigneeId: null,
          serviceId,
          isActive: true,
          prerequisiteTasks: null,
          // basePrice,
          subRows: filteredAssignedTasks.map<Data>((value) => ({
            assigneeId: value.assigneeId,
            description: value.description,
            id: value.assignTaskId,
            name: value.taskName,
            price: null,
            sizeForRevision: null,
            duration:
              project.propertyType === "Commercial" ? value.duration : null,
            status: value.status,
            serviceId: null,
            isRevision,
            isActive: value.prerequisiteTasks.every(
              ({ prerequisiteTaskId }) => {
                const foundTask = job.assignedTasks.find(
                  (value) => value.taskId === prerequisiteTaskId
                );
                if (foundTask == null) {
                  return true;
                }

                if (foundTask.status === "Completed") {
                  return true;
                }

                return false;
              }
            ),
            prerequisiteTasks: value.prerequisiteTasks.map(
              (value) => value.prerequisiteTaskName
            ),
            // basePrice: null,
          })),
        };
      }),
    [job.assignedTasks, job.orderedServices, project.propertyType]
  );

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "expand or information",
        header: ({ table }) => (
          <Button
            variant={"ghost"}
            size={"icon"}
            className="w-9 h-9 [&[data-expand=open]>svg]:rotate-180"
            onClick={table.getToggleAllRowsExpandedHandler()}
            data-expand={table.getIsAllRowsExpanded() ? "open" : "closed"}
          >
            <ChevronsDown className="w-4 h-4 transition-transform duration-200" />
          </Button>
        ),
        cell: ({ row }) => {
          if (row.depth === 0) {
            return (
              <Button
                variant={"ghost"}
                size={"icon"}
                className="w-9 h-9 [&[data-expand=open]>svg]:rotate-180"
                onClick={row.getToggleExpandedHandler()}
                data-expand={row.getIsExpanded() ? "open" : "closed"}
              >
                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
              </Button>
            );
          }

          if (
            !row.original.isActive &&
            row.original.prerequisiteTasks != null &&
            row.original.prerequisiteTasks.length !== 0
          ) {
            return (
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button variant={"ghost"} size={"icon"} className="w-9 h-9">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      <span className="font-medium">
                        {row.original.prerequisiteTasks.join(", ")}
                      </span>{" "}
                      must be completed first
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }
        },
      }),
      columnHelper.accessor("isRevision", {
        header: "",
        cell: ({ row, getValue }) => {
          const isRevision = getValue();

          if (row.depth > 0) {
            return <div className="h-9"></div>;
          }

          return isRevision ? (
            <Badge variant={"outline"}>Rev</Badge>
          ) : (
            <Badge>New</Badge>
          );
        },
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: ({ getValue, row }) => {
          const value = getValue();

          if (row.depth === 0) {
            return value;
          }

          let name = value;
          if (
            row.original.description != null &&
            row.original.description !== ""
          ) {
            name = row.original.description;
          }

          return (
            <div className="flex gap-4 items-center">
              <CornerDownRight className="h-4 w-4 text-muted-foreground" />
              <p>{name}</p>
            </div>
          );
        },
      }),
      project.propertyType === "Residential"
        ? columnHelper.accessor("sizeForRevision", {
            header: "Major / Minor",
            cell: ({ row, getValue }) => {
              if (row.depth > 0) {
                return;
              }

              if (!row.original.isRevision) {
                return <p className="text-muted-foreground">-</p>;
              }

              return (
                <SizeForRevisionField
                  sizeForRevision={getValue()}
                  jobId={job.id}
                  orderedServiceId={row.id}
                />
              );
            },
          })
        : columnHelper.accessor("duration", {
            header: "Duration",
            cell: ({ row, getValue }) => {
              if (!row.original.isRevision) {
                return;
              }

              const duration = getValue();

              if (row.depth === 0) {
                return (
                  <DurationField
                    assignedTaskId={row.id}
                    duration={duration}
                    disabled
                    jobId={job.id}
                  />
                );
              }

              return (
                <DurationField
                  assignedTaskId={row.id}
                  duration={duration}
                  jobId={job.id}
                />
              );

              // if (!row.original.isRevision) {
              //   return <p className="text-muted-foreground">-</p>;
              // }

              // return (
              //   <SizeForRevisionField
              //     sizeForRevision={getValue()}
              //     jobId={job.id}
              //     orderedServiceId={row.id}
              //   />
              // );
            },
          }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: ({ row, getValue }) => {
          if (row.depth > 0) {
            return;
          }

          return (
            <PriceField
              disabled={
                row.original.isRevision &&
                row.original.sizeForRevision === "Minor"
              }
              orderedServiceId={row.id}
              price={getValue()}
              jobId={job.id}
            />
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue, row }) => {
          const value = getValue();

          if (row.depth === 0) {
            const status =
              orderedServiceStatuses[value as OrderedServiceStatusEnum];

            return (
              <div className="flex items-center">
                <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
                <span className="whitespace-nowrap">{status.value}</span>
              </div>
            );
          }

          const status = jobStatuses[value as JobStatusEnum];

          return (
            <div className="flex items-center">
              <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
              <span className="whitespace-nowrap">{status.value}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("assigneeId", {
        header: "Assignee",
        cell: ({ row, getValue }) => {
          if (row.depth === 0) {
            return;
          }

          return (
            <AssigneeField
              assignedTaskId={row.id}
              userId={getValue() ?? ""}
              status={row.original.status as JobStatusEnum}
              jobId={job.id}
              projectId={job.projectId}
            />
          );
        },
      }),
      columnHelper.display({
        id: "action",
        cell: ({ row }) => {
          if (row.depth === 0) {
            return (
              <OrderedServiceActionField
                orderedServiceId={row.id}
                status={row.original.status as OrderedServiceStatusEnum}
                jobId={job.id}
                projectId={job.projectId}
              />
            );
          }

          return (
            <AssignedTaskActionField
              assignedTaskId={row.id}
              status={row.original.status as JobStatusEnum}
              jobId={job.id}
              projectId={job.projectId}
              page="SYSTEM_MANAGEMENT"
            />
          );
        },
      }),
    ],
    [job.id, job.projectId, project.propertyType]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
    getSubRows: (row) => row.subRows,
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(row.depth > 0 && "bg-muted/50")}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
