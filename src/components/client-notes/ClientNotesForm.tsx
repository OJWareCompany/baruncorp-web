import { zodResolver } from "@hookform/resolvers/zod";
import { Value } from "@udecode/plate-common";
import { DefaultValues, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useToast } from "../ui/use-toast";
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
import { ClientNoteDetail, ClientNoteDetailResponseDto } from "@/api/api-spec";
import {
  getEditorValue,
  transformEditorValueToStringOrNull,
} from "@/lib/plate-utils";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import usePatchClientNoteMutation from "@/mutations/usePatchClientNoteMutation";
import { getClientNoteHistoriesQueryKey } from "@/queries/useClientNoteHistoriesQuery";

const formSchema = z.object({
  designNotes: z.custom<Value>(),
  electricalEngineeringNotes: z.custom<Value>(),
  structuralEngineeringNotes: z.custom<Value>(),
});

type FieldValues = z.infer<typeof formSchema>;

function getFieldValues(note: ClientNoteDetail): FieldValues {
  return {
    designNotes: getEditorValue(note.designNotes),
    electricalEngineeringNotes: getEditorValue(note.electricalEngineeringNotes),
    structuralEngineeringNotes: getEditorValue(note.structuralEngineeringNotes),
  };
}

interface Props {
  clientNote: ClientNoteDetailResponseDto;
  organizationId: string;
}

export default function ClientNotesForm({ clientNote, organizationId }: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(
      clientNote.afterModificationDetail
    ) as DefaultValues<FieldValues>, // editor value의 deep partial 문제로 typescript가 error를 발생시키나, 실제로는 문제 없음
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutateAsync } = usePatchClientNoteMutation(organizationId);

  useEffect(() => {
    form.reset(getFieldValues(clientNote.afterModificationDetail));
  }, [clientNote.afterModificationDetail, form]);

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      designNotes: transformEditorValueToStringOrNull(values.designNotes) ?? "",
      electricalEngineeringNotes:
        transformEditorValueToStringOrNull(values.electricalEngineeringNotes) ??
        "",
      structuralEngineeringNotes:
        transformEditorValueToStringOrNull(values.structuralEngineeringNotes) ??
        "",
    })
      .then(() => {
        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getClientNoteHistoriesQueryKey({ organizationId }),
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
        <Item>
          <Label>Organization</Label>
          <Input value={clientNote.organizationName} disabled />
        </Item>
        <FormField
          control={form.control}
          name="designNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Design Notes</FormLabel>
              <FormControl>
                <BasicEditor value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="electricalEngineeringNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Electrical Engineering Notes</FormLabel>
              <FormControl>
                <BasicEditor value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="structuralEngineeringNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Structural Engineering Notes</FormLabel>
              <FormControl>
                <BasicEditor value={field.value} onChange={field.onChange} />
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
          Save
        </LoadingButton>
      </form>
    </Form>
  );
}
