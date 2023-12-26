import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { ExpensePricingResponseDto, OrganizationResponseDto } from "@/api";
import {
  ExpenseTypeEnum,
  digitRegExp,
  toTwoDecimalRegExp,
} from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RowItemsContainer from "@/components/RowItemsContainer";
import { AffixInput } from "@/components/AffixInput";
import LoadingButton from "@/components/LoadingButton";
import usePatchExpensePricingMutation from "@/mutations/usePatchExpensePricingMutation";
import { getExpensePricingQueryKey } from "@/queries/useExpensePricingQuery";

const formSchema = z
  .object({
    taskId: z.string().trim().min(1, { message: "Task is required" }),
    resiNewExpenseType: ExpenseTypeEnum,
    resiNewValue: z.string().trim(),
    resiRevExpenseType: ExpenseTypeEnum,
    resiRevValue: z.string().trim(),
    comNewExpenseType: ExpenseTypeEnum,
    comNewValue: z.string().trim(),
    comRevExpenseType: ExpenseTypeEnum,
    comRevValue: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.resiNewValue.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${
          values.resiNewExpenseType === "Fixed" ? "Price" : "Percentage"
        } is required`,
        path: [`resiNewValue`],
      });
    }

    if (values.resiRevValue.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${
          values.resiRevExpenseType === "Fixed" ? "Price" : "Percentage"
        } is required`,
        path: [`resiRevValue`],
      });
    }

    if (values.comNewValue.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${
          values.comNewExpenseType === "Fixed" ? "Price" : "Percentage"
        } is required`,
        path: [`comNewValue`],
      });
    }

    if (values.comRevValue.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${
          values.comRevExpenseType === "Fixed" ? "Price" : "Percentage"
        } is required`,
        path: [`comRevValue`],
      });
    }
  });

type FieldValues = z.infer<typeof formSchema>;

const getFieldValues = (
  expensePricing: ExpensePricingResponseDto
): FieldValues => {
  return {
    taskId: expensePricing.taskId,
    resiNewExpenseType: expensePricing.resiNewExpenseType as ExpenseTypeEnum,
    resiNewValue: String(expensePricing.resiNewValue),
    resiRevExpenseType: expensePricing.resiRevExpenseType as ExpenseTypeEnum,
    resiRevValue: String(expensePricing.resiRevValue),
    comNewExpenseType: expensePricing.comNewExpenseType as ExpenseTypeEnum,
    comNewValue: String(expensePricing.comNewValue),
    comRevExpenseType: expensePricing.comRevExpenseType as ExpenseTypeEnum,
    comRevValue: String(expensePricing.comRevValue),
  };
};

interface Props {
  expensePricing: ExpensePricingResponseDto;
  organization: OrganizationResponseDto;
}

