"use client";

import React from "react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useProfileQuery from "@/queries/useProfileQuery";
import usePatchProfileMutation from "@/queries/usePatchProfileMutation";
import LoadingButton from "@/components/LoadingButton";
import RowItemsContainer from "@/components/RowItemsContainer";
import { UserResponseDto } from "@/api";
import {
  transformNullishStringIntoString,
  transformStringIntoNullableString,
} from "@/lib/constants";
import PageHeader from "@/components/PageHeader";

const formSchema = z.object({
  organization: z.string().trim().min(1, {
    message: "Organization is required",
  }),
  firstName: z.string().trim().min(1, {
    message: "First Name is required",
  }),
  lastName: z.string().trim().min(1, {
    message: "Last Name is required",
  }),
  phoneNumber: z.string().trim(),
  emailAddress: z
    .string()
    .trim()
    .min(1, { message: "Email Address is required" })
    .email({
      message: "Format of Email Address is incorrect",
    }),
  emailAddressesToReceiveDeliverables: z.array(
    z.object({
      email: z
        .string()
        .trim()
        .min(1, { message: "Email Address is required" })
        .email({ message: "Format of Email Address is incorrect" }),
    })
  ),
});

type FieldValues = z.infer<typeof formSchema>;

function getFieldValues(profile: UserResponseDto | null): FieldValues {
  return {
    organization: transformNullishStringIntoString.parse(profile?.organization),
    firstName: transformNullishStringIntoString.parse(profile?.firstName),
    lastName: transformNullishStringIntoString.parse(profile?.lastName),
    emailAddress: transformNullishStringIntoString.parse(profile?.email),
    emailAddressesToReceiveDeliverables: (
      profile?.deliverablesEmails ?? []
    ).map((email) => ({
      email,
    })),
    phoneNumber: transformNullishStringIntoString.parse(profile?.phoneNumber),
  };
}

interface Props {
  initialProfile: UserResponseDto | null;
}

export default function Client({ initialProfile }: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(initialProfile),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailAddressesToReceiveDeliverables",
  });

  /**
   * Query
   */
  const queryClient = useQueryClient();
  const { data: profile } = useProfileQuery(initialProfile);
  const { mutateAsync } = usePatchProfileMutation();

  /**
   * useEffect
   */
  useEffect(() => {
    if (profile) {
      form.reset(getFieldValues(profile));
    }
  }, [form, profile]);

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: transformStringIntoNullableString.parse(values.phoneNumber),
      deliverablesEmails: values.emailAddressesToReceiveDeliverables
        .map(({ email }) => transformStringIntoNullableString.parse(email))
        .filter((value): value is string => value != null),
    })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      })
      .catch(() => {});
  }

  const title = "My Profile";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/my/profile", name: title }]}
        title={title}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Organization</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <RowItemsContainer>
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </RowItemsContainer>
          <FormField
            control={form.control}
            name="emailAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Email Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    readOnly
                    onChange={(event) => {
                      field.onChange(event);
                      form.setValue(
                        `emailAddressesToReceiveDeliverables.0.email`,
                        event.target.value,
                        {
                          shouldValidate: form.formState.isSubmitted,
                        }
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emailAddressesToReceiveDeliverables"
            render={() => {
              return (
                <FormItem>
                  <FormLabel required>
                    Email Addresses to Receive Deliverables
                  </FormLabel>
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`emailAddressesToReceiveDeliverables.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex flex-row gap-2">
                            <FormControl>
                              <Input {...field} readOnly={index === 0} />
                            </FormControl>
                            {index !== 0 && (
                              <Button
                                variant={"outline"}
                                size={"icon"}
                                className="flex-shrink-0"
                                onClick={() => {
                                  remove(index);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  <Button
                    variant={"outline"}
                    className="w-full"
                    onClick={() => {
                      append({ email: "" });
                    }}
                    type="button"
                  >
                    Add Email
                  </Button>
                </FormItem>
              );
            }}
          />
          <LoadingButton
            type="submit"
            disabled={!form.formState.isDirty}
            isLoading={form.formState.isSubmitting}
            className="w-full"
          >
            Edit
          </LoadingButton>
        </form>
      </Form>
    </div>
  );
}
