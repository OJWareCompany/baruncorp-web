"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { ProjectResponseDto } from "@/api/api-spec";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import LoadingButton from "@/components/LoadingButton";
import Minimap from "@/components/Minimap";
import usePatchProjectMutation from "@/mutations/usePatchProjectMutation";
import {
  PropertyTypeEnum,
  capitalizedStateNames,
  postalCodeRegExp,
  transformStringIntoNullableString,
} from "@/lib/constants";
import { getProjectQueryKey } from "@/queries/useProjectQuery";
import { useToast } from "@/components/ui/use-toast";
import UtilitiesCombobox from "@/components/combobox/UtilitiesCombobox";
import { useProfileContext } from "@/app/(root)/ProfileProvider";
import {
  fetchGeocodeFeatures,
  getMapboxPlacesQueryKey,
} from "@/queries/useAddressSearchQuery";

const formSchema = z.object({
  organization: z
    .string()
    .trim()
    .min(1, { message: "Organization is required" }),
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
      if (value.street1.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Street 1 is required",
        });
        return;
      }
      if (value.city.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "City is required",
        });
        return;
      }
      if (value.state.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "State is required",
        });
        return;
      }
      if (value.postalCode.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Postal Code is required",
        });
        return;
      }
      if (!postalCodeRegExp.test(value.postalCode)) {
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

function getFieldValues(project: ProjectResponseDto): FieldValues {
  return {
    organization: project.clientOrganization,
    propertyType: project.propertyType,
    propertyOwner: project.projectPropertyOwnerName ?? "",
    projectNumber: project.projectNumber ?? "",
    address: {
      ...project.propertyAddress,
      street2: project.propertyAddress.street2 ?? "",
      country: project.propertyAddress.country ?? "",
      coordinates:
        project.propertyAddress.coordinates.length === 2
          ? project.propertyAddress.coordinates
          : [0, 0],
    },
    utilityId: project.utilityId ?? "",
  };
}

interface Props {
  project: ProjectResponseDto;
  pageType: JobDetailPageType;
}

export default function ProjectForm({ project, pageType }: Props) {
  const { isBarunCorpMember } = useProfileContext();
  const isHome = pageType === "HOME";

  /**
   * 바른코프 멤버 ✅
   * 바른코프 멤버아닌데, 홈 ❌
   * 바른코프 멤버아닌데, 워크스페이스 ✅
   */
  const isWorker = isBarunCorpMember || !isHome;

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(project),
  });

  const initialStateOrRegion = form.getValues("address.state");
  const statesOrRegionsRef = useRef(
    capitalizedStateNames.includes(initialStateOrRegion)
      ? capitalizedStateNames
      : [initialStateOrRegion, ...capitalizedStateNames]
  );

  const watchState = form.watch("address.state");

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

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutateAsync } = usePatchProjectMutation(project.projectId);

  async function onSubmit(values: FieldValues) {
    if (values.address.fullAddress.length === 0) {
      toast({
        description:
          "Please enter address information with coordinates for the map display",
        variant: "destructive",
      });
      return;
    }

    if (
      values.propertyType !== project.propertyType ||
      values.address.fullAddress !== project.propertyAddress.fullAddress
    ) {
      toast({
        title: "Please wait a minute",
        description: "Moving related folders in Google Drive",
      });
    }

    await mutateAsync({
      projectNumber: transformStringIntoNullableString.parse(
        values.projectNumber
      ),
      projectPropertyOwner: transformStringIntoNullableString.parse(
        values.propertyOwner
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
      .then(() => {
        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getProjectQueryKey(project.projectId),
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

    return addressSearchText;
  };

  useEffect(() => {
    if (project) {
      form.reset(getFieldValues(project));
      const [longitude, latitude] = project.propertyAddress.coordinates;
      setMinimapCoordinates([longitude, latitude]);
    }
  }, [form, project]);

  return (
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
        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Organization</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <RowItemsContainer>
          {isBarunCorpMember ? (
            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Property Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
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
          ) : (
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
                      disabled
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
          )}
          <FormField
            control={form.control}
            name="propertyOwner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Owner</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isWorker} />
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
                  <Input {...field} disabled={!isWorker} />
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
                    {isWorker && (
                      <AddressSearchButton
                        ref={field.ref}
                        format="us"
                        onSelect={(value) => {
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
                    )}
                    <Input
                      value={field.value.street1}
                      disabled={!isWorker}
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
                      disabled={!isWorker}
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
                      disabled={!isWorker}
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
                      disabled={!isWorker}
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
                      disabled={!isWorker}
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
                      disabled={!isWorker}
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
                  disabled={!isWorker}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isWorker && (
          <LoadingButton
            type="submit"
            className="w-full"
            isLoading={form.formState.isSubmitting}
            disabled={!form.formState.isDirty || isAddressFieldFocused}
          >
            {isAddressFieldFocused
              ? "Disabled when editing address field"
              : "Save"}
          </LoadingButton>
        )}
      </form>
    </Form>
  );
}
