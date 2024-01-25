"use client";
import { Pencil } from "lucide-react";
import { DefaultValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Value } from "@udecode/plate-common";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import LoadingButton from "@/components/LoadingButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import BasicEditor from "@/components/editor/BasicEditor";
import { isEditorValueEmpty } from "@/lib/plate-utils";
import usePostInformationMutation from "@/mutations/usePostInformationMutation";
import { getInformationsQueryKey } from "@/queries/useInformationsQuery";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  information: z
    .custom<Value>()
    .refine((value) => !isEditorValueEmpty(value), "Information is required"),
});

type FieldValues = z.infer<typeof formSchema>;

const getFieldValues = (information: Value): FieldValues => {
  return {
    information,
  };
};

interface Props {
  information: Value;
}

export default function EditDialog({ information }: Props) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(information) as DefaultValues<FieldValues>, // editor value의 deep partial 문제로 typescript가 error를 발생시키나, 실제로는 문제 없음
  });

  const queryClient = useQueryClient();

  const { mutateAsync } = usePostInformationMutation();

  async function onSubmit(values: FieldValues) {
    await mutateAsync({ contents: JSON.stringify(values.information) })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: getInformationsQueryKey({ limit: 1 }),
        });
        setOpen(false);
        toast({ title: "Success" });
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

  useEffect(() => {
    form.reset(getFieldValues(information));
  }, [form, information]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Pencil className="w-4 h-4 cursor-pointer" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Information</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="min-w-0 space-y-4"
          >
            <FormField
              control={form.control}
              name="information"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <BasicEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton
              type="submit"
              className="w-full"
              disabled={!form.formState.isDirty}
              isLoading={form.formState.isSubmitting}
            >
              Edit
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
