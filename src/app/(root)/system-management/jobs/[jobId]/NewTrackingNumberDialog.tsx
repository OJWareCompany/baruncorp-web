import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
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
import { useToast } from "@/components/ui/use-toast";
import LoadingButton from "@/components/LoadingButton";
import CouriersCombobox from "@/components/combobox/CouriersCombobox";
import { Input } from "@/components/ui/input";
import usePostTrackingNumberMutation from "@/mutations/usePostTrackingNumberMutation";
import { JobResponseDto } from "@/api/api-spec";
import { getTrackingNumbersQueryKey } from "@/queries/useTrackingNumbersQuery";

const formSchema = z.object({
  courierId: z.string().trim().min(1, { message: "Courier is required" }),
  trackingNumber: z
    .string()
    .trim()
    .min(1, { message: "Tracking Number is required" }),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  job: JobResponseDto;
}

export default function NewTrackingNumberDialog({ job }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutateAsync } = usePostTrackingNumberMutation();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courierId: "",
      trackingNumber: "",
    },
  });

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      jobId: job.id,
      courierId: values.courierId,
      trackingNumber: values.trackingNumber,
    })
      .then(() => {
        form.reset();
        queryClient.invalidateQueries({
          queryKey: getTrackingNumbersQueryKey({ jobId: job.id }),
        });
        toast({ title: "Success" });
        setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className="h-[28px] text-xs px-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Tracking Number
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Tracking Number</DialogTitle>
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
