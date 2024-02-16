import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PlateEditor, Value, createPlateEditor } from "@udecode/plate-common";
import { serializeHtml } from "@udecode/plate-serializer-html";
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
import { JobResponseDto } from "@/api/api-spec";
import { useToast } from "@/components/ui/use-toast";
import MentionEditor from "@/components/editor/MentionEditor";
import {
  findAllEmails,
  isEditorValueEmpty,
  trimValue,
} from "@/lib/plate-utils";
import { INITIAL_EDITOR_VALUE } from "@/lib/constants";
import { mentionEditorPlugins } from "@/lib/plate/plugins";
import Dropzone from "@/components/Dropzone";

const editor = createPlateEditor({ plugins: mentionEditorPlugins });

const formSchema = z.object({
  content: z
    .custom<Value>()
    .refine((value) => !isEditorValueEmpty(value), "Content is required"),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  job: JobResponseDto;
}

export default function JobNoteForm({ job }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: INITIAL_EDITOR_VALUE,
    },
  });
  const usePostJobNoteMutationResult = usePostJobNoteMutation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const editorRef = useRef<PlateEditor<Value>>(null);

  useEffect(() => {
    if (
      form.formState.isSubmitSuccessful &&
      usePostJobNoteMutationResult.isSuccess
    ) {
      form.reset();
    }
  }, [
    form,
    form.formState.isSubmitSuccessful,
    usePostJobNoteMutationResult.isSuccess,
  ]);

  async function onSubmit(values: FieldValues) {
    const trimmedContent = trimValue(values.content);
    const emails = findAllEmails(trimmedContent);
    const hasMention = emails.length !== 0;

    let emailBody: string | undefined = undefined;
    if (hasMention) {
      emailBody = serializeHtml(editor, {
        nodes: trimmedContent,
      })
        .split('<div class="slate-p"></div>')
        .filter((value) => value !== "")
        .join("<br />");
    }

    await usePostJobNoteMutationResult
      .mutateAsync({
        jobId: job.id,
        content: JSON.stringify(trimmedContent),
        type: hasMention ? "RFI" : "JobNote",
        receiverEmails: hasMention ? emails : ["yunwoo@oj.vision"],
        emailBody,
        files,
      })
      .then(() => {
        toast({
          title: "Success",
        });
        setFiles([]);
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
                <MentionEditor
                  {...field}
                  editorRef={editorRef}
                  key={String(
                    form.formState.isSubmitSuccessful &&
                      usePostJobNoteMutationResult.isSuccess
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Dropzone files={files} onFilesChange={setFiles} />
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
