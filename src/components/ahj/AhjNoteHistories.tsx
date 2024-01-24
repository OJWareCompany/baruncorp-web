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
import { useState } from "react";
import Item from "../Item";
import { Label } from "../ui/label";
import PageLoading from "../PageLoading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AhjNoteHistoryPaginatedResponseDto,
  AhjNoteHistoryResponseDto,
} from "@/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useAhjNoteHistoriesQuery from "@/queries/useAhjNoteHistoriesQuery";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import useAhjNoteHistoryQuery from "@/queries/useAhjNoteHistoryQuery";
import { Input } from "@/components/ui/input";
import RowItemsContainer from "@/components/RowItemsContainer";
import { formatInEST } from "@/lib/utils";
import InputEditor from "@/components/editor/InputEditor";
import BasicEditor from "@/components/editor/BasicEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEditorValue } from "@/lib/plate-utils";

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
    header: "Date Updated (EST)",
    cell: ({ getValue }) => formatInEST(getValue()),
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

interface AhjNoteHistoryFormProps {
  data: AhjNoteHistoryResponseDto;
}

function AhjNoteHistoryForm({ data }: AhjNoteHistoryFormProps) {
  return (
    <>
      <section>
        <h2 className="h4 mb-2">General</h2>
        <div className="flex flex-col gap-4">
          <RowItemsContainer>
            <Item>
              <Label>Name</Label>
              <Input value={data.general.name} disabled />
            </Item>
            <Item>
              <Label>Website</Label>
              <InputEditor
                value={getEditorValue(data.general.website)}
                disabled
              />
            </Item>
            <Item>
              <Label>Specific Form Required?</Label>
              <Input value={data.general.specificFormRequired ?? ""} disabled />
            </Item>
          </RowItemsContainer>
          <RowItemsContainer>
            <Item>
              <Label>Building Codes</Label>
              <BasicEditor
                value={getEditorValue(data.general.buildingCodes)}
                disabled
              />
            </Item>
            <Item>
              <Label>General Codes</Label>
              <BasicEditor
                value={getEditorValue(data.general.generalNotes)}
                disabled
              />
            </Item>
          </RowItemsContainer>
        </div>
      </section>
      <section>
        <h2 className="h4 mb-2">Design</h2>
        <div className="flex flex-col gap-4">
          <RowItemsContainer>
            <Item>
              <Label>PV Meter Required?</Label>
              <Input value={data.design.pvMeterRequired ?? ""} disabled />
            </Item>
            <Item>
              <Label>AC Disconnect Required?</Label>
              <Input value={data.design.acDisconnectRequired ?? ""} disabled />
            </Item>
            <Item>
              <Label>Center Fed 120%</Label>
              <Input value={data.design.centerFed120Percent ?? ""} disabled />
            </Item>
            <Item>
              <Label>Derated Ampacity</Label>
              <Input value={data.design.deratedAmpacity ?? ""} disabled />
            </Item>
          </RowItemsContainer>
          <Item>
            <Label>Fire Setback</Label>
            <BasicEditor
              value={getEditorValue(data.design.fireSetBack)}
              disabled
            />
          </Item>
          <Item>
            <Label>Utility Notes</Label>
            <BasicEditor
              value={getEditorValue(data.design.utilityNotes)}
              disabled
            />
          </Item>
          <Item>
            <Label>Design Notes</Label>
            <BasicEditor
              value={getEditorValue(data.design.designNotes)}
              disabled
            />
          </Item>
        </div>
      </section>
      <section>
        <h2 className="h4 mb-2">Structural Engineering</h2>
        <div className="flex flex-col gap-4">
          <RowItemsContainer>
            <Item>
              <Label>IEBC Accepted?</Label>
              <Input value={data.engineering.iebcAccepted ?? ""} disabled />
            </Item>
            <Item>
              <Label>Structural Observation Required?</Label>
              <Input
                value={data.engineering.structuralObservationRequired ?? ""}
                disabled
              />
            </Item>
            <Item>
              <Label>Digital Signature Type</Label>
              <Input
                value={data.engineering.digitalSignatureType ?? ""}
                disabled
              />
            </Item>
          </RowItemsContainer>
          <RowItemsContainer>
            <Item>
              <Label>Wind Uplift Calculation Required?</Label>
              <Input
                value={data.engineering.windUpliftCalculationRequired ?? ""}
                disabled
              />
            </Item>
            <Item>
              <Label>Wind Speed (mph)</Label>
              <Input value={data.engineering.windSpeed ?? ""} disabled />
            </Item>
            <Item>
              <Label>Wind Exposure</Label>
              <Input value={data.engineering.windExposure ?? ""} disabled />
            </Item>
          </RowItemsContainer>
          <RowItemsContainer>
            <Item>
              <Label>Snow Load Ground (psf)</Label>
              <Input value={data.engineering.snowLoadGround ?? ""} disabled />
            </Item>
            <Item>
              <Label>Snow Load Flat Roof (psf)</Label>
              <Input value={data.engineering.snowLoadFlatRoof ?? ""} disabled />
            </Item>
          </RowItemsContainer>
          <RowItemsContainer>
            <Item>
              <Label>Wet Stamp Required?</Label>
              <Input
                value={data.engineering.wetStampsRequired ?? ""}
                disabled
              />
            </Item>
            <Item>
              <Label># of Wet Stamps</Label>
              <Input value={data.engineering.ofWetStamps ?? ""} disabled />
            </Item>
            <Item>
              <Label>Wet Stamp Size</Label>
              <Input value={data.engineering.wetStampSize ?? ""} disabled />
            </Item>
          </RowItemsContainer>
          <Item>
            <Label>Engineering Notes</Label>
            <BasicEditor
              value={getEditorValue(data.engineering.engineeringNotes)}
              disabled
            />
          </Item>
        </div>
      </section>
      <section>
        <h2 className="h4 mb-2">Electrical Engineering</h2>
        <Item>
          <Label>Engineering Notes</Label>
          <BasicEditor
            value={getEditorValue(data.electricalEngineering.electricalNotes)}
            disabled
          />
        </Item>
      </section>
    </>
  );
}

