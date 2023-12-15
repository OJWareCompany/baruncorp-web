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
  ChevronDown,
  ChevronsDown,
  CornerDownRight,
  MoreHorizontal,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AssignedTaskResponseFields,
  OrderedServiceResponseFields,
} from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { orderedServiceStatuses, statuses } from "@/lib/constants";

interface Data {
  id: string;
  name: string;
  description: string | null;
  status: string;
  price: number | null;
  priceOverride: number | null;
  sizeForRevision: "Major" | "Minor" | null;
  isRevision: boolean;
  assigneeId: string | null;
  serviceId: string | null;
  subRows?: Data[];
}

const columnHelper = createColumnHelper<Data>();

interface Props {
  assignedTasks: AssignedTaskResponseFields[];
  orderedServices: OrderedServiceResponseFields[];
  jobId: string;
  projectId: string;
}

export default function TasksTable({
  assignedTasks,
  orderedServices,
  projectId,
  jobId,
}: Props) {
  console.log(
    "🚀 ~ file: TasksTable.tsx:56 ~ orderedServices:",
    orderedServices
  );
  console.log("🚀 ~ file: TasksTable.tsx:56 ~ assignedTasks:", assignedTasks);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const data = useMemo(
    () =>
      orderedServices.map<Data>((value) => {
        const {
          status,
          description,
          serviceName,
          price,
          orderedServiceId,
          serviceId,
          priceOverride,
          sizeForRevision,
          isRevision,
        } = value;

        return {
          description,
          id: orderedServiceId,
          name: serviceName,
          price,
          priceOverride,
          sizeForRevision,
          isRevision,
          status,
          assigneeId: null,
          serviceId,
          subRows: assignedTasks
            .filter((value) => value.orderedServiceId === orderedServiceId)
            .map((value) => ({
              assigneeId: value.assigneeId,
              description: value.description,
              id: value.assignTaskId,
              name: value.taskName,
              price: null,
              priceOverride: null,
              sizeForRevision: null,
              status: value.status,
              serviceId: null,
              isRevision,
            })),
        };
      }),
    [assignedTasks, orderedServices]
  );

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "expand",
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
          if (row.depth > 0) {
            return;
          }

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
        },
      }),
      columnHelper.accessor("isRevision", {
        header: "",
        cell: ({ row, getValue }) => {
          const isRevision = getValue();

          if (row.depth > 0) {
            return;
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
        cell: ({ getValue, row, column }) => {
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
      columnHelper.accessor("sizeForRevision", {
        header: "Major / Minor",
        // size: 200,
        // cell: (cellContext) => {
        //   const { row } = cellContext;

        //   if (row.depth > 0 || !row.original.isRevision) {
        //     return <p className="text-muted-foreground">-</p>;
        //   }

        //   return <SizeForRevision cellContext={cellContext} jobId={jobId} />;
        // },
      }),
      columnHelper.accessor("price", {
        header: "Price",
        // size: 200,
        // cell: (cellContext) => {
        //   const { row } = cellContext;

        //   if (row.depth > 0) {
        //     return <p className="text-muted-foreground">-</p>;
        //   }

        //   return <Price cellContext={cellContext} jobId={jobId} />;
        // },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue, row }) => {
          const value = getValue();
          if (row.depth === 0) {
            const status = orderedServiceStatuses.find(
              (status) => status.value === value
            );
            if (status == null) {
              return null;
            }

            return (
              <div className="flex items-center">
                <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
                <span className="whitespace-nowrap">{status.value}</span>
              </div>
            );
          }

          const status = statuses.find((status) => status.value === value);
          if (status == null) {
            return null;
          }

          return (
            <div className="flex items-center">
              <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
              <span className="whitespace-nowrap">{status.value}</span>
            </div>
          );
        },
      }),
      //   columnHelper.accessor("assigneeId", {
      //     header: "Action",
      //     size: 300,
      //     cell: (cellContext) => {
      //       if (cellContext.row.depth === 0) {
      //         return (
      //           <Action
      //             cellContext={cellContext}
      //             projectId={projectId}
      //             jobId={jobId}
      //           />
      //         );
      //       }

      //       return (
      //         <Assignee
      //           cellContext={cellContext}
      //           projectId={projectId}
      //           jobId={jobId}
      //         />
      //       );
      //     },
      //   }),
      columnHelper.display({
        id: "action",
        cell: ({ row }) => {
          return (
            <Button variant={"ghost"} size={"icon"} className="h-9 w-9">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          );
        },
      }),
    ],
    []
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
