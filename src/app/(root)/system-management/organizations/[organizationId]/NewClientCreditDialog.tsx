import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Plus } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toTwoDecimalRegExp } from "@/lib/constants";
import { AffixInput } from "@/components/AffixInput";
import { useToast } from "@/components/ui/use-toast";
import usePostCreditPaymentMutation from "@/mutations/usePostCreditPaymentMutation";
import { getOrganizationCreditQueryKey } from "@/queries/useOrganizationCreditQuery";

const formSchema = z
  .object({
    amount: z.string().trim().min(1, { message: "Amount is required" }),
  })
  .superRefine((values, ctx) => {
    const { amount } = values;

    if (Number(amount) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount should be greater than 0",
        path: [`amount`],
      });
      return;
    }
  });

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  organizationId: string;
}

export default function NewClientCreditDialog({ organizationId }: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
    },
  });
  const usePostCreditPaymentMutationResult = usePostCreditPaymentMutation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (
      form.formState.isSubmitSuccessful &&
      usePostCreditPaymentMutationResult.isSuccess
    ) {
      form.reset();
    }
  }, [
    form,
    form.formState.isSubmitSuccessful,
    usePostCreditPaymentMutationResult.isSuccess,
  ]);

  async function onSubmit(values: FieldValues) {
    await usePostCreditPaymentMutationResult
      .mutateAsync({
        amount: Number(values.amount),
        creditTransactionType: "Reload",
        clientOrganizationId: organizationId,
        relatedInvoiceId: null,
        note: null,
      })
      .then(() => {
        setOpen(false);
        queryClient.invalidateQueries({
          queryKey: getOrganizationCreditQueryKey(organizationId),
        });
        toast({ title: "Success" });
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className="h-[28px] text-xs px-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Client Credit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Client Credit</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Amount</FormLabel>
                  <FormControl>
                    <AffixInput
                      prefixElement={
                        <span className="text-muted-foreground">$</span>
                      }
                      {...field}
                      onChange={(event) => {
                        const { value } = event.target;
                        if (value === "" || toTwoDecimalRegExp.test(value)) {
                          field.onChange(event);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton
              type="submit"
              isLoading={form.formState.isSubmitting}
              className="w-full"
            >
              Submit
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
