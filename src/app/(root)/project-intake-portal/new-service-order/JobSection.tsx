"use client";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { X } from "lucide-react";
import { Value } from "@udecode/plate-common";
import { useSession } from "next-auth/react";
import { useProfileContext } from "../../ProfileProvider";
import ResultDialog from "./ResultDialog";
import {
  useNewServiceOrderData,
  useNewServiceOrderDataDispatch,
} from "./NewServiceOrderDataProvider";
import { Button } from "@/components/ui/button";
import ItemsContainer from "@/components/ItemsContainer";
import { Input } from "@/components/ui/input";
import useProjectQuery from "@/queries/useProjectQuery";
import Minimap from "@/components/Minimap";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ELECTRICAL_LOAD_CALCULATION_SERVICE_ID,
  ELECTRICAL_LOAD_JUSTIFICATION_LETTER_SERVICE_ID,
  ELECTRICAL_PE_STAMP_SERVICE_ID,
  ELECTRICAL_POST_INSTALLED_LETTER_SERVICE_ID,
  ELECTRICAL_WET_STAMP_SERVICE_ID,
  ESS_ELECTRICAL_PE_STAMP_SERVICE_ID,
  ESS_STRUCTURAL_PE_STAMP_SERVICE_ID,
  INITIAL_EDITOR_VALUE,
  LoadCalcOriginEnum,
  MountingTypeEnum,
  OTHER_SERVICE_ID,
  SPECIAL_INSPECTION_FORM_SERVICE_ID,
  STRUCTURAL_FEASIBILITY_SERVICE_ID,
  STRUCTURAL_PE_STAMP_SERVICE_ID,
  STRUCTURAL_POST_INSTALLED_LETTER_SERVICE_ID,
  STRUCTURAL_WET_STAMP_SERVICE_ID,
  digitRegExp,
  toTwoDecimalRegExp,
  transformStringIntoNullableString,
} from "@/lib/constants";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import useServicesQuery from "@/queries/useServicesQuery";
import usePostJobMutation from "@/mutations/usePostJobMutation";
import {
  CreateOrderedTaskWhenJobIsCreatedRequestDto,
  OrganizationResponseDto,
  ProjectResponseDto,
  ServicePaginatedResponseDto,
} from "@/api/api-spec";
import useUserQuery from "@/queries/useUserQuery";
import UsersByOrganizationCombobox from "@/components/combobox/UsersByOrganizationCombobox";
import { AffixInput } from "@/components/AffixInput";
import { Checkbox } from "@/components/ui/checkbox";
import AddressSearchButton from "@/components/AddressSearchButton";
import Dropzone from "@/components/Dropzone";
import LoadingButton from "@/components/LoadingButton";
import BasicEditor from "@/components/editor/BasicEditor";
import { isEditorValueEmpty } from "@/lib/plate-utils";
import { useToast } from "@/components/ui/use-toast";
import DateTimePicker from "@/components/date-time-picker/DateTimePicker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ResultDialogState =
  | { open: false }
  | { open: true; jobId: string; files: File[] };

interface JobSectionWithDataProps {
  project: ProjectResponseDto;
  organization: OrganizationResponseDto;
  services: ServicePaginatedResponseDto;
}

