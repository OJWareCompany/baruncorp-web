import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
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
import usePostPaymentMutation from "@/mutations/usePostPaymentMutation";
import { AffixInput } from "@/components/AffixInput";

const formSchema = z
  .object({
    amount: z.string().trim().min(1, { message: "Amount is required" }),
    paymentMethod: PaymentMethodEnum,
    notes: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    const { amount } = values;

    if (!/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/.test(amount)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount should be a number",
        path: [`amount`],
      });
      return;
    }

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
  invoiceId: string;
}

export default function PaymentDialog({ invoiceId }: Props) {
  /**
   * State
   */
  const [open, setOpen] = useState(false);

  /**
   * Form
   */
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      notes: "",
      paymentMethod: "Direct",
    },
  });

  /**
   * Query
   */
  const { mutateAsync } = usePostPaymentMutation();
  const queryClient = useQueryClient();

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      amount: Number(values.amount),
      notes: transformStringIntoNullableString.parse(values.notes),
      paymentMethod: values.paymentMethod,
      invoiceId,
    })
      .then((value) => {
        setOpen(false);
        // TODO
        // queryClient.invalidateQueries({
        //   queryKey: ["client-invoices", "detail", invoiceId],
        // });
        form.reset();
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
            }
            if (error.response?.data.errorCode.includes("70203")) {
              form.setError(
                "amount",
                {
                  message: `Amount should be greater than 0`,
                },
                { shouldFocus: true }
              );
            }
            break;
        }
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="w-full">
          Add Payment
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
                          <SelectItem value={"Direct"}>Direct</SelectItem>
                          <SelectItem value={"Credit"} disabled>
                            Credit
                          </SelectItem>
                          {/* {PaymentMethodEnum.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))} */}
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
              Add
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
