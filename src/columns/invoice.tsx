import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { InvoicePaginatedResponseDto } from "@/api";
import { formatDateTime } from "@/lib/utils";
import { invoiceStatuses } from "@/lib/constants";

const columnHelper =
  createColumnHelper<InvoicePaginatedResponseDto["items"][number]>();

export const invoiceColumns = [
  columnHelper.accessor("clientOrganization.name", {
    header: "Organization",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("servicePeriodDate", {
    header: "Service Period Month",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {format(new Date(getValue().slice(0, 7)), "MMM yyyy")}
      </p>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    size: 200,
    cell: ({ getValue, column }) => {
      const value = getValue();
      const status = invoiceStatuses[value];

      return (
        <div className={`flex items-center`}>
          <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
          <span>{status.value}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("invoiceDate", {
    header: "Invoice Date",
    size: 150,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {format(new Date(getValue()), "MM-dd-yyyy")}
      </p>
    ),
  }),
  columnHelper.accessor("terms", {
    header: "Terms",
    size: 100,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("dueDate", {
    header: "Due Date",
    size: 150,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {format(new Date(getValue()), "MM-dd-yyyy")}
      </p>
    ),
  }),
  columnHelper.accessor("notesToClient", {
    header: "Notes to Client",
    size: 400,
    cell: ({ getValue, column }) => {
      return (
        <p
          style={{ width: column.getSize() - 32 }}
          className={`whitespace-nowrap overflow-hidden text-ellipsis`}
        >
          {getValue()}
        </p>
      );
    },
  }),
  columnHelper.accessor("subtotal", {
    header: "Subtotal",
    size: 150,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        ${getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("discount", {
    header: "Discount",
    size: 150,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        ${getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("total", {
    header: "Total",
    size: 150,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        ${getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Date Created",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {formatDateTime(getValue())}
      </p>
    ),
  }),
];

interface InvoiceTableExportData {
  [index: string]: unknown;
  Organization: string;
  "Service Period Month": string;
  Status: string;
  "Invoice Date": string;
  Terms: number;
  "Due Date": string;
  "Notes to Client": string;
  Subtotal: string;
  Discount: string;
  Total: string;
  "Date Created": string;
}

export function getInvoiceTableExportDataFromInvoices(
  invoices: InvoicePaginatedResponseDto | undefined
): InvoiceTableExportData[] | undefined {
  return invoices?.items.map<InvoiceTableExportData>((value) => ({
    Organization: value.clientOrganization.name,
    "Service Period Month": format(
      new Date(value.servicePeriodDate.slice(0, 7)),
      "MMM yyyy"
    ),
    Status: value.status,
    "Invoice Date": format(new Date(value.invoiceDate), "MM-dd-yyyy"),
    Terms: value.terms,
    "Due Date": format(new Date(value.dueDate), "MM-dd-yyyy"),
    "Notes to Client": value.notesToClient ?? "-",
    Subtotal: `$${value.subtotal}`,
    Discount: `$${value.discount}`,
    Total: `$${value.total}`,
    "Date Created": formatDateTime(value.createdAt),
  }));
}
