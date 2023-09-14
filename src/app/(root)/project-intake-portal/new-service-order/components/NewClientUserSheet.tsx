"use client";

import * as z from "zod";
import { DefaultValues, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogProps } from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import RowItemsContainer from "@/components/RowItemsContainer";
import { Label } from "@/components/ui/label";
import LoadingButton from "@/components/LoadingButton";
import Item from "@/components/Item";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import usePostUserMutation from "@/queries/usePostUserMutation";

const formSchema = z.object({
  firstName: z.string().trim().min(1, {
    message: "First Name is required",
  }),
  lastName: z.string().trim().min(1, {
    message: "Last Name is required",
  }),
  phoneNumber: z.string(),
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

interface Props extends DialogProps {
  selectedOrganizationId: string;
  onSelect: (newUserId: string) => void;
}

const defaultValues: DefaultValues<z.infer<typeof formSchema>> = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  emailAddress: "",
  emailAddressesToReceiveDeliverables: [{ email: "" }],
};

export default function NewClientUserSheet({
  selectedOrganizationId,
  onSelect,
  ...dialogProps
}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailAddressesToReceiveDeliverables",
  });
  const queryClient = useQueryClient();

  const { data: organization } = useOrganizationQuery(selectedOrganizationId);
  const { mutateAsync } = usePostUserMutation();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const {
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
      organizationId: selectedOrganizationId,
    })
      .then(({ id }) => {
        dialogProps.onOpenChange?.(false);
        form.reset();
        onSelect(id);
        queryClient.invalidateQueries({
          queryKey: [
            "users",
            "list",
            { organizationId: selectedOrganizationId },
          ],
        });
      })
      .catch(() => {});
  }

  return (
    <Sheet {...dialogProps}>
      <SheetContent className="sm:max-w-[1400px] w-full overflow-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>New Client User</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Item>
              <Label>Organization</Label>
              <Input value={organization?.name} readOnly />
            </Item>
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
      </SheetContent>
    </Sheet>
  );
}
