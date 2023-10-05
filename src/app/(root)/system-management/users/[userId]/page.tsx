"use client";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserResponseDto } from "@/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import RowItemsContainer from "@/components/RowItemsContainer";
import LoadingButton from "@/components/LoadingButton";
import useUserQuery from "@/queries/useUserQuery";
import { transformStringIntoNullableString } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import usePatchProfileByUserIdMutation from "@/queries/usePatchProfileByUserIdMutation";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";

const formSchema = z.object({
  organization: z
    .string()
    .trim()
    .min(1, { message: "Organization is required" }),
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

function getFieldValues(user?: UserResponseDto): FieldValues {
  return {
    emailAddress: user?.email ?? "",
    emailAddressesToReceiveDeliverables: (user?.deliverablesEmails ?? []).map(
      (email) => ({
        email,
      })
    ),
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    organization: user?.organization ?? "",
    phoneNumber: user?.phoneNumber ?? "",
  };
}

interface Props {
  params: {
    userId: string;
  };
}

export default function Page({ params: { userId } }: Props) {
  const { data: session, status } = useSession();

  /**
   * Form
   */
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailAddressesToReceiveDeliverables",
  });

  /**
   * Query
   */
  const { data: user, isLoading: isUserQueryLoading } = useUserQuery({
    userId,
  });
  const { mutateAsync } = usePatchProfileByUserIdMutation(userId);
  const queryClient = useQueryClient();

  /**
   * useEffect
   */
  useEffect(() => {
    if (user) {
      form.reset(getFieldValues(user));
    }
  }, [form, user]);

  async function onSubmit(values: FieldValues) {
    const {
      phoneNumber,
      emailAddressesToReceiveDeliverables,
      firstName,
      lastName,
    } = values;

    await mutateAsync({
      deliverablesEmails: emailAddressesToReceiveDeliverables.map(
        ({ email }) => email
      ),
      firstName,
      lastName,
      phoneNumber: transformStringIntoNullableString.parse(phoneNumber),
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["users", "detail", { userId }],
        });

        if (
          status === "authenticated" &&
          user &&
          session.email === user.email
        ) {
          queryClient.invalidateQueries({
            queryKey: ["profile"],
          });
        }
      })
      .catch(() => {});
  }

  const title = user?.fullName ?? "";

  if (isUserQueryLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/users", name: "Users" },
          {
            href: `/system-management/users/${user?.id}`,
            name: title,
          },
        ]}
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
                    readOnly
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
                                <X className="h-4 w-4 text-destructive" />
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
            className="w-full"
            isLoading={form.formState.isSubmitting}
            disabled={!form.formState.isDirty}
          >
            Edit
          </LoadingButton>
        </form>
      </Form>
    </div>
  );
}
