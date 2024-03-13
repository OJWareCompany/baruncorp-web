"use client";
import { DialogProps } from "@radix-ui/react-dialog";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReasonDialogState } from "./ScopesTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import LoadingButton from "@/components/LoadingButton";
import usePatchAssignedTaskRejectMutation from "@/mutations/usePatchAssignedTaskRejectMutation";
import { useToast } from "@/components/ui/use-toast";
import { getJobQueryKey } from "@/queries/useJobQuery";
import { getProjectQueryKey } from "@/queries/useProjectQuery";

const formSchema = z.object({
  reason: z.string().trim().min(1, { message: "Reason is required" }),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props extends DialogProps {
  onOpenChange: (open: boolean) => void;
  reasonDialogState: ReasonDialogState;
  jobId: string;
  projectId: string;
}

export default function ReasonDialog({
  reasonDialogState,
  jobId,
  projectId,
  ...dialogProps
}: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });
  const { mutateAsync: patchAssignedTaskRejectMutateAsync } =
    usePatchAssignedTaskRejectMutation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  async function onSubmit(values: FieldValues) {
    if (!reasonDialogState.open) {
      return;
    }

    await patchAssignedTaskRejectMutateAsync({
      assignedTaskId: reasonDialogState.assignedTaskId,
      reason: values.reason,
    })
      .then(() => {
        toast({ title: "Success" });
        dialogProps.onOpenChange(false);
        queryClient.invalidateQueries({
          queryKey: getJobQueryKey(jobId),
        });
        queryClient.invalidateQueries({
          queryKey: getProjectQueryKey(projectId),
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
    <Dialog {...dialogProps} open={reasonDialogState.open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reason for rejection</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
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
      </DialogContent>
    </Dialog>
  );
}
