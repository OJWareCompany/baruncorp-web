"use client";
import { DialogProps } from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DateRange } from "react-day-picker";
import { differenceInCalendarDays, eachDayOfInterval, getDay } from "date-fns";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { PtoDialogState } from "./PtoDetails";
import usePostPtoDetailMutation from "@/mutations/usePostPtoDetailMutation";
import PtoTypeAmountsCombobox from "@/components/combobox/PtoTypeAmountsCombobox";
import PtoTypesCombobox from "@/components/combobox/PtoTypesCombobox";
import LoadingButton from "@/components/LoadingButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { getPtoDetailsQueryKey } from "@/queries/usePtoDetailsQuery";
import usePatchPtoDetailMutation from "@/mutations/usePatchPtoDetailMutation";
import { getPtosQueryKey } from "@/queries/usePtosQuery";
import PtoDatePicker from "@/components/PtoDatePicker";
import UsersByOrganizationCombobox from "@/components/combobox/UsersByOrganizationCombobox";
import { BARUNCORP_ORGANIZATION_ID } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { getISOStringForStartOfDayInUTC } from "@/lib/utils";

const formSchema = z.object({
  rangeOfDays: z
    .custom<DateRange>()
    .nullable()
    .superRefine((value, ctx) => {
      if (value == null || value.from == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Range of Days is required",
        });
        return;
      }

      if (value.to != null) {
        const days = eachDayOfInterval({ start: value.from, end: value.to });

        const hasWeekend = days.some((day) => {
          const dayOfWeek = getDay(day);
          return dayOfWeek === 0 || dayOfWeek === 6;
        });

        if (hasWeekend) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Range of Days should not include weekends",
          });
          return;
        }
      }
    }),
  userId: z.string().trim().min(1, {
    message: "User is required",
  }),
  ptoTypeId: z.string().trim().min(1, {
    message: "Type is required",
  }),
  amount: z.string().trim().min(1, {
    message: "Amount is required",
  }),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props extends DialogProps {
  state: PtoDialogState;
}

