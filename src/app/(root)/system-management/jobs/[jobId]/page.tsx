"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { FolderOpen, MoreHorizontal, ScrollText } from "lucide-react";
import JobNoteForm from "./JobNoteForm";
import OrderedServicesTable from "./OrderedServicesTable";
import { JobResponseDto } from "@/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import RowItemsContainer from "@/components/RowItemsContainer";
import AddressSearchButton from "@/components/AddressSearchButton";
import LoadingButton from "@/components/LoadingButton";
import Minimap from "@/components/Minimap";
import useProjectQuery from "@/queries/useProjectQuery";
import useJobQuery from "@/queries/useJobQuery";
import ItemsContainer from "@/components/ItemsContainer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { AffixInput } from "@/components/AffixInput";
import useApi from "@/hook/useApi";
import usePatchJobMutation from "@/queries/usePatchJobMutation";
import UsersByOrganizationCombobox from "@/components/combobox/UsersByOrganizationCombobox";
import NewUserSheet from "@/components/sheet/NewUserByOrganizationSheet";
import {
  ELECTRICAL_WET_STAMP_SERVICE_ID,
  STRUCTURAL_WET_STAMP_SERVICE_ID,
  statuses,
  transformNullishStringIntoString,
  transformStringIntoNullableString,
} from "@/lib/constants";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import usePatchJobCancelMutation from "@/queries/usePatchJobCancelMutation";
import usePatchJobHoldMutation from "@/queries/usePatchJobHoldMutation";
import CommonAlertDialogContent from "@/components/CommonAlertDialogContent";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import PageHeader from "@/components/PageHeader";
import BaseTable from "@/components/table/BaseTable";
import { jobNoteColumns } from "@/columns/jobNote";
import useJobNotesQuery from "@/queries/useJobNotesQuery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { jobForProjectColumns } from "@/columns/job";
import PageLoading from "@/components/PageLoading";

interface Props {
  params: {
    jobId: string;
  };
}

