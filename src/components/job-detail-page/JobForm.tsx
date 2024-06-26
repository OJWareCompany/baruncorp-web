import React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DefaultValues, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Info, X } from "lucide-react";
import { Value } from "@udecode/plate-common";
import { formatInTimeZone } from "date-fns-tz";
import RowItemsContainer from "../RowItemsContainer";
import AllDateTimePicker from "../date-time-picker/AllDateTimePicker";
import {
  fetchGeocodeFeatures,
  getMapboxPlacesQueryKey,
} from "@/queries/useAddressSearchQuery";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { JobResponseDto, ProjectResponseDto } from "@/api/api-spec";
import { Input } from "@/components/ui/input";
import AddressSearchButton from "@/components/AddressSearchButton";
import LoadingButton from "@/components/LoadingButton";
import Minimap from "@/components/Minimap";
import ItemsContainer from "@/components/ItemsContainer";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { AffixInput } from "@/components/AffixInput";
import usePatchJobMutation from "@/mutations/usePatchJobMutation";
import UsersByOrganizationCombobox from "@/components/combobox/UsersByOrganizationCombobox";
import {
  ELECTRICAL_WET_STAMP_SERVICE_ID,
  INITIAL_EDITOR_VALUE,
  JobPriorityEnum,
  LoadCalcOriginEnum,
  MountingTypeEnum,
  STRUCTURAL_PE_STAMP_SERVICE_ID,
  STRUCTURAL_WET_STAMP_SERVICE_ID,
  digitRegExp,
  toTwoDecimalRegExp,
  capitalizedStateNames,
  postalCodeRegExp,
} from "@/lib/constants";
import useUserQuery from "@/queries/useUserQuery";
import { getJobQueryKey } from "@/queries/useJobQuery";
import { getProjectQueryKey } from "@/queries/useProjectQuery";
import { useToast } from "@/components/ui/use-toast";
import BasicEditor from "@/components/editor/BasicEditor";
import { getEditorValue, isEditorValueEmpty } from "@/lib/plate-utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getJobHistoriesQueryKey } from "@/queries/useJobHistoriesQuery";
import { useProfileContext } from "@/app/(root)/ProfileProvider";
import usePatchJobDueDateMutation from "@/mutations/usePatchJobDueDateMution";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  project: ProjectResponseDto;
  job: JobResponseDto;
  pageType: JobDetailPageType;
}

