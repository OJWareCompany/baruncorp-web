"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import LoadingButton from "@/components/LoadingButton";
import { Input } from "@/components/ui/input";
import RowItemsContainer from "@/components/RowItemsContainer";

import { Button } from "@/components/ui/button";
import ItemsContainer from "@/components/ItemsContainer";
import { ServiceResponseDto, TaskResponseDto } from "@/api";
import usePatchTaskMutation from "@/mutations/usePatchTaskMutation";
import { getTaskQueryKey } from "@/queries/useTaskQuery";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  service: z.string().trim().min(1, { message: "Service is required" }),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  task: TaskResponseDto;
  service: ServiceResponseDto;
}

export default function TaskForm({ task, service }: Props) {
  const { taskId } = useParams() as { taskId: string };
  const queryClient = useQueryClient();

  const { mutateAsync } = usePatchTaskMutation(taskId);

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: task.name,
      service: service.name,
    },
  });

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      name: values.name.trim(),
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: getTaskQueryKey(taskId),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        // switch (error.response?.status) {
        //   case 409:
        //     if (error.response?.data.errorCode.includes("30002")) {
        //       form.setError(
        //         "address",
        //         {
        //           message: `${values.address.fullAddress} is already existed`,
        //         },
        //         { shouldFocus: true }
        //       );
        //     }
        //     if (error.response?.data.errorCode.includes("30003")) {
        //       form.setError(
        //         "projectNumber",
        //         {
        //           message: `${values.projectNumber} is already existed`,
        //         },
        //         { shouldFocus: true }
        //       );
        //     }
        //     break;
        // }
      });
  }

  useEffect(() => {
    form.reset((prev) => {
      return {
        ...prev,
        name: task.name,
      };
    });
  }, [form, service.name, task.name]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ItemsContainer>
          <RowItemsContainer>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Service</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <Button
                      size={"icon"}
                      variant={"outline"}
                      className="shrink-0"
                      asChild
                    >
                      <Link href={`/system-management/services/${service.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </RowItemsContainer>
          <LoadingButton
            type="submit"
            className="w-full"
            isLoading={form.formState.isSubmitting}
            disabled={!form.formState.isDirty}
          >
            Edit
          </LoadingButton>
        </ItemsContainer>
      </form>
    </Form>
  );
}