export default function Page({ params: { jobId } }: Props) {
  const router = useRouter();

  /**
   * State
   */
  const [newUserSheetOpen, setNewUserSheetOpen] = useState(false);

  /**
   * Query
   */
  const api = useApi();
  const queryClient = useQueryClient();
  const { data: job, isLoading: isJobQueryLoading } = useJobQuery({
    jobId,
  });
  const projectId = job?.projectId ?? "";
  const { data: project, isLoading: isProjectQueryLoading } = useProjectQuery({
    projectId,
  });
  const organizationId = job?.clientInfo.clientOrganizationId ?? "";
  const { mutateAsync: patchJobMutateAsync } = usePatchJobMutation(jobId);
  const { mutateAsync: patchJobCancelMutateAsync } =
    usePatchJobCancelMutation(jobId);
  const { mutateAsync: patchJobHoldMutateAsync } =
    usePatchJobHoldMutation(jobId);
  const { data: jobNotes } = useJobNotesQuery({ jobId });

  const hasWetStamp = useMemo(
    () =>
      job &&
      job.orderedServices.findIndex(
        (value) =>
          value.serviceId === ELECTRICAL_WET_STAMP_SERVICE_ID ||
          value.serviceId === STRUCTURAL_WET_STAMP_SERVICE_ID
      ) !== -1,
    [job]
  );

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
          additionalInformation: z.string().trim(),
          mountingType: z
            .string()
            .trim()
            .min(1, { message: "Mounting Type is required" }),
          isExpedited: z.boolean(),
          systemSize: z.string().trim(),
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

          if (!/^\d+$/.test(numberOfWetStamp)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Number of Wet Stamp should be a number",
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
    [hasWetStamp, project?.propertyType]
  );

  type FieldValues = z.infer<typeof formSchema>;

  const getFieldValues = useCallback((job?: JobResponseDto): FieldValues => {
    return {
      clientUser: {
        id: job?.clientInfo.clientUserId ?? "",
        emailAddressesToReceiveDeliverables: (
          job?.clientInfo.deliverablesEmails ?? []
        ).map((email) => ({
          email,
        })),
      },
      additionalInformation: job?.additionalInformationFromClient ?? "",
      mountingType: job?.mountingType ?? "",
      isExpedited: job?.isExpedited ?? false,
      systemSize: job?.systemSize == null ? "" : String(job.systemSize),
      numberOfWetStamp:
        job?.numberOfWetStamp == null ? "" : String(job.numberOfWetStamp),
      mailingAddress: {
        city: job?.mailingAddressForWetStamp?.city ?? "",
        coordinates: job?.mailingAddressForWetStamp?.coordinates ?? [],
        country: job?.mailingAddressForWetStamp?.country ?? "",
        fullAddress: job?.mailingAddressForWetStamp?.fullAddress ?? "",
        postalCode: job?.mailingAddressForWetStamp?.postalCode ?? "",
        stateOrRegion: job?.mailingAddressForWetStamp?.state ?? "",
        street1: job?.mailingAddressForWetStamp?.street1 ?? "",
        street2: job?.mailingAddressForWetStamp?.street2 ?? "",
      },
    };
  }, []);

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(),
  });
  const {
    fields: emailAddressesToReceiveDeliverablesFields,
    append: appendEmailAddressToReceiveDeliverables,
    remove: removeEmailAddressToReceiveDeliverables,
  } = useFieldArray({
    control: form.control,
    name: "clientUser.emailAddressesToReceiveDeliverables",
  });

  /**
   * useEffect
   */
  useEffect(() => {
    if (job) {
      form.reset(getFieldValues(job));
    }
  }, [form, getFieldValues, job]);

  async function onSubmit(values: FieldValues) {
    if (job == null || project == null) {
      return;
    }
    const {
      additionalInformation,
      clientUser,
      isExpedited,
      mailingAddress,
      mountingType,
      numberOfWetStamp,
      systemSize,
    } = values;
    await patchJobMutateAsync({
      additionalInformationFromClient: transformStringIntoNullableString.parse(
        additionalInformation
      ),
      clientUserId: clientUser.id,
      deliverablesEmails: clientUser.emailAddressesToReceiveDeliverables.map(
        ({ email }) => email
      ),
      systemSize:
        project.propertyType === "Commercial" ? Number(systemSize) : null,
      mountingType,
      numberOfWetStamp: hasWetStamp ? Number(numberOfWetStamp) : null,
      mailingAddressForWetStamp: hasWetStamp
        ? {
            ...mailingAddress,
            state: mailingAddress.stateOrRegion,
          }
        : null,
      isExpedited,
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["jobs", "detail", jobId],
        });
        queryClient.invalidateQueries({
          queryKey: ["projects", "detail", projectId],
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 400:
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

  const status = statuses.find((value) => value.value === job?.jobStatus);

  const title = job?.jobName ?? "";

  if (isJobQueryLoading || isProjectQueryLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/jobs", name: "Jobs" },
          { href: `/system-management/jobs/${job?.id}`, name: title },
        ]}
        title={title}
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} size={"icon"} className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/system-management/jobs/${job?.id}/ahj`}>
                  <ScrollText className="mr-2 h-4 w-4" />
                  <span>View AHJ Note</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={{
                    protocol: "barun",
                    host: "open-explorer",
                    slashes: true,
                    query: {
                      payload: JSON.stringify({
                        organizationName: project?.clientOrganization,
                        projectFolderName: project?.propertyAddress.fullAddress,
                        jobFolderName: job?.jobName,
                      }),
                    },
                  }}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  <span>Open Folder</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <div className="space-y-6">
        <section>
          <Link href={`/system-management/projects/${projectId}`}>
            <h4 className="h4 mb-2 underline inline-block">Project</h4>
          </Link>
          <ItemsContainer>
            <Item>
              <Label>Organization</Label>
              <Input value={project?.clientOrganization ?? ""} readOnly />
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
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Item>
                  <Label>Address</Label>
                  <Input
                    value={project?.propertyAddress.street1 ?? ""}
                    readOnly
                    placeholder="Street 1"
                  />
                  <Input
                    value={project?.propertyAddress.street2 ?? ""}
                    readOnly
                    placeholder="Street 2"
                  />
                  <Input
                    value={project?.propertyAddress.city ?? ""}
                    readOnly
                    placeholder="City"
                  />
                  <Input
                    value={project?.propertyAddress.state ?? ""}
                    readOnly
                    placeholder="State Or Region"
                  />
                  <Input
                    value={project?.propertyAddress.postalCode ?? ""}
                    readOnly
                    placeholder="Postal Code"
                  />
                  <Input
                    value={project?.propertyAddress.country ?? ""}
                    readOnly
                    placeholder="Country"
                  />
                </Item>
              </div>
              <div className="col-span-2">
                <Minimap
                  longitude={project?.propertyAddress.coordinates[0]}
                  latitude={project?.propertyAddress.coordinates[1]}
                />
              </div>
            </div>
            <BaseTable
              columns={jobForProjectColumns}
              data={project?.jobs ?? []}
              onRowClick={(jobId) => {
                router.push(`/system-management/jobs/${jobId}`);
              }}
              getRowId={({ id }) => id}
            />
          </ItemsContainer>
        </section>
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
                            api.users
                              .usersControllerGetUserInfoByUserId(newUserId)
                              .then((value) => {
                                form.setValue(
                                  "clientUser.emailAddressesToReceiveDeliverables",
                                  value.data.deliverablesEmails.map(
                                    (email) => ({ email })
                                  ),
                                  {
                                    shouldDirty: true,
                                  }
                                );
                                form.trigger(
                                  "clientUser.emailAddressesToReceiveDeliverables"
                                );
                              });
                          }}
                          ref={field.ref}
                          onAdd={() => {
                            setNewUserSheetOpen(true);
                          }}
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
                {project?.propertyType === "Commercial" && (
                  <div className="grid grid-cols-3 gap-4">
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
                          ref={field.ref}
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
                {hasWetStamp && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="numberOfWetStamp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Number of Wet Stamp</FormLabel>
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
                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                              <FormItem>
                                <FormLabel required>Mailing Address</FormLabel>
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
                                        city: transformNullishStringIntoString.parse(
                                          city
                                        ),
                                        stateOrRegion:
                                          transformNullishStringIntoString.parse(
                                            stateOrRegion
                                          ),
                                        postalCode:
                                          transformNullishStringIntoString.parse(
                                            postalCode
                                          ),
                                        country:
                                          transformNullishStringIntoString.parse(
                                            country
                                          ),
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
                <LoadingButton
                  type="submit"
                  disabled={!form.formState.isDirty}
                  isLoading={form.formState.isSubmitting}
                >
                  Edit
                </LoadingButton>
              </ItemsContainer>
            </form>
          </Form>
        </section>
        <section>
          <h4 className="h4 mb-2">Job Note</h4>
          <ItemsContainer>
            <BaseTable
              columns={jobNoteColumns}
              data={jobNotes?.notes ?? []}
              getRowId={({ jobNoteId }) => jobNoteId}
            />
            <JobNoteForm jobId={jobId} />
          </ItemsContainer>
        </section>
        <section>
          <h4 className="h4 mb-2">Job Status</h4>
          <div className="flex flex-col gap-2">
            <div className="flex h-10 px-3 py-2 rounded-md text-sm border border-input bg-background">
              {status && (
                <div className="flex items-center flex-1 gap-2">
                  <status.Icon className={`w-4 h-4 ${status.color}`} />
                  <span>{status.value}</span>
                </div>
              )}
            </div>
            <RowItemsContainer className="space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={"outline"}
                    disabled={
                      job?.jobStatus === "Completed" ||
                      job?.jobStatus === "On Hold"
                    }
                  >
                    Hold
                  </Button>
                </AlertDialogTrigger>
                <CommonAlertDialogContent
                  onContinue={() => {
                    patchJobHoldMutateAsync()
                      .then(() => {
                        queryClient.invalidateQueries({
                          queryKey: ["jobs", "detail", jobId],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["projects", "detail", projectId],
                        });
                      })
                      .catch(() => {});
                  }}
                />
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={"outline"}
                    disabled={
                      job?.jobStatus === "Completed" ||
                      job?.jobStatus === "Canceled"
                    }
                  >
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <CommonAlertDialogContent
                  onContinue={() => {
                    patchJobCancelMutateAsync()
                      .then(() => {
                        queryClient.invalidateQueries({
                          queryKey: ["jobs", "detail", jobId],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["projects", "detail", projectId],
                        });
                      })
                      .catch(() => {});
                  }}
                />
              </AlertDialog>
            </RowItemsContainer>
          </div>
        </section>
        <section>
          <h4 className="h4 mb-2">Tasks</h4>
          <OrderedServicesTable
            assignedTasks={job?.assignedTasks ?? []}
            orderedServices={job?.orderedServices ?? []}
            jobId={jobId}
            projectId={projectId}
          />
        </section>
      </div>
      <NewUserSheet
        open={newUserSheetOpen}
        onOpenChange={setNewUserSheetOpen}
        organizationId={organizationId}
        onAdd={(newUserId) => {
          form.setValue("clientUser.id", newUserId, {
            shouldValidate: true,
            shouldDirty: true,
          });
          api.users
            .usersControllerGetUserInfoByUserId(newUserId)
            .then((value) => {
              form.setValue(
                "clientUser.emailAddressesToReceiveDeliverables",
                value.data.deliverablesEmails.map((email) => ({ email })),
                {
                  shouldDirty: true,
                }
              );
              form.trigger("clientUser.emailAddressesToReceiveDeliverables");
            });
        }}
      />
    </div>
  );
}
