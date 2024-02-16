"use client";
import { Plus, RotateCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
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
import LoadingButton from "@/components/LoadingButton";
import usePostPositionMutation from "@/mutations/usePostPositionMutation";
import { Textarea } from "@/components/ui/textarea";
import {
  LicenseTypeEnum,
  LicenseTypeEnumWithEmptyString,
  digitRegExp,
  transformLicenseTypeEnumWithEmptyStringIntoNullableLicenseTypeEnum,
  transformStringIntoNullableNumber,
  transformStringIntoNullableString,
} from "@/lib/constants";
import { getPositionsQueryKey } from "@/queries/usePositionsQuery";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  maxAssignedTasksLimit: z.string(),
  licenseType: LicenseTypeEnumWithEmptyString,
  description: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

export default function NewPositionSheet() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const usePostPositionMutationResult = usePostPositionMutation();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      maxAssignedTasksLimit: "",
      description: "",
      licenseType: "",
    },
  });

  const watchLicenseType = form.watch("licenseType");

  /**
   * https://react-hook-form.com/docs/useform/reset
   * It's recommended to reset inside useEffect after submission.
   * then의 callback 함수에서 form.reset()을 하면, form.formState의 isSubmitted 등 일부 상태가 reset 되지 않는다.
   * 공식 문서의 추천을 따라 useEffect에서 처리한다.
   * request가 실패해도 onSubmit에서 error를 catch하기 때문에 submit은 성공한 걸로 간주된다. 그래서, request에 대한 성공 여부인 isSuccess를 추가했다.
   */
  useEffect(() => {
    if (
      form.formState.isSubmitSuccessful &&
      usePostPositionMutationResult.isSuccess
    ) {
      form.reset();
    }
  }, [
    form,
    form.formState.isSubmitSuccessful,
    usePostPositionMutationResult.isSuccess,
  ]);

  async function onSubmit(values: FieldValues) {
    await usePostPositionMutationResult
      .mutateAsync({
        name: values.name,
        maxAssignedTasksLimit: transformStringIntoNullableNumber.parse(
          values.maxAssignedTasksLimit
        ),
        description: transformStringIntoNullableString.parse(
          values.description
        ),
        licenseType:
          transformLicenseTypeEnumWithEmptyStringIntoNullableLicenseTypeEnum.parse(
            values.licenseType
          ),
      })
      .then(() => {
        setOpen(false);
        toast({
          title: "Success",
        });
        queryClient.invalidateQueries({
          queryKey: getPositionsQueryKey({
            limit: Number.MAX_SAFE_INTEGER,
          }),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 409:
            if (error.response?.data.errorCode.includes("20203")) {
              form.setError(
                "name",
                {
                  message: `${values.name} already exists`,
                },
                { shouldFocus: true }
              );
              return;
            }
          case 400:
            if (error.response?.data.errorCode.includes("20202")) {
              form.setError(
                "maxAssignedTasksLimit",
                {
                  message:
                    "Maximum Number of Tasks Held should be less than 256",
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
        <Button variant={"outline"} size={"sm"}>
          <Plus className="mr-2 h-4 w-4" />
          New Position
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New Position</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="maxAssignedTasksLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Maximum Number of Tasks Held</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(event) => {
                          const { value } = event.target;
                          if (value === "" || digitRegExp.test(value)) {
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
