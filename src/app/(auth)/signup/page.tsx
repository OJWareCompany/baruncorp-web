"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hook/use-toast";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First Name is required" }),
  lastName: z.string().trim().min(1, { message: "Last Name is required" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email Address is required" })
    .email({ message: "Format of email address is incorrect" }),
  password: z
    .string()
    .trim()
    .min(1, { message: "Password is required" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&+=])(?!.*\s).{12,}$/, {
      message:
        "Password should be at least 12 characters with uppercase, lowercase, numbers and special characters(!@#$%^&+=)",
    }),
  passwordConfirm: z
    .string()
    .trim()
    .min(1, { message: "Password confirm is required" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&+=])(?!.*\s).{12,}$/, {
      message:
        "Password confirm should be at least 12 characters with uppercase, lowercase, numbers and special characters(!@#$%^&+=)",
    }),
  code: z.string().trim().length(6, { message: "Code shoule be 6 characters" }),
});

interface SignupForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  code: string;
}

export default function SignupPage() {
  const router = useRouter();

  /**
   * signup mutation
   */
  const mSignup = useMutation<
    AxiosResponse,
    AxiosError<ErrorResponseData>,
    SignupForm
  >({
    mutationFn: (data) => {
      return axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        data,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    },
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "ejsvk3284@kakao.com",
      password: "WkdWkdaos123!",
      passwordConfirm: "",
      firstName: "Chris",
      lastName: "Kim",
      code: "079207",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password, passwordConfirm } = values;

    if (password !== passwordConfirm) {
      control.setError("passwordConfirm", {
        message: "Password does not match",
      });
      return;
    }

    if (email.split("@")[0] === password) {
      control.setError("password", {
        message: "Password cannot be a email address",
      });
      return;
    }

    await mSignup
      .mutateAsync(values)
      .then((response) => {
        const { status } = response;
        if (status === 200) {
          router.push("/signin");
          toast({ title: "Sign up is complete." });
        }
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        const { response: errorResponse } = error;

        let title = "Something went wrong";
        let description =
          "Please try again in a few minutes. If the problem persists, please contact the Barun Corp Manager.";

        switch (errorResponse?.data.statusCode) {
          case 404:
            title = "Invalid code";
            description =
              "Please check your mail again. If the problem persists, please contact the Barun Corp Manager.";
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-20">
        <FormField
          control={control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>First Name</FormLabel>
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
              <FormLabel required={true}>Last Name</FormLabel>
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
              <FormLabel required={true}>Email Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field}></Input>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="passwordConfirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Password Confirm</FormLabel>
              <FormControl>
                <Input type="password" {...field}></Input>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Code</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <Separator />
        <Button type="button" variant="outline" fullWidth={true} asChild={true}>
          <Link href="/signin">Sign in</Link>
        </Button>
      </form>
    </Form>
  );
}
