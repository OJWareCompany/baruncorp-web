"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
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

export default function SignupPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<{
    title: string;
    description?: string;
  } | null>(null);
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
    setErrorMessage(null);

    const { email, password, passwordConfirm, code, firstName, lastName } =
      values;

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

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, code, firstName, lastName }),
    })
      .then(async (response) => {
        if (!response.ok) throw response;
        router.push("/signin");
        toast({ title: "Sign up is complete." });
      })
      .catch(async (errorResponse) => {
        const { statusCode } = await errorResponse.json();
        if (statusCode === 404) {
          setErrorMessage({
            title: "Invalid code",
            description:
              "Please check your mail again. If the problem persists, please contact the Barun Corp Manager.",
          });
          return;
        }

        setErrorMessage({
          title: "Server error",
          description:
            "Please try again in a few minutes. If the problem persists, please contact the Barun Corp Manager.",
        });
      });
  }

  return (
    <>
      {errorMessage && (
        <Alert
          variant="destructive"
          className={`fixed w-96 top-8 left-2/4 translate-x-[-50%] bg-background`}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{errorMessage.title}</AlertTitle>
          <AlertDescription>{errorMessage.description}</AlertDescription>
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
          <Button
            type="button"
            variant="outline"
            fullWidth={true}
            disabled={isSubmitting}
            asChild={!isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              <Link href="/signin">Sign in</Link>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}
