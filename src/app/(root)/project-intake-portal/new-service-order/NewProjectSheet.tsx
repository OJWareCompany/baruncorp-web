"use client";
import * as z from "zod";
import { DefaultValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { DialogProps } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RowItemsContainer from "@/components/RowItemsContainer";
import AddressSearchButton from "@/components/AddressSearchButton";
import Minimap from "@/components/Minimap";
import usePostProjectMutation from "@/mutations/usePostProjectMutation";
import {
  PropertyTypeEnum,
  capitalizedStateNames,
  postalCodeRegExp,
  transformStringIntoNullableString,
} from "@/lib/constants";
import LoadingButton from "@/components/LoadingButton";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import { useToast } from "@/components/ui/use-toast";
import { getProjectsQueryKey } from "@/queries/useProjectsQuery";
import UtilitiesCombobox from "@/components/combobox/UtilitiesCombobox";
import {
  fetchGeocodeFeatures,
  getMapboxPlacesQueryKey,
} from "@/queries/useAddressSearchQuery";

const formSchema = z.object({
  propertyType: PropertyTypeEnum,
  propertyOwner: z.string().trim(),
  projectNumber: z.string().trim(),
  address: z
    .object({
      street1: z.string().trim(),
      street2: z.string().trim(),
      city: z.string().trim(),
      state: z.string().trim(),
      postalCode: z.string().trim(),
      country: z.string().trim(),
      fullAddress: z.string().trim(),
      coordinates: z.array(z.number()),
    })
    .superRefine((value, ctx) => {
      const address = value;
      if (address.street1.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Street 1 is required",
        });
        return;
      }
      if (address.city.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "City is required",
        });
        return;
      }
      if (address.state.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "State is required",
        });
        return;
      }
      if (address.postalCode.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Postal code is required",
        });
        return;
      }
      if (!postalCodeRegExp.test(address.postalCode)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Invalid postal code format. Postal code should be in the format XXXXX or XXXXX-XXXX",
        });
        return;
      }
    }),
  utilityId: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;
type AddressTextField = Pick<
  FieldValues["address"],
  "street1" | "street2" | "city" | "state" | "postalCode" | "country"
>;

const defaultValues: DefaultValues<FieldValues> = {
  propertyType: "Residential",
  propertyOwner: "",
  projectNumber: "",
  address: {
    street1: "",
    street2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    fullAddress: "",
    coordinates: [0, 0],
  },
  utilityId: "",
};

interface Props extends DialogProps {
  organizationId: string;
  onProjectIdChange: (newProjectId: string) => void;
}

