"use client";

import * as z from "zod";
import Link from "next/link";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2, PlusCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import NewProjectSheet from "./components/NewProjectSheet";
import ExistingProjectSheet from "./components/ExistingProjectSheet";
import JobsTable from "./components/JobsTable";
import NewClientUserSheet from "./components/NewClientUserSheet";
import ResultDialog from "./components/ResultDialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import RowItemsContainer from "@/components/RowItemsContainer";
import useProjectQuery from "@/queries/useProjectQuery";
import { Input } from "@/components/ui/input";
import Minimap from "@/components/Minimap";
import ItemsContainer from "@/components/ItemsContainer";
import useTasksQuery from "@/queries/useTasksQuery";
import { Checkbox } from "@/components/ui/checkbox";
import useUserByUserIdQuery from "@/queries/useUserQuery";
import AddressSearchButton from "@/components/AddressSearchButton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { AffixInput } from "@/components/AffixInput";
import useOrganizationsQuery from "@/queries/useOrganizationsQuery";
import { cn } from "@/lib/utils";
import useUsersByOrganizationIdQuery from "@/queries/useClientUsersByOrganizationIdQuery";
import usePostJobMutation from "@/queries/usePostJobMutation";
import { CreateOrderedTaskWhenJobIsCreatedRequestDto } from "@/api";
import { schemaToConvertFromStringToNullableString } from "@/lib/constants";
import Dropzone from "@/components/Dropzone";
import LoadingButton from "@/components/LoadingButton";

function PageHeader() {
  return (
    <div className="py-2 ">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href="/project-intake-portal">
            Project Intake Portal
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink
            as={Link}
            href="/project-intake-portal/new-service-order"
          >
            New Service Order
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <div className="flex justify-between items-center h-9">
        <h3 className="h3">New Service Order</h3>
      </div>
    </div>
  );
}

const formSchema = z.object({
  organization: z.object({
    id: z.string().trim().min(1, { message: "Organization Id is required" }),
    name: z
      .string()
      .trim()
      .min(1, { message: "Organization Name is required" }),
  }),
  project: z
    .object({
      tempId: z.string(),
      id: z.string().trim().min(1, { message: "Project Id is required" }),
      propertyAddress: z
        .string()
        .trim()
        .min(1, { message: "Project Property Address is required" }),
      propertyType: z.enum(["Residential", "Commercial"], {
        required_error: "Project Property Type is required",
      }),
      propertyOwner: z.string(),
      projectNumber: z.string(),
      coordinates: z
        .array(z.number())
        .min(1, { message: "Project Coordinates is required" }),
      job: z
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
          systemSize: z.string(),
          mountingType: z.enum([
            "Roof Mount",
            "Ground Mount",
            "Roof Mount & Ground Mount",
          ]),
          tasks: z
            .array(
              z.object({
                id: z.string(),
                name: z.string(),
                description: z.string().nullable(),
              })
            )
            .min(1, { message: "At least one task should be selected" }),
          descriptionForOtherTasks: z.array(
            z.object({
              description: z.string().trim(),
            })
          ),
          typeOfWetStamp: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable(),
            })
          ),
          numberOfWetStamp: z.string(),
          mailingAddress: z.object({
            street1: z.string(),
            street2: z.string(),
            city: z.string(),
            stateOrRegion: z.string(),
            postalCode: z.string(),
            country: z.string(),
            fullAddress: z.string(),
            coordinates: z.array(z.number()),
          }),
          additionalInformation: z.string(),
          isExpedited: z.boolean(),
        })
        .superRefine((values, ctx) => {
          const { tasks, descriptionForOtherTasks } = values;
          if (tasks.find((task) => task.name === "Other") === undefined) {
            return;
          }

          for (const index in descriptionForOtherTasks) {
            const { description } = descriptionForOtherTasks[index];
            if (description.length === 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Description for Other Task is required",
                path: [`descriptionForOtherTasks.${index}.description`],
              });
            }
          }
        })
        .superRefine((values, ctx) => {
          const { tasks, typeOfWetStamp } = values;
          if (tasks.find((task) => task.name === "Wet Stamp") === undefined) {
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
          const { tasks, numberOfWetStamp } = values;
          if (tasks.find((task) => task.name === "Wet Stamp") === undefined) {
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
          const { tasks, mailingAddress } = values;
          if (tasks.find((task) => task.name === "Wet Stamp") === undefined) {
            return;
          }

          if (mailingAddress.fullAddress.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Address is required",
              path: [`mailingAddress`],
            });
            return;
          }
        }),
    })
    .superRefine((values, ctx) => {
      const {
        propertyType,
        job: { systemSize },
      } = values;
      if (propertyType === "Residential") {
        return;
      }

      if (systemSize.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "System Size is required",
          path: ["job.systemSize"],
        });
        return;
      }

      if (!/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/.test(systemSize)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "System Size should be a number",
          path: ["job.systemSize"],
        });
        return;
      }
    }),
});

