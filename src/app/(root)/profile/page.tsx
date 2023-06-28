"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { AxiosError, AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
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
import { toast } from "@/hook/use-toast";
import useProfileQuery from "@/queries/useProfileQuery";
import usePatchProfileMutation from "@/queries/usePatchProfileMutation";

const formSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First Name is required" }),
  lastName: z.string().trim().min(1, { message: "Last Name is required" }),
  email: z.string().email(),
  organization: z.string(),
});

export default function ProfilePage() {
  const { update } = useSession();
  const [isAccessTokenError, setIsAccessTokenError] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      organization: "",
    },
  });
  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = form;

  const { data: profile, isSuccess, isError, error } = useProfileQuery();
  const { mutateAsync } = usePatchProfileMutation();

  useEffect(() => {
    if (!isSuccess || isAccessTokenError) {
      return;
    }

    const { email, firstName, lastName, companyId } = profile;
    reset({
      firstName,
      lastName,
      email,
      organization: companyId === 1 ? "BARUN CORP" : "TESLA", // TODO 서버측에서 넘겨주는 데이터 변경된 이후 다시 확인
    });
  }, [isAccessTokenError, isSuccess, profile, reset]);

  useEffect(() => {
    if (!isError || error.response == null) {
      return;
    }

    const { errorCode, statusCode } = error.response.data;
    if (errorCode === "10005") {
      update();
      return;
    }

    let title = "Something went wrong";
    let description =
      "Please try again in a few minutes. If the problem persists, please contact the Barun Corp Manager.";

    if (statusCode === 500) {
      title = "Server error";
    }

    toast({ title, description, variant: "destructive" });
  }, [error, isError, update]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { firstName, lastName } = values;

    setIsAccessTokenError(false);
    await mutateAsync({ firstName, lastName }).catch(
      async (error: AxiosError<ErrorResponseData>) => {
        const { response } = error;
        if (response == null) {
          return;
        }

        const { errorCode, statusCode } = response.data;
        if (errorCode === "10005") {
          const newSession = await update();
          if (newSession?.isValid) {
            setIsAccessTokenError(true);
            toast({
              title: "Expired session",
              description: "Please try agian.",
              variant: "destructive",
            });
          }
          return;
        }

        let title = "Something went wrong";
        let description =
          "Please try again in a few minutes. If the problem persists, please contact the Barun Corp Manager.";

        if (statusCode === 500) {
          title = "Server error";
        }

        toast({ title, description, variant: "destructive" });
      }
    );
  }

  return (
    <Form {...form}>
      <h1 className="h3 mb-4">Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-96">
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
  );
}
