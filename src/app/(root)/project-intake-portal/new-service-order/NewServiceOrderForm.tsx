"use client";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { X } from "lucide-react";
import NewProjectSheet from "./NewProjectSheet";
import JobsTable from "./JobsTable";
import ResultDialog from "./ResultDialog";
import OrganizationsCombobox from "@/components/combobox/OrganizationsCombobox";
import ExistingProjectCombobox from "@/components/combobox/ExistingProjectCombobox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Item from "@/components/Item";
import ItemsContainer from "@/components/ItemsContainer";
import { Input } from "@/components/ui/input";
import useProjectQuery from "@/queries/useProjectQuery";
import Minimap from "@/components/Minimap";
import {
  Form,
  FormControl,
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
import { CreateOrderedTaskWhenJobIsCreatedRequestDto } from "@/api";
import useUserQuery from "@/queries/useUserQuery";
import UsersByOrganizationCombobox from "@/components/combobox/UsersByOrganizationCombobox";
import { AffixInput } from "@/components/AffixInput";
import { Checkbox } from "@/components/ui/checkbox";
import AddressSearchButton from "@/components/AddressSearchButton";
import { Textarea } from "@/components/ui/textarea";
import Dropzone from "@/components/Dropzone";
import LoadingButton from "@/components/LoadingButton";
import PageLoading from "@/components/PageLoading";

export default function NewServiceOrderForm() {
  const [organizationId, setOrganizationId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [isWetStampChecked, setIsWetStampChecked] = useState(false);

  const isOrganizationSelected = organizationId !== "";

  const [newProjectSheetOpen, setNewProjectSheetOpen] = useState(false);
  const [result, setResult] = useState<{ open: boolean; jobId?: string }>({
    open: false,
  });
  const [files, setFiles] = useState<File[]>([]);

  const {
    data: project,
    isSuccess: isProjectQuerySuccess,
    isLoading: isProjectQueryLoading,
  } = useProjectQuery(projectId);
  const { data: organization, isSuccess: isOrganizationQuerySuccess } =
    useOrganizationQuery(organizationId);
  const { data: services } = useServicesQuery({
    limit: Number.MAX_SAFE_INTEGER,
  });
  const { mutateAsync } = usePostJobMutation();

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
          additionalInformation: z.string().trim(),
          isExpedited: z.boolean(),
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

          if (!/^\d+$/.test(numberOfWetStamp)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Number of Wet Stamp should be a number",
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

            if (!/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/.test(systemSize)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "System Size should be a number",
                path: ["systemSize"],
              });
              return;
            }
          }
        }),
    [project?.propertyType, isWetStampChecked]
  );

  type FieldValues = z.infer<typeof formSchema>;

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientUser: {
        id: "",
        emailAddressesToReceiveDeliverables: [],
      },
      systemSize: "",
      mountingType: "Roof Mount",
      services: [],
      descriptionForOtherServices: [{ description: "" }],
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
      additionalInformation: "",
      isExpedited: false,
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
  const watchClientUser = form.watch("clientUser");
  const watchServices = form.watch("services");
  const watchTypeOfWetStamp = form.watch("typeOfWetStamp");

  const { data: user } = useUserQuery(watchClientUser.id);

  const otherService = useMemo(
    () => services?.items.find((value) => value.id === OTHER_SERVICE_ID),
    [services?.items]
  );
  const electricalWetStampService = useMemo(
    () =>
      services?.items.find(
        (value) => value.id === ELECTRICAL_WET_STAMP_SERVICE_ID
      ),
    [services?.items]
  );
  const structuralWetStampService = useMemo(
    () =>
      services?.items.find(
        (value) => value.id === STRUCTURAL_WET_STAMP_SERVICE_ID
      ),
    [services?.items]
  );

  useEffect(() => {
    if (isOrganizationQuerySuccess && isProjectQuerySuccess) {
      const {
        systemSize,
        mailingAddressForWetStamp,
        hasHistoryElectricalPEStamp, // TODO: replace name
        hasHistoryStructuralPEStamp, // TODO: replace name
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
          id: "",
          emailAddressesToReceiveDeliverables: [],
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
        typeOfWetStamp,
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
        additionalInformation: "",
        isExpedited: false,
      });
    }
  }, [
    form,
    isOrganizationQuerySuccess,
    isProjectQuerySuccess,
    organization?.mountingTypeDefaultValue,
    project,
  ]);

  useEffect(() => {
    if (user) {
      form.setValue(
        "clientUser.emailAddressesToReceiveDeliverables",
        user.deliverablesEmails.map((email) => ({ email })),
        {
          shouldDirty: true,
        }
      );
      form.trigger("clientUser.emailAddressesToReceiveDeliverables");
    }
  }, [form, user]);

  useEffect(() => {
    if (form.formState.isSubmitted) {
      form.trigger("services");
    }
  }, [form, isWetStampChecked]);

  async function onSubmit(values: FieldValues) {
    if (!isProjectQuerySuccess) {
      return;
    }

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
      additionalInformationFromClient: transformStringIntoNullableString.parse(
        values.additionalInformation
      ),
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
    })
      .then(({ id }) => {
        // TODO: client인 경우 어떻게? project-management/jobs/:jobId로 이동?
        setResult({ open: true, jobId: id });
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
            }
            if (error.response?.data.errorCode.includes("40004")) {
              form.setError(
                "numberOfWetStamp",
                {
                  message: `Number of Wet Stamp should be less than 256`,
                },
                { shouldFocus: true }
              );
            }
            break;
        }
      });
  }

  function reset() {
    setProjectId("");
    setIsWetStampChecked(false);
  }

  return (
    <>
      <div className="space-y-6">
        <section>
          <Item>
            <Label>Organization</Label>
            <OrganizationsCombobox
              organizationId={organizationId}
              onOrganizationIdChange={(newOrganizationId) => {
                setOrganizationId(newOrganizationId);
                reset();
              }}
            />
          </Item>
        </section>
        {isOrganizationSelected && (
          <section>
            <h4 className="h4 mb-2">Project</h4>
            <ItemsContainer>
              <Item>
                <Label>Existing Project</Label>
                <ExistingProjectCombobox
                  organizationId={organizationId}
                  projectId={projectId}
                  onProjectIdChange={(newProjectId) => {
                    setProjectId(newProjectId);
                  }}
                />
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setNewProjectSheetOpen(true);
                  }}
                >
                  Project Not Found / This is New Project
                </Button>
              </Item>
              {projectId !== "" && isProjectQueryLoading && (
                <PageLoading isPageHeaderPlaceholder={false} />
              )}
              {isProjectQuerySuccess && (
                <div className="grid grid-cols-3 gap-2">
                  <ItemsContainer>
                    <Item>
                      <Label>Property Address</Label>
                      <Input
                        value={project.propertyAddress.fullAddress ?? ""}
                        disabled
                      />
                    </Item>
                    <Item>
                      <Label>Property Type</Label>
                      <Input value={project.propertyType ?? ""} disabled />
                    </Item>
                    <Item>
                      <Label>Property Owner</Label>
                      <Input
                        value={project.projectPropertyOwnerName ?? "-"}
                        disabled
                      />
                    </Item>
                    <Item>
                      <Label>Project Number</Label>
                      <Input value={project.projectNumber ?? "-"} disabled />
                    </Item>
                  </ItemsContainer>
                  <div className="col-span-2">
                    <Minimap
                      longitude={project.propertyAddress.coordinates[0]}
                      latitude={project.propertyAddress.coordinates[1]}
                    />
                  </div>
                </div>
              )}
            </ItemsContainer>
          </section>
        )}
        {isOrganizationSelected && isProjectQuerySuccess && (
          <section>
            <h4 className="h4 mb-2">Jobs Related to Project</h4>
            <ItemsContainer>
              {/* TODO: column 추가 */}
              <JobsTable data={project.jobs} />
              {/* <BaseTable
              columns={jobForProjectColumns}
              data={project?.jobs ?? []}
              getRowId={({ id }) => id}
            /> */}
            </ItemsContainer>
          </section>
        )}
        {isOrganizationSelected && isProjectQuerySuccess && (
          <section>
            <h4 className="h4 mb-2">Job</h4>
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
                            organizationId={organizationId}
                            userId={field.value}
                            onUserIdChange={field.onChange}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchClientUser.emailAddressesToReceiveDeliverables
                    .length !== 0 && (
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
                                  <span className="text-muted-foreground">
                                    kW
                                  </span>
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
                        <FormLabel required>Services</FormLabel>
                        <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                          {services?.items
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
                                                        form.formState
                                                          .isSubmitted,
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
                                                        form.formState
                                                          .isSubmitted,
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
                                                        form.formState
                                                          .isSubmitted,
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
                                                        form.formState
                                                          .isSubmitted,
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
                                                (value) =>
                                                  value.id !== service.id
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
                                          (value) =>
                                            value.id === otherService.id
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
                          <FormLabel>Description for Other Service</FormLabel>
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
                                        placeholder={`Other Service ${
                                          index + 1
                                        }`}
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
                            Add Other Service
                          </Button>
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
                                <FormLabel required>
                                  Number of Wet Stamp
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    onChange={(event) => {
                                      const { value } = event.target;
                                      if (
                                        value === "" ||
                                        digitRegExp.test(value)
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
                        <FormField
                          control={form.control}
                          name="mailingAddress"
                          render={({ field }) => (
                            <div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col gap-2">
                                  <FormItem>
                                    <FormLabel required>
                                      Mailing Address
                                    </FormLabel>
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
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* TODO: member인 경우만 */}
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
                  <Dropzone files={files} onFilesChange={setFiles} />
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
        )}
      </div>
      <NewProjectSheet
        open={newProjectSheetOpen}
        onOpenChange={setNewProjectSheetOpen}
        organizationId={organizationId}
        onProjectIdChange={(newProjectId) => {
          setProjectId(newProjectId);
        }}
      />
      <ResultDialog
        files={files}
        open={result.open}
        jobId={result.jobId}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            reset();
            setResult({ open: false });
            setFiles([]);
          }
        }}
      />
    </>
  );
}