export default function Page() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization: {
        id: "",
        name: "",
      },
      project: {
        tempId: "",
        id: "",
        projectNumber: "",
        propertyAddress: "",
        propertyOwner: "",
        coordinates: [],
        job: {
          clientUser: {
            id: "",
            emailAddressesToReceiveDeliverables: [],
          },
          systemSize: "",
          mountingType: "Roof Mount",
          tasks: [],
          descriptionForOtherTasks: [{ description: "" }],
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
      },
    },
  });
  const router = useRouter();

  /**
   * Fields
   */
  const {
    fields: emailAddressesToReceiveDeliverablesFields,
    append: appendEmailAddressToReceiveDeliverables,
    remove: removeEmailAddressToReceiveDeliverables,
  } = useFieldArray({
    control: form.control,
    name: "project.job.clientUser.emailAddressesToReceiveDeliverables",
  });
  const {
    fields: otherTasksFields,
    append: appendOtherTask,
    remove: removeOtherTask,
  } = useFieldArray({
    control: form.control,
    name: "project.job.descriptionForOtherTasks",
  });

  /**
   * State
   */
  const [organizationsComboboxOpen, setOrganizationsComboboxOpen] =
    useState(false);
  const [clientUsersComboboxOpen, setClientUsersComboboxOpen] = useState(false);
  const [newProjectSheetOpen, setNewProjectSheetOpen] = useState(false);
  const [existingProjectSheetOpen, setExistingProjectSheetOpen] =
    useState(false);
  const [newClientUserSheetOpen, setNewClientUserSheetOpen] = useState(false);
  const [result, setResult] = useState<
    { open: false } | { open: true; jobId: string }
  >({ open: false });

  /**
   * Watch
   */
  const watchOrganization = form.watch("organization");
  const watchProject = form.watch("project");
  const watchProjectTempId = form.watch("project.tempId");
  const watchClientUser = form.watch("project.job.clientUser");
  const watchTasks = form.watch("project.job.tasks");
  const watchTypeOfWetStamp = form.watch("project.job.typeOfWetStamp");

  /**
   * Query
   */
  const { data: organizations, isLoading: isOrganizationsQueryLoading } =
    useOrganizationsQuery();
  const { data: project } = useProjectQuery(watchProjectTempId);
  const { data: users, isLoading: isUsersQueryLoading } =
    useUsersByOrganizationIdQuery(watchOrganization.id);
  const { data: user } = useUserByUserIdQuery(watchClientUser.id);
  const { data: tasks } = useTasksQuery();
  const { mutateAsync } = usePostJobMutation();

  /**
   * useEffect
   */
  useEffect(() => {
    if (project) {
      const {
        projectId,
        projectNumber,
        propertyAddress,
        projectPropertyOwnerName,
        propertyType,
        systemSize,
        mailingAddressForWetStamp,
        hasHistoryElectricalPEStamp, // TODO: replace name
        hasHistoryStructuralPEStamp, // TODO: replace name
      } = project;
      const { fullAddress, coordinates } = propertyAddress ?? {};

      const typeOfWetStamp: {
        id: string;
        name: string;
        description: string | null;
      }[] = [];
      if (hasHistoryElectricalPEStamp) {
        const electricalWetStamp = tasks
          ?.find((task) => task.name === "Wet Stamp")
          ?.childTasks.find((value) => value.name === "Electrical Wet Stamp");
        if (electricalWetStamp != null) {
          typeOfWetStamp.push({
            id: electricalWetStamp.id,
            name: electricalWetStamp.name,
            description: null,
          });
        }
      }
      if (hasHistoryStructuralPEStamp) {
        const structuralWetStamp = tasks
          ?.find((task) => task.name === "Wet Stamp")
          ?.childTasks.find((value) => value.name === "Structural Wet Stamp");
        if (structuralWetStamp != null) {
          typeOfWetStamp.push({
            id: structuralWetStamp.id,
            name: structuralWetStamp.name,
            description: null,
          });
        }
      }

      form.setValue("project", {
        tempId: projectId,
        id: projectId,
        projectNumber: projectNumber ?? "",
        propertyAddress: fullAddress ?? "",
        coordinates: coordinates ?? [],
        propertyOwner: projectPropertyOwnerName ?? "",
        propertyType,
        job: {
          clientUser: {
            id: "",
            emailAddressesToReceiveDeliverables: [],
          },
          systemSize: systemSize == null ? "" : String(systemSize),
          mountingType: "Roof Mount", // TODO: default value of organization
          tasks: [],
          descriptionForOtherTasks: [{ description: "" }],
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
        },
      });
    }
  }, [form, project, tasks]);

  useEffect(() => {
    if (user) {
      form.setValue(
        "project.job.clientUser.emailAddressesToReceiveDeliverables",
        user.deliverablesEmails.map((email) => ({ email }))
      );
    }
  }, [form, user]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const {
      organization: {},
      project: {
        id: projectId,
        propertyType,
        job: {
          additionalInformation,
          clientUser: { emailAddressesToReceiveDeliverables, id: clientUserId },
          systemSize,
          mountingType,
          tasks,
          typeOfWetStamp,
          descriptionForOtherTasks,
          mailingAddress,
          numberOfWetStamp,
          isExpedited,
        },
      },
    } = values;

    const taskIds: CreateOrderedTaskWhenJobIsCreatedRequestDto[] = [];

    for (const task of tasks) {
      if (task.name === "Other") {
        for (const descriptionForOtherTask of descriptionForOtherTasks) {
          taskIds.push({
            taskId: task.id,
            description: descriptionForOtherTask.description,
          });
        }
        continue;
      }

      if (task.name === "Wet Stamp") {
        for (const type of typeOfWetStamp) {
          taskIds.push({ taskId: type.id, description: type.description });
        }
        continue;
      }

      taskIds.push({ taskId: task.id, description: task.description });
    }

    const hasWetStamp =
      tasks.find((task) => task.name === "Wet Stamp") !== undefined;

    await mutateAsync({
      additionalInformationFromClient:
        schemaToConvertFromStringToNullableString.parse(additionalInformation),
      clientUserId,
      deliverablesEmails: emailAddressesToReceiveDeliverables.map(
        ({ email }) => email
      ),
      isExpedited,
      systemSize: propertyType === "Commercial" ? Number(systemSize) : null,
      mountingType,
      projectId,
      taskIds,
      mailingAddressForWetStamp: hasWetStamp
        ? {
            ...mailingAddress,
            state: mailingAddress.stateOrRegion,
          }
        : null,
      numberOfWetStamp: hasWetStamp ? Number(numberOfWetStamp) : null,
    })
      .then(({ id }) => {
        // TODO: client인 경우 어떻게? project-management/jobs/:jobId로 이동?
        setResult({ open: true, jobId: id });
      })
      .catch(() => {});
  }

  return (
    <>
      <PageHeader />
      <div className="py-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <section>
              {/* TODO: New Organization */}
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Organization</FormLabel>
                    <FormControl>
                      <Popover
                        open={organizationsComboboxOpen}
                        onOpenChange={setOrganizationsComboboxOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            aria-expanded={organizationsComboboxOpen}
                            className="justify-between px-3 font-normal"
                          >
                            {field.value.id === ""
                              ? "Select an organization"
                              : field.value.name}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search" />
                            {isOrganizationsQueryLoading ? (
                              <div className="h-[68px] flex justify-center items-center">
                                <Loader2 className="h-6 w-6 animate-spin" />
                              </div>
                            ) : (
                              <>
                                <CommandEmpty>
                                  No organization found.
                                </CommandEmpty>
                                <CommandList>
                                  <CommandGroup>
                                    {organizations?.map((organization) => (
                                      <CommandItem
                                        key={organization.id}
                                        value={organization.name}
                                        onSelect={() => {
                                          form.setValue("organization", {
                                            id: organization.id,
                                            name: organization.name,
                                          });
                                          form.resetField("project");
                                          setOrganizationsComboboxOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            watchOrganization.id ===
                                              organization.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {organization.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </>
                            )}
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
            {watchOrganization.id !== "" && (
              <section>
                <h4 className="h4 mb-2">Project</h4>
                {watchProject.id === "" ? (
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
                    <FormField
                      control={form.control}
                      name="project.propertyAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Property Address</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <RowItemsContainer>
                      <FormField
                        control={form.control}
                        name="project.propertyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Property Type</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="project.propertyOwner"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Owner</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="project.projectNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Number</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </RowItemsContainer>
                    <div className="w-full h-[400px]">
                      <Minimap
                        longitude={watchProject.coordinates[0]}
                        latitude={watchProject.coordinates[1]}
                      />
                    </div>
                    <JobsTable jobs={project?.jobs ?? []} />
                    <Button
                      variant={"outline"}
                      onClick={() => {
                        form.resetField("project");
                      }}
                    >
                      Reset Project
                    </Button>
                  </ItemsContainer>
                )}
              </section>
            )}
            {watchProject.id !== "" && (
              <>
                <section>
                  <h4 className="h4 mb-2">Job</h4>
                  <ItemsContainer>
                    <FormField
                      control={form.control}
                      name="project.job.clientUser.id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Client User</FormLabel>
                          <FormControl>
                            <Popover
                              open={clientUsersComboboxOpen}
                              onOpenChange={setClientUsersComboboxOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  aria-expanded={clientUsersComboboxOpen}
                                  className="justify-between px-3 font-normal"
                                >
                                  {field.value === ""
                                    ? "Select a client user"
                                    : users?.find(
                                        (user) => user.id === field.value
                                      )?.fullName}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="p-0 w-[326px]"
                                align="start"
                              >
                                <Command>
                                  <CommandInput placeholder="Search" />
                                  {isUsersQueryLoading && (
                                    <div className="h-[68px] flex justify-center items-center">
                                      <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                  )}
                                  {!isUsersQueryLoading &&
                                  users &&
                                  users.length === 0 ? (
                                    <div className="h-[68px] flex justify-center items-center text-sm">
                                      No client user found.
                                    </div>
                                  ) : (
                                    <>
                                      <CommandEmpty>
                                        No client user found.
                                      </CommandEmpty>
                                      <CommandList>
                                        <CommandGroup>
                                          {users?.map((user) => (
                                            <CommandItem
                                              key={user.email}
                                              value={`${user.fullName} ${user.email}`}
                                              onSelect={() => {
                                                field.onChange(user.id);
                                                setClientUsersComboboxOpen(
                                                  false
                                                );
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4 flex-shrink-0",
                                                  field.value === user.id
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                              <div>
                                                <p className="font-medium">
                                                  {user.fullName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  {user.email}
                                                </p>
                                              </div>
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </>
                                  )}
                                  <div className="-mx-1 h-px bg-border" />
                                  <div className="p-1 text-foreground">
                                    <div
                                      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                      onClick={() => {
                                        setClientUsersComboboxOpen(false);
                                        setNewClientUserSheetOpen(true);
                                      }}
                                    >
                                      <PlusCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                                      New Client User
                                    </div>
                                  </div>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {watchClientUser.emailAddressesToReceiveDeliverables
                      .length !== 0 && (
                      <FormField
                        control={form.control}
                        name="project.job.clientUser.emailAddressesToReceiveDeliverables"
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
                                    name={`project.job.clientUser.emailAddressesToReceiveDeliverables.${index}.email`}
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
                    <div className="grid grid-cols-3 gap-4">
                      {watchProject.propertyType === "Commercial" && (
                        <FormField
                          control={form.control}
                          name="project.job.systemSize"
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
                      )}
                    </div>
                    {/* TODO: org가 default mounting type을 가지고 있도록 해서, 그 값이 기본으로 들어가 있게끔 */}
                    <FormField
                      control={form.control}
                      name="project.job.mountingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Mounting Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
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
                      name="project.job.tasks"
                      render={() => (
                        <FormItem>
                          <FormLabel required>Task</FormLabel>
                          <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                            {tasks
                              ?.sort((a, b) => {
                                if (a.name === "Other") {
                                  return 1;
                                }
                                if (b.name === "Other") {
                                  return -1;
                                }
                                return a.name < b.name ? -1 : 1;
                              })
                              .map((task) => (
                                <FormField
                                  key={task.id}
                                  control={form.control}
                                  name="project.job.tasks"
                                  render={({ field }) => (
                                    <FormItem
                                      key={task.id}
                                      className="flex flex-row gap-3 items-center"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={
                                            field.value.find(
                                              (value) => value.id === task.id
                                            ) !== undefined
                                          }
                                          onCheckedChange={(checked) => {
                                            switch (task.name) {
                                              case "ESS Electrical PE Stamp":
                                              case "Electrical Load Calculation":
                                              case "Electrical Load Justification Letter":
                                              case "Electrical PE Stamp":
                                              case "Electrical Post Installed Letter":
                                                if (
                                                  checked &&
                                                  watchTypeOfWetStamp.find(
                                                    (value) =>
                                                      value.name ===
                                                      "Electrical Wet Stamp"
                                                  ) === undefined
                                                ) {
                                                  form.setValue(
                                                    "project.job.typeOfWetStamp",
                                                    [
                                                      ...watchTypeOfWetStamp,
                                                      tasks
                                                        ?.find(
                                                          (task) =>
                                                            task.name ===
                                                            "Wet Stamp"
                                                        )
                                                        ?.childTasks.find(
                                                          (value) =>
                                                            value.name ===
                                                            "Electrical Wet Stamp"
                                                        )!,
                                                    ]
                                                  );
                                                }

                                                if (!checked) {
                                                  form.setValue(
                                                    "project.job.typeOfWetStamp",
                                                    watchTypeOfWetStamp.filter(
                                                      (value) =>
                                                        value.name !==
                                                        "Electrical Wet Stamp"
                                                    )
                                                  );
                                                }
                                                break;

                                              case "ESS Structural PE Stamp":
                                              case "Special Inspection Form":
                                              case "Structural Feasibility":
                                              case "Structural PE Stamp":
                                              case "Structural Post Installed Letter":
                                                if (
                                                  checked &&
                                                  watchTypeOfWetStamp.find(
                                                    (value) =>
                                                      value.name ===
                                                      "Structural Wet Stamp"
                                                  ) === undefined
                                                ) {
                                                  form.setValue(
                                                    "project.job.typeOfWetStamp",
                                                    [
                                                      ...watchTypeOfWetStamp,
                                                      tasks
                                                        ?.find(
                                                          (task) =>
                                                            task.name ===
                                                            "Wet Stamp"
                                                        )
                                                        ?.childTasks.find(
                                                          (value) =>
                                                            value.name ===
                                                            "Structural Wet Stamp"
                                                        )!,
                                                    ]
                                                  );
                                                }

                                                if (!checked) {
                                                  form.setValue(
                                                    "project.job.typeOfWetStamp",
                                                    watchTypeOfWetStamp.filter(
                                                      (value) =>
                                                        value.name !==
                                                        "Structural Wet Stamp"
                                                    )
                                                  );
                                                }
                                                break;
                                            }

                                            if (checked) {
                                              field.onChange([
                                                ...field.value,
                                                {
                                                  id: task.id,
                                                  name: task.name,
                                                  description: null,
                                                },
                                              ]);
                                              return;
                                            }

                                            field.onChange(
                                              field.value.filter(
                                                (value) => value.id !== task.id
                                              )
                                            );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {task.name}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {watchTasks.find((task) => task.name === "Other") && (
                      <FormField
                        control={form.control}
                        name="project.job.descriptionForOtherTasks"
                        render={() => (
                          <FormItem>
                            <FormLabel>Description for Other Task</FormLabel>
                            {otherTasksFields.map((field, index) => (
                              <FormField
                                key={field.id}
                                control={form.control}
                                name={`project.job.descriptionForOtherTasks.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex flex-row gap-2">
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder={`Other Task ${
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
                                            removeOtherTask(index);
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
                    {watchTasks.find((task) => task.name === "Wet Stamp") && (
                      <>
                        <FormField
                          control={form.control}
                          name="project.job.typeOfWetStamp"
                          render={() => (
                            <FormItem>
                              <FormLabel required>Type of Wet Stamp</FormLabel>
                              {tasks
                                ?.find((task) => task.name === "Wet Stamp")
                                ?.childTasks.map((task) => (
                                  <FormField
                                    key={task.id}
                                    control={form.control}
                                    name="project.job.typeOfWetStamp"
                                    render={({ field }) => (
                                      <FormItem
                                        key={task.id}
                                        className="flex flex-row gap-3 items-center"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={
                                              field.value.find(
                                                (value) => value.id === task.id
                                              ) !== undefined
                                            }
                                            onCheckedChange={(checked) =>
                                              checked
                                                ? field.onChange([
                                                    ...field.value,
                                                    {
                                                      id: task.id,
                                                      name: task.name,
                                                      description: null,
                                                    },
                                                  ])
                                                : field.onChange(
                                                    field.value.filter(
                                                      (value) =>
                                                        value.id !== task.id
                                                    )
                                                  )
                                            }
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {task.name}
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="project.job.numberOfWetStamp"
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
                          name="project.job.mailingAddress"
                          render={({ field }) => (
                            <div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col gap-2">
                                  <FormItem>
                                    <FormLabel required>
                                      Mailing Address
                                    </FormLabel>
                                    <AddressSearchButton
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
                                          "project.job.mailingAddress",
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
                                          { shouldValidate: true }
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
                      name="project.job.additionalInformation"
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
                      name="project.job.isExpedited"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expedite</FormLabel>
                          <FormControl>
                            <Checkbox
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
                    <Dropzone />
                  </ItemsContainer>
                </section>
                <LoadingButton
                  className="w-full"
                  type="submit"
                  isLoading={form.formState.isSubmitting}
                >
                  Submit
                </LoadingButton>
              </>
            )}
          </form>
        </Form>
      </div>
      {watchOrganization.id !== "" && (
        <>
          <NewProjectSheet
            selectedOrganizationId={watchOrganization.id}
            open={newProjectSheetOpen}
            onOpenChange={setNewProjectSheetOpen}
            onSelect={(newProjectId) => {
              form.setValue("project.tempId", newProjectId);
            }}
          />
          <ExistingProjectSheet
            selectedOrganizationId={watchOrganization.id}
            open={existingProjectSheetOpen}
            onOpenChange={setExistingProjectSheetOpen}
            onSelect={(newProjectId) => {
              form.setValue("project.tempId", newProjectId);
            }}
          />
          <NewClientUserSheet
            selectedOrganizationId={watchOrganization.id}
            open={newClientUserSheetOpen}
            onOpenChange={setNewClientUserSheetOpen}
            onSelect={(newUserId) => {
              form.setValue("project.job.clientUser.id", newUserId, {
                shouldValidate: true,
              });
            }}
          />
          <ResultDialog
            open={result.open}
            onOpenChange={(newOpen) => {
              if (!newOpen) {
                form.resetField("project");
                setResult({ open: false });
              }
            }}
            onOrderMoreButtonClick={() => {
              form.resetField("project");
              setResult({ open: false });
            }}
            onViewDetailButtonClick={() => {
              if (!result.open) {
                return;
              }

              router.push(`/system-management/jobs/${result.jobId}`);
            }}
          />
        </>
      )}
    </>
  );
}
