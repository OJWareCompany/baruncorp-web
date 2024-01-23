"use client";
import {
  PaginationState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DialogProps } from "@radix-ui/react-dialog";
import { DefaultValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AhjNoteHistoryPaginatedResponseDto } from "@/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useAhjNoteHistoriesQuery from "@/queries/useAhjNoteHistoriesQuery";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import useAhjNoteHistoryQuery from "@/queries/useAhjNoteHistoryQuery";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import RowItemsContainer from "@/components/RowItemsContainer";
import { FieldValues, formSchema, getFieldValuesFromAhjNote } from "@/lib/ahj";
import { formatDateTime } from "@/lib/utils";
import InputEditor from "@/components/editor/InputEditor";
import BasicEditor from "@/components/editor/BasicEditor";

const columnHelper =
  createColumnHelper<AhjNoteHistoryPaginatedResponseDto["items"][number]>();

const columns = [
  columnHelper.accessor("updatedBy", {
    header: "Updated By",
  }),
  columnHelper.accessor("historyType", {
    header: "Type",
  }),
  columnHelper.accessor("updatedAt", {
    header: "Date Updated",
  }),
];

interface AhjNoteHistoriesTableProps {
  geoId: string;
  onRowClick: (updatedAt: string) => void;
}

function AhjNoteHistoriesTable({
  geoId,
  onRowClick,
}: AhjNoteHistoriesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pagination: PaginationState = {
    pageIndex: searchParams.get("pageIndex")
      ? Number(searchParams.get("pageIndex"))
      : 0,
    pageSize: searchParams.get("pageSize")
      ? Number(searchParams.get("pageSize"))
      : 10,
  };

  const { data, isLoading } = useAhjNoteHistoriesQuery(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      geoId,
    },
    true
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ updatedAt }) => updatedAt,
    pageCount: data?.totalPage ?? -1,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const { pageIndex, pageSize } = updater(pagination);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("pageIndex", String(pageIndex));
        newSearchParams.set("pageSize", String(pageSize));
        router.replace(`${pathname}?${newSearchParams.toString()}`, {
          scroll: false,
        });
      }
    },
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
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                  onClick={() => {
                    onRowClick(row.original.updatedAt);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
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
  );
}

interface AhjNoteHistorySheetProps extends DialogProps {
  geoId: string;
  updatedAt?: string;
}

function AhjNoteHistorySheet({
  geoId,
  updatedAt,
  ...dialogProps
}: AhjNoteHistorySheetProps) {
  const { data: ahjNoteHistory } = useAhjNoteHistoryQuery({
    geoId,
    updatedAt: updatedAt ?? "",
  });
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValuesFromAhjNote() as DefaultValues<FieldValues>, // editor value의 deep partial 문제로 typescript가 error를 발생시키나, 실제로는 문제 없음
  });

  useEffect(() => {
    if (ahjNoteHistory) {
      form.reset(getFieldValuesFromAhjNote(ahjNoteHistory));
    }
  }, [ahjNoteHistory, form]);

  return (
    <Sheet {...dialogProps}>
      <SheetContent className="w-full max-w-[1400px] sm:max-w-[1400px]">
        <Form {...form}>
          <form className="space-y-6 w-full">
            <section>
              <h2 className="h4 mb-2">General</h2>
              <div className="flex flex-col gap-4">
                <RowItemsContainer>
                  <FormField
                    control={form.control}
                    name="general.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="general.website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <InputEditor {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="general.specificFormRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Form Required?</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </RowItemsContainer>
                <RowItemsContainer>
                  <FormField
                    control={form.control}
                    name="general.buildingCodes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Building Codes</FormLabel>
                        <FormControl>
                          <BasicEditor {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="general.generalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Notes</FormLabel>
                        <FormControl>
                          <BasicEditor {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </RowItemsContainer>
              </div>
            </section>
            <section>
              <h2 className="h4 mb-2">Design</h2>
              <div className="flex flex-col gap-4">
                <RowItemsContainer>
                  <FormField
                    control={form.control}
                    name="design.pvMeterRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PV Meter Required?</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="design.acDisconnectRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AC Disconnect Required?</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="design.centerFed120Percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Center Fed 120%</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="design.deratedAmpacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Derated Ampacity</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </RowItemsContainer>
                <FormField
                  control={form.control}
                  name="design.fireSetBack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fire Setback</FormLabel>
                      <FormControl>
                        <BasicEditor {...field} disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="design.utilityNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utility Notes</FormLabel>
                      <FormControl>
                        <BasicEditor {...field} disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="design.designNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Design Notes</FormLabel>
                      <FormControl>
                        <BasicEditor {...field} disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </section>
            <section>
              <h2 className="h4 mb-2">Structural Engineering</h2>
              <div className="flex flex-col gap-4">
                <RowItemsContainer>
                  <FormField
                    control={form.control}
                    name="structuralEngineering.iebcAccepted"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IEBC Accepted?</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="structuralEngineering.structuralObservationRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Structural Observation Required?</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="structuralEngineering.digitalSignatureType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Digital Signature Type</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </RowItemsContainer>
                <RowItemsContainer>
                  <FormField
                    control={form.control}
                    name="structuralEngineering.windUpliftCalculationRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wind Uplift Calculation Required?</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="structuralEngineering.windSpeed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wind Speed (mph)</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="structuralEngineering.windExposure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wind Exposure</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </RowItemsContainer>
                <RowItemsContainer>
                  <FormField
                    control={form.control}
                    name="structuralEngineering.snowLoadGround"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Snow Load Ground (psf)</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="structuralEngineering.snowLoadFlatRoof"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Snow Load Flat Roof (psf)</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </RowItemsContainer>
                <RowItemsContainer>
                  <FormField
                    control={form.control}
                    name="structuralEngineering.wetStampsRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wet Stamp Required?</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="structuralEngineering.ofWetStamps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel># of Wet Stamps</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="structuralEngineering.wetStampSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wet Stamp Size</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </RowItemsContainer>
                <FormField
                  control={form.control}
                  name="structuralEngineering.engineeringNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engineering Notes</FormLabel>
                      <FormControl>
                        <BasicEditor {...field} disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </section>
            <section>
              <h2 className="h4 mb-2">Electrical Engineering</h2>
              <FormField
                control={form.control}
                name="electricalEngineering.engineeringNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engineering Notes</FormLabel>
                    <FormControl>
                      <BasicEditor {...field} disabled />
                    </FormControl>
                  </FormItem>
                )}
              />
            </section>
            <section>
              <h2 className="h4 mb-2">History</h2>
              <RowItemsContainer>
                <FormField
                  control={form.control}
                  name="general.updatedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Modified By</FormLabel>
                      <FormControl>
                        <Input value={field.value ?? "System"} disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="general.updatedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Modified</FormLabel>
                      <FormControl>
                        <Input
                          value={
                            field.value === ""
                              ? "-"
                              : formatDateTime(field.value)
                          }
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </RowItemsContainer>
            </section>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

interface Props {
  geoId: string;
}

export default function AhjNoteHistories({ geoId }: Props) {
  const [sheetState, setSheetState] = useState<
    | {
        open: false;
      }
    | { open: true; updatedAt: string }
  >({ open: false });

  return (
    <>
      <AhjNoteHistoriesTable
        geoId={geoId}
        onRowClick={(updatedAt) => {
          setSheetState({ open: true, updatedAt });
        }}
      />
      <AhjNoteHistorySheet
        {...sheetState}
        geoId={geoId}
        onOpenChange={(open) => {
          if (!open) {
            setSheetState({ open });
          }
        }}
      />
    </>
  );
}
