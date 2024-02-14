"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AxiosError } from "axios";
import { DialogProps } from "@radix-ui/react-dialog";
import { EditDialogState } from "./TrackingNumbersTable";
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
import { getTrackingNumbersQueryKey } from "@/queries/useTrackingNumbersQuery";
import usePatchTrackingNumberMutation from "@/mutations/usePatchTrackingNumberMutation";
import CouriersCombobox from "@/components/combobox/CouriersCombobox";

const formSchema = z.object({
  courierId: z.string().trim().min(1, { message: "Courier is required" }),
  trackingNumber: z
    .string()
    .trim()
    .min(1, { message: "Tracking Number is required" }),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props extends DialogProps {
  state: EditDialogState;
}

export default function EditTrackingNumberDialog({
  state,
  ...dialogProps
}: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutateAsync } = usePatchTrackingNumberMutation();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courierId: "",
      trackingNumber: "",
    },
  });

  useEffect(() => {
    if (!state.open) {
      return;
    }

    form.reset({
      courierId: state.initialValue.courierId,
      trackingNumber: state.initialValue.trackingNumber,
    });
  }, [form, state]);

  async function onSubmit(values: FieldValues) {
    if (!state.open) {
      return;
    }

    await mutateAsync({
      trackingNumberId: state.initialValue.id,
      courierId: values.courierId,
      trackingNumber: values.trackingNumber,
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: getTrackingNumbersQueryKey({
            jobId: state.initialValue.jobId,
          }),
        });
        toast({ title: "Success" });
        dialogProps.onOpenChange?.(false);
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 404:
            if (error.response?.data.errorCode.includes("21303")) {
              form.setError(
                "trackingNumber",
                {
                  message: `${values.trackingNumber} already exists`,
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
          <DialogTitle>Edit TrackingNumber</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="courierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Courier</FormLabel>
                  <FormControl>
                    <CouriersCombobox
                      courierId={field.value}
                      onCourierIdChange={field.onChange}
                      ref={field.ref}
                      modal
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trackingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Tracking Number</FormLabel>
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
              Edit
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
