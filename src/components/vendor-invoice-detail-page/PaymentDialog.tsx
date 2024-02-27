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
import usePostVendorDirectPaymentMutation from "@/mutations/usePostVendorDirectPaymentMutation";
import { AffixInput } from "@/components/AffixInput";
import { useToast } from "@/components/ui/use-toast";
import usePostVendorCreditPaymentMutation from "@/mutations/usePostVendorCreditPaymentMutation";
import { VendorInvoiceResponseDto } from "@/api/api-spec";
import { getVendorInvoiceQueryKey } from "@/queries/useVendorInvoiceQuery";

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
  vendorInvoice: VendorInvoiceResponseDto;
}

export default function PaymentDialog({ vendorInvoice }: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      notes: "",
      paymentMethod: "Direct",
    },
  });
  const {
    isSuccess: isPostVendorDirectPaymentMutationSuccess,
    mutateAsync: postVendorDirectPaymentMutateAsync,
    reset: resetPostVendorDirectPaymentMutation,
  } = usePostVendorDirectPaymentMutation();
  const {
    isSuccess: isPostVendorCreditPaymentMutationSuccess,
    mutateAsync: postVendorCreditPaymentMutateAsync,
    reset: resetPostVendorCreditPaymentMutation,
  } = usePostVendorCreditPaymentMutation();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (
      form.formState.isSubmitSuccessful &&
      (isPostVendorDirectPaymentMutationSuccess ||
        isPostVendorCreditPaymentMutationSuccess)
    ) {
      form.reset();
    }
  }, [
    form,
    form.formState.isSubmitSuccessful,
    isPostVendorCreditPaymentMutationSuccess,
    isPostVendorDirectPaymentMutationSuccess,
  ]);

  useEffect(() => {
    // dialog를 닫을 때, 각 request에 대한 mutation의 state를 초기화한다.
    // 일반적으로는 이 useEffect가 필요하지 않다. form을 submit할 때 하나의 request로 처리를 하기 때문에 그 mutation의 isSuccess state는 계속 업데이트될 것이기 때문에 위의 useEffect가 잘 동작한다.
    // 그런데 이 form을 submit할 때는 경우에 따라 두 개의 request로 처리를 하기 때문에 state를 초기화해주지 않으면 원하지 않는 상황에서 위의 useEffect가 동작하게 된다.
    if (!open) {
      resetPostVendorDirectPaymentMutation();
      resetPostVendorCreditPaymentMutation();
    }
  }, [
    open,
    resetPostVendorCreditPaymentMutation,
    resetPostVendorDirectPaymentMutation,
  ]);

  async function onSubmit(values: FieldValues) {
    if (values.paymentMethod === "Direct") {
      await postVendorDirectPaymentMutateAsync({
        amount: Number(values.amount),
        notes: transformStringIntoNullableString.parse(values.notes),
        paymentMethod: "Direct",
        vendorInvoiceId: vendorInvoice.id,
      })
        .then(() => {
          setOpen(false);
          queryClient.invalidateQueries({
            queryKey: getVendorInvoiceQueryKey(vendorInvoice.id),
          });
          toast({ title: "Success" });
        })
        .catch((error: AxiosError<ErrorResponseData>) => {
          switch (error.response?.status) {
            case 400:
              if (error.response?.data.errorCode.includes("70300")) {
                form.setError(
                  "amount",
                  {
                    message: `Amount exceeded the total amount`,
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

    if (values.paymentMethod === "Credit") {
      await postVendorCreditPaymentMutateAsync({
        amount: Number(values.amount),
        creditTransactionType: "Deduction",
        clientOrganizationId: vendorInvoice.organizationId,
        relatedInvoiceId: vendorInvoice.id,
        note: transformStringIntoNullableString.parse(values.notes),
      })
        .then(() => {
          setOpen(false);
          queryClient.invalidateQueries({
            queryKey: getVendorInvoiceQueryKey(vendorInvoice.id),
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
            case 422:
              if (error.response?.data.errorCode.includes("50432")) {
                const requiredCreditAmount = error.response.data.message
                  .split("(")[1]
                  .slice(0, -1);
                const currentCreditAmount =
                  Number(values.amount) - Number(requiredCreditAmount);
                toast({
                  title: `Not enough credit`,
                  description: `Current credit amount: $${currentCreditAmount}`,
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
