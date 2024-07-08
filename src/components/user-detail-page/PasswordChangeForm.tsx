"use client";
import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AxiosError } from "axios";
import validator from "validator";
import { PasswordInput } from "../PasswordInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/components/ui/use-toast";
import usePostChangePasswordMutation from "@/mutations/usePostChangePasswordMutation";

interface Props {
  userId: string;
}

export default function PasswordChangeForm({ userId }: Props) {
  const formSchema = useMemo(
    () =>
      z
        .object({
          newPassword: z
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
        .refine((values) => values.newPassword === values.confirmPassword, {
          message: "Confirm Password doesn't match Password",
          path: ["confirmPassword"],
        }),
    []
  );

  type FieldValues = z.infer<typeof formSchema>;

  const getFieldValues = useCallback((): FieldValues => {
    return {
      newPassword: "",
      confirmPassword: "",
    };
  }, []);

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(),
  });

  const { mutateAsync } = usePostChangePasswordMutation();
  const { toast } = useToast();

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      targetUserId: userId,
      newPassword: values.newPassword,
    })
      .then(() => {
        toast({ title: "Success" });
        form.reset(getFieldValues());
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>New Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
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
          className="w-full"
          isLoading={form.formState.isSubmitting}
        >
          Change
        </LoadingButton>
      </form>
    </Form>
  );
}
