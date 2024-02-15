"use client";
import { Time, parseTime } from "@internationalized/date";
import { useEffect, useMemo, useState } from "react";
import {
  PaginationState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import ScheduleDialog from "./ScheduleDialog";
import {
  FindSchedulePaginatedHttpControllerGetParams,
  SchedulePaginatedResponseDto,
  ScheduleResponseDto,
} from "@/api/api-spec";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import useSchedulesQuery from "@/queries/useSchedulesQuery";
import useOnPaginationChange from "@/hook/useOnPaginationChange";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import SearchHeader from "@/components/table/SearchHeader";

const times = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

const columnHelper =
  createColumnHelper<SchedulePaginatedResponseDto["items"][number]>();

interface InternalTableProps {
  modifySchedule: (initialValue: ScheduleResponseDto) => void;
}

function InternalTable({ modifySchedule }: InternalTableProps) {
  const searchParams = useSearchParams();
  const [syncedParams, setSyncedParams] =
    useState<FindSchedulePaginatedHttpControllerGetParams>();

  const userNameSearchParamName = "UserName";
  const pageIndexSearchParamName = "PageIndex";
  const pageSizeSearchParamName = "PageSize";
  const pagination: PaginationState = {
    pageIndex: searchParams.get(pageIndexSearchParamName)
      ? Number(searchParams.get(pageIndexSearchParamName))
      : 0,
    pageSize: searchParams.get(pageSizeSearchParamName)
      ? Number(searchParams.get(pageSizeSearchParamName))
      : 5,
  };

  const nameSearchParam = searchParams.get(userNameSearchParamName) ?? "";

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pageSizeSearchParamName,
    pagination,
  });

  const params: FindSchedulePaginatedHttpControllerGetParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      userName: nameSearchParam,
    }),
    [nameSearchParam, pagination.pageIndex, pagination.pageSize]
  );

  const { data, isLoading, isFetching } = useSchedulesQuery(params, true);

  useEffect(() => {
    if (!isFetching) {
      setSyncedParams(params);
    }
  }, [isFetching, params]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => (
          <div className="flex w-[88px]">
            <SearchHeader
              buttonText="Name"
              searchParamName={userNameSearchParamName}
              pageIndexSearchParamName={pageIndexSearchParamName}
              isLoading={
                syncedParams != null &&
                params.userName !== syncedParams.userName
              }
            />
          </div>
        ),
        cell: ({ getValue }) => (
          <div className="line-clamp-2 w-[88px]">{getValue()}</div>
        ),
      }),
      columnHelper.accessor("position", {
        header: () => <div className="flex w-[88px]">Position</div>,
        cell: ({ getValue }) => (
          <div className="line-clamp-2 w-[88px]">{getValue()}</div>
        ),
      }),
      ...times.map((value, index) =>
        columnHelper.display({
          id: value,
          header: () => (
            <div className="flex px-4 border-l leading-6 w-[120px]">
              {value}
            </div>
          ),
          cell: ({ row }) => {
            const hour = index;
            const hourTime = new Time(hour);
            const isBetween =
              row.original.schedules.findIndex(
                (schedule) =>
                  hourTime.compare(
                    parseTime(schedule.start).set({
                      minute: 0,
                      second: 0,
                      millisecond: 0,
                    })
                  ) >= 0 && hourTime.compare(parseTime(schedule.end)) <= 0
              ) !== -1;

            if (!isBetween) {
              return <div className="flex w-[120px]"></div>;
            }

            return (
              <div className="flex w-[120px]">
                {Array.from({ length: 60 }, (_, index) => index).map(
                  (minute) => {
                    const time = new Time(hour, minute);
                    const isTarget =
                      row.original.schedules.findIndex(
                        (schedule) =>
                          time.compare(parseTime(schedule.start)) >= 0 &&
                          time.compare(parseTime(schedule.end)) <= 0
                      ) !== -1;

                    return (
                      <div
                        key={minute}
                        className={cn(
                          "w-[2px] h-[72px]",
                          isTarget && "bg-muted"
                        )}
                      ></div>
                    );
                  }
                )}
              </div>
            );
          },
        })
      ),
    ],
    [params.userName, syncedParams]
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ userId }) => userId,
    pageCount: data?.totalPage ?? -1,
    onPaginationChange,
    manualPagination: true,
    state: {
      pagination,
    },
  });

  return (
    <div className="space-y-2">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <TableHead key={header.id} className={cn(index > 1 && "p-0")}>
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
                <TableRow
                  key={row.id}
                  className="h-[73px] cursor-pointer"
                  onClick={() => {
                    modifySchedule(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell key={cell.id} className={cn(index > 1 && "p-0")}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
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
  );
}

export type DialogState =
  | { open: false }
  | { open: true; initialValue: ScheduleResponseDto };

export default function SchedulesTable() {
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });

  return (
    <>
      <InternalTable
        modifySchedule={(initialValue) => {
          setDialogState({ open: true, initialValue });
        }}
      />
      <ScheduleDialog
        state={dialogState}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            return;
          }

          setDialogState({ open: newOpen });
        }}
      />
    </>
  );
}
