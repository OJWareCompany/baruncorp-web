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
    if (scopeId !== OTHER_SERVICE_ID) {
      return;
    }

    if (description.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Description is required",
        path: [`description`],
      });
    }
  });

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  job: JobResponseDto;
  onSuccessWithWetStamp: () => void;
  onSuccessWithoutWetStamp: () => void;
}

export default function NewScopeForm({
  job,
  onSuccessWithWetStamp,
  onSuccessWithoutWetStamp,
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
    await usePostOrderedServiceMutationResult
      .mutateAsync({
        jobId: job.id,
        serviceId: scopeId,
        description: transformStringIntoNullableString.parse(
          values.description
        ),
        isRevision: values.isRevision,
      })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: getJobQueryKey(job.id) });
        queryClient.invalidateQueries({
          queryKey: getProjectQueryKey(job.projectId),
        });
        toast({
          title: "Success",
        });

        if (
          scopeId === STRUCTURAL_WET_STAMP_SERVICE_ID ||
          scopeId === ELECTRICAL_WET_STAMP_SERVICE_ID
        ) {
          onSuccessWithWetStamp();
          return;
        }

        onSuccessWithoutWetStamp();
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
                  // filteringIds={job.orderedServices.map(
                  //   (value) => value.serviceId
                  // )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchScopeId === OTHER_SERVICE_ID && (
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
        )}
        {watchScopeId === OTHER_SERVICE_ID && (
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
                    if (value === "Is Revision") {
                      form.setValue("isRevision", true);
                    } else if (value === "New") {
                      form.setValue("isRevision", false);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Status for Other Scope" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Is Revision">Is Revision</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <LoadingButton
          type="submit"
          isLoading={form.formState.isSubmitting}
          className="w-full"
        >
          Submit
        </LoadingButton>
      </form>
    </Form>
  );
}
