"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import LoadingButton from "@/components/LoadingButton";
import { Input } from "@/components/ui/input";
import ItemsContainer from "@/components/ItemsContainer";
import { DepartmentResponseDto } from "@/api/api-spec";
import usePatchDepartmentMutation from "@/mutations/usePatchDepartmentMutation";
import {
  transformNullishStringIntoString,
  transformStringIntoNullableString,
} from "@/lib/constants";
import { getDepartmentQueryKey } from "@/queries/useDepartmentQuery";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useProfileContext } from "@/app/(root)/ProfileProvider";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  description: z.string().trim(),
  viewClientInvoice: z.boolean(),
  viewVendorInvoice: z.boolean(),
  viewCustomPricing: z.boolean(),
  viewExpensePricing: z.boolean(),
  viewScopePrice: z.boolean(),
  viewTaskCost: z.boolean(),
  editTask: z.boolean(),
  editLicense: z.boolean(),
  editPosition: z.boolean(),
});

type FieldValues = z.infer<typeof formSchema>;

const getFieldValues = (department: DepartmentResponseDto): FieldValues => {
  return {
    name: department.name,
    description: transformNullishStringIntoString.parse(department.description),
    viewClientInvoice: department.viewClientInvoice,
    viewVendorInvoice: department.viewVendorInvoice,
    viewCustomPricing: department.viewCustomPricing,
    viewExpensePricing: department.viewExpensePricing,
    viewScopePrice: department.viewScopePrice,
    viewTaskCost: department.viewTaskCost,
    editTask: department.editUserTask,
    editLicense: department.editUserLicense,
    editPosition: department.editUserPosition,
  };
};

interface Props {
  department: DepartmentResponseDto;
}

export default function DepartmentForm({ department }: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAdmin } = useProfileContext();

  const { mutateAsync } = usePatchDepartmentMutation(department.id);

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(department),
  });

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      name: values.name,
      description: transformStringIntoNullableString.parse(values.description),
      viewClientInvoice: values.viewClientInvoice,
      viewVendorInvoice: values.viewVendorInvoice,
      viewCustomPricing: values.viewCustomPricing,
      viewExpensePricing: values.viewExpensePricing,
      viewScopePrice: values.viewScopePrice,
      viewTaskCost: values.viewTaskCost,
      editUserTask: values.editTask,
      editUserLicense: values.editLicense,
      editUserPosition: values.editPosition,
    })
      .then(() => {
        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getDepartmentQueryKey(department.id),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 409:
            if (error.response?.data.errorCode.includes("20402")) {
              form.setError(
                "name",
                {
                  message: `${values.name} already exists`,
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

  useEffect(() => {
    if (department) {
      form.reset(getFieldValues(department));
    }
  }, [form, department]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ItemsContainer>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isAdmin} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={!isAdmin} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 권한 처리. Admin만 View Options를 설정할 수 있음 */}
          {isAdmin && (
            <>
              <div className="flex flex-col gap-2">
                <Label>View Options</Label>
                <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                  <FormField
                    control={form.control}
                    name="viewClientInvoice"
                    render={({ field }) => (
                      <FormItem className="flex flex-row gap-3 items-center">
                        <FormControl>
                          <Checkbox
                            ref={field.ref}
                            checked={field.value}
                            onCheckedChange={(newChecked) => {
                              if (typeof newChecked === "boolean") {
                                field.onChange(newChecked);
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Can View Client Invoice
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="viewVendorInvoice"
                    render={({ field }) => (
                      <FormItem className="flex flex-row gap-3 items-center">
                        <FormControl>
                          <Checkbox
                            ref={field.ref}
                            checked={field.value}
                            onCheckedChange={(newChecked) => {
                              if (typeof newChecked === "boolean") {
                                field.onChange(newChecked);
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Can View Vendor Invoice
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="viewCustomPricing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row gap-3 items-center">
                        <FormControl>
                          <Checkbox
                            ref={field.ref}
                            checked={field.value}
                            onCheckedChange={(newChecked) => {
                              if (typeof newChecked === "boolean") {
                                field.onChange(newChecked);
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Can View Custom Pricing
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="viewExpensePricing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row gap-3 items-center">
                        <FormControl>
                          <Checkbox
                            ref={field.ref}
                            checked={field.value}
                            onCheckedChange={(newChecked) => {
                              if (typeof newChecked === "boolean") {
                                field.onChange(newChecked);
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Can View Expense Pricing
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="viewScopePrice"
                    render={({ field }) => (
                      <FormItem className="flex flex-row gap-3 items-center">
                        <FormControl>
                          <Checkbox
                            ref={field.ref}
                            checked={field.value}
                            onCheckedChange={(newChecked) => {
                              if (typeof newChecked === "boolean") {
                                field.onChange(newChecked);
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Can View Scope Price
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="viewTaskCost"
                    render={({ field }) => (
                      <FormItem className="flex flex-row gap-3 items-center">
                        <FormControl>
                          <Checkbox
                            ref={field.ref}
                            checked={field.value}
                            onCheckedChange={(newChecked) => {
                              if (typeof newChecked === "boolean") {
                                field.onChange(newChecked);
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Can View Task Cost
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Edit Options</Label>
                <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                  <FormField
                    control={form.control}
                    name="editPosition"
                    render={({ field }) => (
                      <FormItem className="flex flex-row gap-3 items-center">
                        <FormControl>
                          <Checkbox
                            ref={field.ref}
                            checked={field.value}
                            onCheckedChange={(newChecked) => {
                              if (typeof newChecked === "boolean") {
                                field.onChange(newChecked);
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Can Edit Position
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="editLicense"
                    render={({ field }) => (
                      <FormItem className="flex flex-row gap-3 items-center">
                        <FormControl>
                          <Checkbox
                            ref={field.ref}
                            checked={field.value}
                            onCheckedChange={(newChecked) => {
                              if (typeof newChecked === "boolean") {
                                field.onChange(newChecked);
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Can Edit License
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="editTask"
                    render={({ field }) => (
                      <FormItem className="flex flex-row gap-3 items-center">
                        <FormControl>
                          <Checkbox
                            ref={field.ref}
                            checked={field.value}
                            onCheckedChange={(newChecked) => {
                              if (typeof newChecked === "boolean") {
                                field.onChange(newChecked);
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Can Edit Task
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <LoadingButton
                type="submit"
                className="w-full"
                isLoading={form.formState.isSubmitting}
                disabled={!form.formState.isDirty}
              >
                Save
              </LoadingButton>
            </>
          )}
        </ItemsContainer>
      </form>
    </Form>
  );
}
