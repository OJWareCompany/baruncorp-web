import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PlateEditor, Value, createPlateEditor } from "@udecode/plate-common";
import { serializeHtml } from "@udecode/plate-serializer-html";
import JobNoteResultDialog from "./JobNoteResultDialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import LoadingButton from "@/components/LoadingButton";
import usePostJobNoteMutation from "@/mutations/usePostJobNoteMutation";
import { getJobNotesQueryKey } from "@/queries/useJobNotesQuery";
import { CreateJobNoteRequestDto, JobResponseDto } from "@/api/api-spec";
import { useToast } from "@/components/ui/use-toast";
import MentionEditor from "@/components/editor/MentionEditor";
import {
  findAllEmails,
  isEditorValueEmpty,
  trimValue,
} from "@/lib/plate-utils";
import { INITIAL_EDITOR_VALUE } from "@/lib/constants";
import Dropzone from "@/components/Dropzone";
import { getMentionEditorPlugins } from "@/lib/plate/plugins";

const mentionEditorPlugins = getMentionEditorPlugins("default");

const editor = createPlateEditor({ plugins: mentionEditorPlugins });

const formSchema = z.object({
  content: z
    .custom<Value>()
    .refine((value) => !isEditorValueEmpty(value), "Content is required"),
  files: z.custom<File[]>().superRefine((files, ctx) => {
    if (files.length > 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The number of files cannot exceed 10",
      });
      return;
    }

    if (files.some((file) => file.size > 25000000)) {
      // TODO: 25mb의 기준이 25000000인지 26214400인지 확인 필요
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Each file must not exceed 25 MB in size",
      });
      return;
    }
  }),
});

type FieldValues = z.infer<typeof formSchema>;

export type DialogState =
  | { open: false }
  | { open: true; requestData: CreateJobNoteRequestDto };

interface Props {
  job: JobResponseDto;
}

export default function JobNoteForm({ job }: Props) {
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: INITIAL_EDITOR_VALUE,
      files: [],
    },
  });
  const usePostJobNoteMutationResult = usePostJobNoteMutation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const editorRef = useRef<PlateEditor<Value>>(null);
  const [isResultDialogSuccess, setIsResultDialogSuccess] = useState(false);

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
    const requestData: CreateJobNoteRequestDto = {
      jobId: job.id,
      content: JSON.stringify(trimmedContent),
      type: hasMention ? "RFI" : "JobNote",
      receiverEmails: hasMention ? emails : [],
      emailBody,
      files: values.files,
    };

    if (values.files.length !== 0) {
      // file 있는 경우
      setDialogState({ open: true, requestData });
      setIsResultDialogSuccess(false);
      return;
    } else {
      // file 없는 경우
      await usePostJobNoteMutationResult
        .mutateAsync(requestData)
        .then(() => {
          toast({
            title: "Success",
          });
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
  }

  const handleResultDialogSuccess = useCallback(() => {
    form.reset();
    setIsResultDialogSuccess(true);
  }, [form]);

  return (
    <>
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
                      (form.formState.isSubmitSuccessful &&
                        usePostJobNoteMutationResult.isSuccess) ||
                        isResultDialogSuccess
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="files"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Dropzone
                    files={field.value}
                    onFilesChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  When sending mail, the maximum file size is currently set to 1
                  MB, but we plan to modify this to allow up to 10 files with a
                  maximum size of 25 MB
                </FormDescription>
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
      <JobNoteResultDialog
        state={dialogState}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            return;
          }

          setDialogState({ open: newOpen });
        }}
        onSuccess={handleResultDialogSuccess}
      />
    </>
  );
}
