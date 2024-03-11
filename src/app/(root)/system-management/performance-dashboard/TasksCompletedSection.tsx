"use client";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  PaginationState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useMemo, useState } from "react";
import { endOfDay, startOfMonth } from "date-fns";
import { z } from "zod";
import * as Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useLocalStorage } from "@uidotdev/usehooks";
import TasksCompletedDatePicker from "./TasksCompletedDatePicker";
import TasksCompletedDetailSheet from "./TasksCompletedDetailSheet";
import CollapsibleSection from "@/components/CollapsibleSection";
import useOnPaginationChange from "@/hook/useOnPaginationChange";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAssignedTasksSummaryTotalQuery from "@/queries/useAssignedTasksSummaryTotalQuery";
import {
  AssignedTaskSummaryTotalPaginatedResponseDto,
  FindAssignedTaskSummaryTotalPaginatedHttpControllerGetParams,
} from "@/api/api-spec";

interface TasksCompletedChartProps {
  data: AssignedTaskSummaryTotalPaginatedResponseDto;
  openSheet: (userId: string) => void;
}

const TasksCompletedChart = memo(
  ({ data, openSheet }: TasksCompletedChartProps) => {
    return (
      <HighchartsReact
        highcharts={Highcharts}
        options={
          {
            title: {
              style: {
                opacity: 0,
              },
            },
            series: data.items[0].tasks.map((task, index) => ({
              type: "column",
              name: task.taskName,
              data: data.items.map((value) => value.tasks[index].count),
            })),
            xAxis: {
              categories: data.items.map((value) => value.userName),
              crosshair: true,
            },
            yAxis: {
              min: 0,
              title: {
                text: "# of Tasks Completed",
              },
            },
            plotOptions: {
              column: {
                className: "cursor-pointer",
                stacking: "normal",
                events: {
                  click: (event) => {
                    openSheet(data.items[event.point.index].userId);
                  },
                },
              },
            },
            tooltip: {
              shadow: false,
              borderColor: "#e2e8f0",
              borderWidth: 1,
              shared: true,
            },
            chart: {
              animation: false,
              height: 500,
              style: {
                fontFamily: "inherit",
              },
            },
          } as Highcharts.Options
        }
      />
    );
  }
);
TasksCompletedChart.displayName = "TasksCompletedChart";

const TABLE_NAME = "TasksCompleted";
const RELATIVE_PATH =
  "src/app/(root)/system-management/performance-dashboard/TasksCompletedSection.tsx";

export type SheetState = { open: false } | { open: true; userId: string };

export default function TasksCompletedSection() {
  const [sheetState, setSheetState] = useState<SheetState>({ open: false });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageIndexSearchParamName = `${TABLE_NAME}PageIndex`;
  const fromDateSearchParamName = `${TABLE_NAME}FromDate`;
  const toDateSearchParamName = `${TABLE_NAME}ToDate`;

  const [pageSize, setPageSize] = useLocalStorage<number>(
    `${RELATIVE_PATH}`,
    50
  );
  const pagination: PaginationState = {
    pageIndex: searchParams.get(encodeURIComponent(pageIndexSearchParamName))
      ? Number(searchParams.get(encodeURIComponent(pageIndexSearchParamName)))
      : 0,
    pageSize,
  };

  const currentDate = new Date();
  const initialFromDate = startOfMonth(currentDate);
  const initialToDate = endOfDay(currentDate);

  const fromDateSearchParamParseResult = z
    .date()
    .safeParse(
      new Date(
        searchParams.get(encodeURIComponent(fromDateSearchParamName)) ?? ""
      )
    );
  const fromDateData = fromDateSearchParamParseResult.success
    ? fromDateSearchParamParseResult.data
    : initialFromDate;
  const fromDateSearchParam = fromDateSearchParamParseResult.success
    ? fromDateSearchParamParseResult.data.toISOString()
    : initialFromDate.toISOString();

  const toDateSearchParamParseResult = z
    .date()
    .safeParse(
      new Date(
        searchParams.get(encodeURIComponent(toDateSearchParamName)) ?? ""
      )
    );
  const toDateData = toDateSearchParamParseResult.success
    ? toDateSearchParamParseResult.data
    : initialToDate;
  const toDateSearchParam = toDateSearchParamParseResult.success
    ? toDateSearchParamParseResult.data.toISOString()
    : initialToDate.toISOString();

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pagination,
    updatePageSize: setPageSize,
  });

  const params: FindAssignedTaskSummaryTotalPaginatedHttpControllerGetParams =
    useMemo(
      () => ({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        startedAt: fromDateSearchParam,
        endedAt: toDateSearchParam,
      }),
      [
        fromDateSearchParam,
        pagination.pageIndex,
        pagination.pageSize,
        toDateSearchParam,
      ]
    );

  const { data, isLoading } = useAssignedTasksSummaryTotalQuery({
    params,
    isKeepPreviousData: true,
  });

  const table = useReactTable({
    data: [],
    columns: [],
    getCoreRowModel: getCoreRowModel(),
    pageCount: data?.totalPage ?? -1,
    onPaginationChange,
    manualPagination: true,
    state: {
      pagination,
    },
  });

  const openSheet = useCallback((userId: string) => {
    setSheetState({ open: true, userId });
  }, []);

  return (
    <>
      <CollapsibleSection
        title="Tasks Completed"
        action={
          <TasksCompletedDatePicker
            value={{ from: fromDateData, to: toDateData }}
            onChange={(newValue) => {
              const newSearchParams = new URLSearchParams(
                searchParams.toString()
              );

              if (newValue == null) {
                newSearchParams.set(
                  encodeURIComponent(fromDateSearchParamName),
                  fromDateData.toISOString()
                );
                newSearchParams.set(
                  encodeURIComponent(toDateSearchParamName),
                  fromDateData.toISOString()
                );
                newSearchParams.set(
                  encodeURIComponent(pageIndexSearchParamName),
                  "0"
                );
              } else {
                if (newValue.from != null) {
                  newSearchParams.set(
                    encodeURIComponent(fromDateSearchParamName),
                    newValue.from.toISOString()
                  );
                  newSearchParams.set(
                    encodeURIComponent(pageIndexSearchParamName),
                    "0"
                  );
                }

                if (newValue.to != null) {
                  newSearchParams.set(
                    encodeURIComponent(toDateSearchParamName),
                    newValue.to.toISOString()
                  );
                  newSearchParams.set(
                    encodeURIComponent(pageIndexSearchParamName),
                    "0"
                  );
                }
              }

              router.replace(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
          />
        }
      >
        <div className="space-y-2">
          {isLoading || data == null ? (
            <div className="h-[500px] flex flex-col gap-[25px]">
              <div className="flex-1 animate-pulse bg-muted rounded-md" />
              <div className="basis-[150px] animate-pulse bg-muted rounded-md" />
            </div>
          ) : (
            <TasksCompletedChart data={data} openSheet={openSheet} />
          )}
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
        </div>
      </CollapsibleSection>
      <TasksCompletedDetailSheet
        state={sheetState}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            return;
          }

          setSheetState({ open: newOpen });
        }}
        fromDate={fromDateSearchParam}
        toDate={toDateSearchParam}
      />
    </>
  );
}
