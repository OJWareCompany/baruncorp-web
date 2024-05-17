"use client";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useProfileContext } from "../../ProfileProvider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/LoadingButton";
import { Textarea } from "@/components/ui/textarea";
import { transformStringIntoNullableString } from "@/lib/constants";
import { getDepartmentsQueryKey } from "@/queries/useDepartmentsQuery";
import usePostDepartmentMutation from "@/mutations/usePostDepartmentMutation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  sendDeliverables: z.boolean(),
  editClientRole: z.boolean(),
  editMemberRole: z.boolean(),
});

type FieldValues = z.infer<typeof formSchema>;

export default function NewDepartmentSheet() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const usePostDepartmentMutationResult = usePostDepartmentMutation();
  const { isAdmin } = useProfileContext();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      viewClientInvoice: false,
      viewVendorInvoice: false,
      viewCustomPricing: false,
      viewExpensePricing: false,
      viewScopePrice: false,
      viewTaskCost: false,
      editTask: false,
      editLicense: false,
      editPosition: false,
      sendDeliverables: false,
      editClientRole: false,
      editMemberRole: false,
    },
  });

  useEffect(() => {
    if (
      form.formState.isSubmitSuccessful &&
      usePostDepartmentMutationResult.isSuccess
    ) {
      form.reset();
    }
  }, [
    form,
    form.formState.isSubmitSuccessful,
    usePostDepartmentMutationResult.isSuccess,
  ]);

  async function onSubmit(values: FieldValues) {
    await usePostDepartmentMutationResult
      .mutateAsync({
        name: values.name,
        description: transformStringIntoNullableString.parse(
          values.description
        ),
        viewClientInvoice: values.viewClientInvoice,
        viewVendorInvoice: values.viewVendorInvoice,
        viewCustomPricing: values.viewCustomPricing,
        viewExpensePricing: values.viewExpensePricing,
        viewScopePrice: values.viewScopePrice,
        viewTaskCost: values.viewTaskCost,
        editUserTask: values.editTask,
        editUserLicense: values.editLicense,
        editUserPosition: values.editPosition,
        sendDeliverables: values.sendDeliverables,
        editClientRole: values.editClientRole,
        editMemberRole: values.editMemberRole,
      })
      .then(() => {
        setOpen(false);
        toast({
          title: "Success",
        });
        queryClient.invalidateQueries({
          queryKey: getDepartmentsQueryKey({}),
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className="text-white bg-slate-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Department
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New Department</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} />
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
                    <FormField
                      control={form.control}
                      name="sendDeliverables"
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
                            Can Send Deliverables
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editClientRole"
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
                            Can Edit Client Role
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editMemberRole"
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
                              disabled // 아직 사용되는 곳이 없어서 interface만 만들어놓고 disabled 처리하기로 이야기함
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Can Edit Member Role
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}
            <LoadingButton
              type="submit"
              className="w-full"
              isLoading={form.formState.isSubmitting}
            >
              Submit
            </LoadingButton>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
