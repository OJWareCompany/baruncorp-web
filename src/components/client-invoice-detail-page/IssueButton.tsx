import React, { useState } from "react";
import { ArrowUp, Mail, X } from "lucide-react";
import { usePDF } from "@react-pdf/renderer";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import LoadingButton from "../LoadingButton";
import {
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import ClientInvoiceDocument from "./ClientInvoiceDocument";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import usePatchClientInvoiceIssueMutation from "@/mutations/usePatchClientInvoiceIssueMutation";
import { useToast } from "@/components/ui/use-toast";
import {
  InvoiceResponseDto,
  OrganizationResponseDto,
  ServicePaginatedResponseDto,
} from "@/api/api-spec";
import { getClientInvoiceQueryKey } from "@/queries/useClientInvoiceQuery";

const formSchema = z.object({
  ccArray: z.array(
    z.object({
      cc: z
        .string()
        .trim()
        .min(1, { message: "Email Address is required" })
        .email({ message: "Format of Email Address is incorrect" }),
    })
  ),
});

type FieldValues = z.infer<typeof formSchema>;

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
  const [confirmAction, setConfirmAction] = useState<"cc" | "noCc" | null>(
    null
  );

  const getFieldValues = (data: InvoiceResponseDto): FieldValues => {
    return {
      ccArray:
        data.currentCc.length === 0
          ? [{ cc: "" }]
          : data.currentCc.map((cc) => ({
              cc,
            })),
    };
  };

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(clientInvoice),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ccArray",
  });

  const [instance] = usePDF({
    document: (
      <ClientInvoiceDocument
        clientInvoice={clientInvoice}
        organization={organization}
        services={services}
      />
    ),
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: patchClientInvoiceIssueMutateAsync } =
    usePatchClientInvoiceIssueMutation(clientInvoice.id);

  if (clientInvoice.status === "Paid") {
    return null;
  }

  async function handleSubmit(values: FieldValues, ccIncluded: boolean) {
    const { blob } = instance;
    if (blob == null) {
      return;
    }

    const fileName = `[Barun Corp] ${
      clientInvoice.clientOrganization.name
    }, ${format(
      new Date(clientInvoice.servicePeriodDate.slice(0, 7)),
      "MMM yyyy"
    )}, Client Invoice.pdf`;

    const file = new File([blob], fileName, { type: blob.type });
    const payload = {
      files: [file],
      cc: ccIncluded ? values.ccArray.map((cc) => cc.cc) : [],
    };

    try {
      await patchClientInvoiceIssueMutateAsync(payload);
      queryClient.invalidateQueries({
        queryKey: getClientInvoiceQueryKey(clientInvoice.id),
      });
      toast({ title: "Success" });
      setOpen(false);
    } catch (error: any) {
      if (error.response?.data?.errorCode?.length) {
        toast({
          title: error.response.data.message,
          variant: "destructive",
        });
      }
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            size="sm"
            className="h-[28px] text-xs px-2"
            disabled={instance.loading}
          >
            {clientInvoice.status === "Unissued" ? (
              <ArrowUp className="mr-2 h-4 w-4" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            {clientInvoice.status === "Unissued" ? "Issue" : "Remind"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Are You Sure?</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="ccArray"
                render={() => (
                  <FormItem>
                    <FormLabel>CC</FormLabel>
                    {fields.map((field, index) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`ccArray.${index}.cc`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex flex-row gap-2">
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <Button
                                variant="outline"
                                size="icon"
                                className="flex-shrink-0"
                                onClick={() => {
                                  if (fields.length === 1) {
                                    form.setValue(`ccArray.${index}.cc`, "");
                                    return;
                                  }
                                  remove(index);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => append({ cc: "" })}
                      type="button"
                    >
                      Add Email
                    </Button>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmAction("noCc")}
                  type="button"
                >
                  Submit (No Cc)
                </Button>
                <LoadingButton
                  onClick={() => setConfirmAction("cc")}
                  isLoading={form.formState.isSubmitting}
                  type="button"
                >
                  Submit
                </LoadingButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {confirmAction && (
        <Dialog
          open={confirmAction !== null}
          onOpenChange={() => setConfirmAction(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setConfirmAction(null)} variant="outline">
                Cancel
              </Button>
              <LoadingButton
                onClick={() => {
                  const values = form.getValues();
                  if (confirmAction === "cc") {
                    handleSubmit(values, true);
                  } else {
                    handleSubmit(values, false);
                  }
                  setConfirmAction(null);
                }}
                isLoading={form.formState.isSubmitting}
              >
                Continue
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
