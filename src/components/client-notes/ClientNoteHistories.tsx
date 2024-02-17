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
  ClientNoteDetail,
  ClientNotePaginatedResponseDto,
} from "@/api/api-spec";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import RowItemsContainer from "@/components/RowItemsContainer";
import { formatInEST } from "@/lib/utils";
import BasicEditor from "@/components/editor/BasicEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEditorValue } from "@/lib/plate-utils";
import useClientNoteHistoriesQuery from "@/queries/useClientNoteHistoriesQuery";
import useClientNoteQuery from "@/queries/useClientNoteQuery";

const columnHelper =
  createColumnHelper<ClientNotePaginatedResponseDto["items"][number]>();

const columns = [
  columnHelper.accessor("userName", {
    header: "Updated By",
  }),
  columnHelper.accessor("type", {
    header: "Type",
  }),
  columnHelper.accessor("updatedAt", {
    header: "Date Updated (EST)",
    cell: ({ getValue }) => formatInEST(getValue()),
  }),
];

interface ClientNoteHistoriesTableProps {
  organizationId: string;
  onRowClick: (id: string) => void;
}

function ClientNoteHistoriesTable({
  organizationId,
  onRowClick,
}: ClientNoteHistoriesTableProps) {
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

  const { data, isLoading } = useClientNoteHistoriesQuery(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      organizationId,
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
                    onRowClick(row.original.id);
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

interface ClientNoteHistoryFormProps {
  organizationName: string;
  data: ClientNoteDetail;
}

function ClientNoteHistoryForm({
  organizationName,
  data,
}: ClientNoteHistoryFormProps) {
  return (
    <section className="space-y-4">
      <Item>
        <Label>Organization</Label>
        <Input value={organizationName} disabled />
      </Item>
      <Item>
        <Label>Design Notes</Label>
        <BasicEditor value={getEditorValue(data.designNotes)} disabled />
      </Item>
      <Item>
        <Label>Electrical Engineering Notes</Label>
        <BasicEditor
          value={getEditorValue(data.electricalEngineeringNotes)}
          disabled
        />
      </Item>
      <Item>
        <Label>Structural Engineering Notes</Label>
        <BasicEditor
          value={getEditorValue(data.structuralEngineeringNotes)}
          disabled
        />
      </Item>
    </section>
  );
}

interface ContentProps {
  id: string;
}

function Content({ id }: ContentProps) {
  const { data, isLoading } = useClientNoteQuery(id);

  if (isLoading || data == null) {
    return <PageLoading isPageHeaderPlaceholder={false} />;
  }

  const metaData = (
    <section>
      <RowItemsContainer>
        <Item>
          <Label>Updated By</Label>
          <Input value={data.userName} disabled />
        </Item>
        <Item>
          <Label>Type</Label>
          <Input value={data.type} disabled />
        </Item>
        <Item>
          <Label>Date Updated (EST)</Label>
          <Input value={formatInEST(data.updatedAt)} disabled />
        </Item>
      </RowItemsContainer>
    </section>
  );

  if (data.type === "Modify" && data.beforeModificationDetail != null) {
    return (
      <div className="space-y-4">
        {metaData}
        <Tabs defaultValue="before">
          <TabsList>
            <TabsTrigger value="before">Before Modification</TabsTrigger>
            <TabsTrigger value="after">After Modification</TabsTrigger>
          </TabsList>
          <TabsContent value="before" className="mt-4">
            <div className="space-y-6">
              <ClientNoteHistoryForm
                data={data.beforeModificationDetail}
                organizationName={data.organizationName}
              />
            </div>
          </TabsContent>
          <TabsContent value="after" className="mt-4">
            <div className="space-y-6">
              <ClientNoteHistoryForm
                data={data.afterModificationDetail}
                organizationName={data.organizationName}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {metaData}
      <ClientNoteHistoryForm
        data={data.afterModificationDetail}
        organizationName={data.organizationName}
      />
    </div>
  );
}

interface ClientNoteHistorySheetProps extends DialogProps {
  id: string;
}

function ClientNoteHistorySheet({
  id,
  ...dialogProps
}: ClientNoteHistorySheetProps) {
  return (
    <Sheet {...dialogProps}>
      <SheetContent className="w-full max-w-[1400px] sm:max-w-[1400px]">
        <SheetHeader className="mb-6">
          <SheetTitle>History</SheetTitle>
        </SheetHeader>
        <Content id={id} />
      </SheetContent>
    </Sheet>
  );
}

interface Props {
  organizationId: string;
}

export default function ClientNoteHistories({ organizationId }: Props) {
  const [sheetState, setSheetState] = useState<{
    open: boolean;
    id: string;
  }>({ open: false, id: "" });

  return (
    <>
      <ClientNoteHistoriesTable
        organizationId={organizationId}
        onRowClick={(id) => {
          setSheetState({ open: true, id });
        }}
      />
      <ClientNoteHistorySheet
        {...sheetState}
        onOpenChange={(open) => {
          if (!open) {
            setSheetState((prev) => ({ ...prev, open }));
          }
        }}
      />
    </>
  );
}
