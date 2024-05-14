import React, { useEffect, useState } from "react";
import { ArrowUp, Mail, X } from "lucide-react";
import { usePDF } from "@react-pdf/renderer";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AxiosError } from "axios";
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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

  const getFieldValues = (data: InvoiceResponseDto): FieldValues => {
    console.log("### getFieldValues ###");
    console.log(data.issueHistory);
    console.log(data.currentCc);
    if (!data.issueHistory) {
      return { ccArray: [] };
    }

    return {
      ccArray: data.currentCc.map((cc) => ({
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

  useEffect(() => {
    console.log("### useEffect ###");
    console.log(fields);
    if (fields.length === 0) {
      append({ cc: "" });
    }
  }, []);

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
    return;
  }

  async function onSubmit(values: FieldValues) {
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

    // Blob을 File로 변환
    const file = new File([blob], fileName, {
      type: blob.type,
    });
    console.log(
      "cc",
      values.ccArray.map((cc) => cc.cc)
    );
    patchClientInvoiceIssueMutateAsync({
      files: [file],
      cc: values.ccArray.map((cc) => cc.cc),
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
          error.response.data.errorCode.filter((value) => value != null)
            .length !== 0
        ) {
          toast({
            title: error.response.data.message,
            variant: "destructive",
          });
          return;
        }
      });
  }

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
        variant={"outline"}
        size={"sm"}
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
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Continue</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Are You Sure?</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid gap-4 py-4"
                  >
                    <FormField
                      control={form.control}
                      name="ccArray"
                      render={() => {
                        return (
                          <FormItem>
                            <FormLabel>Cc</FormLabel>
                            {/* {fields.map((field, index) => (
                              <FormField
                                key={field.id}
                                control={form.control}
                                name={`ccArray.${index}.cc`}
                                render={({ field }) => {
                                  return (
                                    <FormItem>
                                      <div className="flex flex-row gap-2">
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <Button
                                          variant={"outline"}
                                          size={"icon"}
                                          className="flex-shrink-0"
                                          onClick={() => {
                                            remove(index);
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  );
                                }}
                              />
                            ))} */}
                            {fields.map((field, index) => (
                              <FormField
                                key={field.id}
                                control={form.control}
                                name={`ccArray.${index}.cc`}
                                render={({ field }) => {
                                  return (
                                    <FormItem>
                                      <div className="flex flex-row gap-2">
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        {index}
                                        <Button
                                          variant={"outline"}
                                          size={"icon"}
                                          className="flex-shrink-0"
                                          onClick={() => {
                                            if (fields.length === 1) {
                                              form.setValue(
                                                `ccArray.${index}.cc`,
                                                ""
                                              ); // 값을 초기화
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
                                  );
                                }}
                              />
                            ))}
                            <Button
                              variant={"outline"}
                              className="w-full"
                              onClick={() => {
                                console.log("추가 append");
                                append({ cc: "" });
                              }}
                              type="button"
                            >
                              Add Email
                            </Button>
                          </FormItem>
                        );
                      }}
                    />
                    <DialogFooter>
                      <Button
                        variant={"outline"}
                        onClick={() => {
                          const { blob } = instance;
                          if (blob == null) {
                            return;
                          }

                          const fileName = `[Barun Corp] ${
                            clientInvoice.clientOrganization.name
                          }, ${format(
                            new Date(
                              clientInvoice.servicePeriodDate.slice(0, 7)
                            ),
                            "MMM yyyy"
                          )}, Client Invoice.pdf`;

                          // Blob을 File로 변환
                          const file = new File([blob], fileName, {
                            type: blob.type,
                          });

                          patchClientInvoiceIssueMutateAsync({
                            files: [file],
                          })
                            .then(() => {
                              queryClient.invalidateQueries({
                                queryKey: getClientInvoiceQueryKey(
                                  clientInvoice.id
                                ),
                              });
                              toast({
                                title: "Success",
                              });
                              setOpen(false);
                              form.reset({
                                ccArray: [{ cc: "" }],
                              });
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
                        }}
                      >
                        No Cc
                      </Button>
                      <LoadingButton
                        type="submit"
                        isLoading={form.formState.isSubmitting}
                      >
                        Submit
                      </LoadingButton>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
