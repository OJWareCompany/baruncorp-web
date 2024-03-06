"use client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import DownloadCSVButton from "./DownloadCSVButton";
import ExpenseTotalForm from "./ExpenseTotalForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FindVendorInvoiceLineItemHttpControllerGetParams,
  VendorInvoiceLineItemPaginatedResponseDto,
  VendorInvoiceLineItemResponse,
  VendorInvoiceResponseDto,
} from "@/api/api-spec";
import { Checkbox } from "@/components/ui/checkbox";
import useVendorInvoiceLineItemsQuery from "@/queries/useVendorInvoiceLineItemsQuery";
import { formatInEST } from "@/lib/utils";
import CollapsibleSection from "@/components/CollapsibleSection";
import RowItemsContainer from "@/components/RowItemsContainer";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import { AffixInput } from "@/components/AffixInput";
import { OTHER_SERVICE_ID } from "@/lib/constants";
import { useProfileContext } from "@/app/(root)/ProfileProvider";

const columnHelper =
  createColumnHelper<
    VendorInvoiceLineItemPaginatedResponseDto["items"][number]
  >();

const columns = [
  columnHelper.display({
    header: "#",
    id: "#",
    cell: ({ row }) => row.index + 1,
  }),
  columnHelper.accessor("assigneeName", {
    header: "User",
  }),
  columnHelper.accessor("clientOrganizationName", {
    header: "Client Organization",
  }),
  columnHelper.accessor("jobDescription", {
    header: "Job",
  }),
  columnHelper.accessor("serviceName", {
    header: "Scope",
  }),
  columnHelper.accessor("taskName", {
    header: "Task",
    cell: ({ row, getValue }) => {
      if (row.original.serviceId === OTHER_SERVICE_ID) {
        return row.original.serviceDescription;
      }

      return getValue();
    },
  }),
  columnHelper.accessor((row) => `$${row.taskExpenseTotal}`, {
    header: "Cost",
  }),
  columnHelper.accessor("isRevision", {
    header: "Revision",
    cell: ({ getValue }) => (
      <div className="flex">
        <Checkbox checked={getValue()} />
      </div>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Date Created",
    cell: ({ getValue }) => formatInEST(getValue()),
  }),
  columnHelper.accessor("doneAt", {
    header: "Date Completed/Canceled",
    cell: ({ getValue }) => {
      const value = getValue();

      if (value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return formatInEST(value);
    },
  }),
];

interface LineItemTableExportData {
  [index: string]: unknown;
  "#": string;
  User: string;
  "Client Organization": string;
  Job: string;
  Scope: string;
  Task: string;
  Cost: string;
  Revision: boolean;
  "Date Created": string;
  "Date Completed/Canceled": string;
}

export function getLineItemsTableExportDataFromLineItems(
  lineItem: VendorInvoiceLineItemResponse[]
): LineItemTableExportData[] {
  return lineItem.map<LineItemTableExportData>((value, index) => ({
    "#": String(index + 1),
    User: value.assigneeName,
    "Client Organization": value.clientOrganizationName,
    Job: value.jobDescription ?? "-",
    Scope: value.serviceName,
    Task:
      value.serviceId === OTHER_SERVICE_ID
        ? value.serviceDescription ?? "-"
        : value.taskName,
    Cost: String(value.taskExpenseTotal),
    Revision: value.isRevision,
    "Date Created": formatInEST(value.createdAt),
    "Date Completed/Canceled": value.doneAt ? formatInEST(value.doneAt) : "-",
  }));
}

function getJobDetailUrl({
  pageType,
  jobId,
}: {
  pageType: InvoiceDetailPageType;
  jobId: string;
}) {
  switch (pageType) {
    case "INVOICES":
      return `/workspace/jobs/${jobId}`;
    case "SYSTEM_MANAGEMENT":
      return `/system-management/jobs/${jobId}`;
  }
}

interface Props {
  vendorInvoice: VendorInvoiceResponseDto;
  pageType: InvoiceDetailPageType;
}

export default function TasksSection({ vendorInvoice, pageType }: Props) {
  const router = useRouter();
  const { isBarunCorpMember } = useProfileContext();

  const params: FindVendorInvoiceLineItemHttpControllerGetParams = useMemo(
    () => ({
      limit: Number.MAX_SAFE_INTEGER,
      vendorInvoiceId: vendorInvoice.id,
    }),
    [vendorInvoice.id]
  );

  const { data, isLoading } = useVendorInvoiceLineItemsQuery(params, true);

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: data?.totalPage ?? -1,
  });

  return (
    <CollapsibleSection
      title="Tasks"
      action={
        <DownloadCSVButton
          vendorInvoice={vendorInvoice}
          lineItems={data?.items ?? []}
        />
      }
    >
      <RowItemsContainer>
        <Item>
          <Label>Subtotal</Label>
          <AffixInput
            prefixElement={<span className="text-muted-foreground">$</span>}
            value={String(vendorInvoice.subTotal)}
            readOnly
          />
        </Item>
        {isBarunCorpMember ? (
          <ExpenseTotalForm vendorInvoice={vendorInvoice} />
        ) : (
          <Item>
            <Label>Total</Label>
            <AffixInput
              prefixElement={<span className="text-muted-foreground">$</span>}
              value={String(vendorInvoice.total)}
              readOnly
            />
          </Item>
        )}
        <Item>
          <Label>Total Difference</Label>
          <AffixInput
            prefixElement={<span className="text-muted-foreground">$</span>}
            value={String(vendorInvoice.invoiceTotalDifference)}
            readOnly
          />
        </Item>
      </RowItemsContainer>
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
                  onClick={() => {
                    router.push(
                      getJobDetailUrl({
                        jobId: row.original.jobId,
                        pageType,
                      })
                    );
                  }}
                  className="cursor-pointer"
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
    </CollapsibleSection>
  );
}
