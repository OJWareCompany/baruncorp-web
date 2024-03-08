"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AxiosError } from "axios";
import { DialogProps } from "@radix-ui/react-dialog";
import { EditDialogState } from "./CouriersTable";
import LoadingButton from "@/components/LoadingButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { getCouriersQueryKey } from "@/queries/useCouriersQuery";
import usePatchCourierMutation from "@/mutations/usePatchCourierMutation";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  trackingNumberUrlPermalink: z
    .string()
    .trim()
    .min(1, { message: "Tracking Number URL Permalink is required" })
    .url({ message: "Tracking Number URL Permalink should be a URL" }),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props extends DialogProps {
  state: EditDialogState;
}

export default function EditCourierDialog({ state, ...dialogProps }: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutateAsync } = usePatchCourierMutation();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      trackingNumberUrlPermalink: "",
    },
  });

  useEffect(() => {
    if (!state.open) {
      return;
    }

    form.reset({
      name: state.initialValue.name,
      trackingNumberUrlPermalink: state.initialValue.urlParam,
    });
  }, [form, state]);

  async function onSubmit(values: FieldValues) {
    if (!state.open) {
      return;
    }

    await mutateAsync({
      courierId: state.initialValue.id,
      name: values.name,
      urlParam: values.trackingNumberUrlPermalink,
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: getCouriersQueryKey({}),
        });
        toast({ title: "Success" });
        dialogProps.onOpenChange?.(false);
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 404:
            if (error.response?.data.errorCode.includes("21202")) {
              form.setError(
                "name",
                {
                  message: `${values.name} already exists`,
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
    <Dialog {...dialogProps} open={state.open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Courier</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="trackingNumberUrlPermalink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Tracking Number URL Permalink</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton
              type="submit"
              isLoading={form.formState.isSubmitting}
              disabled={!form.formState.isDirty}
              className="w-full"
            >
              Save
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
