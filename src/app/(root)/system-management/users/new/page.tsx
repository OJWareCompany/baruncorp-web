"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { AxiosError } from "axios";
import { X } from "lucide-react";
import { useEffect } from "react";
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
import usePostUserMutation from "@/queries/usePostUserMutation";
import { Button } from "@/components/ui/button";
import OrganizationsCombobox from "@/components/combobox/OrganizationsCombobox";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/PageHeader";

const formSchema = z.object({
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
});

type FieldValues = z.infer<typeof formSchema>;

const title = "New User";

export default function Page() {
  const { toast } = useToast();

  /**
   * Form
   */
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: "",
      emailAddress: "",
      emailAddressesToReceiveDeliverables: [{ email: "" }],
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailAddressesToReceiveDeliverables",
  });
  const { isSubmitSuccessful } = form.formState;

  /**
   * Query
   */
  const { mutateAsync } = usePostUserMutation();

  useEffect(() => {
    if (isSubmitSuccessful) {
      form.reset();
    }
  }, [form, isSubmitSuccessful]);

  async function onSubmit(values: FieldValues) {
    const {
      organizationId,
      emailAddress,
      emailAddressesToReceiveDeliverables,
      firstName,
      lastName,
      phoneNumber,
    } = values;

    await mutateAsync({
      deliverablesEmails: emailAddressesToReceiveDeliverables.map(
        (value) => value.email
      ),
      email: emailAddress,
      firstName,
      lastName,
      phoneNumber,
      organizationId,
    })
      .then(() => {
        toast({
          title: "Success",
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 409:
            if (error.response?.data.errorCode.includes("10017")) {
              form.setError(
                "emailAddress",
                {
                  message: `${emailAddress} is already existed`,
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
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/users", name: "Users" },
          { href: "/system-management/users/new", name: title },
        ]}
        title={title}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Organization</FormLabel>
                <FormControl>
                  <OrganizationsCombobox
                    organizationId={field.value}
                    onSelect={(newOrganizationId) => {
                      field.onChange(newOrganizationId);
                    }}
                    ref={field.ref}
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
            className="w-full"
            isLoading={form.formState.isSubmitting}
          >
            Create
          </LoadingButton>
        </form>
      </Form>
    </div>
  );
}
