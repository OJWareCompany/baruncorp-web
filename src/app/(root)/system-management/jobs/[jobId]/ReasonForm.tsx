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
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  async function onSubmit(values: FieldValues) {
    await patchAssignedTaskRejectMutateAsync({ reason: values.reason })
      .then(() => {
        toast({ title: "Success" });
        onSuccess?.();
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
