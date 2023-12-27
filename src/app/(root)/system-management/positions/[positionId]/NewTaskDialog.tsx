import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
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
import { AutoAssignmentPropertyTypeEnum } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import usePostPositionTaskMutation from "@/mutations/usePostPositionTaskMutation";
import { getPositionQueryKey } from "@/queries/usePositionQuery";
import TasksCombobox from "@/components/combobox/TasksCombobox";
import { PositionResponseDto } from "@/api";

const formSchema = z.object({
  taskId: z.string().trim().min(1, { message: "Task is required" }),
  autoAssignmentPropertyType: AutoAssignmentPropertyTypeEnum,
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  position: PositionResponseDto;
}

export default function NewTaskDialog({ position }: Props) {
  const { positionId } = useParams() as { positionId: string };
  const { mutateAsync } = usePostPositionTaskMutation(positionId);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskId: "",
      autoAssignmentPropertyType: "None",
    },
  });

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      taskId: values.taskId,
      autoAssignmentType: values.autoAssignmentPropertyType,
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: getPositionQueryKey(positionId),
        });
        setOpen(false);
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 409:
            if (error.response?.data.errorCode.includes("20204")) {
              form.setError(
                "taskId",
                {
                  message: `This task is already existed`,
                },
                { shouldFocus: true }
              );
            }
            break;
        }
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className="h-[28px] text-xs px-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
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
                    {/* TODO: 포지션이 가지고 있지 않은 태스크들 목록 */}
                    <TasksCombobox
                      taskId={field.value}
                      onTaskIdChange={field.onChange}
                      ref={field.ref}
                      modal
                      filteringIds={position.tasks.map(({ taskId }) => taskId)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="autoAssignmentPropertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Auto Assignment Property Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger ref={field.ref}>
                        <SelectValue placeholder="Select a property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {AutoAssignmentPropertyTypeEnum.options.map(
                            (option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            )
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
