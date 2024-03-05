import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
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
import { getPositionQueryKey } from "@/queries/usePositionQuery";
import { PositionResponseDto } from "@/api/api-spec";
import WorkersCombobox from "@/components/combobox/WorkerCombobox";
import usePostUserPositionMutation from "@/mutations/usePostUserPositionMutation";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  userId: z.string().trim().min(1, { message: "User is required" }),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  position: PositionResponseDto;
}

export default function NewWorkerDialog({ position }: Props) {
  const usePostUserPositionMutationResult = usePostUserPositionMutation();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
    },
  });

  useEffect(() => {
    if (
      form.formState.isSubmitSuccessful &&
      usePostUserPositionMutationResult.isSuccess
    ) {
      form.reset();
    }
  }, [
    form,
    form.formState.isSubmitSuccessful,
    usePostUserPositionMutationResult.isSuccess,
  ]);

  async function onSubmit(values: FieldValues) {
    await usePostUserPositionMutationResult
      .mutateAsync({
        userId: values.userId,
        positionId: position.id,
      })
      .then(() => {
        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getPositionQueryKey(position.id),
        });
        setOpen(false);
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 400:
            if (error.response?.data.errorCode.includes("20208")) {
              form.setError(
                "userId",
                {
                  message: `Electrical License is required`,
                },
                { shouldFocus: true }
              );
              return;
            }

            if (error.response?.data.errorCode.includes("20209")) {
              form.setError(
                "userId",
                {
                  message: `Structural License is required`,
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
          New Worker
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Worker</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>User</FormLabel>
                  <FormControl>
                    <WorkersCombobox
                      userId={field.value}
                      onUserIdChange={field.onChange}
                      ref={field.ref}
                      modal
                      filteringIds={position.workers.map(
                        (value) => value.userId
                      )}
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
