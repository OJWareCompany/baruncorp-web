"use client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import NewTabTableRow from "../table/NewTabTableRow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobResponseDto, ProjectResponseDto } from "@/api/api-spec";
import { Checkbox } from "@/components/ui/checkbox";
import TasksBadge from "@/components/badge/TasksBadge";
import { formatInEST } from "@/lib/utils";
import { jobPriorities, jobStatuses } from "@/lib/constants";
import AdditionalInformationHoverCard from "@/components/hover-card/AdditionalInformationHoverCard";
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
];

function getJobDetailUrl({
  pageType,
  jobId,
}: {
  pageType: JobDetailPageType;
  jobId: string;
}) {
  switch (pageType) {
    case "HOME":
      return `/jobs/${jobId}`;
    case "WORKSPACE":
      return `/workspace/jobs/${jobId}`;
    case "SYSTEM_MANAGEMENT":
      return `/system-management/jobs/${jobId}`;
  }
}

interface Props {
  project: ProjectResponseDto;
  pageType: JobDetailPageType;
}

export default function JobsRelatedToProjectTable({
  project,
  pageType,
}: Props) {
  const router = useRouter();
  const columnVisibility = useJobsColumnVisibility();

  const table = useReactTable({
    data: project.jobs,
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
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <NewTabTableRow
                key={row.id}
                href={getJobDetailUrl({ pageType, jobId: row.id })}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => {
                  router.push(getJobDetailUrl({ pageType, jobId: row.id }));
                }}
                className="cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </NewTabTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
