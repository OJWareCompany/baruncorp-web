"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Value } from "@udecode/plate-common";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import States from "@/components/States";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import LoadingButton from "@/components/LoadingButton";
import BasicEditor from "@/components/editor/BasicEditor";
import { Input } from "@/components/ui/input";
import usePostUtilityMutation from "@/mutations/usePostUtilityMutation";
import { getUtilitiesQueryKey } from "@/queries/useUtilitiesQuery";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  states: z.string().array().min(1, { message: "States is required" }),
  notes: z.custom<Value>(),
});

type FieldValues = z.infer<typeof formSchema>;

export default function NewUtilitySheet() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      states: [],
      notes: [
        {
          type: "p",
          children: [{ text: "" }],
        },
      ],
    },
  });

  const { mutateAsync } = usePostUtilityMutation();

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      name: values.name,
      stateAbbreviations: values.states,
      notes: JSON.stringify(values.notes),
    })
      .then(() => {
        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getUtilitiesQueryKey({}),
        });
        setOpen(false);
        form.reset();
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        // TODO: 이름 중복 예외 처리
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <Plus className="mr-2 h-4 w-4" />
          New Utility
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New Utility</SheetTitle>
        </SheetHeader>
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
              name="states"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>States</FormLabel>
                  <FormControl>
                    <States
                      abbreviations={field.value}
                      onAbbreviationsChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <BasicEditor {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton
              type="submit"
              className="w-full"
              isLoading={form.formState.isSubmitting}
            >
              Submit
            </LoadingButton>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
