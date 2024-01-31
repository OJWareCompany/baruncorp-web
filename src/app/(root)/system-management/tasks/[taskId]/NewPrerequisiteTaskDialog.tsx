import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import usePostPrerequisiteTaskMutation from "@/mutations/usePostPrerequisiteTaskMutation";
import { getTaskQueryKey } from "@/queries/useTaskQuery";
import TasksCombobox from "@/components/combobox/TasksCombobox";
import { TaskResponseDto } from "@/api/api-spec";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  taskId: z.string().trim().min(1, { message: "Task is required" }),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  task: TaskResponseDto;
}

export default function NewPrerequisiteTaskDialog({ task }: Props) {
  const { taskId } = useParams() as { taskId: string };
  const { mutateAsync } = usePostPrerequisiteTaskMutation(taskId);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskId: "",
    },
  });

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      prerequisiteTaskId: values.taskId,
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: getTaskQueryKey(taskId),
        });
        setOpen(false);
        setIsSubmitSuccessful(true);
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 409:
            if (error.response?.data.errorCode.includes("20301")) {
              form.setError(
                "taskId",
                {
                  message: `This task already exists`,
                },
                { shouldFocus: true }
              );
              return;
            }
        }

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

  useEffect(() => {
    if (isSubmitSuccessful) {
      form.reset();
      setIsSubmitSuccessful(false);
    }
  }, [form, isSubmitSuccessful]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className="h-[28px] text-xs px-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Prerequisite Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Prerequisite Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="taskId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Task</FormLabel>
                  <FormControl>
                    {/* TODO: 태스크가 가지고 있지 않은 프리 리쿠이짓 태스크들 목록 */}
                    <TasksCombobox
                      taskId={field.value}
                      onTaskIdChange={field.onChange}
                      ref={field.ref}
                      modal
                      filteringIds={[
                        ...task.prerequisiteTask.map(({ taskId }) => taskId),
                        task.id,
                      ]}
                    />
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