interface ContentProps {
  geoId: string;
  updatedAt: string;
}

function Content({ geoId, updatedAt }: ContentProps) {
  const { data, isLoading } = useAhjNoteHistoryQuery({
    geoId,
    updatedAt,
  });

  if (isLoading || data == null) {
    return <PageLoading isPageHeaderPlaceholder={false} />;
  }

  const metaData = (
    <section>
      <RowItemsContainer>
        <Item>
          <Label>Updated By</Label>
          <Input value={data.general.updatedBy ?? "System"} disabled />
        </Item>
        <Item>
          <Label>Type</Label>
          <Input value={data.historyType} disabled />
        </Item>
        <Item>
          <Label>Date Updated (EST)</Label>
          <Input
            value={
              data.general.updatedAt == null
                ? "-"
                : formatInEST(data.general.updatedAt)
            }
            disabled
          />
        </Item>
      </RowItemsContainer>
    </section>
  );

  if (data.historyType === "Modified" && data.beforeModification != null) {
    return (
      <div className="space-y-4">
        {metaData}
        <Tabs defaultValue="before">
          <TabsList>
            <TabsTrigger value="before">Before Modification</TabsTrigger>
            <TabsTrigger value="after">After Modification</TabsTrigger>
          </TabsList>
          <TabsContent value="before">
            <div className="space-y-6">
              <AhjNoteHistoryForm data={data.beforeModification} />
            </div>
          </TabsContent>
          <TabsContent value="after">
            <div className="space-y-6">
              <AhjNoteHistoryForm data={data} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {metaData}
      <AhjNoteHistoryForm data={data} />
    </div>
  );
}

interface AhjNoteHistorySheetProps extends DialogProps {
  geoId: string;
  updatedAt: string;
}

function AhjNoteHistorySheet({
  geoId,
  updatedAt,
  ...dialogProps
}: AhjNoteHistorySheetProps) {
  return (
    <Sheet {...dialogProps}>
      <SheetContent className="w-full max-w-[1400px] sm:max-w-[1400px]">
        <SheetHeader className="mb-6">
          <SheetTitle>History</SheetTitle>
        </SheetHeader>
        <Content geoId={geoId} updatedAt={updatedAt} />
      </SheetContent>
    </Sheet>
  );
}

interface Props {
  geoId: string;
}

export default function AhjNoteHistories({ geoId }: Props) {
  const [sheetState, setSheetState] = useState<{
    open: boolean;
    updatedAt: string;
  }>({ open: false, updatedAt: "" });

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
            setSheetState((prev) => ({ ...prev, open }));
          }
        }}
      />
    </>
  );
}
