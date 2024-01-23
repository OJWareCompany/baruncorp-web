"use client";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import usePatchProfileMutation from "@/mutations/usePatchProfileMutation";
import LoadingButton from "@/components/LoadingButton";
import RowItemsContainer from "@/components/RowItemsContainer";
import { UserResponseDto } from "@/api";
import {
  BARUNCORP_ORGANIZATION_ID,
  transformStringIntoNullableString,
} from "@/lib/constants";
import { getProfileQueryKey } from "@/queries/useProfileQuery";
import DateOfJoiningDatePicker from "@/components/DateOfJoiningDatePicker";
import { getISOStringForStartOfDayInUTC } from "@/lib/utils";

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
  dateOfJoining: z.date().optional(),
});

type FieldValues = z.infer<typeof formSchema>;

function getFieldValues(profile: UserResponseDto): FieldValues {
  return {
    organization: profile.organization,
    firstName: profile.firstName,
    lastName: profile.lastName,
    emailAddress: profile.email,
    emailAddressesToReceiveDeliverables: (profile.deliverablesEmails ?? []).map(
      (email) => ({
        email,
      })
    ),
    phoneNumber: profile.phoneNumber ?? "",
    dateOfJoining:
      profile.dateOfJoining == null
        ? undefined
        : new Date(profile.dateOfJoining),
  };
}

interface Props {
  profile: UserResponseDto;
}

export default function ProfileForm({ profile }: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(profile),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailAddressesToReceiveDeliverables",
  });

  const queryClient = useQueryClient();
  const { mutateAsync } = usePatchProfileMutation();

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
      isVendor: profile.isVendor,
      dateOfJoining:
        profile.organizationId === BARUNCORP_ORGANIZATION_ID
          ? getISOStringForStartOfDayInUTC(values.dateOfJoining ?? new Date())
          : null,
    })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: getProfileQueryKey() });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 400:
            if (error.response?.data.errorCode.includes("10111")) {
              form.setError(
                "phoneNumber",
                {
                  message: `Phone Number is invalid`,
                },
                { shouldFocus: true }
              );
            }
            if (error.response?.data.errorCode.includes("20821")) {
              form.setError(
                "dateOfJoining",
                {
                  message: `There is PTO history before the date of joining`,
                },
                { shouldFocus: true }
              );
            }
            break;
        }
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Organization</FormLabel>
              <FormControl>
                <Input {...field} disabled />
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
                  disabled
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
                            <Input {...field} disabled={index === 0} />
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
        {profile.organizationId === BARUNCORP_ORGANIZATION_ID && (
          <FormField
            control={form.control}
            name="dateOfJoining"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Date of Joining</FormLabel>
                <FormControl>
                  <DateOfJoiningDatePicker {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
  );
}
