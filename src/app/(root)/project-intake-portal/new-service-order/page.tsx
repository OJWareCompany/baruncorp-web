"use client";
import * as z from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { AxiosError } from "axios";
import NewProjectSheet from "./NewProjectSheet";
import ExistingProjectSheet from "./ExistingProjectSheet";
import ResultDialog from "./ResultDialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import RowItemsContainer from "@/components/RowItemsContainer";
import useProjectQuery from "@/queries/useProjectQuery";
import { Input } from "@/components/ui/input";
import Minimap from "@/components/Minimap";
import ItemsContainer from "@/components/ItemsContainer";
import { Checkbox } from "@/components/ui/checkbox";
import useUserQuery from "@/queries/useUserQuery";
import AddressSearchButton from "@/components/AddressSearchButton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { AffixInput } from "@/components/AffixInput";
import usePostJobMutation from "@/queries/usePostJobMutation";
import { CreateOrderedTaskWhenJobIsCreatedRequestDto } from "@/api";
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
  transformStringIntoNullableString,
} from "@/lib/constants";
import Dropzone from "@/components/Dropzone";
import LoadingButton from "@/components/LoadingButton";
import OrganizationsCombobox from "@/components/combobox/OrganizationsCombobox";
import UsersByOrganizationCombobox from "@/components/combobox/UsersByOrganizationCombobox";
import NewUserByOrganizationSheet from "@/components/sheet/NewUserByOrganizationSheet";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import useAllServicesQuery from "@/queries/useAllServicesQuery";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import BaseTable from "@/components/table/BaseTable";
import PageHeader from "@/components/PageHeader";
import { jobForProjectColumns } from "@/columns/job";

const title = "New Service Order";

