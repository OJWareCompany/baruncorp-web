"use client";

import { flexRender } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Jobs } from "@/api";
import { statuses } from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";

const columnHelper = createColumnHelper<Jobs>();

const columns = [
  columnHelper.accessor("isExpedited", {
    header: "Expedite",
    cell: ({ getValue }) => <Checkbox checked={getValue()} />,
  }),
  columnHelper.accessor("jobRequestNumber", {
    header: "#",
  }),
  columnHelper.accessor("propertyFullAddress", {
    header: "Address",
  }),
  columnHelper.accessor("clientInfo.clientOrganizationName", {
    header: "Organization",
  }),
  columnHelper.accessor("clientInfo.clientUserName", {
    header: "Client User",
  }),
  columnHelper.accessor("mountingType", {
    header: "Mounting Type",
  }),
  columnHelper.accessor("additionalInformationFromClient", {
    header: "Additional Information",
    cell: ({ getValue }) => {
      const value = getValue();

      if (value == null || value === "") {
        return <span className="text-muted-foreground">-</span>;
      }

      return value;
    },
  }),
  columnHelper.accessor("jobStatus", {
    header: "Job Status",
    cell: ({ getValue }) => {
      const value = getValue();
      const status = statuses.find((status) => status.value === value);

      if (status == null) {
        return null;
      }

      return (
        <div className="flex items-center gap-1">
          <status.Icon className={`w-5 h-5 ${status.color}`} />
          <span>{status.value}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("orderedTasks", {
    header: "Tasks",
    cell: ({ getValue }) => {
      const orderedTasks = getValue();

      return (
        <div className="flex flex-col gap-2">
          {orderedTasks.map((orderedTask) => {
            const status = statuses.find(
              (status) => status.value === orderedTask.taskStatus
            );

            return (
              <TooltipProvider key={orderedTask.id} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="border rounded-full pl-1.5 pr-2.5 py-0.5 flex items-center gap-1.5 select-none">
                      {status && (
                        <status.Icon className={`w-5 h-5 ${status.color}`} />
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm">{orderedTask.taskName}</span>
                        <span className="text-xs text-muted-foreground">
                          {orderedTask.assigneeName ?? "-"}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs">{orderedTask.taskStatus}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      );
    },
  }),
  columnHelper.accessor("receivedAt", {
    header: "Date Received",
    cell: ({ getValue }) => format(new Date(getValue()), "MM-dd-yyyy"),
  }),
];

interface Props {
  jobs: Jobs[];
}

export default function JobsTable({ jobs }: Props) {
  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
  });

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
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
                  <TableCell key={cell.id} className="whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results for job.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
