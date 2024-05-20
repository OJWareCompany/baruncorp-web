import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import UpdateWetStampInfoForm from "./UpdateWetStampInfoForm";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ServicesCombobox from "@/components/combobox/ServicesCombobox";
import LoadingButton from "@/components/LoadingButton";
import { JobResponseDto } from "@/api/api-spec";
import usePostOrderedServiceMutation from "@/mutations/usePostOrderedServiceMutation";
import {
  ELECTRICAL_WET_STAMP_SERVICE_ID,
  OTHER_SERVICE_ID,
  STRUCTURAL_WET_STAMP_SERVICE_ID,
  transformStringIntoNullableString,
} from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { getJobQueryKey } from "@/queries/useJobQuery";
import { getProjectQueryKey } from "@/queries/useProjectQuery";

const formSchema = z
  .object({
    scopeId: z.string().trim().min(1, { message: "Scope is required" }),
    description: z.string().trim(),
    isRevision: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const { scopeId, description } = values;
    if (scopeId === OTHER_SERVICE_ID && description.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Description is required",
        path: ["description"],
      });
    }
  });

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  job: JobResponseDto;
  onSuccessWithoutWetStamp: () => void;
  onSuccess: () => void;
}

export default function NewScopeForm({
  job,
  onSuccessWithoutWetStamp,
  onSuccess,
}: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scopeId: "",
      description: "",
      isRevision: false,
    },
  });
  const watchScopeId = form.watch("scopeId");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const usePostOrderedServiceMutationResult = usePostOrderedServiceMutation();

  useEffect(() => {
    if (
      form.formState.isSubmitSuccessful &&
      usePostOrderedServiceMutationResult.isSuccess
    ) {
      form.reset();
    }
  }, [
    form,
    form.formState.isSubmitSuccessful,
    usePostOrderedServiceMutationResult.isSuccess,
  ]);

  async function onSubmit(values: FieldValues) {
    const { scopeId } = values;
    try {
      await usePostOrderedServiceMutationResult.mutateAsync({
        jobId: job.id,
        serviceId: scopeId,
        description: transformStringIntoNullableString.parse(
          values.description
        ),
        isRevision: values.isRevision,
      });

      queryClient.invalidateQueries({ queryKey: getJobQueryKey(job.id) });
      queryClient.invalidateQueries({
        queryKey: getProjectQueryKey(job.projectId),
      });

      toast({ title: "Success" });
      onSuccessWithoutWetStamp();
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast({
          title: error.response.data.message,
          variant: "destructive",
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="scopeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Scope</FormLabel>
              <FormControl>
                <ServicesCombobox
                  serviceId={field.value}
                  onServiceIdChange={field.onChange}
                  ref={field.ref}
                  modal
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchScopeId === OTHER_SERVICE_ID && (
          <>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isRevision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Is Revision</FormLabel>
                  <Select
                    required
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("isRevision", value === "Is Revision");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Status for Other Scope" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Is Revision">Revision</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        {watchScopeId !== STRUCTURAL_WET_STAMP_SERVICE_ID &&
          watchScopeId !== ELECTRICAL_WET_STAMP_SERVICE_ID && (
            <LoadingButton
              type="submit"
              isLoading={form.formState.isSubmitting}
              disabled={!form.formState.isDirty}
              className="w-full"
            >
              Submit
            </LoadingButton>
          )}
      </form>
      {(watchScopeId === STRUCTURAL_WET_STAMP_SERVICE_ID ||
        watchScopeId === ELECTRICAL_WET_STAMP_SERVICE_ID) && (
        <UpdateWetStampInfoForm
          job={job}
          onSuccess={onSuccess}
          scopeId={form.getValues("scopeId")}
          description={form.getValues("description")}
          isRevision={form.getValues("isRevision")}
        />
      )}
    </Form>
  );
}
