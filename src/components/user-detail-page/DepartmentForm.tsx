import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import DepartmentsCombobox from "@/components/combobox/DepartmentsCombobox";
import { useToast } from "@/components/ui/use-toast";
import { getUserQueryKey } from "@/queries/useUserQuery";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import usePostDepartmentAddUserMutation from "@/mutations/usePostDepartmentAddUserMutation";
import usePostDepartmentRemoveUserMutation from "@/mutations/usePostDepartmentRemoveUserMutation";
import { UserResponseDto } from "@/api/api-spec";
import { getProfileQueryKey } from "@/queries/useProfileQuery";
import { useProfileContext } from "@/app/(root)/ProfileProvider";

const formSchema = z.object({
  departmentId: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  user: UserResponseDto;
}

export default function DepartmentForm({ user }: Props) {
  const { data: session } = useSession();
  const { isAdmin } = useProfileContext();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departmentId: user.departmentId ?? "",
    },
  });
  const { toast } = useToast();

  const usePostDepartmentAddUserMutationResult =
    usePostDepartmentAddUserMutation();
  const usePostDepartmentRemoveUserMutationResult =
    usePostDepartmentRemoveUserMutation();

  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset({ departmentId: user.departmentId ?? "" });
  }, [form, user.departmentId]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DepartmentsCombobox
                  departmentId={field.value}
                  onDepartmentIdChange={(newDepartmentId) => {
                    if (field.value === "") {
                      usePostDepartmentAddUserMutationResult
                        .mutateAsync({
                          departmentId: newDepartmentId,
                          userId: user.id,
                        })
                        .then(() => {
                          // 만약에 수정하는 유저가 자신이라면, 자신의 profile을 받아오는 query에 대한 cache를 지워서, 자신의 profile에 담긴 department id도 업데이트한다.
                          if (user.id === session?.id ?? "") {
                            queryClient.invalidateQueries({
                              queryKey: getProfileQueryKey(),
                            });
                          }

                          queryClient.invalidateQueries({
                            queryKey: getUserQueryKey(user.id),
                          });
                          toast({ title: "Success" });
                        })
                        .catch((error: AxiosError<ErrorResponseData>) => {
                          if (
                            error.response &&
                            error.response.data.errorCode.filter(
                              (value) => value != null
                            ).length !== 0
                          ) {
                            toast({
                              title: error.response.data.message,
                              variant: "destructive",
                            });
                            return;
                          }
                        });
                    } else {
                      usePostDepartmentRemoveUserMutationResult
                        .mutateAsync({
                          departmentId: newDepartmentId,
                          userId: user.id,
                        })
                        .then(() => {
                          usePostDepartmentAddUserMutationResult
                            .mutateAsync({
                              departmentId: newDepartmentId,
                              userId: user.id,
                            })
                            .then(() => {
                              // 만약에 수정하는 유저가 자신이라면, 자신의 profile을 받아오는 query에 대한 cache를 지워서, 자신의 profile에 담긴 department id도 업데이트한다.
                              if (user.id === session?.id ?? "") {
                                queryClient.invalidateQueries({
                                  queryKey: getProfileQueryKey(),
                                });
                              }

                              queryClient.invalidateQueries({
                                queryKey: getUserQueryKey(user.id),
                              });
                              toast({ title: "Success" });
                            })
                            .catch((error: AxiosError<ErrorResponseData>) => {
                              if (
                                error.response &&
                                error.response.data.errorCode.filter(
                                  (value) => value != null
                                ).length !== 0
                              ) {
                                toast({
                                  title: error.response.data.message,
                                  variant: "destructive",
                                });
                                return;
                              }
                            });
                        })
                        .catch((error: AxiosError<ErrorResponseData>) => {
                          if (
                            error.response &&
                            error.response.data.errorCode.filter(
                              (value) => value != null
                            ).length !== 0
                          ) {
                            toast({
                              title: error.response.data.message,
                              variant: "destructive",
                            });
                            return;
                          }
                        });
                    }
                  }}
                  ref={field.ref}
                  disabled={!isAdmin}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
