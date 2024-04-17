"use client";
import * as React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobResponseDto } from "@/api/api-spec";
import { Checkbox } from "@/components/ui/checkbox";
import { jobPriorities, jobStatuses } from "@/lib/constants";
import AdditionalInformationHoverCard from "@/components/hover-card/AdditionalInformationHoverCard";
import { formatInEST } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import useJobsColumnVisibility from "@/hook/useJobsColumnVisibility";

const columnHelper = createColumnHelper<JobResponseDto>();

const columns = [
  columnHelper.accessor("isExpedited", {
    header: "Expedite",
    cell: ({ getValue }) => (
      <div className="flex">
        <Checkbox checked={getValue()} />
      </div>
    ),
  }),
  columnHelper.accessor("inReview", {
    header: "In Review",
    cell: ({ getValue }) => (
      <div className="flex">
        <Checkbox checked={getValue()} />
      </div>
    ),
  }),
  columnHelper.accessor("priority", {
    header: "Priority",
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
    header: "Name",
  }),
  columnHelper.accessor("jobStatus", {
    header: "Status",
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
    cell: ({ getValue, row }) => {
      const tasks = row.original.assignedTasks;
      return (
        <div>
          {tasks.map((task) => {
            const status = jobStatuses[task.status];

            return (
              <Badge
                variant={"outline"}
                className="flex items-center py-1 my-1"
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

interface Props {
  data: JobResponseDto[];
}

export default function JobsTable({ data }: Props) {
  const columnVisibility = useJobsColumnVisibility();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
    state: {
      columnVisibility,
    },
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
