"use utility";
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
import { useSearchParams } from "next/navigation";
import { DialogProps } from "@radix-ui/react-dialog";
import { useMemo, useState } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
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
// import {
//   UtilityNoteDetail,
//   UtilityNotePaginatedResponseDto,
// } from "@/api/api-spec";
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
import useUtilityNoteHistoriesQuery from "@/queries/useUtilityNoteHistoriesQuery";
import {
  FindUtilityHistoryPaginatedHttpControllerGetParams,
  UtilityHistoryDetail,
  UtilityHistoryPaginatedResponseDto,
} from "@/api/api-spec";
import useUtilityNoteHistoryQuery from "@/queries/useUtilityNoteHistoryQuery";
import { Abbreviation, abbreviationStateNameMap } from "@/lib/constants";
import useOnPaginationChange from "@/hook/useOnPaginationChange";
// import useUtilityNoteQuery from "@/queries/useUtilityNoteQuery";

const columnHelper =
  createColumnHelper<UtilityHistoryPaginatedResponseDto["items"][number]>();

const columns = [
  columnHelper.accessor("userName", {
    header: "Updated By",
  }),
  columnHelper.accessor("type", {
    header: "Type",
  }),
  columnHelper.accessor("updatedAt", {
    header: "Date Updated",
    cell: ({ getValue }) => formatInEST(getValue()),
  }),
];

const TABLE_NAME = "UtilityNoteHistories";
const RELATIVE_PATH = "src/components/utility-notes/UtilityNoteHistories.tsx";

interface UtilityNoteHistoriesTableProps {
  utilityId: string;
  onRowClick: (id: string) => void;
}

function UtilityNoteHistoriesTable({
  utilityId,
  onRowClick,
}: UtilityNoteHistoriesTableProps) {
  const searchParams = useSearchParams();

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

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pagination,
    updatePageSize: setPageSize,
  });

  const params: FindUtilityHistoryPaginatedHttpControllerGetParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      utilityId,
    }),
    [pagination.pageIndex, pagination.pageSize, utilityId]
  );

  const { data, isLoading } = useUtilityNoteHistoriesQuery(params, true);

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ updatedAt }) => updatedAt,
    pageCount: data?.totalPage ?? -1,
    onPaginationChange,
    manualPagination: true,
    state: {
      pagination,
    },
  });

  return (
    <div className="space-y-2">
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

interface UtilityNoteHistoryFormProps {
  data: UtilityHistoryDetail;
}

function UtilityNoteHistoryForm({ data }: UtilityNoteHistoryFormProps) {
  return (
    <section className="space-y-4">
      <Item>
        <Label>Name</Label>
        <Input value={data.name} disabled />
      </Item>
      <Item>
        <Label>States</Label>
        <div className="flex gap-2 flex-wrap">
          {data.stateAbbreviations.map((abbreviation) => (
            <Button key={abbreviation} variant={"outline"} size={"sm"} disabled>
              {abbreviationStateNameMap[abbreviation as Abbreviation]}
            </Button>
          ))}
        </div>
      </Item>
      <Item>
        <Label>Notes</Label>
        <BasicEditor value={getEditorValue(data.notes)} disabled />
      </Item>
    </section>
  );
}

interface ContentProps {
  id: string;
}

function Content({ id }: ContentProps) {
  const { data, isLoading } = useUtilityNoteHistoryQuery(id);

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
          <Label>Date Updated</Label>
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
              <UtilityNoteHistoryForm data={data.beforeModificationDetail} />
            </div>
          </TabsContent>
          <TabsContent value="after" className="mt-4">
            <div className="space-y-6">
              <UtilityNoteHistoryForm data={data.afterModificationDetail} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {metaData}
      <UtilityNoteHistoryForm data={data.afterModificationDetail} />
    </div>
  );
}

interface UtilityNoteHistorySheetProps extends DialogProps {
  id: string;
}

function UtilityNoteHistorySheet({
  id,
  ...dialogProps
}: UtilityNoteHistorySheetProps) {
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
  utilityId: string;
}

export default function UtilityNoteHistories({ utilityId }: Props) {
  const [sheetState, setSheetState] = useState<{
    open: boolean;
    id: string;
  }>({ open: false, id: "" });

  return (
    <>
      <UtilityNoteHistoriesTable
        utilityId={utilityId}
        onRowClick={(id) => {
          setSheetState({ open: true, id });
        }}
      />
      <UtilityNoteHistorySheet
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
