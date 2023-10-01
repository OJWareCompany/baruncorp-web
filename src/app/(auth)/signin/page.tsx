"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultValues, useForm } from "react-hook-form";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import LoadingButton from "@/components/LoadingButton";
import { defaultErrorToast } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email Address is required" })
    .email({ message: "Format of Email Address is incorrect" }),
  password: z.string().trim().min(1, { message: "Password is required" }),
});

type FieldValues = z.infer<typeof formSchema>;

let defaultValues: DefaultValues<FieldValues> = {
  email: "",
  password: "",
};
if (process.env.NODE_ENV === "development") {
  defaultValues = {
    email: "ejsvk3284@kakao.com",
    password: "WkdWkdaos123!",
  };
}

export default function SigninPage() {
  const router = useRouter();
  const { toast } = useToast();

  /**
   * Form
   */
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: FieldValues) {
    const { email, password } = values;
    const signInResponse = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInResponse == null) {
      toast(defaultErrorToast);
      return;
    }
    const { error } = signInResponse;
    if (error == null) {
      toast({ title: "Sign-in success" });
      router.push("/");
      return;
    }
    const statusCode = Number(error);
    switch (statusCode) {
      case 400:
        form.setError("password", {
          message: "Invalid email address or password",
        });
        break;
      default:
        toast(defaultErrorToast);
        break;
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Email Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          type="submit"
          isLoading={form.formState.isSubmitting}
          className="w-full"
        >
          Sign in
        </LoadingButton>
      </form>
    </Form>
  );
}
