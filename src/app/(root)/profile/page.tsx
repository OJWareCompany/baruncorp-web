"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { AxiosError, AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
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

const formSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First Name is required" }),
  lastName: z.string().trim().min(1, { message: "Last Name is required" }),
  email: z.string().email(),
  organization: z.string(),
});

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: number;
}

interface ProfilePatchData extends Pick<Profile, "firstName" | "lastName"> {}

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const queryClient = useQueryClient();
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
    formState: { isSubmitting, isDirty: isEdit },
  } = form;

  /**
   * get profile query
   */
  const profileQuery = useQuery<Profile, AxiosError<ErrorResponseData>>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  /**
   * update profile mutation
   */
  const mProfile = useMutation<
    AxiosResponse<Profile>,
    AxiosError<ErrorResponseData>,
    ProfilePatchData
  >({
    mutationFn: (data) => {
      return axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    },
  });

  const { data: profile } = profileQuery;

  useEffect(() => {
    if (profileQuery.isSuccess && profile) {
      const { email, firstName, lastName, companyId } = profile;
      reset({
        firstName,
        lastName,
        email,
        organization: companyId === 1 ? "BARUN CORP" : "TESLA", // TODO 서버측에서 넘겨주는 데이터 변경된 이후 다시 확인
      });
    }
  }, [profileQuery.isSuccess, profile, reset]);

  useEffect(() => {
    if (profileQuery.isError) {
      const { response: errorResponse } = profileQuery.error;

      let title = "Something went wrong";
      let description =
        "Please try again in a few minutes. If the problem persists, please contact the Barun Corp Manager.";

      switch (errorResponse?.data.statusCode) {
        case 401:
          if (errorResponse?.data.errorCode === "10005") {
            title = "Please sign in again";
            description = "";
          }
          break;
        case 500:
          title = "Server error";
          break;
      }

      toast({ title, description, variant: "destructive" });
    }
  }, [profileQuery.isError, profileQuery.error]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { firstName, lastName } = values;

    await mProfile
      .mutateAsync({ firstName, lastName })
      .then((response) => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        const { response: errorResponse } = error;

        let title = "Something went wrong";
        let description =
          "Please try again in a few minutes. If the problem persists, please contact the Barun Corp Manager.";

        switch (errorResponse?.data.statusCode) {
          case 401:
            if (errorResponse?.data.errorCode === "10005") {
              title = "Please sign in again";
              description = "";
            }
            break;
          case 500:
            title = "Server error";
            break;
        }

        toast({ title, description, variant: "destructive" });
      });
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
          disabled={!isEdit}
          loading={isSubmitting}
        >
          Save
        </Button>
      </form>
    </Form>
  );
}
