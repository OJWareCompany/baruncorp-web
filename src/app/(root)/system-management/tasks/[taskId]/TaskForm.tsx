"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Link from "next/link";
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
import RowItemsContainer from "@/components/RowItemsContainer";

import { Button } from "@/components/ui/button";
import ItemsContainer from "@/components/ItemsContainer";
import { ServiceResponseDto, TaskResponseDto } from "@/api";
import usePatchTaskMutation from "@/mutations/usePatchTaskMutation";
import { getTaskQueryKey } from "@/queries/useTaskQuery";
import {
  LicenseTypeEnum,
  LicenseTypeEnumWithEmptyString,
  transformLicenseTypeEnumWithEmptyStringIntoNullableLicenseTypeEnum,
  transformNullishLicenseTypeEnumIntoLicenseTypeEnumWithEmptyString,
} from "@/lib/constants";
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
  licenseType: LicenseTypeEnumWithEmptyString,
  service: z.string().trim().min(1, { message: "Service is required" }),
});

type FieldValues = z.infer<typeof formSchema>;

const getFieldValues = (
  task: TaskResponseDto,
  service: ServiceResponseDto
): FieldValues => {
  return {
    name: task.name,
    licenseType:
      transformNullishLicenseTypeEnumIntoLicenseTypeEnumWithEmptyString.parse(
        task.licenseType
      ),
    service: service.name,
  };
};

interface Props {
  task: TaskResponseDto;
  service: ServiceResponseDto;
}

export default function TaskForm({ task, service }: Props) {
  const { taskId } = useParams() as { taskId: string };
  const queryClient = useQueryClient();

  const { mutateAsync } = usePatchTaskMutation(taskId);

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(task, service),
  });
  const watchLicenseType = form.watch("licenseType");

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      name: values.name.trim(),
      licenseType:
        transformLicenseTypeEnumWithEmptyStringIntoNullableLicenseTypeEnum.parse(
          values.licenseType
        ),
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: getTaskQueryKey(taskId),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        // switch (error.response?.status) {
        //   case 409:
        //     if (error.response?.data.errorCode.includes("30002")) {
        //       form.setError(
        //         "address",
        //         {
        //           message: `${values.address.fullAddress} already exists`,
        //         },
        //         { shouldFocus: true }
        //       );
        //     }
        //     if (error.response?.data.errorCode.includes("30003")) {
        //       form.setError(
        //         "projectNumber",
        //         {
        //           message: `${values.projectNumber} already exists`,
        //         },
        //         { shouldFocus: true }
        //       );
        //     }
        //     break;
        // }
      });
  }

  useEffect(() => {
    form.reset(getFieldValues(task, service));
  }, [form, service, task]);

  return (
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
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Service</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <Button
                      size={"icon"}
                      variant={"outline"}
                      className="shrink-0"
                      asChild
                    >
                      <Link href={`/system-management/services/${service.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
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
            disabled={!form.formState.isDirty}
          >
            Edit
          </LoadingButton>
        </ItemsContainer>
      </form>
    </Form>
  );
}
