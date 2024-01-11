import React, { useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { usePDF } from "@react-pdf/renderer";
import { useQueryClient } from "@tanstack/react-query";
import InvoiceDocument from "./InvoiceDocument";
import { InvoiceResponseDto, OrganizationResponseDto } from "@/api";
import { InvoiceStatusEnum, invoiceStatuses } from "@/lib/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import usePatchInvoiceIssueMutation from "@/mutations/usePatchInvoiceIssueMutation";
import { getClientInvoiceQueryKey } from "@/queries/useClientInvoiceQuery";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  clientInvoice: InvoiceResponseDto;
  organization: OrganizationResponseDto;
}

export default function ClientInvoiceStatus({
  clientInvoice,
  organization,
}: Props) {
  const [open, setOpen] = useState(false);
  const status = invoiceStatuses[clientInvoice.status];
  const [instance] = usePDF({
    document: (
      <InvoiceDocument
        clientInvoice={clientInvoice}
        organization={organization}
      />
    ),
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    mutateAsync: patchInvoiceIssueMutateAsync,
    isLoading: isPatchInvoiceIssueMutationLoading,
  } = usePatchInvoiceIssueMutation(clientInvoice.id);

  const isUnissued =
    clientInvoice.status === InvoiceStatusEnum.Values["Unissued"];

  if (!isUnissued) {
    return (
      <div className="flex gap-2">
        <div className="flex h-10 px-3 py-2 rounded-md text-sm border border-input bg-background flex-1">
          <div className="flex items-center flex-1 gap-2">
            <status.Icon className={`w-4 h-4 ${status.color}`} />
            <span>{status.value}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="flex h-10 px-3 py-2 rounded-md text-sm border border-input bg-background flex-1">
        <div className="flex items-center flex-1 gap-2">
          <status.Icon className={`w-4 h-4 ${status.color}`} />
          <span>{status.value}</span>
        </div>
      </div>
      <Button
        variant={"outline"}
        onClick={() => {
          setOpen(true);
        }}
        disabled={isPatchInvoiceIssueMutationLoading}
      >
        Issue
        {isPatchInvoiceIssueMutationLoading ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        ) : (
          <ArrowUp className="ml-2 h-4 w-4" />
        )}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const { blob } = instance;
                if (blob == null) {
                  return;
                }
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                  const base64 = reader.result;
                  if (base64 == null || typeof base64 !== "string") {
                    return;
                  }
                  patchInvoiceIssueMutateAsync({
                    attachments: [
                      {
                        path: base64,
                      },
                    ],
                  })
                    .then(() => {
                      queryClient.invalidateQueries({
                        queryKey: getClientInvoiceQueryKey(clientInvoice.id),
                      });
                      toast({
                        title: "Success",
                      });
                    })
                    .catch(() => {});
                };
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
