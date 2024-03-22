import React, { useEffect } from "react";
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
import LoadingButton from "@/components/LoadingButton";
import { JobResponseDto } from "@/api/api-spec";
import { digitRegExp, transformNullishStringIntoString } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { getJobQueryKey } from "@/queries/useJobQuery";
import Minimap from "@/components/Minimap";
import AddressSearchButton from "@/components/AddressSearchButton";
import usePatchJobMutation from "@/mutations/usePatchJobMutation";
import RowItemsContainer from "@/components/RowItemsContainer";
import { Button } from "@/components/ui/button";

const formSchema = z
  .object({
    numberOfWetStamp: z
      .string()
      .trim()
      .min(1, { message: "Number of Wet Stamp is required" }),
    mailingAddress: z.object({
      street1: z.string().trim(),
      street2: z.string().trim(),
      city: z.string().trim(),
      state: z.string().trim(),
      postalCode: z.string().trim(),
      country: z.string().trim(),
      fullAddress: z.string().trim(),
      coordinates: z.array(z.number()),
    }),
  })
  .superRefine((values, ctx) => {
    const { mailingAddress } = values;
    if (mailingAddress.fullAddress.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mailing Address is required",
        path: [`mailingAddress`],
      });
    }
  });

type FieldValues = z.infer<typeof formSchema>;

function getFieldValues(job: JobResponseDto): FieldValues {
  return {
    numberOfWetStamp: transformNullishStringIntoString.parse(
      job.numberOfWetStamp
    ),
    mailingAddress: {
      city: job.mailingAddressForWetStamp?.city ?? "",
      coordinates: job.mailingAddressForWetStamp?.coordinates ?? [],
      country: job.mailingAddressForWetStamp?.country ?? "",
      fullAddress: job.mailingAddressForWetStamp?.fullAddress ?? "",
      postalCode: job.mailingAddressForWetStamp?.postalCode ?? "",
      state: job.mailingAddressForWetStamp?.state ?? "",
      street1: job.mailingAddressForWetStamp?.street1 ?? "",
      street2: job.mailingAddressForWetStamp?.street2 ?? "",
    },
  };
}

interface Props {
  job: JobResponseDto;
  onSuccess: () => void;
}

export default function UpdateWetStampInfoForm({ job, onSuccess }: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(job),
  });

  const { mutateAsync: patchJobMutateAsync } = usePatchJobMutation(job.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    form.reset(getFieldValues(job));
  }, [job, form]);

  async function onSubmit(values: FieldValues) {
    await patchJobMutateAsync({
      additionalInformationFromClient: job.additionalInformationFromClient,
      clientUserId: job.clientInfo.clientUserId,
      deliverablesEmails: job.clientInfo.deliverablesEmails,
      systemSize: job.systemSize,
      numberOfWetStamp: Number(values.numberOfWetStamp),
      mailingAddressForWetStamp: values.mailingAddress,
      isExpedited: job.isExpedited,
      dueDate: job.dueDate,
      inReview: job.inReview,
      priority: job.priority,
      structuralUpgradeNote: job.structuralUpgradeNote,
      loadCalcOrigin: job.loadCalcOrigin,
      mountingType: job.mountingType,
    })
      .then(() => {
        onSuccess();
        toast({
          title: "Success",
        });
        queryClient.invalidateQueries({
          queryKey: getJobQueryKey(job.id),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 400:
            if (error.response?.data.errorCode.includes("40004")) {
              form.setError(
                "numberOfWetStamp",
                {
                  message: `Number of Wet Stamp should be less than 256`,
                },
                { shouldFocus: true }
              );
              return;
            }

          // if (error.response?.data.errorCode.includes("40006")) {
          //   toast({
          //     title: "Completed jobs cannot be modified",
          //     variant: "destructive",
          //   });
          //   return;
          // }

          // if (error.response?.data.errorCode.includes("40002")) {
          //   toast({
          //     title: "Job cannot be updated after invoice is issued",
          //     variant: "destructive",
          //   });
          //   return;
          // }
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="numberOfWetStamp"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Number of Wet Stamp</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(event) => {
                    const { value } = event.target;
                    if (value === "" || digitRegExp.test(value)) {
                      field.onChange(event);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mailingAddress"
          render={({ field }) => (
            <div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-2">
                  <FormItem>
                    <FormLabel required>Mailing Address</FormLabel>
                    <AddressSearchButton
                      ref={field.ref}
                      format="us"
                      onSelect={(value) => {
                        form.setValue(
                          "mailingAddress",
                          {
                            ...value,
                            street2: "",
                          },
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                          }
                        );
                      }}
                    />
                    <Input
                      value={field.value.street1}
                      disabled
                      placeholder="Street 1"
                    />
                    <Input
                      value={field.value.street2}
                      onChange={(event) => {
                        field.onChange({
                          ...field.value,
                          street2: event.target.value,
                        });
                      }}
                      placeholder="Street 2"
                    />
                    <Input
                      value={field.value.city}
                      disabled
                      placeholder="City"
                    />
                    <Input
                      value={field.value.state}
                      disabled
                      placeholder="State Or Region"
                    />
                    <Input
                      value={field.value.postalCode}
                      disabled
                      placeholder="Postal Code"
                    />
                    <Input
                      value={field.value.country}
                      disabled
                      placeholder="Country"
                    />
                  </FormItem>
                </div>
                <div className="col-span-1">
                  <Minimap
                    longitude={field.value.coordinates[0]}
                    latitude={field.value.coordinates[1]}
                  />
                </div>
              </div>
              <FormMessage className="mt-2" />
            </div>
          )}
        />
        <RowItemsContainer>
          <Button
            variant={"outline"}
            onClick={() => {
              onSuccess();
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            isLoading={form.formState.isSubmitting}
            disabled={!form.formState.isDirty}
          >
            Save
          </LoadingButton>
        </RowItemsContainer>
      </form>
    </Form>
  );
}