export default function PtoDialog({ state, ...dialogProps }: Props) {
  const { data: session } = useSession();
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rangeOfDays: undefined,
      userId: "",
      ptoTypeId: "",
      amount: "",
    },
  });

  useEffect(() => {
    if (!state.open) {
      return;
    }

    if (state.type === "Add") {
      form.reset({
        rangeOfDays: {
          from: state.from,
        },
        userId: "",
        ptoTypeId: "",
        amount: "",
      });
      return;
    }

    if (state.type === "Modify") {
      const {
        startedAt,
        endedAt,
        ptoTypeId,
        amount,
        days,
        userFirstName,
        userLastName,
      } = state.pto;

      form.reset({
        rangeOfDays: {
          from: new Date(startedAt),
          to: startedAt === endedAt ? undefined : new Date(endedAt),
        },
        userId: `${userFirstName} ${userLastName}`,
        ptoTypeId,
        amount: String(amount / days),
      });
      return;
    }
  }, [form, state]);

  const watchPtoTypeId = form.watch("ptoTypeId");
  const { mutateAsync: postPtoDetailMutateAsync } = usePostPtoDetailMutation();
  const { mutateAsync: patchPtoDetailMutateAsync } =
    usePatchPtoDetailMutation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  async function onSubmit(values: FieldValues) {
    if (
      session == null ||
      !state.open ||
      values.rangeOfDays == null ||
      values.rangeOfDays.from == null
    ) {
      return;
    }

    let days = 1;
    if (values.rangeOfDays.to != null) {
      days =
        differenceInCalendarDays(
          values.rangeOfDays!.to,
          values.rangeOfDays!.from!
        ) + 1;
    }

    if (state.type === "Add") {
      await postPtoDetailMutateAsync({
        userId: values.userId,
        startedAt: getISOStringForStartOfDayInUTC(values.rangeOfDays.from),
        ptoTypeId: values.ptoTypeId,
        amountPerDay: Number(values.amount),
        days,
      })
        .then(() => {
          toast({
            title: "Success",
          });
          queryClient.invalidateQueries({
            queryKey: getPtoDetailsQueryKey({}),
          });
          queryClient.invalidateQueries({
            queryKey: getPtosQueryKey({}),
          });
          dialogProps.onOpenChange?.(false);
        })
        .catch((error: AxiosError<ErrorResponseData>) => {
          switch (error.response?.status) {
            case 400:
              if (error.response?.data.errorCode.includes("20813")) {
                form.setError(
                  "rangeOfDays",
                  {
                    message: `Range of Days overlaps with an already existing pto day`,
                  },
                  { shouldFocus: true }
                );
                return;
              }

              if (error.response?.data.errorCode.includes("20806")) {
                form.setError(
                  "rangeOfDays",
                  {
                    message: `You have selected more than the available PTO`,
                  },
                  { shouldFocus: true }
                );
                return;
              }

              if (error.response?.data.errorCode.includes("20808")) {
                form.setError(
                  "rangeOfDays",
                  {
                    message: `PTO cannot be registered by combining days before and after the date of joining the company`,
                  },
                  { shouldFocus: true }
                );
                return;
              }

              if (error.response?.data.errorCode.includes("20810")) {
                toast({
                  title: "PTO cannot be registered if it is paid",
                  variant: "destructive",
                });
                return;
              }

              if (error.response?.data.errorCode.includes("20822")) {
                form.setError(
                  "rangeOfDays",
                  {
                    message: `PTO cannot be registered before the date of joining the company`,
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
    }

    if (state.type === "Modify") {
      await patchPtoDetailMutateAsync({
        ptoId: state.pto.id,
        startedAt: getISOStringForStartOfDayInUTC(values.rangeOfDays.from),
        ptoTypeId: values.ptoTypeId,
        amountPerDay: Number(values.amount),
        days,
      })
        .then(() => {
          toast({
            title: "Success",
          });
          queryClient.invalidateQueries({
            queryKey: getPtoDetailsQueryKey({}),
          });
          queryClient.invalidateQueries({
            queryKey: getPtosQueryKey({}),
          });
          dialogProps.onOpenChange?.(false);
        })
        .catch((error: AxiosError<ErrorResponseData>) => {
          switch (error.response?.status) {
            case 400:
              if (error.response?.data.errorCode.includes("20806")) {
                form.setError(
                  "rangeOfDays",
                  {
                    message: `You have selected more than the available PTO`,
                  },
                  { shouldFocus: true }
                );
                return;
              }

              if (error.response?.data.errorCode.includes("20808")) {
                form.setError(
                  "rangeOfDays",
                  {
                    message: `PTO cannot be registered by combining days before and after the date of joining the company`,
                  },
                  { shouldFocus: true }
                );
                return;
              }

              if (error.response?.data.errorCode.includes("20810")) {
                toast({
                  title: "PTO cannot be updated if it is paid",
                  variant: "destructive",
                });
                return;
              }

              if (error.response?.data.errorCode.includes("20813")) {
                form.setError(
                  "rangeOfDays",
                  {
                    message: `Range of Days overlaps with an already existing pto day`,
                  },
                  { shouldFocus: true }
                );
                return;
              }

              if (error.response?.data.errorCode.includes("20822")) {
                form.setError(
                  "rangeOfDays",
                  {
                    message: `PTO cannot be registered before the date of joining the company`,
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
    }
  }

  return (
    <Dialog {...dialogProps} open={state.open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>PTO</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rangeOfDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Range of Days</FormLabel>
                  <FormControl>
                    <PtoDatePicker
                      value={field.value ?? undefined}
                      onChange={(...args) => {
                        const newValue = args[0];
                        // https://react-hook-form.com/docs/usecontroller/controller
                        // field.onChange에 undefined를 담을 수 없음
                        field.onChange(
                          newValue === undefined ? null : newValue
                        );
                      }}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>User</FormLabel>
                  <FormControl>
                    <>
                      {state.open &&
                        (state.type === "Add" ? (
                          <UsersByOrganizationCombobox
                            organizationId={BARUNCORP_ORGANIZATION_ID}
                            userId={field.value}
                            onUserIdChange={field.onChange}
                            ref={field.ref}
                            modal
                          />
                        ) : (
                          <Input value={field.value} disabled ref={field.ref} />
                        ))}
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ptoTypeId"
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel required>Type</FormLabel>
                  <FormControl>
                    <PtoTypesCombobox
                      ptoTypeId={field.value}
                      onPtoTypeChange={(newPtoType) => {
                        field.onChange(newPtoType.id);

                        let newAmount = "";
                        if (newPtoType.availableValues.length === 1) {
                          newAmount = String(
                            newPtoType.availableValues[0].value
                          );
                        }

                        form.setValue("amount", newAmount, {
                          shouldValidate: formState.isSubmitted,
                        });
                      }}
                      ref={field.ref}
                    />
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
                    <PtoTypeAmountsCombobox
                      amount={field.value}
                      onAmountChange={field.onChange}
                      ref={field.ref}
                      ptoTypeId={watchPtoTypeId}
                      modal
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton
              type="submit"
              className="w-full"
              isLoading={form.formState.isSubmitting}
            >
              Submit
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