// TODO: 주소 수정은 언제 가능해야 하는지? 주소는 중요한 키라서 수정하도록 하는 것은 영향이 끼칠 수 있다. draggable?
export default function NewProjectSheet({
  organizationId,
  onProjectIdChange,
  ...dialogProps
}: Props) {
  const { toast } = useToast();
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const usePostProjectMutationResult = usePostProjectMutation();
  const queryClient = useQueryClient();
  const { data: organization } = useOrganizationQuery(organizationId);

  const watchState = form.watch("address.state");

  const statesOrRegionsRef = useRef(capitalizedStateNames);

  const [minimapCoordinates, setMinimapCoordinates] = useState<
    [number, number]
  >([0, 0]);

  const [isAddressFieldFocused, setIsAddressFieldFocused] = useState(false);
  const handleFocusAddressField = () => setIsAddressFieldFocused(true);
  const handleBlurAddressField = async () => {
    setIsAddressFieldFocused(false);
    updateAddressFormCoordinatesFromGeocode();
  };
  const handleOnOpenChangeAddressSelect = (open: boolean) => {
    if (open) {
      handleFocusAddressField();
    } else {
      handleBlurAddressField();
    }
  };

  useEffect(() => {
    if (organization && organization.projectPropertyTypeDefaultValue) {
      form.reset({
        ...defaultValues,
        propertyType: organization.projectPropertyTypeDefaultValue as z.infer<
          typeof PropertyTypeEnum
        >,
      });
    }
  }, [form, organization]);

  useEffect(() => {
    form.reset();
  }, [form, organizationId]);

  useEffect(() => {
    if (
      form.formState.isSubmitSuccessful &&
      usePostProjectMutationResult.isSuccess
    ) {
      form.reset();
    }
  }, [
    form,
    form.formState.isSubmitSuccessful,
    usePostProjectMutationResult.isSuccess,
  ]);

  async function onSubmit(values: FieldValues) {
    if (values.address.fullAddress.length === 0) {
      toast({
        description:
          "Please enter address information with coordinates for the map display",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Please wait a minute",
      description: "Creating related folders in Google Drive",
    });
    await usePostProjectMutationResult
      .mutateAsync({
        clientOrganizationId: organizationId,
        projectPropertyOwner: transformStringIntoNullableString.parse(
          values.propertyOwner
        ),
        projectNumber: transformStringIntoNullableString.parse(
          values.projectNumber
        ),
        projectPropertyType: values.propertyType,
        projectPropertyAddress: {
          ...values.address,
          country: transformStringIntoNullableString.parse(
            values.address.country
          ),
          state: values.address.state,
          street2: transformStringIntoNullableString.parse(
            values.address.street2
          ),
        },
        utilityId: values.utilityId === "" ? undefined : values.utilityId,
      })
      .then(async ({ id }) => {
        toast({
          title: "Success",
        });
        dialogProps.onOpenChange?.(false);
        onProjectIdChange(id);
        queryClient.invalidateQueries({
          queryKey: getProjectsQueryKey({
            organizationId: organizationId,
            limit: Number.MAX_SAFE_INTEGER,
          }),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 409:
            if (error.response?.data.errorCode.includes("30002")) {
              form.setError(
                "address",
                {
                  message: `${values.address.fullAddress} already exists`,
                },
                { shouldFocus: true }
              );
              return;
            }

            if (error.response?.data.errorCode.includes("30003")) {
              form.setError(
                "projectNumber",
                {
                  message: `${values.projectNumber} already exists`,
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
      form.setValue("address.fullAddress", geocodeFeatures[0].place_name);
    }

    if (!geocodeFeatures || geocodeFeatures.length === 0) {
      updateAddressCoordinates([0, 0]);
      form.setValue("address.fullAddress", "");
    }
  };

  const updateAddressCoordinates = (
    coordinates: [longitude: number, latitude: number]
  ) => {
    form.setValue("address.coordinates", coordinates);
    setMinimapCoordinates(coordinates);
  };

  const handleFormKeyDown = async (
    event: React.KeyboardEvent<HTMLFormElement>
  ) => {
    if (event.key === "Enter" && isAddressFieldFocused) {
      event.preventDefault();
      updateAddressFormCoordinatesFromGeocode();
    }
  };

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
      .map((field) => form.getValues(`address.${field}`)?.trim())
      .filter(Boolean)
      .join(" ");

    /**
     * @Delete Delete
     */
    console.log(`Generated SearchText: ${addressSearchText}`);

    return addressSearchText;
  };

  return (
    <Sheet {...dialogProps}>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New Project</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            // onSubmit={(event) => {
            //   event.preventDefault();
            //   form.handleSubmit(onSubmit)(event);
            // }}
            onKeyDown={handleFormKeyDown}
            className="space-y-4"
          >
            <RowItemsContainer>
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Property Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger ref={field.ref}>
                          <SelectValue placeholder="Select a property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {PropertyTypeEnum.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="propertyOwner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Owner</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </RowItemsContainer>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-2">
                      <FormItem>
                        <FormLabel required>Address</FormLabel>
                        <AddressSearchButton
                          ref={field.ref}
                          format="us"
                          onSelect={(value) => {
                            if (
                              value.state !== form.getValues("address.state")
                            ) {
                              form.setValue("utilityId", "");
                            }

                            form.setValue(
                              "address",
                              {
                                ...value,
                                street2: "",
                              },
                              { shouldValidate: true, shouldDirty: true }
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
                        <Select
                          value={field.value.state}
                          onValueChange={(value) => {
                            field.onChange({
                              ...field.value,
                              state: value,
                            });
                          }}
                          onOpenChange={handleOnOpenChangeAddressSelect}
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
            <FormField
              control={form.control}
              name="utilityId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Utility</FormLabel>
                  <FormControl>
                    <UtilitiesCombobox
                      utilityId={field.value}
                      onUtilityIdChange={field.onChange}
                      state={watchState}
                      ref={field.ref}
                      modal
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton
              type="submit"
              className="w-full"
              isLoading={form.formState.isSubmitting}
              disabled={isAddressFieldFocused}
            >
              {isAddressFieldFocused
                ? "Disabled when editing address field"
                : "Submit"}
            </LoadingButton>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
