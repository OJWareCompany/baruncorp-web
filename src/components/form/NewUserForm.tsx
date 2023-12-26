import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { AxiosError } from "axios";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import RowItemsContainer from "../RowItemsContainer";
import OrganizationsCombobox from "../combobox/OrganizationsCombobox";
import { Checkbox } from "../ui/checkbox";
import PositionsCombobox from "../combobox/PositionsCombobox";
import LoadingButton from "../LoadingButton";
import usePostUserMutation from "@/mutations/usePostUserMutation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  BARUNCORP_ORGANIZATION_ID,
  transformStringIntoNullableString,
} from "@/lib/constants";

const formSchema = z
  .object({
    organizationId: z.string().trim().min(1, {
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
    isContractor: z.boolean(),
    positionId: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (
      values.organizationId === BARUNCORP_ORGANIZATION_ID ||
      (values.organizationId !== BARUNCORP_ORGANIZATION_ID &&
        values.isContractor)
    ) {
      if (values.positionId.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Position is required",
          path: [`positionId`],
        });
      }
    }
  });

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  onSuccess?: (userId: string) => void;
  organizationId?: string;
}

export default function NewUserForm({ onSuccess, organizationId }: Props) {
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: organizationId ?? "",
      emailAddress: "",
      emailAddressesToReceiveDeliverables: [{ email: "" }],
      firstName: "",
      lastName: "",
      phoneNumber: "",
      isContractor: false,
      positionId: "",
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailAddressesToReceiveDeliverables",
  });
  const { mutateAsync } = usePostUserMutation();

  useEffect(() => {
    if (isSubmitSuccessful) {
      form.reset();
      setIsSubmitSuccessful(false);
    }
  }, [form, isSubmitSuccessful]);

  const watchOrganizationId = form.watch("organizationId");
  const watchIsContractor = form.watch("isContractor");

  async function onSubmit(values: FieldValues) {
    // TODO: positionId
    await mutateAsync({
      deliverablesEmails: values.emailAddressesToReceiveDeliverables.map(
        (value) => value.email
      ),
      email: values.emailAddress,
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: transformStringIntoNullableString.parse(values.phoneNumber),
      organizationId: values.organizationId,
      isVendor:
        values.organizationId === BARUNCORP_ORGANIZATION_ID
          ? false
          : values.isContractor,
    })
      .then(({ id }) => {
        setIsSubmitSuccessful(true);
        onSuccess?.(id);
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
            break;
          case 409:
            if (error.response?.data.errorCode.includes("10017")) {
              form.setError(
                "emailAddress",
                {
                  message: `${values.emailAddress} is already existed`,
                },
                {
                  shouldFocus: true,
                }
              );
            }
            break;
        }
      });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => {
          event.stopPropagation();

          return form.handleSubmit(onSubmit)(event);
        }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="organizationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Organization</FormLabel>
              <FormControl>
                <OrganizationsCombobox
                  organizationId={field.value}
                  onOrganizationIdChange={(newOrganizationId) => {
                    field.onChange(newOrganizationId);
                  }}
                  ref={field.ref}
                  disabled={organizationId !== undefined}
                />
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
        {watchOrganizationId !== BARUNCORP_ORGANIZATION_ID && (
          <FormField
            control={form.control}
            name="isContractor"
            render={({ field }) => (
              <FormItem className="flex-row-reverse justify-end items-center gap-3">
                <FormLabel>Contractor</FormLabel>
                <FormControl>
                  <Checkbox
                    ref={field.ref}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {(watchOrganizationId === BARUNCORP_ORGANIZATION_ID ||
          (watchOrganizationId !== BARUNCORP_ORGANIZATION_ID &&
            watchIsContractor)) && (
          <FormField
            control={form.control}
            name="positionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Position</FormLabel>
                <FormControl>
                  <PositionsCombobox
                    positionId={field.value}
                    onPositionChange={({ id }) => {
                      field.onChange(id);
                    }}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
  );
}
