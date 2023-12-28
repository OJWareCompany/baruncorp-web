import { useQueryClient } from "@tanstack/react-query";
import {
  CellContext,
  PaginationState,
  createColumnHelper,
} from "@tanstack/react-table";
import { PaymentPaginatedResponseDto, PaymentResponseDto } from "@/api";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import usePatchPaymentCancelMutation from "@/mutations/usePatchPaymentCancelMutation";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import CommonAlertDialogContent from "@/components/CommonAlertDialogContent";

function CancelButtonForPaymentPaginated({
  cellContext: { row },
  pagination,
}: {
  cellContext: CellContext<PaymentResponseDto, unknown>;
  pagination: PaginationState;
}) {
  const isCanceled = row.original.canceledAt == null;

  const { mutateAsync } = usePatchPaymentCancelMutation(row.original.id);
  const queryClient = useQueryClient();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size={"sm"}
          variant={"outline"}
          className="w-full text-destructive hover:text-destructive"
          disabled={!isCanceled}
        >
          Cancel
        </Button>
      </AlertDialogTrigger>
      <CommonAlertDialogContent
        onContinue={() => {
          mutateAsync()
            .then(() => {
              // queryClient.invalidateQueries({
              //   queryKey: ["payments", "list", pagination],
              // });
            })
            .catch(() => {});
        }}
      />
    </AlertDialog>
  );
}

const paymentPaginatedColumnHelper =
  createColumnHelper<PaymentPaginatedResponseDto["items"][number]>();

export function getPaymentPaginatedColumns(pagination: PaginationState) {
  return [
    paymentPaginatedColumnHelper.accessor("organizationName", {
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
    paymentPaginatedColumnHelper.accessor("paymentDate", {
      header: "Payment Date",
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
    paymentPaginatedColumnHelper.accessor("paymentMethod", {
      header: "Payment Method",
      size: 150,
      cell: ({ getValue, column }) => (
        <p
          style={{ width: column.getSize() - 32 }}
          className={`whitespace-nowrap overflow-hidden text-ellipsis`}
        >
          {getValue()}
        </p>
      ),
    }),
    paymentPaginatedColumnHelper.accessor("amount", {
      header: "Amount",
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
    paymentPaginatedColumnHelper.accessor("notes", {
      header: "Notes",
      size: 400,
      cell: ({ getValue }) => {
        const value = getValue();

        if (value == null || value === "") {
          return <p className="text-muted-foreground">-</p>;
        }

        return value;
      },
    }),
    paymentPaginatedColumnHelper.accessor("canceledAt", {
      header: "Date Canceled",
      size: 200,
      cell: ({ getValue, column }) => {
        const value = getValue();

        if (value == null) {
          return <p className="text-muted-foreground">-</p>;
        }

        return (
          <p
            style={{ width: column.getSize() - 32 }}
            className={`whitespace-nowrap overflow-hidden text-ellipsis`}
          >
            {formatDateTime(value)}
          </p>
        );
      },
    }),
    paymentPaginatedColumnHelper.display({
      id: "action",
      size: 150,
      cell: (cellContext) => (
        <CancelButtonForPaymentPaginated
          cellContext={cellContext}
          pagination={pagination}
        />
      ),
    }),
  ];
}

interface PaymentTableExportData {
  [index: string]: unknown;
  Organization: string;
  "Payment Date": string;
  "Payment Method": string;
  Amount: string;
  Notes: string;
  "Date Canceled": string;
}

export function getPaymentTableExportDataFromPayments(
  payments: PaymentPaginatedResponseDto | undefined
): PaymentTableExportData[] | undefined {
  return payments?.items.map<PaymentTableExportData>((value) => ({
    Organization: value.organizationName,
    "Payment Date": formatDateTime(value.paymentDate),
    "Payment Method": value.paymentMethod,
    Amount: `$${value.amount}`,
    Notes: value.notes == null ? "-" : value.notes === "" ? "-" : value.notes,
    "Date Canceled": value.canceledAt ? formatDateTime(value.canceledAt) : "-",
  }));
}

// const jobToInvoiceColumnHelper = createColumnHelper<LineItem>();

// export const jobToInvoiceColumns = [
//   jobToInvoiceColumnHelper.accessor("billingCodes", {
//     header: "Billing Codes",
//     size: 150,
//   }),
//   jobToInvoiceColumnHelper.accessor("clientOrganization.name", {
//     header: "Organization",
//     size: 150,
//   }),
//   jobToInvoiceColumnHelper.accessor("propertyType", {
//     header: "Property Type",
//     size: 150,
//   }),
//   jobToInvoiceColumnHelper.accessor("mountingType", {
//     header: "Mounting Type",
//     size: 150,
//   }),
//   jobToInvoiceColumnHelper.accessor("dateSentToClient", {
//     header: "Date Sent to Client",
//     size: 150,
//   }),
//   // TODO: replace
//   jobToInvoiceColumnHelper.accessor("description", {
//     header: "Description",
//     size: 150,
//   }),
//   jobToInvoiceColumnHelper.accessor("price", {
//     header: "Price",
//     size: 150,
//   }),
//   jobToInvoiceColumnHelper.accessor("pricingType", {
//     header: "Pricing Type",
//     size: 150,
//   }),
// ];
