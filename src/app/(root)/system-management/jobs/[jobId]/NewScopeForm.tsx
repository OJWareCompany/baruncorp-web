import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
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
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scopeId: "",
      description: "",
    },
  });
  const watchScopeId = form.watch("scopeId");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutateAsync } = usePostOrderedServiceMutation();

  useEffect(() => {
    if (isSubmitSuccessful) {
      form.reset();
      setIsSubmitSuccessful(false);
    }
  }, [form, isSubmitSuccessful]);

  async function onSubmit(values: FieldValues) {
    const { scopeId } = values;
    await mutateAsync({
      jobId: job.id,
      serviceId: scopeId,
      description: transformStringIntoNullableString.parse(values.description),
    })
      .then(() => {
        setIsSubmitSuccessful(true);
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
