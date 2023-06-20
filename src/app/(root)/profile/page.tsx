"use client";

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCallback, useEffect, useState } from "react";
import { AxiosError, AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
import {
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
  const [editable, setEditable] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const setValues = useCallback(
    ({ email, firstName, lastName, companyId }: Profile) => {
      setValue("firstName", firstName);
      setValue("lastName", lastName);
      setValue("email", email);
      setValue("organization", companyId === 1 ? "BARUN CORP" : "TESLA"); // TODO 서버측에서 넘겨주는 데이터 변경된 이후 다시 확인
    },
    [setValue]
  );

  /**
   * get profile query
   */
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (authStatus !== "authenticated") return; // TODO AuthGuard 적용된 이후 제거
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
  const mProfile = useMutation({
    mutationFn: (data: ProfilePatchData) => {
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

  const { data: profile }: UseQueryResult<Profile> = profileQuery;

  useEffect(() => {
    if (profile) {
      setValues(profile);
    }
  }, [profileQuery.isSuccess, profile, setValues]);

  useEffect(() => {
    if (profileQuery.isError) {
      const { response } = profileQuery.error as AxiosError;
      const { data } = response as AxiosResponse;
      const { statusCode } = data;

      let title = "";
      switch (statusCode) {
        case 401:
          title = "unauthorized";
          break;
        default:
          title = "occurs error";
      }

      toast({ title, variant: "destructive" });
    }
  }, [profileQuery.isError, profileQuery.error]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { firstName, lastName } = values;
    if (firstName === profile!.firstName && lastName === profile!.lastName) {
      return;
    }

    try {
      const { status } = await mProfile.mutateAsync({ firstName, lastName });
      if (status === 200) {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    } catch (error) {
      const { response } = error as AxiosError;
      const { statusCode } = response?.data as ResponseErrorData;
      let title = "";
      let description = "";

      switch (statusCode) {
        case 404:
          title = "Invalid code";
          description =
            "Please check your mail again. If the problem persists, please contact the Barun Corp Manager.";
          break;
        default:
          title = "Server error";
          description =
            "Please try again in a few minutes. If the problem persists, please contact the Barun Corp Manager.";
      }

      toast({ title, description, variant: "destructive" });
    }
  }

  function onReset() {
    if (!profile) {
      return;
    }
    const { firstName, lastName } = profile;
    reset({ firstName, lastName });
    setEditable(false);
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
              <FormLabel required={true}>First Name</FormLabel>
              <FormControl>
                <Input {...field} readOnly={!editable} />
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
              <FormLabel required={true}>Last Name</FormLabel>
              <FormControl>
                <Input {...field} readOnly={!editable} />
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
              <FormLabel required={true}>Email Address</FormLabel>
              <FormControl>
                <Input {...field} readOnly={true} disabled={editable} />
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
              <FormLabel required={true}>Organization</FormLabel>
              <FormControl>
                <Input {...field} readOnly={true} disabled={editable} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {editable ? (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              fullWidth={true}
              onClick={onReset}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth={true} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        ) : (
          <Button fullWidth={true} onClick={() => setEditable(true)}>
            Edit
          </Button>
        )}
      </form>
    </Form>
  );
}
