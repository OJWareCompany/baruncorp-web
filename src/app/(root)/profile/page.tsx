"use client";

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hook/use-toast";

const formSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First Name is required" }),
  lastName: z.string().trim().min(1, { message: "Last Name is required" }),
  email: z.string().email(),
  organization: z.string(),
});

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [editable, setEditable] = useState(false);
  const [originName, setOriginName] = useState({
    firstName: "",
    lastName: "",
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const {
    control,
    formState: { isSubmitting },
    setValue,
    handleSubmit,
    reset,
  } = form;

  function setValues({
    email,
    firstName,
    lastName,
    companyId,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    companyId: any;
  }) {
    setValue("firstName", firstName);
    setValue("lastName", lastName);
    setValue("email", email);
    setValue("organization", companyId === 1 ? "BARUN CORP" : "TESLA");
  }

  useEffect(() => {
    if (status !== "authenticated") return;

    // TODO 세부적인 에러 핸들링 필요
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
    })
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((json) => {
        const { firstName, lastName } = json;
        setOriginName({ firstName, lastName });
        setValues(json);
      })
      .catch((error) => {
        console.log("🚀 ~ file: page.tsx:81 ~ useEffect ~ error:", error);
        toast({ title: "occurs error", variant: "destructive" });
      });
  }, [status]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { firstName, lastName } = values;
    if (firstName === originName.firstName && lastName === originName.lastName)
      return;

    // TODO 세부적인 에러 핸들링 필요
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((json) => {
        const { firstName, lastName } = json;
        setOriginName({ firstName, lastName });
        setValues(json);
        toast({ title: "Success your profile edit." });
        setEditable(false);
      })
      .catch((error) => {
        console.log("🚀 ~ file: page.tsx:111 ~ onSubmit ~ error:", error);
        toast({ title: "occurs error", variant: "destructive" });
      });
  }

  return (
    <Form {...form}>
      <h1 className="h3 mb-4">Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-96">
        <FormField
          control={control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>First Name</FormLabel>
              <FormControl>
                <Input {...field} readOnly={!editable} />
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
                <Input {...field} readOnly={!editable} />
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
                <Input {...field} readOnly={true} disabled={editable} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Organization</FormLabel>
              <FormControl>
                <Input {...field} readOnly={true} disabled={editable} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {editable ? (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              fullWidth={true}
              onClick={() => {
                reset({ ...originName });
                setEditable(false);
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Cancle"
              )}
            </Button>
            <Button type="submit" fullWidth={true}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        ) : (
          <Button
            fullWidth={true}
            onClick={() => setEditable(true)}
            disabled={isSubmitting}
          >
            Edit
          </Button>
        )}
      </form>
    </Form>
  );
}
