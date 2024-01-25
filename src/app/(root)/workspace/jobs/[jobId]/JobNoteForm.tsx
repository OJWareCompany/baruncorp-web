import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
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
import usePostJobNoteMutation from "@/mutations/usePostJobNoteMutation";
import { getJobNotesQueryKey } from "@/queries/useJobNotesQuery";
import { JobResponseDto } from "@/api";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  content: z.string().trim().min(1, {
    message: "Content is required",
  }),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  job: JobResponseDto;
}

export default function JobNoteForm({ job }: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const { mutateAsync } = usePostJobNoteMutation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      jobId: job.id,
      content: values.content,
    })
      .then(() => {
        form.reset();
        queryClient.invalidateQueries({
          queryKey: getJobNotesQueryKey(job.id),
        });
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
