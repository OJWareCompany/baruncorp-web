"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

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
  passwordConfirm: z.string().trim(),
  code: z.string().trim().length(6, { message: "Code is 6 length" }),
});

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "ejsvk3284@kakao.com",
      password: "WkdWkdaos123!",
      passwordConfirm: "",
      firstName: "Chris",
      lastName: "Kim",
      code: "test",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(false);

    const { email, password, passwordConfirm, code, firstName, lastName } =
      values;

    if (password !== passwordConfirm) {
      control.setError("passwordConfirm", {
        message: "Password confirmation does not match. Please re-enter.",
      });
      return;
    }

    if (email.split("@")[0] === password) {
      control.setError("password", {
        message: "Password cannot be a email address",
      });
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, code, firstName, lastName }),
    })
      .then((response) => {
        if (!response.ok) {
          setError(true);
          return;
        }
        router.push("/signin");
        toast({ title: "Sign up is complete." });
      })
      .catch((error) => {
        // 서버가 터지는 에러에 대해 어떻게 처리할 것인지 논의 필요
        // 예를 들면 서버에서도 예상치 못한 에러가 발생하여 터지는 경우.. 서버에서 에러를 발생시키는 클라이언트에서 catch로 잡을 수 있는지 확인 필요
        console.log("🚀 ~ file: page.tsx:89 ~ onSubmit ~ error:", error);
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
                <div className="flex relative items-center">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...field}
                      className="pr-10"
                    ></Input>
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-3"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <Eye /> : <EyeOff />}
                  </button>
                </div>
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
                <div className="flex relative items-center">
                  <FormControl>
                    <Input
                      type={showPasswordConfirm ? "text" : "password"}
                      {...field}
                      className="pr-10"
                    ></Input>
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-3"
                    onClick={() => setShowPasswordConfirm((prev) => !prev)}
                  >
                    {showPasswordConfirm ? <Eye /> : <EyeOff />}
                  </button>
                </div>
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
          <div className="border border-input" />
          <Button
            type="button"
            variant="outline"
            fullWidth={true}
            disabled={isSubmitting}
            onClick={() => router.push("/signin")}
          >
            {isSubmitting ? (
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
