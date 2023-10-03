import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import LoadingButton from "@/components/LoadingButton";
import usePostJobNoteMutation from "@/queries/usePostJobNoteMutation";

const formSchema = z.object({
  content: z.string().trim().min(1, {
    message: "Content is required",
  }),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  jobId: string;
}

export default function JobNoteForm({ jobId }: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const { mutateAsync } = usePostJobNoteMutation();
  const queryClient = useQueryClient();

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      jobId,
      content: values.content,
    })
      .then(() => {
        form.reset();
        queryClient.invalidateQueries({
          queryKey: ["job-notes", "list", { jobId }],
        });
      })
      .catch(() => {});
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Content</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          type="submit"
          isLoading={form.formState.isSubmitting}
          className="w-full"
        >
          Submit
        </LoadingButton>
      </form>
    </Form>
  );
}
