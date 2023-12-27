import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
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

const formSchema = z.object({
  reason: z.string().trim().min(1, { message: "Reason is required" }),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  assignedTaskId: string;
  onSuccess?: () => void;
}

export default function ReasonForm({ assignedTaskId, onSuccess }: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });
  const { mutateAsync: patchAssignedTaskRejectMutateAsync } =
    usePatchAssignedTaskRejectMutation(assignedTaskId);

  async function onSubmit(values: FieldValues) {
    await patchAssignedTaskRejectMutateAsync({ reason: values.reason })
      .then(() => {
        onSuccess?.();
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        // switch (error.response?.status) {
        //   case 409:
        //     if (error.response?.data.errorCode.includes("20301")) {
        //       form.setError(
        //         "taskId",
        //         {
        //           message: `This task is already existed`,
        //         },
        //         { shouldFocus: true }
        //       );
        //     }
        //     break;
        // }
      });
  }

  return (
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
  );
}
