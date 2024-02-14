"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Value } from "@udecode/plate-common";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import BasicEditor from "@/components/editor/BasicEditor";
import LoadingButton from "@/components/LoadingButton";
import PageHeader from "@/components/PageHeader";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  notes: z.custom<Value>(),
});

type FieldValues = z.infer<typeof formSchema>;

export default function Page() {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: [
        {
          type: "p",
          children: [{ text: "" }],
        },
      ],
    },
  });

  async function onSubmit(values: FieldValues) {
    // if(isEmptyValue(values.information))
    // const textContent = values.information;
    // if (textContent === "") {
    //   form.setError("information", { message: "Information is required" });
    //   focusEditor(editorRef.current);
    //   return;
    // }
  }

  const id = "TODO";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/utilities", name: "Utilities" },
          { href: `/system-management/utilities/${id}`, name: "Utility Name" },
        ]}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <BasicEditor
                    {...field}
                    //
                    // editorRef={editorRef}
                  />
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
            Edit
          </LoadingButton>
        </form>
      </Form>
    </div>
  );
}
