import React, { useEffect, useRef, useState } from "react";
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
import {
  fetchGeocodeFeatures,
  getMapboxPlacesQueryKey,
} from "@/queries/useAddressSearchQuery";
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
import {
  capitalizedStateNames,
  digitRegExp,
  transformNullishStringIntoString,
  transformStringIntoNullableString,
} from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { getJobQueryKey } from "@/queries/useJobQuery";
import Minimap from "@/components/Minimap";
import AddressSearchButton from "@/components/AddressSearchButton";
import usePatchJobMutation from "@/mutations/usePatchJobMutation";
import RowItemsContainer from "@/components/RowItemsContainer";
import usePostOrderedServiceMutation from "@/mutations/usePostOrderedServiceMutation";
import { getProjectQueryKey } from "@/queries/useProjectQuery";
import { getFullAddressByAddressFields } from "@/lib/utils";

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
    if (mailingAddress.street1.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Street 1 is required",
        path: [`mailingAddress`],
      });
      return;
    }
    if (mailingAddress.city.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "City is required",
        path: [`mailingAddress`],
      });
      return;
    }
    if (mailingAddress.state.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "State is required",
        path: [`mailingAddress`],
      });
      return;
    }
    if (mailingAddress.postalCode.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Postal Code is required",
        path: [`mailingAddress`],
      });
      return;
    }
    /**
     * @todo
     * fullAddress에 대한 검증 하지 않고, onSubmit에서 요청 보내는 것으로
     * 왜냐하면 여기서 검증 시켜 버리면 onSubmit까지 가지도 못함
     */
    if (mailingAddress.fullAddress.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mailing Address is required",
        path: [`mailingAddress`],
      });
    }
  });

type FieldValues = z.infer<typeof formSchema>;
type AddressTextField = Pick<
  FieldValues["mailingAddress"],
  "street1" | "street2" | "city" | "state" | "postalCode" | "country"
>;

