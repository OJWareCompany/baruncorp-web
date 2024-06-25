"use client";
import * as React from "react";
import {
  Cell,
  Header,
  VisibilityState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useLocalStorage } from "@uidotdev/usehooks";
import { CSSProperties, useEffect, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { GripHorizontal } from "lucide-react";
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
import {
  ResizeTableCell,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobResponseDto } from "@/api/api-spec";
import { jobPriorities, jobStatuses } from "@/lib/constants";
import AdditionalInformationHoverCard from "@/components/hover-card/AdditionalInformationHoverCard";
import { formatInEST } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import useJobsColumnVisibility from "@/hook/useJobsColumnVisibility";
import { Checkbox } from "@/components/ui/checkbox";

const columnHelper = createColumnHelper<JobResponseDto>();

const columns = [
  columnHelper.accessor("isExpedited", {
    size: 90,
    header: "Expedite",
    cell: ({ getValue }) => (
      <div className="flex">
        <Checkbox checked={getValue()} />
      </div>
    ),
  }),
  columnHelper.accessor("inReview", {
    size: 90,
    header: "In Review",
    cell: ({ getValue }) => (
      <div className="flex">
        <Checkbox checked={getValue()} />
      </div>
    ),
  }),
  columnHelper.accessor("priority", {
    size: 130,
    header: "Priority",
    cell: ({ getValue }) => {
      const value = getValue();
      const status = jobPriorities[value];

      return <Badge className={`${status.color}`}>{status.value}</Badge>;
    },
  }),
  columnHelper.accessor("clientInfo.clientOrganizationName", {
    id: "organization",
    header: "Organization",
  }),
  columnHelper.accessor("jobName", {
    size: 450,
    header: "Name",
  }),
  columnHelper.accessor("jobStatus", {
    size: 150,
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
    size: 280,
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
  const columnVisibilities = useJobsColumnVisibility();
  const COLUMN_SIZES_KEY = `Project_Intake_Jobs_Related_ColumnSizes`;

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

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    ...columnVisibilities,
  });

  useEffect(() => {
    if (Object.keys(columnSizes).length > 0) {
      table.setColumnSizing(columnSizes);
    }
  }, []);

  const DraggableTableHeader = ({
    header,
  }: {
    header: Header<JobResponseDto, unknown>;
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
  const DragAlongCell = ({ cell }: { cell: Cell<JobResponseDto, unknown> }) => {
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
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
    columnResizeMode: "onChange",
    manualPagination: true,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
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

  return (
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={
                    (row.original.isExpedited ? "bg-yellow-100 " : "") +
                    (row.original.inReview ? "bg-violet-100 " : "") +
                    (row.original.isExpedited && row.original.inReview
                      ? "bg-green-300"
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DndContext>
  );
}
