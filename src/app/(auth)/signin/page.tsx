"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
});

export default function SigninPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: "",
    description: "",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "ejsvk3284@kakao.com",
      password: "WkdWkdaos123!",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(false);

    const { email, password } = values;
    if (email.split("@")[0] === password) {
      form.control.setError("password", {
        message: "Password cannot be a email address",
      });
    } else {
      const result: any = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      const { error } = result;
      if (error) {
        setError(true);
        setErrorMessage(() => {
          return {
            title:
              error === "CredentialsSignin"
                ? "Server error"
                : "Invalid email address or password",
            description:
              error === "CredentialsSignin"
                ? "This is a temporary. Please try again in a momentarily. Or contact the Barun Corp manager."
                : "",
          };
        });
      } else {
        router.push("/");
        toast({ title: "Sign in is complete." });
      }
      setLoading(false);
    }
  }

  return (
    <>
      {error && (
        <Alert
          variant="destructive"
          className={`fixed w-96 top-8 left-2/4 translate-x-[-50%]`}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{errorMessage.title}</AlertTitle>
          <AlertDescription>{errorMessage.description}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit" fullWidth={true} disabled={loading}>
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
