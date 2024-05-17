"use client";
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
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import usePostCourierMutation from "@/mutations/usePostCourierMutation";
import { getCouriersQueryKey } from "@/queries/useCouriersQuery";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  trackingNumberUrlPermalink: z
    .string()
    .trim()
    .min(1, { message: "Tracking Number URL Permalink is required" })
    .url({ message: "Tracking Number URL Permalink should be a URL" }),
});

type FieldValues = z.infer<typeof formSchema>;

export default function NewCourierDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutateAsync } = usePostCourierMutation();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      trackingNumberUrlPermalink: "",
    },
  });

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset();
    }
  }, [form, form.formState.isSubmitSuccessful]);

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      name: values.name,
      urlParam: values.trackingNumberUrlPermalink,
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: getCouriersQueryKey({}),
        });
        toast({ title: "Success" });
        setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className="text-white bg-slate-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Courier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Courier</DialogTitle>
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
