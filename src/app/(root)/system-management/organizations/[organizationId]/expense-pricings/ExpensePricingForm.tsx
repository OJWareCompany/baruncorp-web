"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import LoadingButton from "@/components/LoadingButton";
import {
  ExpenseTypeEnum,
  digitRegExp,
  toTwoDecimalRegExp,
} from "@/lib/constants";
import { AffixInput } from "@/components/AffixInput";
import RowItemsContainer from "@/components/RowItemsContainer";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreatableExpensePricingCombobox from "@/components/combobox/CreatableExpensePricingCombobox";
import usePostExpensePricingMutation from "@/mutations/usePostExpensePricingMutation";
import { getExpensePricingsQueryKey } from "@/queries/useExpensePricingsQuery";
import { getCreatableExpensePricingsQueryKey } from "@/queries/useCreatableExpensePricingsQuery";

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

interface Props {
  onSuccess?: () => void;
}

export default function ExpensePricingForm({ onSuccess }: Props) {
  const { organizationId } = useParams() as { organizationId: string };
  const { toast } = useToast();
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const { mutateAsync } = usePostExpensePricingMutation();
  const queryClient = useQueryClient();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskId: "",
      resiNewExpenseType: "Fixed",
      resiNewValue: "",
      resiRevExpenseType: "Fixed",
      resiRevValue: "",
      comNewExpenseType: "Fixed",
      comNewValue: "",
      comRevExpenseType: "Fixed",
      comRevValue: "",
    },
  });

  const watchResiNewExpenseType = form.watch("resiNewExpenseType");
  const watchResiRevExpenseType = form.watch("resiRevExpenseType");
  const watchComNewExpenseType = form.watch("comNewExpenseType");
  const watchComRevExpenseType = form.watch("comRevExpenseType");

  useEffect(() => {
    if (isSubmitSuccessful) {
      form.reset();
      setIsSubmitSuccessful(false);
    }
  }, [form, isSubmitSuccessful]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await mutateAsync({
      taskId: values.taskId,
      organizationId: organizationId,
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
        onSuccess?.();
        setIsSubmitSuccessful(true);
        toast({
          title: "Success",
        });
        queryClient.invalidateQueries({
          queryKey: getExpensePricingsQueryKey({ organizationId }),
        });
        queryClient.invalidateQueries({
          queryKey: getCreatableExpensePricingsQueryKey({ organizationId }),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 409:
            form.setError(
              "taskId",
              {
                message: `This Organization already has Expense Pricing for this`,
              },
              { shouldFocus: true }
            );
            break;
        }
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
        <FormField
          control={form.control}
          name="taskId"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Task</FormLabel>
              <FormControl>
                <CreatableExpensePricingCombobox
                  organizationId={organizationId}
                  taskId={field.value}
                  onTaskIdChange={(newTaskId) => {
                    field.onChange(newTaskId);
                  }}
                  modal
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        >
          Submit
        </LoadingButton>
      </form>
    </Form>
  );
}

// "use client";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { UseFormReturn, useFieldArray, useForm } from "react-hook-form";
// import { z } from "zod";
// import { useEffect, useMemo, useState } from "react";
// import { X } from "lucide-react";
// import { useQueryClient } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import RowRowItemsContainer from "@/components/RowRowItemsContainer";
// import LoadingButton from "@/components/LoadingButton";
// import {
//   ExpenseTypeEnum,
//   ExpenseTypeEnumWithEmptyString,
//   ResidentialNewPriceChargeTypeEnum,
//   ResidentialNewPriceChargeTypeEnumWithEmptyString,
//   digitRegExp,
//   toTwoDecimalRegExp,
//   transformExpenseTypeEnumWithEmptyStringIntoNullableExpenseTypeEnum,
//   transformResidentialNewPriceChargeTypeEnumWithEmptyStringIntoNullableResidentialNewPriceChargeTypeEnum,
//   transformStringIntoNullableNumber,
// } from "@/lib/constants";
// import { OrganizationResponseDto, ServiceResponseDto } from "@/api";
// import { AffixInput } from "@/components/AffixInput";
// import { Button } from "@/components/ui/button";
// import RowItemsContainer from "@/components/RowItemsContainer";
// import { useToast } from "@/components/ui/use-toast";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import CreatableExpensePricingCombobox from "@/components/combobox/CreatableExpensePricingCombobox";
// import { useParams } from "next/navigation";
// import usePostExpensePricingMutation from "@/queries/usePostExpensePricingMutation";

// export default function ExpensePricingForm() {
//   const { organizationId } = useParams() as { organizationId: string };
//   // const { toast } = useToast();
//   // const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
//   const [sectionExisting, setSectionExisting] = useState({
//     isResiNewPriceExist: false,
//     isResiRevPriceExist: false,
//     isComNewPriceExist: false,
//     isComRevPriceExist: false,
//   });
//   const { mutateAsync } = usePostExpensePricingMutation();
//   const queryClient = useQueryClient();

//   const formSchema = useMemo(
//     () =>
//       z
//         .object({
//           taskId: z.string().trim().min(1, { message: "Task is required" }),
//           resiNewExpenseType: ExpenseTypeEnumWithEmptyString,
//           resiNewValue: z.string().trim(),
//           resiRevExpenseType: ExpenseTypeEnumWithEmptyString,
//           resiRevValue: z.string().trim(),
//           comNewExpenseType: ExpenseTypeEnumWithEmptyString,
//           comNewValue: z.string().trim(),
//           comRevExpenseType: ExpenseTypeEnumWithEmptyString,
//           comRevValue: z.string().trim(),
//         })
//         .superRefine((values, ctx) => {
//           if (sectionExisting.isResiNewPriceExist) {
//             if (values.resiNewExpenseType === "") {
//               ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 message: "Expense Type is required",
//                 path: [`resiNewExpenseType`],
//               });
//             }

//             if (
//               values.resiNewExpenseType !== "" &&
//               values.resiNewValue.length === 0
//             ) {
//               ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 message: `${
//                   values.resiNewExpenseType === "Fixed" ? "Price" : "Percentage"
//                 } is required`,
//                 path: [`resiNewValue`],
//               });
//             }
//           }

//           if (sectionExisting.isResiRevPriceExist) {
//             if (values.resiRevExpenseType === "") {
//               ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 message: "Expense Type is required",
//                 path: [`resiRevExpenseType`],
//               });
//             }

//             if (
//               values.resiRevExpenseType !== "" &&
//               values.resiRevValue.length === 0
//             ) {
//               ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 message: `${
//                   values.resiRevExpenseType === "Fixed" ? "Price" : "Percentage"
//                 } is required`,
//                 path: [`resiRevValue`],
//               });
//             }
//           }

//           if (sectionExisting.isComNewPriceExist) {
//             if (values.comNewExpenseType === "") {
//               ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 message: "Expense Type is required",
//                 path: [`comNewExpenseType`],
//               });
//             }

//             if (
//               values.comNewExpenseType !== "" &&
//               values.comNewValue.length === 0
//             ) {
//               ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 message: `${
//                   values.comNewExpenseType === "Fixed" ? "Price" : "Percentage"
//                 } is required`,
//                 path: [`comNewValue`],
//               });
//             }
//           }

//           if (sectionExisting.isComRevPriceExist) {
//             if (values.comRevExpenseType === "") {
//               ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 message: "Expense Type is required",
//                 path: [`comRevExpenseType`],
//               });
//             }

//             if (
//               values.comRevExpenseType !== "" &&
//               values.comRevValue.length === 0
//             ) {
//               ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 message: `${
//                   values.comRevExpenseType === "Fixed" ? "Price" : "Percentage"
//                 } is required`,
//                 path: [`comRevValue`],
//               });
//             }
//           }
//         }),
//     [sectionExisting]
//   );

//   type FieldValues = z.infer<typeof formSchema>;

//   const form = useForm<FieldValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       taskId: "",
//       resiNewExpenseType: "",
//       resiNewValue: "",
//       resiRevExpenseType: "",
//       resiRevValue: "",
//       comNewExpenseType: "",
//       comNewValue: "",
//       comRevExpenseType: "",
//       comRevValue: "",
//     },
//   });

//   const watchResiNewExpenseType = form.watch("resiNewExpenseType");
//   const watchResiRevExpenseType = form.watch("resiRevExpenseType");
//   const watchComNewExpenseType = form.watch("comNewExpenseType");
//   const watchComRevExpenseType = form.watch("comRevExpenseType");

//   // useEffect(() => {
//   //   if (isSubmitSuccessful) {
//   //     serviceIdForm.reset();
//   //     form.reset();
//   //     setIsSubmitSuccessful(false);
//   //   }
//   // }, [form, isSubmitSuccessful, serviceIdForm]);

//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     // await mutateAsync({
//     //   taskId: values.taskId,
//     //   organizationId: organizationId,
//     //   resiNewExpenseType:
//     //     transformExpenseTypeEnumWithEmptyStringIntoNullableExpenseTypeEnum.parse(
//     //       values.resiNewExpenseType
//     //     ),
//     //   resiNewValue: transformStringIntoNullableNumber.parse(
//     //     values.resiNewValue
//     //   ),
//     //   resiRevExpenseType:
//     //     transformExpenseTypeEnumWithEmptyStringIntoNullableExpenseTypeEnum.parse(
//     //       values.resiRevExpenseType
//     //     ),
//     //   resiRevValue: transformStringIntoNullableNumber.parse(
//     //     values.resiRevValue
//     //   ),
//     //   comNewExpenseType:
//     //     transformExpenseTypeEnumWithEmptyStringIntoNullableExpenseTypeEnum.parse(
//     //       values.comNewExpenseType
//     //     ),
//     //   comNewValue: transformStringIntoNullableNumber.parse(values.comNewValue),
//     //   comRevExpenseType:
//     //     transformExpenseTypeEnumWithEmptyStringIntoNullableExpenseTypeEnum.parse(
//     //       values.comRevExpenseType
//     //     ),
//     //   comRevValue: transformStringIntoNullableNumber.parse(values.comRevValue),
//     // })
//     // .then(() => {
//     //   setIsSubmitSuccessful(true);
//     //   toast({
//     //     title: "Success",
//     //   });
//     //   queryClient.invalidateQueries({
//     //     queryKey: [
//     //       "expense-pricing",
//     //       "list",
//     //       "all",
//     //       { organizationId: organization.id },
//     //     ],
//     //   });
//     //   queryClient.invalidateQueries({
//     //     queryKey: [
//     //       "creatable-expense-pricing",
//     //       "list",
//     //       { organizationId: organization.id },
//     //     ],
//     //   });
//     // })
//     // .catch((error: AxiosError<ErrorResponseData>) => {
//     //   switch (error.response?.status) {
//     //     case 409:
//     //       // serviceIdForm.setError(
//     //       //   "serviceId",
//     //       //   {
//     //       //     message: `This Organization already has Expense Pricing for the ${service.name}`,
//     //       //   },
//     //       //   { shouldFocus: true }
//     //       // );
//     //       // if (error.response?.data.errorCode.includes("20001")) {
//     //       // form.setError(
//     //       //   "",
//     //       //   {
//     //       //     message: `${name} is already existed`,
//     //       //   },
//     //       //   {
//     //       //     shouldFocus: true,
//     //       //   }
//     //       // );
//     //       // }
//     //       break;
//     //   }
//     // });
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
//         <FormField
//           control={form.control}
//           name="taskId"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel required>Task</FormLabel>
//               <FormControl>
//                 <CreatableExpensePricingCombobox
//                   organizationId={organizationId}
//                   taskId={field.value}
//                   onTaskIdChange={(newTaskId) => {
//                     field.onChange(newTaskId);
//                     form.clearErrors();
//                   }}
//                   modal
//                   ref={field.ref}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <section className="space-y-2">
//           <div className="flex items-center justify-between">
//             <h2 className="h4">Residential New Price</h2>
//             {sectionExisting.isResiNewPriceExist && (
//               <Button
//                 variant={"outline"}
//                 size={"sm"}
//                 className="h-[28px] text-xs px-2"
//                 onClick={() => {
//                   setSectionExisting((prev) => ({
//                     ...prev,
//                     isResiNewPriceExist: false,
//                   }));
//                   form.setValue("resiNewExpenseType", "", {
//                     shouldDirty: true,
//                   });
//                   form.setValue("resiNewValue", "", {
//                     shouldDirty: true,
//                   });
//                 }}
//               >
//                 <X className="mr-2 h-4 w-4" />
//                 Remove
//               </Button>
//             )}
//           </div>
//           {sectionExisting.isResiNewPriceExist ? (
//             <RowItemsContainer>
//               <FormField
//                 control={form.control}
//                 name="resiNewExpenseType"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel required>Expense Type</FormLabel>
//                     <FormControl>
//                       <Select
//                         value={field.value}
//                         onValueChange={(value) => {
//                           field.onChange(value);
//                           form.setValue("resiNewValue", "", {
//                             shouldDirty: true,
//                           });
//                           form.clearErrors("resiNewValue");
//                         }}
//                       >
//                         <SelectTrigger ref={field.ref}>
//                           <SelectValue placeholder="Select an expense type" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectGroup>
//                             {ExpenseTypeEnum.options.map((option) => (
//                               <SelectItem key={option} value={option}>
//                                 {option}
//                               </SelectItem>
//                             ))}
//                           </SelectGroup>
//                         </SelectContent>
//                       </Select>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               {watchResiNewExpenseType !== "" &&
//                 (watchResiNewExpenseType === "Fixed" ? (
//                   <FormField
//                     control={form.control}
//                     name="resiNewValue"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel required>Price</FormLabel>
//                         <FormControl>
//                           <AffixInput
//                             prefixElement={
//                               <span className="text-muted-foreground">$</span>
//                             }
//                             value={field.value}
//                             onChange={(event) => {
//                               const { value } = event.target;
//                               if (
//                                 value === "" ||
//                                 toTwoDecimalRegExp.test(value)
//                               ) {
//                                 field.onChange(event);
//                               }
//                             }}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 ) : (
//                   <FormField
//                     control={form.control}
//                     name="resiNewValue"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel required>Percentage</FormLabel>
//                         <FormControl>
//                           <AffixInput
//                             suffixElement={
//                               <span className="text-muted-foreground">%</span>
//                             }
//                             value={field.value}
//                             onChange={(event) => {
//                               const { value } = event.target;
//                               if (value === "" || digitRegExp.test(value)) {
//                                 field.onChange(event);
//                               }
//                             }}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 ))}
//             </RowItemsContainer>
//           ) : (
//             <Button
//               variant={"outline"}
//               className="w-full"
//               onClick={() => {
//                 setSectionExisting((prev) => ({
//                   ...prev,
//                   isResiNewPriceExist: true,
//                 }));
//               }}
//             >
//               Add Residential New Price
//             </Button>
//           )}
//         </section>
//         <section className="space-y-2">
//           <div className="flex items-center justify-between">
//             <h2 className="h4">Residential Rev Price</h2>
//             {sectionExisting.isResiRevPriceExist && (
//               <Button
//                 variant={"outline"}
//                 size={"sm"}
//                 className="h-[28px] text-xs px-2"
//                 onClick={() => {
//                   setSectionExisting((prev) => ({
//                     ...prev,
//                     isResiRevPriceExist: false,
//                   }));
//                   form.setValue("resiRevExpenseType", "", {
//                     shouldDirty: true,
//                   });
//                   form.setValue("resiRevValue", "", {
//                     shouldDirty: true,
//                   });
//                 }}
//               >
//                 <X className="mr-2 h-4 w-4" />
//                 Remove
//               </Button>
//             )}
//           </div>
//           {sectionExisting.isResiRevPriceExist ? (
//             <RowItemsContainer>
//               <FormField
//                 control={form.control}
//                 name="resiRevExpenseType"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel required>Expense Type</FormLabel>
//                     <FormControl>
//                       <Select
//                         value={field.value}
//                         onValueChange={(value) => {
//                           field.onChange(value);
//                           form.setValue("resiRevValue", "", {
//                             shouldDirty: true,
//                           });
//                           form.clearErrors("resiRevValue");
//                         }}
//                       >
//                         <SelectTrigger ref={field.ref}>
//                           <SelectValue placeholder="Select an expense type" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectGroup>
//                             {ExpenseTypeEnum.options.map((option) => (
//                               <SelectItem key={option} value={option}>
//                                 {option}
//                               </SelectItem>
//                             ))}
//                           </SelectGroup>
//                         </SelectContent>
//                       </Select>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               {watchResiRevExpenseType !== "" &&
//                 (watchResiRevExpenseType === "Fixed" ? (
//                   <FormField
//                     control={form.control}
//                     name="resiRevValue"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel required>Price</FormLabel>
//                         <FormControl>
//                           <AffixInput
//                             prefixElement={
//                               <span className="text-muted-foreground">$</span>
//                             }
//                             value={field.value}
//                             onChange={(event) => {
//                               const { value } = event.target;
//                               if (
//                                 value === "" ||
//                                 toTwoDecimalRegExp.test(value)
//                               ) {
//                                 field.onChange(event);
//                               }
//                             }}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 ) : (
//                   <FormField
//                     control={form.control}
//                     name="resiRevValue"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel required>Percentage</FormLabel>
//                         <FormControl>
//                           <AffixInput
//                             suffixElement={
//                               <span className="text-muted-foreground">%</span>
//                             }
//                             value={field.value}
//                             onChange={(event) => {
//                               const { value } = event.target;
//                               if (value === "" || digitRegExp.test(value)) {
//                                 field.onChange(event);
//                               }
//                             }}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 ))}
//             </RowItemsContainer>
//           ) : (
//             <Button
//               variant={"outline"}
//               className="w-full"
//               onClick={() => {
//                 setSectionExisting((prev) => ({
//                   ...prev,
//                   isResiRevPriceExist: true,
//                 }));
//               }}
//             >
//               Add Residential Rev Price
//             </Button>
//           )}
//         </section>
//         <section className="space-y-2">
//           <div className="flex items-center justify-between">
//             <h2 className="h4">Commercial New Price</h2>
//             {sectionExisting.isComNewPriceExist && (
//               <Button
//                 variant={"outline"}
//                 size={"sm"}
//                 className="h-[28px] text-xs px-2"
//                 onClick={() => {
//                   setSectionExisting((prev) => ({
//                     ...prev,
//                     isComNewPriceExist: false,
//                   }));
//                   form.setValue("comNewExpenseType", "", {
//                     shouldDirty: true,
//                   });
//                   form.setValue("comNewValue", "", {
//                     shouldDirty: true,
//                   });
//                 }}
//               >
//                 <X className="mr-2 h-4 w-4" />
//                 Remove
//               </Button>
//             )}
//           </div>
//           {sectionExisting.isComNewPriceExist ? (
//             <RowItemsContainer>
//               <FormField
//                 control={form.control}
//                 name="comNewExpenseType"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel required>Expense Type</FormLabel>
//                     <FormControl>
//                       <Select
//                         value={field.value}
//                         onValueChange={(value) => {
//                           field.onChange(value);
//                           form.setValue("comNewValue", "", {
//                             shouldDirty: true,
//                           });
//                           form.clearErrors("comNewValue");
//                         }}
//                       >
//                         <SelectTrigger ref={field.ref}>
//                           <SelectValue placeholder="Select an expense type" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectGroup>
//                             {ExpenseTypeEnum.options.map((option) => (
//                               <SelectItem key={option} value={option}>
//                                 {option}
//                               </SelectItem>
//                             ))}
//                           </SelectGroup>
//                         </SelectContent>
//                       </Select>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               {watchComNewExpenseType !== "" &&
//                 (watchComNewExpenseType === "Fixed" ? (
//                   <FormField
//                     control={form.control}
//                     name="comNewValue"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel required>Price</FormLabel>
//                         <FormControl>
//                           <AffixInput
//                             prefixElement={
//                               <span className="text-muted-foreground">$</span>
//                             }
//                             value={field.value}
//                             onChange={(event) => {
//                               const { value } = event.target;
//                               if (
//                                 value === "" ||
//                                 toTwoDecimalRegExp.test(value)
//                               ) {
//                                 field.onChange(event);
//                               }
//                             }}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 ) : (
//                   <FormField
//                     control={form.control}
//                     name="comNewValue"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel required>Percentage</FormLabel>
//                         <FormControl>
//                           <AffixInput
//                             suffixElement={
//                               <span className="text-muted-foreground">%</span>
//                             }
//                             value={field.value}
//                             onChange={(event) => {
//                               const { value } = event.target;
//                               if (value === "" || digitRegExp.test(value)) {
//                                 field.onChange(event);
//                               }
//                             }}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 ))}
//             </RowItemsContainer>
//           ) : (
//             <Button
//               variant={"outline"}
//               className="w-full"
//               onClick={() => {
//                 setSectionExisting((prev) => ({
//                   ...prev,
//                   isComNewPriceExist: true,
//                 }));
//               }}
//             >
//               Add Commercial New Price
//             </Button>
//           )}
//         </section>
//         <section className="space-y-2">
//           <div className="flex items-center justify-between">
//             <h2 className="h4">Commercial Rev Price</h2>
//             {sectionExisting.isComRevPriceExist && (
//               <Button
//                 variant={"outline"}
//                 size={"sm"}
//                 className="h-[28px] text-xs px-2"
//                 onClick={() => {
//                   setSectionExisting((prev) => ({
//                     ...prev,
//                     isComRevPriceExist: false,
//                   }));
//                   form.setValue("comRevExpenseType", "", {
//                     shouldDirty: true,
//                   });
//                   form.setValue("comRevValue", "", {
//                     shouldDirty: true,
//                   });
//                 }}
//               >
//                 <X className="mr-2 h-4 w-4" />
//                 Remove
//               </Button>
//             )}
//           </div>
//           {sectionExisting.isComRevPriceExist ? (
//             <RowItemsContainer>
//               <FormField
//                 control={form.control}
//                 name="comRevExpenseType"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel required>Expense Type</FormLabel>
//                     <FormControl>
//                       <Select
//                         value={field.value}
//                         onValueChange={(value) => {
//                           field.onChange(value);
//                           form.setValue("comRevValue", "", {
//                             shouldDirty: true,
//                           });
//                           form.clearErrors("comRevValue");
//                         }}
//                       >
//                         <SelectTrigger ref={field.ref}>
//                           <SelectValue placeholder="Select an expense type" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectGroup>
//                             {ExpenseTypeEnum.options.map((option) => (
//                               <SelectItem key={option} value={option}>
//                                 {option}
//                               </SelectItem>
//                             ))}
//                           </SelectGroup>
//                         </SelectContent>
//                       </Select>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               {watchComRevExpenseType !== "" &&
//                 (watchComRevExpenseType === "Fixed" ? (
//                   <FormField
//                     control={form.control}
//                     name="comRevValue"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel required>Price</FormLabel>
//                         <FormControl>
//                           <AffixInput
//                             prefixElement={
//                               <span className="text-muted-foreground">$</span>
//                             }
//                             value={field.value}
//                             onChange={(event) => {
//                               const { value } = event.target;
//                               if (
//                                 value === "" ||
//                                 toTwoDecimalRegExp.test(value)
//                               ) {
//                                 field.onChange(event);
//                               }
//                             }}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 ) : (
//                   <FormField
//                     control={form.control}
//                     name="comRevValue"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel required>Percentage</FormLabel>
//                         <FormControl>
//                           <AffixInput
//                             suffixElement={
//                               <span className="text-muted-foreground">%</span>
//                             }
//                             value={field.value}
//                             onChange={(event) => {
//                               const { value } = event.target;
//                               if (value === "" || digitRegExp.test(value)) {
//                                 field.onChange(event);
//                               }
//                             }}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 ))}
//             </RowItemsContainer>
//           ) : (
//             <Button
//               variant={"outline"}
//               className="w-full"
//               onClick={() => {
//                 setSectionExisting((prev) => ({
//                   ...prev,
//                   isComRevPriceExist: true,
//                 }));
//               }}
//             >
//               Add Commercial Rev Price
//             </Button>
//           )}
//         </section>
//         <LoadingButton
//           type="submit"
//           className="w-full"
//           isLoading={form.formState.isSubmitting}
//         >
//           Submit
//         </LoadingButton>
//       </form>
//     </Form>
//   );
// }
