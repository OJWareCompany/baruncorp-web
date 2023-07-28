"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useUsersControllerUpdateUserByUserIdMutation from "@/queries/useUsersControllerUpdateUserByUserIdMutation";
// import { useProfileQueryWithParams } from "@/queries/useProfileQuery";
import useUsersControllerGetUserInfoByUserIdQuery from "@/queries/useUsersControllerGetUserInfoByUserIdQuery";
import PositionField from "@/components/PositionField";
import ServicesField from "@/components/ServicesField";
import LicensesField from "@/components/LicensesField";

const formSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First Name is required" }),
  lastName: z.string().trim().min(1, { message: "Last Name is required" }),
  email: z.string().email(),
  organization: z.string(),
  role: z.string(),
});

export default function Page() {
  // const { data: profile, isSuccess: isProfileQuerySuccess } =
  //   useProfileQueryWithParams();
  const { userId } = useParams();
  const { data: profile, isSuccess: isProfileQuerySuccess } =
    useUsersControllerGetUserInfoByUserIdQuery(userId);
  const { mutateAsync } = useUsersControllerUpdateUserByUserIdMutation(
    profile?.id
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const {
    control,
    formState: { isSubmitting, isDirty },
    reset,
  } = form;

  useEffect(() => {
    if (!isProfileQuerySuccess) {
      return;
    }

    const { email, firstName, lastName, role, organization } = profile;

    reset({
      email,
      firstName,
      lastName,
      organization,
      role: role ?? "-",
    });
  }, [isProfileQuerySuccess, profile, reset]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { firstName, lastName } = values;

    await mutateAsync({
      firstName,
      lastName,
    });
  }

  return (
    <div className="space-y-4 max-w-sm">
      <h1 className="h3">User</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={control}
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
            control={control}
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
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            fullWidth
            disabled={!isDirty}
            loading={isSubmitting}
          >
            Save
          </Button>
        </form>
      </Form>
      <PositionField />
      <ServicesField />
      <LicensesField />
    </div>
  );
}
