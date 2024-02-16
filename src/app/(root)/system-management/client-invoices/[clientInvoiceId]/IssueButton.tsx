import React, { useState } from "react";
import { ArrowUp } from "lucide-react";
import { usePDF } from "@react-pdf/renderer";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import InvoiceDocument from "./InvoiceDocument";
import {
  AlertDialog,
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
import {
  InvoiceResponseDto,
  OrganizationResponseDto,
  ServicePaginatedResponseDto,
} from "@/api/api-spec";
import LoadingButton from "@/components/LoadingButton";

interface Props {
  clientInvoice: InvoiceResponseDto;
  organization: OrganizationResponseDto;
  services: ServicePaginatedResponseDto;
}

export default function IssueButton({
  clientInvoice,
  organization,
  services,
}: Props) {
  const [open, setOpen] = useState(false);
  const [instance] = usePDF({
    document: (
      <InvoiceDocument
        clientInvoice={clientInvoice}
        organization={organization}
        services={services}
      />
    ),
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    mutateAsync: patchInvoiceIssueMutateAsync,
    isPending: isPatchInvoiceIssueMutationPending,
  } = usePatchInvoiceIssueMutation(clientInvoice.id);

  return (
    <>
      {clientInvoice.status === "Unissued" && (
        <Button
          onClick={() => {
            setOpen(true);
          }}
          variant={"outline"}
          size={"sm"}
          className="h-[28px] text-xs px-2"
        >
          <ArrowUp className="mr-2 h-4 w-4" />
          Issue
        </Button>
      )}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <LoadingButton
              isLoading={isPatchInvoiceIssueMutationPending}
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
                      setOpen(false);
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
                };
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
