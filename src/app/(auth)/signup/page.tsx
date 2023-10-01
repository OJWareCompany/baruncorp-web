"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Separator } from "@/components/ui/separator";
import { PasswordInput } from "@/components/PasswordInput";
import LoadingButton from "@/components/LoadingButton";

const formSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First Name is required" }),
  lastName: z.string().trim().min(1, { message: "Last Name is required" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email Address is required" })
    .email({ message: "Format of Email Address is incorrect" }),
  password: z
    .string()
    .trim()
    .min(1, { message: "Password is required" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&+=])(?!.*\s).{12,}$/, {
      message:
        "Password should be at least 12 characters with uppercase, lowercase, numbers and special characters(!@#$%^&+=)",
    }),
  confirmPassword: z
    .string()
    .trim()
    .min(1, { message: "Confirm Password is required" }),
  code: z.string().trim().length(6, { message: "Code shoule be 6 characters" }),
});

const defaultValues = {
  email: "ejsvk3284@kakao.com",
  password: "WkdWkdaos123!",
  confirmPassword: "",
  firstName: "Chris",
  lastName: "Kim",
  code: "",
};

if (process.env.NODE_ENV === "production") {
  defaultValues.email = "";
  defaultValues.password = "";
  defaultValues.confirmPassword = "";
  defaultValues.firstName = "";
  defaultValues.lastName = "";
  defaultValues.code = "";
}

export default function SignupPage() {
  const router = useRouter();

  // const { mutateAsync } = use...Mutation(); // TODO
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password, confirmPassword } = values;

    if (password !== confirmPassword) {
      control.setError("confirmPassword", {
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

    // await mutateAsync(values)
    //   .then(() => {
    //     router.push("/signin");
    //     toast({ title: "Sign-up success" });
    //   })
    //   .catch((error: AxiosError<ErrorResponseData>) => {
    //     const { response } = error;

    //     switch (response?.data.statusCode) {
    //       case 404:
    //         toast({
    //           title: "Invalid code",
    //           description:
    //             "Please check your email again. If the problem persists, please contact the Barun Corp Manager.",
    //           variant: "destructive",
    //         });
    //         break;
    //     }
    //   });
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Confirm Password</FormLabel>
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
        <LoadingButton
          type="submit"
          isLoading={isSubmitting}
          className="w-full"
        >
          Submit
        </LoadingButton>
        <Separator />
        <Button
          type="button"
          variant="outline"
          asChild={true}
          className="w-full"
        >
          <Link href="/signin">Sign in</Link>
        </Button>
      </form>
    </Form>
  );
}
