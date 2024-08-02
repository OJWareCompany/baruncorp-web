"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultValues, useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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
import { useAuthStore } from "@/store/useAuthStore";
import useAuthenticatationUpdate from "@/hook/useAuthenticatationUpdate";

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
    email: "admin-test@baruncorp.com",
    password: "Dhsmfdmfekseksgkrp12!@",
  };
}

if (process.env.NODE_ENV === "production") {
  defaultValues = {
    email: `${process.env.NEXT_PUBLIC_PORTPOLIO_EMAIL}`,
    password: `${process.env.NEXT_PUBLIC_PORTPOLIO_PASSWORD}`,
  };
}

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setAuthStatus } = useAuthStore();
  const { login } = useAuthenticatationUpdate();

  useEffect(() => {
    // 이 페이지에 처음 진입할 때 cache를 지움
    // 로그아웃시키면 이 페이지에 진입하게 되는데, 일반적으로 이때 실행됨
    queryClient.clear();
  }, [queryClient]);

  /**
   * Form
   */
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: FieldValues) {
    const { email, password } = values;
    const signInResponse = await login({ email, password });

    if (signInResponse == null) {
      toast(defaultErrorToast);
      return;
    }

    const { error } = signInResponse;
    if (error == null) {
      toast({ title: "Sign-in success" });
      setAuthStatus("authenticated");
      router.push("/");
      return;
    }

    const statusCode = Number(error);
    if (statusCode >= 400 && statusCode < 500) {
      form.setError("password", {
        message: "Invalid email address or password",
      });
    } else {
      toast(defaultErrorToast);
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