function getFieldValues(job: JobResponseDto): FieldValues {
  return {
    numberOfWetStamp: transformNullishStringIntoString.parse(
      job.numberOfWetStamp
    ),
    mailingAddress: {
      city: job.mailingAddressForWetStamp?.city ?? "",
      // coordinates: job.mailingAddressForWetStamp?.coordinates ?? [],
      coordinates:
        !job.mailingAddressForWetStamp?.coordinates ||
        (job.mailingAddressForWetStamp?.coordinates &&
          job.mailingAddressForWetStamp?.coordinates.length !== 2)
          ? [0, 0]
          : job.mailingAddressForWetStamp?.coordinates,
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
  scopeId: string;
  description: string | null;
  isRevision: boolean;
  onSuccess: () => void;
}

export default function UpdateWetStampInfoForm({
  job,
  onSuccess,
  scopeId,
  description,
  isRevision,
}: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(job),
  });
  const statesOrRegionsRef = useRef(capitalizedStateNames);
  const [minimapCoordinates, setMinimapCoordinates] = useState<
    [number, number]
  >([0, 0]);

  const isAddressFieldFocusedRef = useRef(false);
  const handleFocusAddressField = () =>
    (isAddressFieldFocusedRef.current = true);
  const handleBlurAddressField = async () => {
    isAddressFieldFocusedRef.current = false;
    updateAddressFormCoordinatesFromGeocode();
  };

  const updateAddressFormCoordinatesFromGeocode = async () => {
    const geocodeFeatures = await queryClient.fetchQuery({
      queryKey: getMapboxPlacesQueryKey(generateAddressSearchText()),
      queryFn: fetchGeocodeFeatures,
    });
    if (geocodeFeatures && geocodeFeatures.length > 0) {
      /**
       * @TODO Delete
       */
      console.log(
        `geocodeFeatures.coordinates: ${JSON.stringify(
          geocodeFeatures.map((item: any) => {
            return { id: item.id, coordi: item.geometry.coordinates };
          }),
          null,
          2
        )}`
      );
      const [longitude, latitude] = geocodeFeatures[0].geometry.coordinates;
      updateAddressCoordinates([longitude, latitude]);
      form.setValue(
        "mailingAddress.fullAddress",
        geocodeFeatures[0].place_name
      );
    }

    if (!geocodeFeatures || geocodeFeatures.length === 0) {
      updateAddressCoordinates([0, 0]);
      form.setValue("mailingAddress.fullAddress", "");
    }
  };

  const updateAddressCoordinates = (
    coordinates: [longitude: number, latitude: number]
  ) => {
    form.setValue("mailingAddress.coordinates", coordinates);
    setMinimapCoordinates(coordinates);
  };

  // const handleFormKeyDown = async (
  //   event: React.KeyboardEvent<HTMLFormElement>
  // ) => {
  //   if (event.key === "Enter" && isAddressFieldFocusedRef.current) {
  //     event.preventDefault();
  //     updateAddressFormCoordinatesFromGeocode();
  //   }
  // };

  const generateAddressSearchText = () => {
    const addressFields: Array<keyof AddressTextField> = [
      "street1",
      "street2",
      "city",
      "state",
      "postalCode",
      "country",
    ];

    const addressSearchText = addressFields
      .map((field) => form.getValues(`mailingAddress.${field}`)?.trim())
      .filter(Boolean)
      .join(" ");

    /**
     * @Delete Delete
     */
    console.log(`Generated SearchText: ${addressSearchText}`);

    return addressSearchText;
  };

  const { mutateAsync: patchJobMutateAsync } = usePatchJobMutation(job.id);
  const usePostOrderedServiceMutationResult = usePostOrderedServiceMutation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    form.reset(getFieldValues(job));
  }, [job, form]);

  async function onSubmit(values: FieldValues) {
    try {
      await patchJobMutateAsync({
        additionalInformationFromClient: job.additionalInformationFromClient,
        clientUserId: job.clientInfo.clientUserId,
        deliverablesEmails: job.clientInfo.deliverablesEmails,
        systemSize: job.systemSize,
        numberOfWetStamp: Number(values.numberOfWetStamp),
        // mailingAddressForWetStamp: values.mailingAddress,
        mailingAddressForWetStamp: {
          ...values.mailingAddress,
          fullAddress:
            values.mailingAddress.fullAddress === ""
              ? getFullAddressByAddressFields({
                  street1: values.mailingAddress.street1,
                  city: values.mailingAddress.city,
                  state: values.mailingAddress.state,
                  postalCode: values.mailingAddress.postalCode,
                  country: values.mailingAddress.country,
                })
              : values.mailingAddress.fullAddress,
        },
        isExpedited: job.isExpedited,
        inReview: job.inReview,
        priority: job.priority,
        structuralUpgradeNote: job.structuralUpgradeNote,
        loadCalcOrigin: job.loadCalcOrigin,
        mountingType: job.mountingType,
      });

      await usePostOrderedServiceMutationResult.mutateAsync({
        jobId: job.id,
        serviceId: scopeId,
        description: transformStringIntoNullableString.parse(description),
        isRevision: isRevision,
      });

      queryClient.invalidateQueries({ queryKey: getJobQueryKey(job.id) });
      queryClient.invalidateQueries({
        queryKey: getProjectQueryKey(job.projectId),
      });

      toast({ title: "Success" });
      onSuccess();
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (
          error.response.status === 400 &&
          error.response.data.errorCode.includes("40004")
        ) {
          form.setError("numberOfWetStamp", {
            message: "Number of Wet Stamp should be less than 256",
          });
        } else {
          toast({
            title: error.response.data.message,
            variant: "destructive",
          });
        }
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="numberOfWetStamp"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Number of Wet Stamp</FormLabel>
              <FormControl>
                <Input
                  required
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

                        /**
                         * 이 onSelect 이벤트 콜백이 호출되는 경우의 address.fullAddress는 AddressSearchButton 컴포넌트 내부에서 초기화 된다
                         */
                        const [longitude, latitude] = value.coordinates;
                        updateAddressCoordinates([longitude, latitude]);
                      }}
                    />
                    <Input
                      value={field.value.street1}
                      // disabled
                      onChange={(event) => {
                        field.onChange({
                          ...field.value,
                          street1: event.target.value,
                        });
                      }}
                      onFocus={handleFocusAddressField}
                      onBlur={handleBlurAddressField}
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
                      onFocus={handleFocusAddressField}
                      onBlur={handleBlurAddressField}
                      placeholder="Street 2"
                    />
                    <Input
                      value={field.value.city}
                      // disabled
                      onChange={(event) => {
                        field.onChange({
                          ...field.value,
                          city: event.target.value,
                        });
                      }}
                      onFocus={handleFocusAddressField}
                      onBlur={handleBlurAddressField}
                      placeholder="City"
                    />
                    {/* <Input
                      value={field.value.state}
                      disabled
                      placeholder="State Or Region"
                    /> */}
                    <Select
                      value={field.value.state}
                      onValueChange={(value) => {
                        field.onChange({
                          ...field.value,
                          state: value,
                        });
                        handleBlurAddressField();
                      }}
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue
                          placeholder={"Select an state or region"}
                        />
                      </SelectTrigger>
                      <SelectContent
                        side="bottom"
                        className="max-h-48 overflow-y-auto"
                      >
                        {statesOrRegionsRef.current.map((state) => (
                          <SelectItem key={state} value={`${state}`}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={field.value.postalCode}
                      // disabled
                      onChange={(event) => {
                        field.onChange({
                          ...field.value,
                          postalCode: event.target.value,
                        });
                      }}
                      onFocus={handleFocusAddressField}
                      onBlur={handleBlurAddressField}
                      placeholder="Postal Code"
                    />
                    <Input
                      value={field.value.country}
                      // disabled
                      onChange={(event) => {
                        field.onChange({
                          ...field.value,
                          country: event.target.value,
                        });
                      }}
                      onFocus={handleFocusAddressField}
                      onBlur={handleBlurAddressField}
                      placeholder="Country"
                    />
                  </FormItem>
                </div>
                <div className="col-span-1">
                  <Minimap
                    longitude={minimapCoordinates[0]}
                    latitude={minimapCoordinates[1]}
                  />
                </div>
              </div>
              <FormMessage className="mt-2" />
            </div>
          )}
        />
        <RowItemsContainer>
          <LoadingButton
            type="submit"
            isLoading={form.formState.isSubmitting}
            disabled={!form.formState.isDirty}
          >
            Submit
          </LoadingButton>
        </RowItemsContainer>
      </form>
    </Form>
  );
}
