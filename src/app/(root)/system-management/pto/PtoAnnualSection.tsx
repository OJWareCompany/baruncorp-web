"use client";
import {
  PaginationState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FindPtoAnnualPaginatedHttpControllerGetParams,
  PtoAnnualPaginatedResponseDto,
} from "@/api/api-spec";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useAnnualPtosQuery from "@/queries/useAnnualPtosQuery";
import CollapsibleSection from "@/components/CollapsibleSection";
import useOnPaginationChange from "@/hook/useOnPaginationChange";

function getYearsArray(startYear: number) {
  const currentYear = new Date().getFullYear();
  let years = [];
  for (let year = startYear; year <= currentYear; year++) {
    years.push(year);
  }
  return years;
}

const columnHelper =
  createColumnHelper<PtoAnnualPaginatedResponseDto["items"][number]>();

const columns = [
  columnHelper.accessor((row) => `${row.userFirstName} ${row.userLastName}`, {
    header: "Name",
  }),
  columnHelper.accessor(
    (row) =>
      row.ptoTypeInfos.find((value) => value.ptoTypeName === "Vacation")
        ?.totalAmount,
    {
      header: "Vacation",
    }
  ),
  columnHelper.accessor(
    (row) =>
      row.ptoTypeInfos.find((value) => value.ptoTypeName === "Half")
        ?.totalAmount,
    {
      header: "Half",
    }
  ),
  columnHelper.accessor(
    (row) =>
      row.ptoTypeInfos.find((value) => value.ptoTypeName === "Sick")
        ?.totalAmount,
    {
      header: "Sick",
    }
  ),
  columnHelper.accessor(
    (row) =>
      row.ptoTypeInfos.find((value) => value.ptoTypeName === "Maternity")
        ?.totalAmount,
    {
      header: "Maternity",
    }
  ),
  columnHelper.accessor(
    (row) =>
      row.ptoTypeInfos.find((value) => value.ptoTypeName === "Casual")
        ?.totalAmount,
    {
      header: "Casual",
    }
  ),
  columnHelper.accessor(
    (row) =>
      row.ptoTypeInfos.find((value) => value.ptoTypeName === "Unpaid")
        ?.totalAmount,
    {
      header: "Unpaid",
    }
  ),
  columnHelper.accessor("totalAmount", {
    header: "Total",
  }),
];

const TABLE_NAME = "PTOAnnual";
const RELATIVE_PATH =
  "src/app/(root)/system-management/pto/PtoAnnualSection.tsx";

export default function PtoAnnualSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const targetYearSearchParamName = `${TABLE_NAME}TargetYear`;
  const pageIndexSearchParamName = `${TABLE_NAME}PageIndex`;

  const [pageSize, setPageSize] = useLocalStorage<number>(
    `${RELATIVE_PATH}`,
    10
  );
  const pagination: PaginationState = {
    pageIndex: searchParams.get(encodeURIComponent(pageIndexSearchParamName))
      ? Number(searchParams.get(encodeURIComponent(pageIndexSearchParamName)))
      : 0,
    pageSize,
  };

  const currentYear = new Date().getFullYear();

  const targetYearSearchParamParseResult = z
    .number()
    .int()
    .min(2018)
    .max(currentYear)
    .safeParse(
      Number(searchParams.get(encodeURIComponent(targetYearSearchParamName)))
    );
  const targetYearData = targetYearSearchParamParseResult.success
    ? targetYearSearchParamParseResult.data
    : currentYear;
  const targetYearSearchParam = targetYearSearchParamParseResult.success
    ? searchParams.get(encodeURIComponent(targetYearSearchParamName))!
    : String(currentYear);

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pagination,
    updatePageSize: setPageSize,
  });

  const params: FindPtoAnnualPaginatedHttpControllerGetParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      targetYear: targetYearSearchParam,
    }),
    [pagination.pageIndex, pagination.pageSize, targetYearSearchParam]
  );

  const { data, isLoading } = useAnnualPtosQuery(params, true);

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
    <CollapsibleSection
      title="Yearly PTO Tracking"
      action={
        <Select
          value={String(targetYearData)}
          onValueChange={(newValue) => {
            const newSearchParams = new URLSearchParams(
              searchParams.toString()
            );
            newSearchParams.set(
              encodeURIComponent(targetYearSearchParamName),
              newValue
            );
            newSearchParams.set(
              encodeURIComponent(pageIndexSearchParamName),
              "0"
            );
            router.replace(`${pathname}?${newSearchParams.toString()}`, {
              scroll: false,
            });
          }}
        >
          <SelectTrigger className="h-[28px] w-[85px]">
            <SelectValue placeholder={targetYearSearchParam} />
          </SelectTrigger>
          <SelectContent align="end">
            {getYearsArray(2018).map((value) => (
              <SelectItem key={value} value={String(value)}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <div className="space-y-2">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>No results.</TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell key={cell.id}>
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
    </CollapsibleSection>
  );
}
