import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  PaymentMethodEnum,
  toTwoDecimalRegExp,
  transformStringIntoNullableString,
} from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import usePostDirectPaymentMutation from "@/mutations/usePostDirectPaymentMutation";
import { AffixInput } from "@/components/AffixInput";
import { getClientInvoiceQueryKey } from "@/queries/useClientInvoiceQuery";
import { useToast } from "@/components/ui/use-toast";
import usePostCreditPaymentMutation from "@/mutations/usePostCreditPaymentMutation";

const formSchema = z
  .object({
    amount: z.string().trim().min(1, { message: "Amount is required" }),
    paymentMethod: PaymentMethodEnum,
    notes: z.string().trim(),
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

export default function PaymentDialog({ organizationId }: Props) {
  const { clientInvoiceId } = useParams() as { clientInvoiceId: string };
  const [open, setOpen] = useState(false);
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      notes: "",
      paymentMethod: "Direct",
    },
  });
  const usePostDirectPaymentMutationResult = usePostDirectPaymentMutation();
  const usePostCreditPaymentMutationResult = usePostCreditPaymentMutation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (
      form.formState.isSubmitSuccessful &&
      (usePostDirectPaymentMutationResult.isSuccess ||
        usePostCreditPaymentMutationResult.isSuccess)
    ) {
      form.reset();
    }
  }, [
    form,
    form.formState.isSubmitSuccessful,
    usePostCreditPaymentMutationResult.isSuccess,
    usePostDirectPaymentMutationResult.isSuccess,
  ]);

  useEffect(() => {
    // dialog를 닫을 때, 각 request에 대한 mutation의 state를 초기화한다.
    // 일반적으로는 이 useEffect가 필요하지 않다. form을 submit할 때 하나의 request로 처리를 하기 때문에 그 mutation의 isSuccess state는 계속 업데이트될 것이기 때문에 위의 useEffect가 잘 동작한다.
    // 그런데 이 form을 submit할 때는 경우에 따라 두 개의 request로 처리를 하기 때문에 state를 초기화해주지 않으면 원하지 않는 상황에서 위의 useEffect가 동작하게 된다.
    if (!open) {
      usePostDirectPaymentMutationResult.reset();
      usePostCreditPaymentMutationResult.reset();
    }
  }, [
    open,
    usePostCreditPaymentMutationResult,
    usePostDirectPaymentMutationResult,
  ]);

  async function onSubmit(values: FieldValues) {
    if (values.paymentMethod === "Credit") {
      await usePostCreditPaymentMutationResult
        .mutateAsync({
          amount: Number(values.amount),
          creditTransactionType: "Deduction",
          clientOrganizationId: organizationId,
          relatedInvoiceId: clientInvoiceId,
          note: transformStringIntoNullableString.parse(values.notes),
        })
        .then(() => {
          setOpen(false);
          queryClient.invalidateQueries({
            queryKey: getClientInvoiceQueryKey(clientInvoiceId),
          });
          toast({ title: "Success" });
        })
        .catch((error: AxiosError<ErrorResponseData>) => {
          switch (error.response?.status) {
            case 400:
              if (error.response?.data.errorCode.includes("70200")) {
                form.setError(
                  "amount",
                  {
                    message: `Amount exceeded the total amount`,
                  },
                  { shouldFocus: true }
                );
                return;
              }

              if (error.response?.data.errorCode.includes("70203")) {
                form.setError(
                  "amount",
                  {
                    message: `Amount should be greater than 0`,
                  },
                  { shouldFocus: true }
                );
                return;
              }
            case 422:
              if (error.response?.data.errorCode.includes("50402")) {
                const requiredCreditAmount = error.response.data.message
                  .split("(")[1]
                  .slice(0, -1);
                const currentCreditAmount =
                  Number(values.amount) - Number(requiredCreditAmount);
                toast({
                  title: `Not enough credit`,
                  description: `Current credit amount: ${currentCreditAmount}`,
                  variant: "destructive",
                });
                return;
              }
          }

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
      return;
    }

    if (values.paymentMethod === "Direct") {
      await usePostDirectPaymentMutationResult
        .mutateAsync({
          amount: Number(values.amount),
          notes: transformStringIntoNullableString.parse(values.notes),
          paymentMethod: "Direct",
          invoiceId: clientInvoiceId,
        })
        .then(() => {
          setOpen(false);
          queryClient.invalidateQueries({
            queryKey: getClientInvoiceQueryKey(clientInvoiceId),
          });
          toast({ title: "Success" });
        })
        .catch((error: AxiosError<ErrorResponseData>) => {
          switch (error.response?.status) {
            case 400:
              if (error.response?.data.errorCode.includes("70200")) {
                form.setError(
                  "amount",
                  {
                    message: `Amount exceeded the total amount`,
                  },
                  { shouldFocus: true }
                );
                return;
              }

              if (error.response?.data.errorCode.includes("70203")) {
                form.setError(
                  "amount",
                  {
                    message: `Amount should be greater than 0`,
                  },
                  { shouldFocus: true }
                );
                return;
              }
          }

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
      return;
    }
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
          New Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Payment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Payment Method</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger ref={field.ref}>
                        <SelectValue placeholder="Select a property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {PaymentMethodEnum.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
