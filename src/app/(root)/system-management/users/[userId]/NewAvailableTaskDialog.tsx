import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import usePostUserAvailableTaskMutation from "@/mutations/usePostUserAvailableTaskMutation";
import { getUserQueryKey } from "@/queries/useUserQuery";
import NoLicensedTasksCombobox from "@/components/combobox/NoLicensedTasksCombobox";
import { UserResponseDto } from "@/api";

const formSchema = z.object({
  taskId: z.string().trim().min(1, { message: "Task is required" }),
  autoAssignmentPropertyType: AutoAssignmentPropertyTypeEnum,
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  user: UserResponseDto;
}

export default function NewAvailableTaskDialog({ user }: Props) {
  const { userId } = useParams() as { userId: string };
  const { mutateAsync } = usePostUserAvailableTaskMutation(userId);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

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
        setIsSubmitSuccessful(true);
        queryClient.invalidateQueries({
          queryKey: getUserQueryKey(userId),
        });
        setOpen(false);
      })
      .catch(() => {
        // TODO
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
          New Available Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Available Task</DialogTitle>
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
                    {/* TODO: 유저가 가지고 있지 않은 태스크들 목록 */}
                    <NoLicensedTasksCombobox
                      taskId={field.value}
                      onTaskIdChange={field.onChange}
                      ref={field.ref}
                      modal
                      filteringIds={user.availableTasks.map(
                        (value) => value.id
                      )}
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