function JobSectionWithData({
  project,
  organization,
  services,
}: JobSectionWithDataProps) {
  const { data: session } = useSession();
  const dispatch = useNewServiceOrderDataDispatch();
  const [isWetStampChecked, setIsWetStampChecked] = useState(false);
  const { mutateAsync } = usePostJobMutation();
  const { toast } = useToast();
  const [resultDialogState, setResultDialogState] = useState<ResultDialogState>(
    { open: false }
  );
  const { isBarunCorpMember } = useProfileContext();
  const { selectedOrganizationId } = useNewServiceOrderData();

  const formSchema = useMemo(
    () =>
      z
        .object({
          clientUser: z.object({
            id: z
              .string()
              .trim()
              .min(1, { message: "Client User is required" }),
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
          systemSize: z.string().trim(),
          mountingType: MountingTypeEnum,
          services: z.array(
            z.object({
              id: z.string().trim(),
              description: z.string().trim().nullable(),
            })
          ),
          descriptionForOtherServices: z.array(
            z.object({
              description: z.string().trim(),
            })
          ),
          loadCalcOrigin: LoadCalcOriginEnum,
          typeOfWetStamp: z.array(
            z.object({
              id: z.string().trim(),
              description: z.string().trim().nullable(),
            })
          ),
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
          additionalInformation: z.custom<Value>(),
          dueDate: z.date().nullable(),
          isExpedited: z.boolean(),
          files: z.custom<File[]>().superRefine((files, ctx) => {
            if (files.length > 6) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "The number of files cannot exceed 6",
              });
              return;
            }

            for (let i = 0; i < files.length; i++) {
              if (files[i].size > 100000000) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "The size of each file should not exceed 100MB",
                });
                return;
              }
            }
          }),
        })
        .superRefine((values, ctx) => {
          const { services, descriptionForOtherServices } = values;
          if (
            services.find((value) => value.id === OTHER_SERVICE_ID) ===
            undefined
          ) {
            return;
          }

          for (const index in descriptionForOtherServices) {
            const { description } = descriptionForOtherServices[index];
            if (description.length === 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Description for Other Service is required",
                path: [`descriptionForOtherServices.${index}.description`],
              });
            }
          }
        })
        .superRefine((values, ctx) => {
          const { services } = values;
          if (services.length === 0 && !isWetStampChecked) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "At least one service should be selected",
              path: [`services`],
            });
          }
        })
        .superRefine((values, ctx) => {
          const { typeOfWetStamp } = values;
          if (!isWetStampChecked) {
            return;
          }

          if (typeOfWetStamp.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "At least one type of wet stamp should be selected",
              path: [`typeOfWetStamp`],
            });
            return;
          }
        })
        .superRefine((values, ctx) => {
          const { numberOfWetStamp } = values;
          if (!isWetStampChecked) {
            return;
          }

          if (numberOfWetStamp.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Number of Wet Stamp is required",
              path: [`numberOfWetStamp`],
            });
            return;
          }
        })
        .superRefine((values, ctx) => {
          const { mailingAddress } = values;
          if (!isWetStampChecked) {
            return;
          }

          if (mailingAddress.fullAddress.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Mailing Address is required",
              path: [`mailingAddress`],
            });
            return;
          }
        })
        .superRefine((values, ctx) => {
          if (project.propertyType === "Commercial") {
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
    [project.propertyType, isWetStampChecked]
  );

  type FieldValues = z.infer<typeof formSchema>;

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientUser: {
        id: isBarunCorpMember ? "" : session?.id ?? "",
        emailAddressesToReceiveDeliverables: [],
      },
      systemSize: "",
      mountingType: "Roof Mount",
      services: [],
      descriptionForOtherServices: [{ description: "" }],
      loadCalcOrigin: "Self",
      numberOfWetStamp: "",
      mailingAddress: {
        city: "",
        coordinates: [],
        country: "",
        fullAddress: "",
        postalCode: "",
        state: "",
        street1: "",
        street2: "",
      },
      typeOfWetStamp: [],
      additionalInformation: INITIAL_EDITOR_VALUE,
      dueDate: null,
      isExpedited: false,
      files: [],
    },
  });

  const {
    fields: emailAddressesToReceiveDeliverablesFields,
    append: appendEmailAddressToReceiveDeliverables,
    remove: removeEmailAddressToReceiveDeliverables,
  } = useFieldArray({
    control: form.control,
    name: "clientUser.emailAddressesToReceiveDeliverables",
  });
  const {
    fields: otherServicesFields,
    append: appendOtherService,
    remove: removeOtherService,
  } = useFieldArray({
    control: form.control,
    name: "descriptionForOtherServices",
  });

  const watchClientUserId = form.watch("clientUser.id");
  const watchServices = form.watch("services");
  const watchTypeOfWetStamp = form.watch("typeOfWetStamp");

  const { data: user } = useUserQuery(watchClientUserId);

  const otherService = useMemo(
    () => services.items.find((value) => value.id === OTHER_SERVICE_ID),
    [services.items]
  );
  const electricalWetStampService = useMemo(
    () =>
      services.items.find(
        (value) => value.id === ELECTRICAL_WET_STAMP_SERVICE_ID
      ),
    [services.items]
  );
  const structuralWetStampService = useMemo(
    () =>
      services.items.find(
        (value) => value.id === STRUCTURAL_WET_STAMP_SERVICE_ID
      ),
    [services.items]
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty || window.onbeforeunload) {
        e.preventDefault();
      }
    };

    window.onbeforeunload = handleBeforeUnload;
    return () => {
      window.onbeforeunload = null;
    };
  }, [form.formState.isDirty]);

  useEffect(() => {
    if (user) {
      form.setValue(
        "clientUser.emailAddressesToReceiveDeliverables",
        user.deliverablesEmails.map((email) => ({ email }))
      );
      form.trigger("clientUser.emailAddressesToReceiveDeliverables");
    }
  }, [form, user]);

  useEffect(() => {
    const {
      systemSize,
      mailingAddressForWetStamp,
      hasHistoryElectricalPEStamp,
      hasHistoryStructuralPEStamp,
      jobs,
    } = project;

    let recentJob;
    if (jobs.length > 0) {
      recentJob = jobs[0];
    }

    const hasElectricalWetStampService =
      recentJob?.orderedServices.find(
        (value) => value.serviceId === ELECTRICAL_WET_STAMP_SERVICE_ID
      ) !== undefined;
    const hasStructuralWetStampService =
      recentJob?.orderedServices.find(
        (value) => value.serviceId === STRUCTURAL_WET_STAMP_SERVICE_ID
      ) !== undefined;

    if (hasElectricalWetStampService || hasStructuralWetStampService) {
      setIsWetStampChecked(true);
    }

    const typeOfWetStamp: {
      id: string;
      description: string | null;
    }[] = [];
    if (hasHistoryElectricalPEStamp || hasElectricalWetStampService) {
      typeOfWetStamp.push({
        id: ELECTRICAL_WET_STAMP_SERVICE_ID,
        description: null,
      });
    }
    if (hasHistoryStructuralPEStamp || hasStructuralWetStampService) {
      typeOfWetStamp.push({
        id: STRUCTURAL_WET_STAMP_SERVICE_ID,
        description: null,
      });
    }

    form.reset({
      clientUser: {
        id: isBarunCorpMember ? "" : session?.id ?? "",
        emailAddressesToReceiveDeliverables: form.getValues(
          "clientUser.emailAddressesToReceiveDeliverables"
        ),
      },
      systemSize: systemSize == null ? "" : String(systemSize),
      mountingType:
        organization.mountingTypeDefaultValue == null
          ? "Roof Mount"
          : (organization.mountingTypeDefaultValue as z.infer<
              typeof MountingTypeEnum
            >),
      services: recentJob
        ? recentJob.orderedServices
            .filter(
              (value) =>
                value.serviceId !== ELECTRICAL_WET_STAMP_SERVICE_ID &&
                value.serviceId !== STRUCTURAL_WET_STAMP_SERVICE_ID
            )
            .map((value) => ({ id: value.serviceId, description: null }))
        : [],
      descriptionForOtherServices: recentJob
        ? recentJob.orderedServices.findIndex(
            (value) => value.serviceId === OTHER_SERVICE_ID
          ) === -1
          ? [{ description: "" }]
          : recentJob.orderedServices
              .filter((value) => value.serviceId === OTHER_SERVICE_ID)
              .map((value) => ({ description: value.description ?? "" }))
        : [{ description: "" }],
      loadCalcOrigin: "Self",
      numberOfWetStamp: "",
      mailingAddress: {
        city: mailingAddressForWetStamp?.city ?? "",
        coordinates: mailingAddressForWetStamp?.coordinates ?? [],
        country: mailingAddressForWetStamp?.country ?? "",
        fullAddress: mailingAddressForWetStamp?.fullAddress ?? "",
        postalCode: mailingAddressForWetStamp?.postalCode ?? "",
        state: mailingAddressForWetStamp?.state ?? "",
        street1: mailingAddressForWetStamp?.street1 ?? "",
        street2: mailingAddressForWetStamp?.street2 ?? "",
      },
      typeOfWetStamp,
      additionalInformation: INITIAL_EDITOR_VALUE,
      dueDate: null,
      isExpedited: false,
      files: [],
    });
  }, [
    form,
    isBarunCorpMember,
    organization.mountingTypeDefaultValue,
    project,
    session?.id,
  ]);

  async function onSubmit(values: FieldValues) {
    toast({
      title: "Please wait a minute",
      description: "Creating related folders in Google Drive",
    });
    const serviceIds: CreateOrderedTaskWhenJobIsCreatedRequestDto[] = [];
    for (const service of values.services) {
      if (service.id === OTHER_SERVICE_ID) {
        for (const descriptionForOtherService of values.descriptionForOtherServices) {
          serviceIds.push({
            serviceId: service.id,
            description: descriptionForOtherService.description,
          });
        }
      } else {
        serviceIds.push({
          serviceId: service.id,
          description: service.description,
        });
      }
    }
    if (isWetStampChecked) {
      for (const wetStampService of values.typeOfWetStamp) {
        serviceIds.push({
          serviceId: wetStampService.id,
          description: wetStampService.description,
        });
      }
    }
    await mutateAsync({
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
      isExpedited: values.isExpedited,
      systemSize:
        project.propertyType === "Commercial"
          ? Number(values.systemSize)
          : null,
      mountingType: values.mountingType,
      projectId: project.projectId,
      taskIds: serviceIds,
      mailingAddressForWetStamp: isWetStampChecked
        ? {
            ...values.mailingAddress,
            country: transformStringIntoNullableString.parse(
              values.mailingAddress.country
            ),
            state: values.mailingAddress.state,
            street2: transformStringIntoNullableString.parse(
              values.mailingAddress.street2
            ),
          }
        : null,
      numberOfWetStamp: isWetStampChecked
        ? Number(values.numberOfWetStamp)
        : null,
      dueDate: values.dueDate == null ? null : values.dueDate.toISOString(),
      structuralUpgradeNote: null, // job detail 페이지에서만 수정 가능
      loadCalcOrigin: values.loadCalcOrigin,
    })
      .then(({ id }) => {
        setResultDialogState({ open: true, jobId: id, files: values.files });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
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

  /**
   * 다음의 이유로 작성한 코드입니다.
   * 1. services를 빈 채로 submit한다.
   * 2. services는 error 상태가 된다.
   * 3. wet stamp를 체크한다. services는 error 상태에서 풀려야한다.
   * wet stamp 체크 여부가 form과 연결되어 있지 않기 때문에 필요하게 되었습니다.
   */
  useEffect(() => {
    if (form.formState.isSubmitted) {
      form.trigger("services");
    }
  }, [form, isWetStampChecked]);

  return (
    <>
      <section>
        <h2 className="h4 mb-2">Job</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ItemsContainer>
              <FormField
                control={form.control}
                name="clientUser.id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Client User</FormLabel>
                    <FormControl>
                      <UsersByOrganizationCombobox
                        organizationId={selectedOrganizationId}
                        userId={field.value}
                        onUserIdChange={field.onChange}
                        ref={field.ref}
                        disabled={!isBarunCorpMember}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {watchClientUserId !== "" && (
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
                                      <Input {...field} />
                                    </FormControl>
                                    {index !== 0 && (
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
                      </FormItem>
                    );
                  }}
                />
              )}
              {project.propertyType === "Commercial" && (
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
                              if (
                                value === "" ||
                                toTwoDecimalRegExp.test(value)
                              ) {
                                field.onChange(event);
                              }
                            }}
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
                        onValueChange={field.onChange}
                        value={field.value}
                        ref={field.ref}
                      >
                        {MountingTypeEnum.options.map((option) => (
                          <FormItem
                            key={option}
                            className="flex-row gap-3 items-center"
                          >
                            <FormControl>
                              <RadioGroupItem value={option} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="services"
                render={() => (
                  <FormItem>
                    {/** Services를 Scopes라고 부르기로 하였으나, 코드 상에서는 services라는 이름으로 사용되고 있기 때문에, 보여지는 쪽에만 우선 Scopes를 적용함 */}
                    <FormLabel required>Scopes</FormLabel>
                    <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                      {services.items
                        .filter(
                          (value) =>
                            value.id !== ELECTRICAL_WET_STAMP_SERVICE_ID &&
                            value.id !== STRUCTURAL_WET_STAMP_SERVICE_ID &&
                            value.id !== OTHER_SERVICE_ID
                        )
                        ?.sort((a, b) => (a.name < b.name ? -1 : 1))
                        .map((service) => (
                          <FormField
                            key={service.id}
                            control={form.control}
                            name="services"
                            render={({ field }) => (
                              <FormItem className="flex flex-row gap-3 items-center">
                                <FormControl>
                                  <Checkbox
                                    ref={field.ref}
                                    checked={
                                      field.value.find(
                                        (value) => value.id === service.id
                                      ) !== undefined
                                    }
                                    onCheckedChange={(newChecked) => {
                                      if (
                                        electricalWetStampService &&
                                        structuralWetStampService
                                      ) {
                                        switch (service.id) {
                                          case ESS_ELECTRICAL_PE_STAMP_SERVICE_ID:
                                          case ELECTRICAL_LOAD_CALCULATION_SERVICE_ID:
                                          case ELECTRICAL_LOAD_JUSTIFICATION_LETTER_SERVICE_ID:
                                          case ELECTRICAL_PE_STAMP_SERVICE_ID:
                                          case ELECTRICAL_POST_INSTALLED_LETTER_SERVICE_ID:
                                            if (newChecked) {
                                              form.setValue(
                                                "typeOfWetStamp",
                                                [
                                                  ...watchTypeOfWetStamp,
                                                  {
                                                    id: electricalWetStampService.id,
                                                    description: null,
                                                  },
                                                ],
                                                {
                                                  shouldValidate:
                                                    form.formState.isSubmitted,
                                                }
                                              );
                                            } else {
                                              form.setValue(
                                                "typeOfWetStamp",
                                                watchTypeOfWetStamp.filter(
                                                  (value) =>
                                                    value.id !==
                                                    ELECTRICAL_WET_STAMP_SERVICE_ID
                                                ),
                                                {
                                                  shouldValidate:
                                                    form.formState.isSubmitted,
                                                }
                                              );
                                            }
                                            break;
                                          case ESS_STRUCTURAL_PE_STAMP_SERVICE_ID:
                                          case SPECIAL_INSPECTION_FORM_SERVICE_ID:
                                          case STRUCTURAL_FEASIBILITY_SERVICE_ID:
                                          case STRUCTURAL_PE_STAMP_SERVICE_ID:
                                          case STRUCTURAL_POST_INSTALLED_LETTER_SERVICE_ID:
                                            if (newChecked) {
                                              form.setValue(
                                                "typeOfWetStamp",
                                                [
                                                  ...watchTypeOfWetStamp,
                                                  {
                                                    id: structuralWetStampService.id,
                                                    description: null,
                                                  },
                                                ],
                                                {
                                                  shouldValidate:
                                                    form.formState.isSubmitted,
                                                }
                                              );
                                            } else {
                                              form.setValue(
                                                "typeOfWetStamp",
                                                watchTypeOfWetStamp.filter(
                                                  (value) =>
                                                    value.id !==
                                                    STRUCTURAL_WET_STAMP_SERVICE_ID
                                                ),
                                                {
                                                  shouldValidate:
                                                    form.formState.isSubmitted,
                                                }
                                              );
                                            }
                                            break;
                                        }
                                      }

                                      if (newChecked) {
                                        field.onChange([
                                          ...field.value,
                                          {
                                            id: service.id,
                                            description: null,
                                          },
                                        ]);
                                      } else {
                                        field.onChange(
                                          field.value.filter(
                                            (value) => value.id !== service.id
                                          )
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {service.name}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      <FormField
                        control={form.control}
                        name="services"
                        render={({ field }) => (
                          <FormItem className="flex flex-row gap-3 items-center">
                            <FormControl>
                              <Checkbox
                                ref={field.ref}
                                checked={isWetStampChecked}
                                onCheckedChange={(newChecked) => {
                                  if (typeof newChecked === "boolean") {
                                    setIsWetStampChecked(newChecked);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Wet Stamp
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      {otherService && (
                        <FormField
                          control={form.control}
                          name="services"
                          render={({ field }) => (
                            <FormItem className="flex flex-row gap-3 items-center">
                              <FormControl>
                                <Checkbox
                                  ref={field.ref}
                                  checked={
                                    field.value.find(
                                      (value) => value.id === otherService.id
                                    ) !== undefined
                                  }
                                  onCheckedChange={(newChecked) => {
                                    if (newChecked) {
                                      field.onChange([
                                        ...field.value,
                                        {
                                          id: otherService.id,
                                          description: null,
                                        },
                                      ]);
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          (value) =>
                                            value.id !== otherService.id
                                        )
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {otherService.name}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {watchServices.find(
                (service) => service.id === otherService?.id
              ) && (
                <FormField
                  control={form.control}
                  name="descriptionForOtherServices"
                  render={() => (
                    <FormItem>
                      <FormLabel>Description for Other Scope</FormLabel>
                      {otherServicesFields.map((field, index) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={`descriptionForOtherServices.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex flex-row gap-2">
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder={`Other Scope ${index + 1}`}
                                  />
                                </FormControl>
                                {index !== 0 && (
                                  <Button
                                    variant={"outline"}
                                    size={"icon"}
                                    className="flex-shrink-0"
                                    onClick={() => {
                                      removeOtherService(index);
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
                      ))}
                      <Button
                        variant={"outline"}
                        className="w-full"
                        onClick={() => {
                          appendOtherService({ description: "" });
                        }}
                        type="button"
                      >
                        Add Other Scope
                      </Button>
                    </FormItem>
                  )}
                />
              )}
              {isBarunCorpMember &&
                watchServices.find(
                  (service) => service.id === STRUCTURAL_PE_STAMP_SERVICE_ID
                ) && (
                  <FormField
                    control={form.control}
                    name="loadCalcOrigin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Structural Calculation Origin</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
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
              {isWetStampChecked &&
                electricalWetStampService &&
                structuralWetStampService && (
                  <>
                    <FormField
                      control={form.control}
                      name="typeOfWetStamp"
                      render={() => (
                        <FormItem>
                          <FormLabel required>Type of Wet Stamp</FormLabel>
                          <FormField
                            control={form.control}
                            name="typeOfWetStamp"
                            render={({ field }) => (
                              <FormItem className="flex flex-row gap-3 items-center">
                                <FormControl>
                                  <Checkbox
                                    ref={field.ref}
                                    checked={
                                      field.value.find(
                                        (value) =>
                                          value.id ===
                                          electricalWetStampService.id
                                      ) !== undefined
                                    }
                                    onCheckedChange={(checked) =>
                                      checked
                                        ? field.onChange([
                                            ...field.value,
                                            {
                                              id: electricalWetStampService.id,
                                              description: null,
                                            },
                                          ])
                                        : field.onChange(
                                            field.value.filter(
                                              (value) =>
                                                value.id !==
                                                electricalWetStampService.id
                                            )
                                          )
                                    }
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {electricalWetStampService.name}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="typeOfWetStamp"
                            render={({ field }) => (
                              <FormItem className="flex flex-row gap-3 items-center">
                                <FormControl>
                                  <Checkbox
                                    ref={field.ref}
                                    checked={
                                      field.value.find(
                                        (value) =>
                                          value.id ===
                                          structuralWetStampService.id
                                      ) !== undefined
                                    }
                                    onCheckedChange={(checked) =>
                                      checked
                                        ? field.onChange([
                                            ...field.value,
                                            {
                                              id: structuralWetStampService.id,
                                              description: null,
                                            },
                                          ])
                                        : field.onChange(
                                            field.value.filter(
                                              (value) =>
                                                value.id !==
                                                structuralWetStampService.id
                                            )
                                          )
                                    }
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {structuralWetStampService.name}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                          <div className="grid grid-cols-3 gap-2">
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
                            <div className="col-span-2">
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
                  </>
                )}
              <FormField
                control={form.control}
                name="additionalInformation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information</FormLabel>
                    <FormControl>
                      <BasicEditor {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isBarunCorpMember && (
                <>
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Due</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            value={field.value}
                            onChange={(...args) => {
                              const newValue = args[0];
                              // https://react-hook-form.com/docs/usecontroller/controller
                              // field.onChange에 undefined를 담을 수 없음
                              field.onChange(
                                newValue === undefined ? null : newValue
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          If not entered, it will be automatically calculated
                          based on the selected scopes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormField
                control={form.control}
                name="files"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Dropzone
                        files={field.value}
                        onFilesChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      You can select up to 6 files, and the size of each file
                      should not exceed 100MB
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <LoadingButton
                className="w-full"
                type="submit"
                isLoading={form.formState.isSubmitting}
              >
                Submit
              </LoadingButton>
            </ItemsContainer>
          </form>
        </Form>
      </section>
      <ResultDialog
        state={resultDialogState}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            return;
          }

          dispatch({ type: "RESET" });
          setResultDialogState({ open: newOpen });
        }}
      />
    </>
  );
}

export default function JobSection() {
  const { selectedOrganizationId, selectedProjectId } =
    useNewServiceOrderData();
  const { data: project, isLoading: isProjectQueryLoading } =
    useProjectQuery(selectedProjectId);
  const { data: organization, isLoading: isOrganizationQueryLoading } =
    useOrganizationQuery(selectedOrganizationId);
  const { data: services, isLoading: isServicesQueryLoading } =
    useServicesQuery({
      limit: Number.MAX_SAFE_INTEGER,
    });

  if (
    project == null ||
    isProjectQueryLoading ||
    organization == null ||
    isOrganizationQueryLoading ||
    services == null ||
    isServicesQueryLoading
  ) {
    return;
  }

  return (
    <JobSectionWithData
      project={project}
      organization={organization}
      services={services}
    />
  );
}
