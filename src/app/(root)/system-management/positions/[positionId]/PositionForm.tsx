"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { useParams } from "next/navigation";
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
import RowItemsContainer from "@/components/RowItemsContainer";

import ItemsContainer from "@/components/ItemsContainer";
import { PositionResponseDto } from "@/api";
import usePatchPositionMutation from "@/mutations/usePatchPositionMutation";
import {
  LicenseTypeEnumWithEmptyString,
  transformNullishStringIntoString,
  transformStringIntoNullableNumber,
  transformStringIntoNullableString,
} from "@/lib/constants";
import { getPositionQueryKey } from "@/queries/usePositionQuery";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  maximumNumberOfTasksHeld: z.string(),
  licenseType: LicenseTypeEnumWithEmptyString,
  description: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

const getFieldValues = (position: PositionResponseDto): FieldValues => {
  return {
    name: position.name,
    maximumNumberOfTasksHeld: position.maxAssignedTasksLimit
      ? String(position.maxAssignedTasksLimit)
      : "",
    licenseType: "Electrical", // TODO
    description: transformNullishStringIntoString.parse(position.description),
  };
};

interface Props {
  position: PositionResponseDto;
}

export default function PositionForm({ position }: Props) {
  const { positionId } = useParams() as { positionId: string };
  const queryClient = useQueryClient();

  const { mutateAsync } = usePatchPositionMutation(positionId);

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(position),
  });

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      name: values.name,
      maxAssignedTasksLimit: transformStringIntoNullableNumber.parse(
        values.maximumNumberOfTasksHeld
      ),
      description: transformStringIntoNullableString.parse(values.description),
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: getPositionQueryKey(positionId),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 400:
            if (error.response?.data.errorCode.includes("20202")) {
              form.setError(
                "maximumNumberOfTasksHeld",
                {
                  message: `Maximum Number of Tasks Held should be less than 256`,
                },
                { shouldFocus: true }
              );
            }
            break;
        }
      });
  }

  useEffect(() => {
    if (position) {
      form.reset(getFieldValues(position));
    }
  }, [form, position]);

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
              name="maximumNumberOfTasksHeld"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Number of Tasks Held</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
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
            disabled={!form.formState.isDirty}
          >
            Edit
          </LoadingButton>
        </ItemsContainer>
      </form>
    </Form>
  );
}