export default function ExpensePricingForm({
  expensePricing,
  organization,
}: Props) {
  const queryClient = useQueryClient();
  const { mutateAsync } = usePatchExpensePricingMutation({
    organizationId: organization.id,
    taskId: expensePricing.taskId,
  });

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(expensePricing),
  });

  const watchResiNewExpenseType = form.watch("resiNewExpenseType");
  const watchResiRevExpenseType = form.watch("resiRevExpenseType");
  const watchComNewExpenseType = form.watch("comNewExpenseType");
  const watchComRevExpenseType = form.watch("comRevExpenseType");

  useEffect(() => {
    if (expensePricing) {
      form.reset(getFieldValues(expensePricing));
    }
  }, [expensePricing, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await mutateAsync({
      resiNewExpenseType: values.resiNewExpenseType,
      resiNewValue: Number(values.resiNewValue),
      resiRevExpenseType: values.resiRevExpenseType,
      resiRevValue: Number(values.resiRevValue),
      comNewExpenseType: values.comNewExpenseType,
      comNewValue: Number(values.comNewValue),
      comRevExpenseType: values.comRevExpenseType,
      comRevValue: Number(values.comRevValue),
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: getExpensePricingQueryKey(
            organization.id,
            expensePricing.taskId
          ),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        // switch (error.response?.status) {
        //   case 409:
        //     serviceIdForm.setError(
        //       "serviceId",
        //       {
        //         message: `This Organization already has Expense Pricing for the ${service.name}`,
        //       },
        //       { shouldFocus: true }
        //     );
        //     // if (error.response?.data.errorCode.includes("20001")) {
        //     // form.setError(
        //     //   "",
        //     //   {
        //     //     message: `${name} is already existed`,
        //     //   },
        //     //   {
        //     //     shouldFocus: true,
        //     //   }
        //     // );
        //     // }
        //     break;
        // }
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <section className="space-y-2">
          <h2 className="h4">Residential New Price</h2>
          <RowItemsContainer>
            <FormField
              control={form.control}
              name="resiNewExpenseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Expense Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("resiNewValue", "", {
                          shouldDirty: true,
                        });
                        form.clearErrors("resiNewValue");
                      }}
                    >
                      <SelectTrigger ref={field.ref}>
                        <SelectValue placeholder="Select an expense type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {ExpenseTypeEnum.options.map((option) => (
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
            {watchResiNewExpenseType === "Fixed" ? (
              <FormField
                control={form.control}
                name="resiNewValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Price</FormLabel>
                    <FormControl>
                      <AffixInput
                        prefixElement={
                          <span className="text-muted-foreground">$</span>
                        }
                        value={field.value}
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
            ) : (
              <FormField
                control={form.control}
                name="resiNewValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Percentage</FormLabel>
                    <FormControl>
                      <AffixInput
                        suffixElement={
                          <span className="text-muted-foreground">%</span>
                        }
                        value={field.value}
                        onChange={(event) => {
                          const { value } = event.target;
                          if (value === "" || digitRegExp.test(value)) {
                            if (Number(value) > 100) {
                              field.onChange({
                                ...event,
                                target: {
                                  ...event.target,
                                  value: "100",
                                },
                              });
                              return;
                            }

                            field.onChange(event);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </RowItemsContainer>
        </section>
        <section className="space-y-2">
          <h2 className="h4">Residential Revision Price</h2>
          <RowItemsContainer>
            <FormField
              control={form.control}
              name="resiRevExpenseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Expense Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("resiRevValue", "", {
                          shouldDirty: true,
                        });
                        form.clearErrors("resiRevValue");
                      }}
                    >
                      <SelectTrigger ref={field.ref}>
                        <SelectValue placeholder="Select an expense type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {ExpenseTypeEnum.options.map((option) => (
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
            {watchResiRevExpenseType === "Fixed" ? (
              <FormField
                control={form.control}
                name="resiRevValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Price</FormLabel>
                    <FormControl>
                      <AffixInput
                        prefixElement={
                          <span className="text-muted-foreground">$</span>
                        }
                        value={field.value}
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
            ) : (
              <FormField
                control={form.control}
                name="resiRevValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Percentage</FormLabel>
                    <FormControl>
                      <AffixInput
                        suffixElement={
                          <span className="text-muted-foreground">%</span>
                        }
                        value={field.value}
                        onChange={(event) => {
                          const { value } = event.target;
                          if (value === "" || digitRegExp.test(value)) {
                            if (Number(value) > 100) {
                              field.onChange({
                                ...event,
                                target: {
                                  ...event.target,
                                  value: "100",
                                },
                              });
                              return;
                            }

                            field.onChange(event);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </RowItemsContainer>
        </section>
        <section className="space-y-2">
          <h2 className="h4">Commercial New Price</h2>
          <RowItemsContainer>
            <FormField
              control={form.control}
              name="comNewExpenseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Expense Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("comNewValue", "", {
                          shouldDirty: true,
                        });
                        form.clearErrors("comNewValue");
                      }}
                    >
                      <SelectTrigger ref={field.ref}>
                        <SelectValue placeholder="Select an expense type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {ExpenseTypeEnum.options.map((option) => (
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
            {watchComNewExpenseType === "Fixed" ? (
              <FormField
                control={form.control}
                name="comNewValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Price</FormLabel>
                    <FormControl>
                      <AffixInput
                        prefixElement={
                          <span className="text-muted-foreground">$</span>
                        }
                        value={field.value}
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
            ) : (
              <FormField
                control={form.control}
                name="comNewValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Percentage</FormLabel>
                    <FormControl>
                      <AffixInput
                        suffixElement={
                          <span className="text-muted-foreground">%</span>
                        }
                        value={field.value}
                        onChange={(event) => {
                          const { value } = event.target;
                          if (value === "" || digitRegExp.test(value)) {
                            if (Number(value) > 100) {
                              field.onChange({
                                ...event,
                                target: {
                                  ...event.target,
                                  value: "100",
                                },
                              });
                              return;
                            }

                            field.onChange(event);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </RowItemsContainer>
        </section>
        <section className="space-y-2">
          <h2 className="h4">Commercial Revision Price</h2>
          <RowItemsContainer>
            <FormField
              control={form.control}
              name="comRevExpenseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Expense Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("comRevValue", "", {
                          shouldDirty: true,
                        });
                        form.clearErrors("comRevValue");
                      }}
                    >
                      <SelectTrigger ref={field.ref}>
                        <SelectValue placeholder="Select an expense type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {ExpenseTypeEnum.options.map((option) => (
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
            {watchComRevExpenseType === "Fixed" ? (
              <FormField
                control={form.control}
                name="comRevValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Price</FormLabel>
                    <FormControl>
                      <AffixInput
                        prefixElement={
                          <span className="text-muted-foreground">$</span>
                        }
                        value={field.value}
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
            ) : (
              <FormField
                control={form.control}
                name="comRevValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Percentage</FormLabel>
                    <FormControl>
                      <AffixInput
                        suffixElement={
                          <span className="text-muted-foreground">%</span>
                        }
                        value={field.value}
                        onChange={(event) => {
                          const { value } = event.target;
                          if (value === "" || digitRegExp.test(value)) {
                            if (Number(value) > 100) {
                              field.onChange({
                                ...event,
                                target: {
                                  ...event.target,
                                  value: "100",
                                },
                              });
                              return;
                            }

                            field.onChange(event);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </RowItemsContainer>
        </section>
        <LoadingButton
          type="submit"
          className="w-full"
          isLoading={form.formState.isSubmitting}
          disabled={!form.formState.isDirty}
        >
          Edit
        </LoadingButton>
      </form>
    </Form>
  );
}
