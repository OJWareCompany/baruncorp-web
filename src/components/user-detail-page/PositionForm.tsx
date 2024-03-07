import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import PositionsCombobox from "@/components/combobox/PositionsCombobox";
import { useToast } from "@/components/ui/use-toast";
import usePostUserPositionMutation from "@/mutations/usePostUserPositionMutation";
import { getUserQueryKey } from "@/queries/useUserQuery";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import usePostUserPositionResetMutation from "@/mutations/usePostUserPositionResetMutation";

const formSchema = z.object({
  positionId: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  positionId: string;
  userId: string;
  disabled?: boolean;
}

export default function PositionForm({
  positionId,
  userId,
  disabled = false,
}: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      positionId,
    },
  });
  const { toast } = useToast();

  const { mutateAsync } = usePostUserPositionMutation();
  const { mutateAsync: postUserPositionResetMutateAsync } =
    usePostUserPositionResetMutation(userId);
  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset({ positionId });
  }, [form, positionId]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="positionId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PositionsCombobox
                  positionId={field.value}
                  onPositionChange={({ id, name }) => {
                    mutateAsync({ positionId: id, userId })
                      .then(() => {
                        postUserPositionResetMutateAsync()
                          .then(() => {
                            toast({ title: "Success" });
                            queryClient.invalidateQueries({
                              queryKey: getUserQueryKey(userId),
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
                      })
                      .catch((error: AxiosError<ErrorResponseData>) => {
                        switch (error.response?.status) {
                          case 400:
                            if (
                              error.response?.data.errorCode.includes("20208")
                            ) {
                              form.setError(
                                "positionId",
                                {
                                  message: `Electrical License is required for ${name}`,
                                },
                                { shouldFocus: true }
                              );
                              return;
                            }

                            if (
                              error.response?.data.errorCode.includes("20209")
                            ) {
                              form.setError(
                                "positionId",
                                {
                                  message: `Structural License is required for ${name}`,
                                },
                                { shouldFocus: true }
                              );
                              return;
                            }
                        }

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
                  disabled={disabled}
                  ref={field.ref}
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
