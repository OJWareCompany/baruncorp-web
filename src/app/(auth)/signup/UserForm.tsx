import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { X } from "lucide-react";
import validator from "validator";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { UserResponseDto } from "@/api";
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
import { PasswordInput } from "@/components/PasswordInput";
import LoadingButton from "@/components/LoadingButton";
import { Separator } from "@/components/ui/separator";
import usePostSignupMutation from "@/mutations/usePostSignupMutation";
import {
  transformNullishStringIntoString,
  transformStringIntoNullableString,
} from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z
  .object({
    organization: z
      .string()
      .trim()
      .min(1, { message: "Organization is required" }),
    firstName: z.string().trim().min(1, { message: "First Name is required" }),
    lastName: z.string().trim().min(1, { message: "Last Name is required" }),
    phoneNumber: z.string().trim(),
    emailAddress: z
      .string()
      .trim()
      .min(1, { message: "Email Address is required" })
      .email({ message: "Format of Email Address is incorrect" }),
    emailAddressesToReceiveDeliverables: z.array(
      z.object({
        email: z
          .string()
          .trim()
          .min(1, { message: "Email Address is required" })
          .email({ message: "Format of Email Address is incorrect" }),
      })
    ),
    password: z
      .string()
      .trim()
      .refine(
        (value) =>
          validator.isStrongPassword(value, {
            minLength: 8,
            minNumbers: 1,
            minLowercase: 1,
            minSymbols: 1,
            minUppercase: 1,
          }),
        "Password must contain at least one number, one lowercase letter, one uppercase letter, and one special character, and must be at least 8 characters long"
      ),
    confirmPassword: z.string().trim(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Confirm Password doesn't match Password",
    path: ["confirmPassword"],
  });

interface Props {
  user: UserResponseDto;
}

export default function UserForm({ user }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const { mutateAsync } = usePostSignupMutation(user.id);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization: user.organization,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: transformNullishStringIntoString.parse(user.phoneNumber),
      emailAddress: user.email,
      emailAddressesToReceiveDeliverables: user.deliverablesEmails.map(
        (value) => ({ email: value })
      ),
      password: "",
      confirmPassword: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailAddressesToReceiveDeliverables",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await mutateAsync({
      deliverablesEmails: values.emailAddressesToReceiveDeliverables.map(
        ({ email }) => email
      ),
      email: values.emailAddress,
      firstName: values.firstName,
      lastName: values.lastName,
      password: values.password,
      phoneNumber: transformStringIntoNullableString.parse(values.phoneNumber),
    })
      .then(() => {
        router.push("/signin");
        toast({ title: "Sign-up success" });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        if (
          error.response &&
          error.response.data.errorCode.filter((value) => value != null)
            .length !== 0
        ) {
          toast({
            title: error.response.data.message,
            variant: "destructive",
          });
          return;
        }
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Organization</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="emailAddress"
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
          name="emailAddressesToReceiveDeliverables"
          render={() => {
            return (
              <FormItem>
                <FormLabel required>
                  Email Addresses to Receive Deliverables
                </FormLabel>
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`emailAddressesToReceiveDeliverables.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-row gap-2">
                          <FormControl>
                            <Input {...field} disabled={index === 0} />
                          </FormControl>
                          {index !== 0 && (
                            <Button
                              variant={"outline"}
                              size={"icon"}
                              className="flex-shrink-0"
                              onClick={() => {
                                remove(index);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  variant={"outline"}
                  className="w-full"
                  onClick={() => {
                    append({ email: "" });
                  }}
                  type="button"
                >
                  Add Email
                </Button>
              </FormItem>
            );
          }}
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
                <PasswordInput {...field}></PasswordInput>
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