export default function JobForm({ project, job, pageType }: Props) {
  const { isBarunCorpMember } = useProfileContext();
  const isHome = pageType === "HOME";

  /**
   * 바른코프 멤버 ✅
   * 바른코프 멤버아닌데, 홈 ❌
   * 바른코프 멤버아닌데, 워크스페이스 ✅
   */
  const isWorker = isBarunCorpMember || !isHome;

  const { toast } = useToast();
  const hasWetStamp = useMemo(
    () =>
      job.orderedServices.findIndex(
        (value) =>
          value.serviceId === ELECTRICAL_WET_STAMP_SERVICE_ID ||
          value.serviceId === STRUCTURAL_WET_STAMP_SERVICE_ID
      ) !== -1,
    [job]
  );
  const hasStructuralPEStamp = useMemo(
    () =>
      job.orderedServices.findIndex(
        (value) => value.serviceId === STRUCTURAL_PE_STAMP_SERVICE_ID
      ) !== -1,
    [job]
  );

  const formSchema = useMemo(
    () =>
      z
        .object({
          clientUser: z.object({
            id: z
              .string()
              .trim()
              .min(1, { message: "Client User Id is required" }),
            emailAddressesToReceiveDeliverables: z.array(
              z.object({
                email: z
                  .string()
                  .trim()
                  .min(1, { message: "Email Address is required" })
                  .email({ message: "Format of Email Address is incorrect" }),
              })
            ),
          }),
          loadCalcOrigin: LoadCalcOriginEnum,
          additionalInformation: z.custom<Value>(),
          mountingType: MountingTypeEnum,
          dueDate: z.date(),
          isExpedited: z.boolean(),
          inReview: z.boolean(),
          priority: JobPriorityEnum,
          systemSize: z.string().trim(),
          numberOfWetStamp: z.string().trim(),
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
          structuralUpgradeNotes: z.custom<Value>(),
        })
        .superRefine((value, ctx) => {
          if (!hasWetStamp) {
            return;
          }

          const { numberOfWetStamp } = value;

          if (numberOfWetStamp.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Number of Wet Stamp is required",
              path: [`numberOfWetStamp`],
            });
            return;
          }
        })
        .superRefine((value, ctx) => {
          if (!hasWetStamp) {
            return;
          }

          const { mailingAddress } = value;
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
          if (!postalCodeRegExp.test(mailingAddress.postalCode)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Invalid postal code format. Postal code should be in the format XXXXX or XXXXX-XXXX",
              path: [`mailingAddress`],
            });
            return;
          }
        })
        .superRefine((values, ctx) => {
          if (project?.propertyType === "Commercial") {
            const { systemSize } = values;

            if (systemSize.length === 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "System Size is required",
                path: ["systemSize"],
              });
              return;
            }
          }
        }),
    [hasWetStamp, project?.propertyType]
  );

  type FieldValues = z.infer<typeof formSchema>;
  type AddressTextField = Pick<
    FieldValues["mailingAddress"],
    "street1" | "street2" | "city" | "state" | "postalCode" | "country"
  >;

  const getFieldValues = useCallback((job: JobResponseDto): FieldValues => {
    return {
      clientUser: {
        id: job.clientInfo.clientUserId,
        emailAddressesToReceiveDeliverables:
          job.clientInfo.deliverablesEmails.map((email) => ({
            email,
          })),
      },
      loadCalcOrigin: job.loadCalcOrigin,
      additionalInformation:
        job.additionalInformationFromClient == null
          ? INITIAL_EDITOR_VALUE
          : getEditorValue(job.additionalInformationFromClient),
      mountingType: job.mountingType as z.infer<typeof MountingTypeEnum>,
      dueDate: job.dueDate ? new Date(job.dueDate) : new Date(),
      isExpedited: job.isExpedited,
      inReview: job.inReview,
      priority: job.priority,
      systemSize: job.systemSize == null ? "" : String(job.systemSize),
      numberOfWetStamp:
        job.numberOfWetStamp == null ? "" : String(job.numberOfWetStamp),
      mailingAddress: {
        city: job.mailingAddressForWetStamp?.city ?? "",
        coordinates: job.mailingAddressForWetStamp?.coordinates ?? [0, 0],
        country: job.mailingAddressForWetStamp?.country ?? "",
        fullAddress: job.mailingAddressForWetStamp?.fullAddress ?? "",
        postalCode: job.mailingAddressForWetStamp?.postalCode ?? "",
        state: job.mailingAddressForWetStamp?.state ?? "",
        street1: job.mailingAddressForWetStamp?.street1 ?? "",
        street2: job.mailingAddressForWetStamp?.street2 ?? "",
      },
      structuralUpgradeNotes:
        job.structuralUpgradeNote == null
          ? INITIAL_EDITOR_VALUE
          : getEditorValue(job.structuralUpgradeNote),
    };
  }, []);

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(job) as DefaultValues<FieldValues>, // editor value의 deep partial 문제로 typescript가 error를 발생시키나, 실제로는 문제 없음
  });
  const statesOrRegionsRef = useRef(capitalizedStateNames);
  const [longitude, latitude] = form.getValues("mailingAddress.coordinates");
  const [minimapCoordinates, setMinimapCoordinates] = useState<
    [number, number]
  >([longitude, latitude]);

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

  const updateAddressFormCoordinatesFromGeocode = async () => {
    const geocodeFeatures = await queryClient.fetchQuery({
      queryKey: getMapboxPlacesQueryKey(generateAddressSearchText()),
      queryFn: fetchGeocodeFeatures,
    });
    if (geocodeFeatures && geocodeFeatures.length > 0) {
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
  //   if (event.key === "Enter" && isAddressFieldFocused) {
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

    return addressSearchText;
  };

  const watchUserId = form.watch("clientUser.id");
  const queryClient = useQueryClient();
  const { data: user } = useUserQuery(watchUserId);
  const { mutateAsync: patchJobMutateAsync } = usePatchJobMutation(job.id);
  const usePatchJobDueDateMutateResult = usePatchJobDueDateMutation(job.id);

  useEffect(() => {
    if (job) {
      form.reset(getFieldValues(job));
    }
  }, [form, getFieldValues, job]);

  useEffect(() => {
    if (user) {
      form.setValue(
        "clientUser.emailAddressesToReceiveDeliverables",
        user.deliverablesEmails.map((email) => ({
          email,
        })),
        {
          shouldValidate: true,
        }
      );
    }
  }, [form, user]);

  const {
    fields: emailAddressesToReceiveDeliverablesFields,
    append: appendEmailAddressToReceiveDeliverables,
    remove: removeEmailAddressToReceiveDeliverables,
  } = useFieldArray({
    control: form.control,
    name: "clientUser.emailAddressesToReceiveDeliverables",
  });

  async function onSubmit(values: FieldValues) {
    if (hasWetStamp && values.mailingAddress.fullAddress.length === 0) {
      toast({
        title: "Please check the mailing address and try again",
        description:
          "The mailing address you entered could not be matched with coordinates",
        variant: "destructive",
      });
      return;
    }

    try {
      await patchJobMutateAsync({
        additionalInformationFromClient: isEditorValueEmpty(
          values.additionalInformation
        )
          ? null
          : JSON.stringify(values.additionalInformation),
        clientUserId: values.clientUser.id,
        deliverablesEmails:
          values.clientUser.emailAddressesToReceiveDeliverables.map(
            ({ email }) => email
          ),
        systemSize:
          project.propertyType === "Commercial"
            ? Number(values.systemSize)
            : null,
        numberOfWetStamp: hasWetStamp ? Number(values.numberOfWetStamp) : null,
        mailingAddressForWetStamp: hasWetStamp ? values.mailingAddress : null,
        isExpedited: values.isExpedited,
        inReview: values.inReview,
        priority: values.priority,
        structuralUpgradeNote: isEditorValueEmpty(values.structuralUpgradeNotes)
          ? null
          : JSON.stringify(values.structuralUpgradeNotes),
        loadCalcOrigin: values.loadCalcOrigin,
        mountingType: values.mountingType,
      });

      const newDueDate = formatInTimeZone(
        new Date(values.dueDate).setSeconds(0),
        "Etc/UTC",
        "yyyy-MM-dd"
      );

      const currentDueDate = job.dueDate
        ? formatInTimeZone(
            new Date(job.dueDate).setSeconds(0),
            "Etc/UTC",
            "yyyy-MM-dd"
          )
        : null;

      if (newDueDate !== currentDueDate) {
        await usePatchJobDueDateMutateResult.mutateAsync({
          dueDate: formatInTimeZone(
            new Date(values.dueDate).setSeconds(0),
            "Etc/UTC",
            "yyyy-MM-dd HH:mm:ss zzz"
          ),
        });
      }

      toast({ title: "Success" });
      queryClient.invalidateQueries({
        queryKey: getJobQueryKey(job.id),
      });
      queryClient.invalidateQueries({
        queryKey: getProjectQueryKey(project.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: getJobHistoriesQueryKey({ jobId: job.id }),
      });
    } catch (error: any) {
      switch (error.response?.status) {
        case 400:
          if (error.response?.data.errorCode.includes("40007")) {
            form.setError(
              "systemSize",
              {
                message: `System Size should be less than 99999999`,
              },
              { shouldFocus: true }
            );
            return;
          }

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

          if (error.response?.data.errorCode.includes("40006")) {
            toast({
              title: "Completed jobs cannot be modified",
              variant: "destructive",
            });
            return;
          }

          if (error.response?.data.errorCode.includes("40002")) {
            toast({
              title: "Job cannot be updated after invoice is issued",
              variant: "destructive",
            });
            return;
          }
      }

      if (
        error.response &&
        error.response.data.errorCode.filter((value: any) => value != null)
          .length !== 0
      ) {
        toast({
          title: error.response.data.message,
          variant: "destructive",
        });
        return;
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        // onSubmit={(event) => {
        //   event.preventDefault();
        //   form.handleSubmit(onSubmit)(event);
        // }}
      >
        <ItemsContainer>
          <FormField
            control={form.control}
            name="clientUser.id"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Client User</FormLabel>
                <FormControl>
                  <UsersByOrganizationCombobox
                    organizationId={job.clientInfo.clientOrganizationId}
                    userId={field.value}
                    onUserIdChange={field.onChange}
                    ref={field.ref}
                    disabled={!isWorker}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientUser.emailAddressesToReceiveDeliverables"
            render={() => {
              return (
                <FormItem>
                  <FormLabel required>
                    Email Addresses to Receive Deliverables
                  </FormLabel>
                  {emailAddressesToReceiveDeliverablesFields.map(
                    (field, index) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`clientUser.emailAddressesToReceiveDeliverables.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex flex-row gap-2">
                              <FormControl>
                                <Input {...field} disabled={!isWorker} />
                              </FormControl>
                              {isWorker && index !== 0 && (
                                <Button
                                  variant={"outline"}
                                  size={"icon"}
                                  className="flex-shrink-0"
                                  onClick={() => {
                                    removeEmailAddressToReceiveDeliverables(
                                      index
                                    );
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )
                  )}
                  {isWorker && (
                    <Button
                      variant={"outline"}
                      className="w-full"
                      onClick={() => {
                        appendEmailAddressToReceiveDeliverables({
                          email: "",
                        });
                      }}
                    >
                      Add Email Address
                    </Button>
                  )}
                </FormItem>
              );
            }}
          />
          {project?.propertyType === "Commercial" && (
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="systemSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>System Size</FormLabel>
                    <FormControl>
                      <AffixInput
                        suffixElement={
                          <span className="text-muted-foreground">kW</span>
                        }
                        {...field}
                        onChange={(event) => {
                          const { value } = event.target;
                          if (value === "" || toTwoDecimalRegExp.test(value)) {
                            field.onChange(event);
                          }
                        }}
                        disabled={!isWorker}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          <FormField
            control={form.control}
            name="mountingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Mounting Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    ref={field.ref}
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!isWorker}
                  >
                    {MountingTypeEnum.options.map((value) => (
                      <FormItem
                        key={value}
                        className="flex-row gap-3 items-center"
                      >
                        <FormControl>
                          <RadioGroupItem value={value} />
                        </FormControl>
                        <FormLabel className="font-normal">{value}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {hasWetStamp && (
            <>
              <div className="grid grid-cols-3 gap-2">
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
                          disabled={!isWorker}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="mailingAddress"
                render={({ field }) => (
                  <div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-2">
                        <FormItem>
                          <FormLabel required>Mailing Address</FormLabel>
                          {isWorker && (
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
                          )}
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
                            disabled={!isWorker}
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
                            disabled={!isWorker}
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
                            disabled={!isWorker}
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
                            disabled={!isWorker}
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
                            disabled={!isWorker}
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
                            disabled={!isWorker}
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
            </>
          )}
          {isWorker && hasStructuralPEStamp && (
            <FormField
              control={form.control}
              name="loadCalcOrigin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Structural Calculation Origin</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger ref={field.ref}>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {LoadCalcOriginEnum.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="additionalInformation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Information</FormLabel>
                <FormControl>
                  <BasicEditor {...field} disabled={!isWorker} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <RowItemsContainer>
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <div className="flex item-center gap-2">
                    <FormLabel>Date Due</FormLabel>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p className="text-xs">
                            You can change Am and Pm with the direction key.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <AllDateTimePicker
                      value={field.value}
                      onChange={(...args) => {
                        const newValue = args[0];
                        // https://react-hook-form.com/docs/usecontroller/controller
                        // field.onChange에 undefined를 담을 수 없음
                        field.onChange(
                          newValue === undefined ? null : newValue
                        );
                      }}
                      disabled={!isWorker}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isWorker && (
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex item-center gap-2">
                      <FormLabel>Priority</FormLabel>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="text-xs">
                              <strong>Priority Update Policy</strong>
                              <ul className="list-disc pl-4">
                                <li>
                                  <strong>Low</strong>
                                  <ul className="list-disc pl-4">
                                    <li>On Hold</li>
                                    <li>Elapsed Time - 20% or less</li>
                                  </ul>
                                </li>
                                <li>
                                  <strong>Medium</strong>
                                  <ul className="list-disc pl-4">
                                    <li>Elapsed Time - 21% to 41%</li>
                                  </ul>
                                </li>
                                <li>
                                  <strong>High</strong>
                                  <ul className="list-disc pl-4">
                                    <li>Elapsed Time - 41% to 71%</li>
                                  </ul>
                                </li>
                                <li>
                                  <strong>Immediate</strong>
                                  <ul className="list-disc pl-4">
                                    <li>Elapsed Time - 71% or more</li>
                                  </ul>
                                </li>
                              </ul>
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled
                      >
                        <SelectTrigger ref={field.ref}>
                          <SelectValue placeholder="Select a priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {JobPriorityEnum.options.map((option) => (
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
          </RowItemsContainer>
          {isWorker && (
            <FormField
              control={form.control}
              name="structuralUpgradeNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Structural Upgrade Notes</FormLabel>
                  <FormControl>
                    <BasicEditor {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="isExpedited"
            render={({ field }) => (
              <FormItem className="flex-row-reverse justify-end items-center gap-3">
                <FormLabel>Expedite</FormLabel>
                <FormControl>
                  <Checkbox
                    ref={field.ref}
                    checked={field.value}
                    onCheckedChange={(newChecked) => {
                      field.onChange(newChecked);
                    }}
                    disabled={!isWorker}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isWorker && (
            <FormField
              control={form.control}
              name="inReview"
              render={({ field }) => (
                <FormItem className="flex-row-reverse justify-end items-center gap-3">
                  <FormLabel>In Review</FormLabel>
                  <FormControl>
                    <Checkbox
                      ref={field.ref}
                      checked={field.value}
                      onCheckedChange={(newChecked) => {
                        field.onChange(newChecked);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {isWorker && (
            <LoadingButton
              type="submit"
              disabled={!form.formState.isDirty || isAddressFieldFocused}
              isLoading={form.formState.isSubmitting}
            >
              {isAddressFieldFocused
                ? "Disabled when editing address field"
                : "Save"}
            </LoadingButton>
          )}
        </ItemsContainer>
      </form>
    </Form>
  );
}