export default function Page() {
  /**
   * State
   */
  const [organizationId, setOrganizationId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [wetStampChecked, setWetStampChecked] = useState(false);

  const [newProjectSheetOpen, setNewProjectSheetOpen] = useState(false);
  const [existingProjectSheetOpen, setExistingProjectSheetOpen] =
    useState(false);
  const [newUserSheetOpen, setNewUserSheetOpen] = useState(false);
  const [result, setResult] = useState<{ open: boolean; jobId?: string }>({
    open: false,
  });
  const [files, setFiles] = useState<File[]>([]);

  /**
   * Query
   */
  const { data: project } = useProjectQuery({ projectId });
  const { data: organization } = useOrganizationQuery({ organizationId });
  const { data: services } = useAllServicesQuery();
  const { mutateAsync } = usePostJobMutation();

  /**
   * Form
   */
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
            stateOrRegion: z.string().trim(),
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
                message: "Description for Other Task is required",
                path: [`descriptionForOtherServices.${index}.description`],
              });
            }
          }
        })
        .superRefine((values, ctx) => {
          const { services } = values;
          if (services.length === 0 && !wetStampChecked) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "At least one task should be selected",
              path: [`services`],
            });
          }
        })
        .superRefine((values, ctx) => {
          const { typeOfWetStamp } = values;
          if (!wetStampChecked) {
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
          if (!wetStampChecked) {
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
          if (!wetStampChecked) {
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
    [project?.propertyType, wetStampChecked]
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
        stateOrRegion: "",
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
    fields: otherTasksFields,
    append: appendOtherTask,
    remove: removeOtherTask,
  } = useFieldArray({
    control: form.control,
    name: "descriptionForOtherServices",
  });
  const watchClientUser = form.watch("clientUser");
  const watchServices = form.watch("services");
  const watchTypeOfWetStamp = form.watch("typeOfWetStamp");

  const { data: user } = useUserQuery({ userId: watchClientUser.id });

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

  /**
   * useEffect
   */
  useEffect(() => {
    if (project && organization) {
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
        setWetStampChecked(true);
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
          ? recentJob.orderedServices
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
          stateOrRegion: mailingAddressForWetStamp?.state ?? "",
          street1: mailingAddressForWetStamp?.street1 ?? "",
          street2: mailingAddressForWetStamp?.street2 ?? "",
        },
        additionalInformation: "",
        isExpedited: false,
      });
    }
  }, [form, organization, project]);

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
  }, [form, wetStampChecked]);

  async function onSubmit(values: FieldValues) {
    if (project == null) {
      return;
    }

    const taskIds: CreateOrderedTaskWhenJobIsCreatedRequestDto[] = [];
    for (const service of values.services) {
      if (service.id === OTHER_SERVICE_ID) {
        for (const descriptionForOtherService of values.descriptionForOtherServices) {
          taskIds.push({
            serviceId: service.id,
            description: descriptionForOtherService.description,
          });
        }
      } else {
        taskIds.push({
          serviceId: service.id,
          description: service.description,
        });
      }
    }

    if (wetStampChecked) {
      for (const wetStampService of values.typeOfWetStamp) {
        taskIds.push({
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
      taskIds,
      mailingAddressForWetStamp: wetStampChecked
        ? {
            ...values.mailingAddress,
            country: transformStringIntoNullableString.parse(
              values.mailingAddress.country
            ),
            state: values.mailingAddress.stateOrRegion,
            street2: transformStringIntoNullableString.parse(
              values.mailingAddress.street2
            ),
          }
        : null,
      numberOfWetStamp: wetStampChecked
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
                  message: `Number of Wet Stamp should be less than 255`,
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
    setWetStampChecked(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/project-intake-portal", name: "Project Intake Portal" },
          {
            href: "/project-intake-portal/new-service-order",
            name: title,
          },
        ]}
        title={title}
      />
      <div className="space-y-6">
        <section>
          <Item>
            <Label>Organization</Label>
            <OrganizationsCombobox
              organizationId={organizationId}
              onSelect={(newOrganizationId) => {
                setOrganizationId(newOrganizationId);
                reset();
              }}
            />
          </Item>
        </section>
        {organizationId !== "" && (
          <section>
            <h4 className="h4 mb-2">Project</h4>
            {projectId === "" ? (
              <RowItemsContainer>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewProjectSheetOpen(true);
                  }}
                >
                  New Project
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setExistingProjectSheetOpen(true);
                  }}
                >
                  Existing Project
                </Button>
              </RowItemsContainer>
            ) : (
              <ItemsContainer>
                <Item>
                  <Label>Property Address</Label>
                  <Input
                    value={project?.propertyAddress.fullAddress ?? ""}
                    readOnly
                  />
                </Item>
                <RowItemsContainer>
                  <Item>
                    <Label>Property Type</Label>
                    <Input value={project?.propertyType ?? ""} readOnly />
                  </Item>
                  <Item>
                    <Label>Property Owner</Label>
                    <Input
                      value={project?.projectPropertyOwnerName ?? ""}
                      readOnly
                    />
                  </Item>
                  <Item>
                    <Label>Project Number</Label>
                    <Input value={project?.projectNumber ?? ""} readOnly />
                  </Item>
                </RowItemsContainer>
                <div className="w-full h-[400px]">
                  <Minimap
                    longitude={project?.propertyAddress.coordinates[0]}
                    latitude={project?.propertyAddress.coordinates[1]}
                  />
                </div>
              </ItemsContainer>
            )}
          </section>
        )}
        {organizationId !== "" && projectId !== "" && (
          <section>
            <h4 className="h4 mb-2">Jobs Related to Project</h4>
            <ItemsContainer>
              <BaseTable
                columns={jobForProjectColumns}
                data={project?.jobs ?? []}
                getRowId={({ id }) => id}
              />
              <Button
                variant={"outline"}
                onClick={() => {
                  reset();
                }}
              >
                Reset Project
              </Button>
            </ItemsContainer>
          </section>
        )}
        {projectId !== "" && (
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
                            onSelect={(newUserId) => {
                              field.onChange(newUserId);
                            }}
                            onAdd={() => {
                              setNewUserSheetOpen(true);
                            }}
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
                                            <X className="h-4 w-4 text-destructive" />
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
                            <FormItem className="flex-row gap-3 items-center">
                              <FormControl>
                                <RadioGroupItem value="Roof Mount" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Roof Mount
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex-row gap-3 items-center">
                              <FormControl>
                                <RadioGroupItem value="Ground Mount" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Ground Mount
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex-row gap-3 items-center">
                              <FormControl>
                                <RadioGroupItem value="Roof Mount & Ground Mount" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Roof Mount & Ground Mount
                              </FormLabel>
                            </FormItem>
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
                        <FormLabel required>Task</FormLabel>
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
                                    checked={wetStampChecked}
                                    onCheckedChange={(newChecked) => {
                                      if (typeof newChecked === "boolean") {
                                        setWetStampChecked(newChecked);
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
                    (task) => task.id === otherService?.id
                  ) && (
                    <FormField
                      control={form.control}
                      name="descriptionForOtherServices"
                      render={() => (
                        <FormItem>
                          <FormLabel>Description for Other Task</FormLabel>
                          {otherTasksFields.map((field, index) => (
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
                                        placeholder={`Other Task ${index + 1}`}
                                      />
                                    </FormControl>
                                    {index !== 0 && (
                                      <Button
                                        variant={"outline"}
                                        size={"icon"}
                                        className="flex-shrink-0"
                                        onClick={() => {
                                          removeOtherTask(index);
                                        }}
                                      >
                                        <X className="h-4 w-4 text-destructive" />
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
                              appendOtherTask({ description: "" });
                            }}
                            type="button"
                          >
                            Add Other Task
                          </Button>
                        </FormItem>
                      )}
                    />
                  )}
                  {wetStampChecked &&
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
                                  <Input {...field} />
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
                                      onSelect={({
                                        street1,
                                        city,
                                        stateOrRegion,
                                        postalCode,
                                        country,
                                        fullAddress,
                                        coordinates,
                                      }) => {
                                        form.setValue(
                                          "mailingAddress",
                                          {
                                            street1,
                                            street2: "",
                                            city: city ?? "",
                                            stateOrRegion: stateOrRegion ?? "",
                                            postalCode: postalCode ?? "",
                                            country: country ?? "",
                                            fullAddress,
                                            coordinates,
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
                                      readOnly
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
                                      readOnly
                                      placeholder="City"
                                    />
                                    <Input
                                      value={field.value.stateOrRegion}
                                      readOnly
                                      placeholder="State Or Region"
                                    />
                                    <Input
                                      value={field.value.postalCode}
                                      readOnly
                                      placeholder="Postal Code"
                                    />
                                    <Input
                                      value={field.value.country}
                                      readOnly
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
      {organizationId !== "" && (
        <>
          <NewProjectSheet
            organizationId={organizationId}
            open={newProjectSheetOpen}
            onOpenChange={setNewProjectSheetOpen}
            onSelect={(newProjectId) => {
              setProjectId(newProjectId);
            }}
          />
          <ExistingProjectSheet
            organizationId={organizationId}
            open={existingProjectSheetOpen}
            onOpenChange={setExistingProjectSheetOpen}
            onSelect={(newProjectId) => {
              setProjectId(newProjectId);
            }}
          />
          <NewUserByOrganizationSheet
            open={newUserSheetOpen}
            onOpenChange={setNewUserSheetOpen}
            organizationId={organizationId}
            onAdd={(newUserId) => {
              form.setValue("clientUser.id", newUserId, {
                shouldValidate: true,
                shouldDirty: true,
              });
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
      )}
    </div>
  );
}
