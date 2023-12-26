"use client";
import * as React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobResponseDto, ProjectResponseDto } from "@/api";
import { Checkbox } from "@/components/ui/checkbox";
import TasksBadge from "@/components/badge/TasksBadge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { formatInEST } from "@/lib/utils";
import { jobStatuses } from "@/lib/constants";

const columnHelper = createColumnHelper<JobResponseDto>();

const columns = [
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

      return (
        <HoverCard openDelay={0} closeDelay={100}>
          <HoverCardTrigger className="underline">View Detail</HoverCardTrigger>
          <HoverCardContent className="w-[auto] cursor-default" side="top">
            {value}
          </HoverCardContent>
        </HoverCard>
      );
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

interface Props {
  project: ProjectResponseDto;
}

export default function JobsTable({ project }: Props) {
  const router = useRouter();

  const table = useReactTable({
    data: project.jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
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
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => {
                  router.push(`/system-management/jobs/${row.id}`);
                }}
                className="cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
