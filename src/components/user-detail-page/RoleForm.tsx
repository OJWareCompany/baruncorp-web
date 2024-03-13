import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import ClientUserRolesCombobox from "../combobox/ClientUserRolesCombobox";
import { useToast } from "@/components/ui/use-toast";
import { getUserQueryKey } from "@/queries/useUserQuery";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ClientUserRoleEnum } from "@/lib/constants";
import usePostUserRoleMutation from "@/mutations/usePostUserRoleMutation";
import { UserResponseDto } from "@/api/api-spec";
import { useProfileContext } from "@/app/(root)/ProfileProvider";

const formSchema = z.object({
  clientUserRole: z.custom<ClientUserRoleEnum>(),
});

type FieldValues = z.infer<typeof formSchema>;

function getFieldValues(user: UserResponseDto): FieldValues {
  return {
    clientUserRole: user.role as ClientUserRoleEnum,
  };
}

interface Props {
  user: UserResponseDto;
}

export default function RoleForm({ user }: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(user),
  });
  const { toast } = useToast();

  const {
    authority: { canEditClientRole },
  } = useProfileContext();

  const { mutateAsync } = usePostUserRoleMutation(user.id);
  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset(getFieldValues(user));
  }, [form, user]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="clientUserRole"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ClientUserRolesCombobox
                  clientUserRole={field.value}
                  onRoleChange={(newRole) => {
                    mutateAsync({ newRole })
                      .then(() => {
                        toast({ title: "Success" });
                        queryClient.invalidateQueries({
                          queryKey: getUserQueryKey(user.id),
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
                  }}
                  ref={field.ref}
                  disabled={!canEditClientRole}
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
