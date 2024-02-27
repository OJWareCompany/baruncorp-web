import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { InvoiceResponseDto } from "@/api/api-spec";
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
import usePatchClientDirectPaymentCancelMutation from "@/mutations/usePatchClientDirectPaymentCancelMutation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getClientInvoiceQueryKey } from "@/queries/useClientInvoiceQuery";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import LoadingButton from "@/components/LoadingButton";
import usePatchClientCreditPaymentCancelMutation from "@/mutations/usePatchClientCreditPaymentCancelMutation";

const columnHelper =
  createColumnHelper<InvoiceResponseDto["payments"][number]>();

interface Props {
  clientInvoice: InvoiceResponseDto;
}

export default function PaymentsTable({ clientInvoice }: Props) {
  const { data: session } = useSession();

  const isBarunCorpMember = useMemo(
    () => session?.isBarunCorpMember ?? false,
    [session?.isBarunCorpMember]
  );

  const {
    mutateAsync: patchClientDirectPaymentCancelMutateAsync,
    isPending: isPatchClientDirectPaymentCancelMutationPending,
  } = usePatchClientDirectPaymentCancelMutation();
  const {
    mutateAsync: patchClientCreditPaymentCancelMutateAsync,
    isPending: isPatchClientCreditPaymentCancelMutationPending,
  } = usePatchClientCreditPaymentCancelMutation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [alertDialogState, setAlertDialogState] = useState<
    | { open: false }
    | { open: true; paymentMethod: "Direct" | "Deduction"; id: string }
  >({ open: false });

  const isPending =
    isPatchClientDirectPaymentCancelMutationPending ||
    isPatchClientCreditPaymentCancelMutationPending;

  const columns = useMemo(
    () => [
      columnHelper.accessor("paymentMethod", {
        header: "Payment Method",
      }),
      columnHelper.accessor((row) => `$${row.amount}`, {
        header: "Amount",
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
      columnHelper.accessor("paymentDate", {
        header: "Payment Date",
        cell: ({ getValue }) => formatInEST(getValue()),
      }),
      columnHelper.accessor("canceledAt", {
        header: "Date Canceled",
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return formatInEST(value);
        },
      }),
      columnHelper.display({
        id: "action",
        cell: ({ row }) => {
          const isCanceled = row.original.canceledAt != null;

          if (isCanceled) {
            return (
              <div className="text-right">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button variant={"ghost"} size={"icon"} className="w-8 h-8">
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Canceled</TooltipContent>
                </Tooltip>
              </div>
            );
          }

          if (!isBarunCorpMember) {
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
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="h-8 w-8"
                  onClick={() => {
                    setAlertDialogState({
                      open: true,
                      paymentMethod: row.original.paymentMethod,
                      id: row.id,
                    });
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        },
      }),
    ],
    [isBarunCorpMember]
  );

  const table = useReactTable({
    data: clientInvoice.payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
  });

  return (
    <>
      <div className="flex flex-col gap-2">
        <Item>
          <Label>Total Amount</Label>
          <AffixInput
            prefixElement={<span className="text-muted-foreground">$</span>}
            value={clientInvoice.totalOfPayment}
            readOnly
          />
        </Item>
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
      </div>
      <AlertDialog
        open={alertDialogState.open}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            return;
          }

          setAlertDialogState({ open: newOpen });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <LoadingButton
              isLoading={isPending}
              onClick={() => {
                if (!alertDialogState.open) {
                  return;
                }

                if (alertDialogState.paymentMethod === "Direct") {
                  patchClientDirectPaymentCancelMutateAsync({
                    paymentId: alertDialogState.id,
                  })
                    .then(() => {
                      queryClient.invalidateQueries({
                        queryKey: getClientInvoiceQueryKey(clientInvoice.id),
                      });
                      setAlertDialogState({ open: false });
                      toast({ title: "Success" });
                    })
                    .catch((error: AxiosError<ErrorResponseData>) => {
                      if (
                        error.response &&
                        error.response.data.errorCode.filter(
                          (value) => value != null
                        ).length !== 0
                      ) {
                        toast({
                          title: error.response.data.message,
                          variant: "destructive",
                        });
                        return;
                      }
                    });
                }

                if (alertDialogState.paymentMethod === "Deduction") {
                  patchClientCreditPaymentCancelMutateAsync({
                    creditTransactionId: alertDialogState.id,
                  })
                    .then(() => {
                      queryClient.invalidateQueries({
                        queryKey: getClientInvoiceQueryKey(clientInvoice.id),
                      });
                      setAlertDialogState({ open: false });
                      toast({ title: "Success" });
                    })
                    .catch((error: AxiosError<ErrorResponseData>) => {
                      if (
                        error.response &&
                        error.response.data.errorCode.filter(
                          (value) => value != null
                        ).length !== 0
                      ) {
                        toast({
                          title: error.response.data.message,
                          variant: "destructive",
                        });
                        return;
                      }
                    });
                }
              }}
            >
              Continue
            </LoadingButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
