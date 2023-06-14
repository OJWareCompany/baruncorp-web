"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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

const formSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First Name is required" }),
  lastName: z.string().trim().min(1, { message: "Last Name is required" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Email Address is not correct" }),
  password: z
    .string()
    .trim()
    .min(1, { message: "Password is required" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!])(?!.*\s).{12,}$/, {
      message:
        "Minimum 12 characters with at least 1 number, uppercase, and lowercase letter, special characters",
    }),
  code: z.string().trim().min(1, { message: "Code is required" }),
});

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "ejsvk3284@kakao.com",
      password: "WkdWkdaos123!",
      firstName: "Chris",
      lastName: "Kim",
      code: "test",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(false);
    setLoading(true);

    const { email, password, code, firstName, lastName } = values;

    if (email.split("@")[0] === password) {
      setLoading(false);
      form.control.setError("password", {
        message: "Password cannot be a email address",
      });
      return;
    }

    fetch("http://192.168.1.19:3000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, code, firstName, lastName }),
      mode: "no-cors",
    })
      .then((response) => {
        console.log(response);
        if (response.ok) {
          router.push("/signin");
          toast({ title: "Sign up is complete." });
        } else {
          setLoading(false);
          setError(true);
        }
      })
      .catch((error) => {
        // 서버가 터지는 에러에 대해 어떻게 처리할 것인지 논의 필요
        // 예를 들면 서버에서도 예상치 못한 에러가 발생하여 터지는 경우.. 서버에서 에러를 발생시키는 클라이언트에서 catch로 잡을 수 있는지 확인 필요
        console.error(error);
      });
  }

  return (
    <>
      {error && (
        <Alert
          variant="destructive"
          className={`fixed w-96 top-8 left-2/4 translate-x-[-50%]`}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid code</AlertTitle>
          <AlertDescription>
            Please check your mail again or contact the Barun corp staff.
          </AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel required={true}>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
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
          <Button type="submit" fullWidth={true} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Submit"
            )}
          </Button>
          <div className="border border-input" />
          <Button
            type="button"
            variant="outline"
            fullWidth={true}
            disabled={loading}
            onClick={() => {
              if (loading) return;
              router.push("/signin");
            }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}
