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
import { getTaskQueryKey } from "@/queries/useTaskQuery";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AutoAssignmentPropertyTypeEnum } from "@/lib/constants";
import usePostPositionTaskMutation from "@/mutations/usePostPositionTaskMutation";
import PositionsCombobox from "@/components/combobox/PositionsCombobox";
import { TaskResponseDto } from "@/api/api-spec";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  positionId: z.string().trim().min(1, { message: "Position is required" }),
  autoAssignmentPropertyType: AutoAssignmentPropertyTypeEnum,
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  task: TaskResponseDto;
}

export default function NewPositionDialog({ task }: Props) {
  const { taskId } = useParams() as { taskId: string };
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      positionId: "",
      autoAssignmentPropertyType: "None",
    },
  });

  const watchPositionId = form.watch("positionId");

  const usePostPositionTaskMutationResult =
    usePostPositionTaskMutation(watchPositionId);

  useEffect(() => {
    if (
      form.formState.isSubmitSuccessful &&
      usePostPositionTaskMutationResult.isSuccess
    ) {
      form.reset();
    }
  }, [
    form,
    form.formState.isSubmitSuccessful,
    usePostPositionTaskMutationResult.isSuccess,
  ]);

  async function onSubmit(values: FieldValues) {
    await usePostPositionTaskMutationResult
      .mutateAsync({
        taskId,
        autoAssignmentType: values.autoAssignmentPropertyType,
      })
      .then(() => {
        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getTaskQueryKey(taskId),
        });
        setOpen(false);
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 409:
            if (error.response?.data.errorCode.includes("20204")) {
              form.setError(
                "positionId",
                {
                  message: `This position already exists`,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className="h-[28px] text-xs px-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Position
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Position</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="positionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Position</FormLabel>
                  <FormControl>
                    <PositionsCombobox
                      positionId={field.value}
                      onPositionChange={({ id }) => {
                        field.onChange(id);
                      }}
                      ref={field.ref}
                      modal
                      filteringIds={task.taskPositions.map(
                        (value) => value.positionId
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
