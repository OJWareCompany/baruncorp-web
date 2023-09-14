"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { toast } from "@/hook/use-toast";
import { PasswordInput } from "@/components/PasswordInput";
import LoadingButton from "@/components/LoadingButton";

const formSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email Address is required" })
    .email({ message: "Format of email address is incorrect" }),
  password: z.string().trim().min(1, { message: "Password is required" }),
});

const defaultValues = {
  email: "ejsvk3284@kakao.com",
  password: "WkdWkdaos123!",
};

if (process.env.NODE_ENV === "production") {
  defaultValues.email = "";
  defaultValues.password = "";
}

export default function SigninPage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password } = values;
    if (email.split("@")[0] === password) {
      control.setError("password", {
        message: "Password cannot be a email address",
      });
      return;
    }

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (response == null) {
      toast({
        title: "Something went wrong",
        description:
          "Please try again in a few minutes. If the problem persists, please contact the Barun Corp Manager.",
        variant: "destructive",
      });
      return;
    }

    let { error: statusCode } = response;

    if (statusCode == null) {
      router.push("/");
      toast({ title: "Sign-in success" });
      return;
    }

    const { success } = z
      .number()
      .min(400)
      .max(499)
      .safeParse(Number(statusCode));

    if (success) {
      toast({
        title: "Invalid email address or password",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Server error",
        description:
          "Please try again in a few minutes. If the problem persists, please contact the Barun Corp Manager.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          type="submit"
          isLoading={isSubmitting}
          className="w-full"
        >
          Sign in
        </LoadingButton>
      </form>
    </Form>
  );
}
