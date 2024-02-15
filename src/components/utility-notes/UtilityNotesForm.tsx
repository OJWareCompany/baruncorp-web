import { zodResolver } from "@hookform/resolvers/zod";
import { Value } from "@udecode/plate-common";
import { DefaultValues, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useToast } from "../ui/use-toast";
import States from "../States";
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
import { UtilityResponseDto } from "@/api/api-spec";
import { getEditorValue } from "@/lib/plate-utils";
import { Input } from "@/components/ui/input";
import usePatchUtilityNoteMutation from "@/mutations/usePatchUtilityNoteMutation";
import { getUtilityQueryKey } from "@/queries/useUtilityQuery";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  states: z.string().array().min(1, { message: "States is required" }),
  notes: z.custom<Value>(),
});

type FieldValues = z.infer<typeof formSchema>;

function getFieldValues(utility: UtilityResponseDto): FieldValues {
  return {
    name: utility.name,
    states: utility.stateAbbreviations,
    notes: getEditorValue(utility.notes),
  };
}

interface Props {
  utility: UtilityResponseDto;
}

export default function UtilityNotesForm({ utility }: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(utility) as DefaultValues<FieldValues>, // editor value의 deep partial 문제로 typescript가 error를 발생시키나, 실제로는 문제 없음
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutateAsync } = usePatchUtilityNoteMutation(utility.id);

  useEffect(() => {
    form.reset(getFieldValues(utility));
  }, [form, utility]);

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      name: values.name,
      stateAbbreviations: values.states,
      notes: JSON.stringify(values.notes),
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: getUtilityQueryKey(utility.id),
        });
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

  return (
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
          disabled={!form.formState.isDirty}
          isLoading={form.formState.isSubmitting}
        >
          Edit
        </LoadingButton>
      </form>
    </Form>
  );
}
