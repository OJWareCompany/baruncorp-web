"use client";
import { Plus, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
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
import RowItemsContainer from "@/components/RowItemsContainer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ItemsContainer from "@/components/ItemsContainer";
import {
  LicenseTypeEnum,
  LicenseTypeEnumWithEmptyString,
  transformLicenseTypeEnumWithEmptyStringIntoNullableLicenseTypeEnum,
} from "@/lib/constants";
import LoadingButton from "@/components/LoadingButton";
import ServicesCombobox from "@/components/combobox/ServicesCombobox";
import usePostTaskMutation from "@/mutations/usePostTaskMutation";
import { getTasksQueryKey } from "@/queries/useTasksQuery";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  licenseType: LicenseTypeEnumWithEmptyString,
  serviceId: z.string().trim().min(1, { message: "Service is required" }),
});

type FieldValues = z.infer<typeof formSchema>;

export default function NewTaskSheet() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync } = usePostTaskMutation();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      licenseType: "",
      serviceId: "",
    },
  });

  const watchLicenseType = form.watch("licenseType");

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      name: values.name,
      licenseType:
        transformLicenseTypeEnumWithEmptyStringIntoNullableLicenseTypeEnum.parse(
          values.licenseType
        ),
      serviceId: values.serviceId,
    })
      .then(() => {
        toast({ title: "Success" });
        setOpen(false);
        setIsSubmitSuccessful(true);
        queryClient.invalidateQueries({
          queryKey: getTasksQueryKey({
            limit: Number.MAX_SAFE_INTEGER,
          }),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        // switch (error.response?.status) {
        //   case 409:
        //     if (error.response?.data.errorCode.includes("40100")) {
        //       form.setError(
        //         "name",
        //         {
        //           message: `${values.name} already exists`,
        //         },
        //         { shouldFocus: true }
        //       );
        //     }
        //     if (error.response?.data.errorCode.includes("40101")) {
        //       form.setError(
        //         "billingCode",
        //         {
        //           message: `${values.billingCode} already exists`,
        //         },
        //         { shouldFocus: true }
        //       );
        //     }
        //     break;
        // }
      });
  }

  useEffect(() => {
    if (isSubmitSuccessful) {
      form.reset();
      setIsSubmitSuccessful(false);
    }
  }, [form, isSubmitSuccessful]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New Task</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ItemsContainer>
              <RowItemsContainer>
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
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Service</FormLabel>
                      <FormControl>
                        <ServicesCombobox
                          serviceId={field.value}
                          onServiceIdChange={field.onChange}
                          ref={field.ref}
                          modal
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Type</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger ref={field.ref}>
                              <SelectValue placeholder="Select a license type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {LicenseTypeEnum.options.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <Button
                          size={"icon"}
                          variant={"outline"}
                          className="shrink-0"
                          disabled={watchLicenseType === ""}
                          onClick={() => {
                            form.setValue("licenseType", "", {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </RowItemsContainer>
              <LoadingButton
                type="submit"
                className="w-full"
                isLoading={form.formState.isSubmitting}
              >
                Submit
              </LoadingButton>
            </ItemsContainer>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
