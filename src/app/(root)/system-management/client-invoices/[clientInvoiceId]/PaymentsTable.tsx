import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useMemo } from "react";
import PaymentDialog from "./PaymentDialog";
import { InvoiceResponseDto } from "@/api";
import { AffixInput } from "@/components/AffixInput";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import { formatInEST } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import usePatchPaymentCancelMutation from "@/mutations/usePatchPaymentCancelMutation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getClientInvoiceQueryKey } from "@/queries/useClientInvoiceQuery";

const columnHelper =
  createColumnHelper<InvoiceResponseDto["payments"][number]>();

interface Props {
  clientInvoice: InvoiceResponseDto;
}

export default function PaymentsTable({ clientInvoice }: Props) {
  const { mutateAsync } = usePatchPaymentCancelMutation();
  const queryClient = useQueryClient();

  const columns = useMemo(
    () => [
      columnHelper.accessor("paymentDate", {
        header: "Payment Date (EST)",
        cell: ({ getValue }) => formatInEST(getValue()),
      }),
      columnHelper.accessor("paymentMethod", {
        header: "Payment Method",
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: ({ getValue, column }) => `$${getValue()}`,
      }),
      columnHelper.accessor("notes", {
        header: "Notes",
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null || value === "") {
            return <p className="text-muted-foreground">-</p>;
          }

          return value;
        },
      }),
      columnHelper.accessor("canceledAt", {
        header: "Date Canceled (EST)",
        size: 200,
        cell: ({ getValue, column }) => {
          const value = getValue();

          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return formatInEST(value);
        },
      }),
      columnHelper.display({
        id: "action",
        size: 150,
        cell: ({ row }) => {
          const isCanceled = row.original.canceledAt == null;

          if (!isCanceled) {
            return;
          }

          return (
            <div className="text-right">
              <div
                className="inline-flex"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant={"ghost"} size={"icon"} className="h-9 w-9">
                      <X className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          mutateAsync({ paymentId: row.id })
                            .then(() => {
                              queryClient.invalidateQueries({
                                queryKey: getClientInvoiceQueryKey(
                                  clientInvoice.id
                                ),
                              });
                            })
                            .catch(() => {});
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        },
      }),
    ],
    [clientInvoice.id, mutateAsync, queryClient]
  );

  const table = useReactTable({
    data: clientInvoice.payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
  });

  return (
    <div className="flex flex-col gap-2">
      <Item>
        <Label>Total</Label>
        <AffixInput
          prefixElement={<span className="text-muted-foreground">$</span>}
          value={clientInvoice.totalOfPayment}
          disabled
        />
      </Item>
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
            {table.getRowModel().rows.length === 0 ? (
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
      <PaymentDialog />
    </div>
  );
}
