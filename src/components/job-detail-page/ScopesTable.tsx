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
import { useSession } from "next-auth/react";
import AssigneeField from "./AssigneeField";
import OrderedServiceStatusField from "./OrderedServiceStatusField";
import PriceField from "@/components/field/PriceField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobResponseDto, ProjectResponseDto } from "@/api/api-spec";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AssignedTaskStatusEnum,
  BARUNCORP_ORGANIZATION_ID,
  JobStatusEnum,
  OrderedServiceStatusEnum,
  assignedTaskStatuses,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import SizeForRevisionField from "@/components/field/SizeForRevisionField";
import DurationField from "@/components/field/DurationField";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CostField from "@/components/field/CostField";

interface Data {
  id: string;
  name: string;
  description: string | null;
  status: OrderedServiceStatusEnum | AssignedTaskStatusEnum;
  price: number | null;
  cost: number | null;
  sizeForRevision: "Major" | "Minor" | null;
  duration: number | null;
  isRevision: boolean;
  assigneeId: string | null;
  assigneeOrganizationId: string | null;
  serviceId: string | null;
  isActive: boolean;
  prerequisiteTasks: string[] | null;
  pricingType: JobResponseDto["orderedServices"][number]["pricingType"];
  subRows?: Data[];
}

const columnHelper = createColumnHelper<Data>();

interface Props {
  job: JobResponseDto;
  project: ProjectResponseDto;
  pageType: PageType;
}

export default function ScopesTable({ job, project, pageType }: Props) {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const { data: session } = useSession();

  const isBarunCorpMember = useMemo(
    () => session?.isBarunCorpMember ?? false,
    [session?.isBarunCorpMember]
  );

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
          pricingType,
        } = value;

        const filteredAssignedTasks = job.assignedTasks.filter(
          (value) => value.orderedServiceId === orderedServiceId
        );

        return {
          description,
          id: orderedServiceId,
          name: serviceName,
          price,
          cost: null,
          sizeForRevision:
            project.propertyType === "Residential" ? sizeForRevision : null,
          duration: filteredAssignedTasks.reduce<number | null>((prev, cur) => {
            if (cur.duration != null) {
              if (prev == null) {
                return cur.duration;
              }

              return Number((prev + cur.duration).toFixed(2));
            }

            return prev;
          }, null),
          isRevision,
          status,
          assigneeId: null,
          assigneeOrganizationId: null,
          serviceId,
          isActive: true,
          prerequisiteTasks: null,
          pricingType,
          subRows: filteredAssignedTasks.map<Data>((value) => ({
            assigneeId: value.assigneeId,
            assigneeOrganizationId: value.assigneeOrganizationId,
            description: value.description,
            id: value.id,
            name: value.taskName,
            price: null,
            cost: value.cost,
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
            pricingType,
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
            className="w-8 h-8 [&[data-expand=closed]>svg]:-rotate-90"
            onClick={table.getToggleAllRowsExpandedHandler()}
            data-expand={table.getIsAllRowsExpanded() ? "open" : "closed"}
          >
            <ChevronsDown className="w-3 h-3 transition-transform duration-200" />
          </Button>
        ),
        cell: ({ row }) => {
          if (row.depth === 0) {
            return (
              <Button
                variant={"ghost"}
                size={"icon"}
                className="w-8 h-8 [&[data-expand=closed]>svg]:-rotate-90"
                onClick={row.getToggleExpandedHandler()}
                data-expand={row.getIsExpanded() ? "open" : "closed"}
              >
                <ChevronDown className="w-3 h-3 transition-transform duration-200" />
              </Button>
            );
          }

          if (
            !row.original.isActive &&
            row.original.prerequisiteTasks != null &&
            row.original.prerequisiteTasks.length !== 0
          ) {
            return (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button variant={"ghost"} size={"icon"} className="w-8 h-8">
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
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
              <CornerDownRight className="h-3 w-3 text-muted-foreground" />
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

              if (
                !row.original.isRevision ||
                row.original.pricingType === "Base Fixed Price" ||
                row.original.pricingType === "Custom Fixed Price"
              ) {
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

              if (
                !row.original.isRevision ||
                row.original.pricingType === "Base Fixed Price" ||
                row.original.pricingType === "Custom Fixed Price"
              ) {
                return <p className="text-muted-foreground">-</p>;
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
                // residential revision인데, size for revision이 선택 안되었거나, minor로 선택된 경우에 disabled
                project.propertyType === "Residential" &&
                row.original.isRevision &&
                (row.original.sizeForRevision == null ||
                  row.original.sizeForRevision === "Minor")
              }
              orderedServiceId={row.id}
              price={getValue()}
              jobId={job.id}
            />
          );
        },
      }),
      columnHelper.accessor("cost", {
        header: "Cost",
        cell: ({ row, getValue }) => {
          if (row.depth === 0) {
            return;
          }

          if (
            row.original.assigneeOrganizationId === BARUNCORP_ORGANIZATION_ID ||
            row.original.assigneeId == null
          ) {
            return <p className="text-muted-foreground">-</p>;
          }

          return (
            <CostField
              assignedTaskId={row.id}
              cost={getValue()}
              jobId={job.id}
            />
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue, row }) => {
          const value = getValue();
          const status = assignedTaskStatuses[value as AssignedTaskStatusEnum];

          if (isBarunCorpMember) {
            if (row.depth === 0) {
              return (
                <OrderedServiceStatusField
                  status={value as OrderedServiceStatusEnum}
                  orderedServiceId={row.id}
                  jobId={job.id}
                  projectId={project.projectId}
                />
              );
            }

            return (
              <div className="flex items-center">
                <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
                <span className="whitespace-nowrap">{status.value}</span>
              </div>
            );
          } else {
            return (
              <div className="flex items-center">
                <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
                <span className="whitespace-nowrap">{status.value}</span>
              </div>
            );
          }
        },
      }),
      columnHelper.accessor("assigneeId", {
        header: "Assignee",
        cell: ({ row, getValue }) => {
          const value = getValue();

          if (row.depth === 0) {
            return;
          }

          return (
            <AssigneeField
              assignedTaskId={row.id}
              userId={value ?? ""}
              status={row.original.status as JobStatusEnum}
              jobId={job.id}
              projectId={job.projectId}
              pageType={pageType}
            />
          );
        },
      }),
    ],
    [
      project.propertyType,
      project.projectId,
      job.id,
      job.projectId,
      isBarunCorpMember,
      pageType,
    ]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
      columnVisibility: {
        sizeForRevision: isBarunCorpMember,
        price: isBarunCorpMember,
        cost: isBarunCorpMember,
        duration: isBarunCorpMember,
      },
    },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
    getSubRows: (row) => row.subRows,
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
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
