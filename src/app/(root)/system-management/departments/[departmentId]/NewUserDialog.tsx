import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
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
import { DepartmentResponseDto } from "@/api/api-spec";
// import usePostUserDepartmentMutation from "@/mutations/usePostUserDepartmentMutation";
import { useToast } from "@/components/ui/use-toast";
import UsersByOrganizationCombobox from "@/components/combobox/UsersByOrganizationCombobox";
import { BARUNCORP_ORGANIZATION_ID } from "@/lib/constants";
import usePostDepartmentAddUserMutation from "@/mutations/usePostDepartmentAddUserMutation";
import { getUsersQueryKey } from "@/queries/useUsersQuery";
import { getProfileQueryKey } from "@/queries/useProfileQuery";

const formSchema = z.object({
  userId: z.string().trim().min(1, { message: "User is required" }),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  department: DepartmentResponseDto;
}

export default function NewUserDialog({ department }: Props) {
  const usePostDepartmentAddUserMutationResult =
    usePostDepartmentAddUserMutation();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: session } = useSession();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
    },
  });

  useEffect(() => {
    if (
      form.formState.isSubmitSuccessful &&
      usePostDepartmentAddUserMutationResult.isSuccess
    ) {
      form.reset();
    }
  }, [
    form,
    form.formState.isSubmitSuccessful,
    usePostDepartmentAddUserMutationResult.isSuccess,
  ]);

  async function onSubmit(values: FieldValues) {
    await usePostDepartmentAddUserMutationResult
      .mutateAsync({
        departmentId: department.id,
        userId: values.userId,
      })
      .then(() => {
        // 만약에 수정하는 유저가 자신이라면, 자신의 profile을 받아오는 query에 대한 cache를 지워서, 자신의 profile에 담긴 department id도 업데이트한다.
        if (values.userId === session?.id ?? "") {
          queryClient.invalidateQueries({
            queryKey: getProfileQueryKey(),
          });
        }

        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getUsersQueryKey({ departmentName: department.name }), // TODO: replace with id
        });
        setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className="h-[28px] text-xs px-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New User</DialogTitle>
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
                    <UsersByOrganizationCombobox
                      organizationId={BARUNCORP_ORGANIZATION_ID}
                      userId={field.value}
                      onUserIdChange={field.onChange}
                      ref={field.ref}
                      modal
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
