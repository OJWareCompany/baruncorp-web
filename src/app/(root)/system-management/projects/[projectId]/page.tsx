"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { FolderOpen, ScrollText } from "lucide-react";
import { ProjectResponseDto } from "@/api";
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
import usePatchProjectMutation from "@/queries/usePatchProjectMutation";
import useProjectQuery from "@/queries/useProjectQuery";
import { Button } from "@/components/ui/button";
import {
  PropertyTypeEnum,
  transformStringIntoNullableString,
} from "@/lib/constants";
import BaseTable from "@/components/table/BaseTable";
import PageHeader from "@/components/PageHeader";

import { jobForProjectColumns } from "@/columns/job";
import PageLoading from "@/components/PageLoading";

const formSchema = z.object({
  organization: z
    .string()
    .trim()
    .min(1, { message: "Organization is required" }),
  propertyType: PropertyTypeEnum,
  propertyOwner: z.string().trim(),
  projectNumber: z.string().trim(),
  address: z.object({
    street1: z.string().trim().min(1, { message: "Street 1 is required" }),
    street2: z.string().trim(),
    city: z.string().trim().min(1, { message: "City required" }),
    stateOrRegion: z
      .string()
      .trim()
      .min(1, { message: "State / Region is required" }),
    postalCode: z
      .string()
      .trim()
      .min(1, { message: "Postal Code is required" }),
    country: z.string().trim().min(1, { message: "Country is required" }),
    fullAddress: z.string().trim().min(1, { message: "Address is required" }),
    coordinates: z
      .array(z.number())
      .min(1, { message: "Coordinates is required" }),
  }),
});

type FieldValues = z.infer<typeof formSchema>;

function getFieldValues(project?: ProjectResponseDto): FieldValues {
  return {
    organization: project?.clientOrganization ?? "",
    propertyType: project?.propertyType ?? "Residential",
    propertyOwner: project?.projectPropertyOwnerName ?? "",
    projectNumber: project?.projectNumber ?? "",
    address: {
      street1: project?.propertyAddress?.street1 ?? "",
      street2: project?.propertyAddress?.street2 ?? "",
      city: project?.propertyAddress?.city ?? "",
      stateOrRegion: project?.propertyAddress?.state ?? "",
      postalCode: project?.propertyAddress?.postalCode ?? "",
      country: project?.propertyAddress?.country ?? "",
      fullAddress: project?.propertyAddress?.fullAddress ?? "",
      coordinates: project?.propertyAddress?.coordinates ?? [],
    },
  };
}
interface Props {
  params: {
    projectId: string;
  };
}

export default function Page({ params: { projectId } }: Props) {
  const router = useRouter();
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(),
  });

  /**
   * Query
   */
  const queryClient = useQueryClient();
  const { data: project, isLoading: isProjectQueryLoading } = useProjectQuery({
    projectId,
  });
  const { mutateAsync } = usePatchProjectMutation(projectId);

  /**
   * useEffect
   */
  useEffect(() => {
    if (project) {
      form.reset(getFieldValues(project));
    }
  }, [form, project]);

  async function onSubmit(values: FieldValues) {
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
        state: values.address.stateOrRegion,
        street2: transformStringIntoNullableString.parse(
          values.address.street2
        ),
      },
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["projects", "detail", { projectId }],
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 409:
            if (error.response?.data.errorCode.includes("30002")) {
              form.setError(
                "address",
                {
                  message: `${values.address.fullAddress} is already existed`,
                },
                { shouldFocus: true }
              );
            }
            if (error.response?.data.errorCode.includes("30003")) {
              form.setError(
                "projectNumber",
                {
                  message: `${values.projectNumber} is already existed`,
                },
                { shouldFocus: true }
              );
            }
            break;
        }
      });
  }

  const title = project?.propertyAddress.fullAddress ?? "";

  if (isProjectQueryLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/projects", name: "Projects" },
          {
            href: `/system-management/projects/${project?.projectId}`,
            name: title,
          },
        ]}
        title={title}
        action={
          <div className="flex gap-2">
            <Button asChild size={"sm"} variant={"outline"}>
              <Link
                href={`/system-management/projects/${project?.projectId}/ahj`}
              >
                <ScrollText className="mr-2 h-4 w-4" />
                <span>View AHJ Note</span>
              </Link>
            </Button>
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => {
                let openDesktopApp = false;

                window.onblur = () => {
                  openDesktopApp = true;
                };

                setTimeout(() => {
                  if (!openDesktopApp) {
                    window.alert(
                      "Couldn't find the app. Please go to the app installation page."
                    );
                    const installUrl = `http://ojw.synology.me:5000/sharing/amHYctCw5`;
                    const newWindow = window.open(installUrl, "_blank");
                    if (newWindow) {
                      newWindow.focus();
                    }
                  }
                }, 2000);

                const url = `barun://open-explorer?payload=${encodeURIComponent(
                  JSON.stringify({
                    organizationName: project?.clientOrganization,
                    projectFolderName: project?.propertyAddress.fullAddress,
                  })
                )}`;
                window.location.href = url;
              }}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              <span>Open Folder</span>
              {/* <a
                href={`barun://open-explorer?payload=${encodeURIComponent(
                  JSON.stringify({
                    organizationName: project?.clientOrganization,
                    projectFolderName: project?.propertyAddress.fullAddress,
                  })
                )}`}
              >
              </a> */}
            </Button>
          </div>
        }
      />
      <div className="space-y-6">
        <section>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Organization</FormLabel>
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
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col gap-2">
                        <FormItem>
                          <FormLabel required>Address</FormLabel>
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
                                "address",
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
                                { shouldValidate: true, shouldDirty: true }
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
              <LoadingButton
                type="submit"
                className="w-full"
                isLoading={form.formState.isSubmitting}
                disabled={!form.formState.isDirty}
              >
                Edit
              </LoadingButton>
            </form>
          </Form>
        </section>
        <section>
          <h4 className="h4 mb-2">Jobs Related to Project</h4>
          <BaseTable
            columns={jobForProjectColumns}
            data={project?.jobs ?? []}
            onRowClick={(jobId) => {
              router.push(`/system-management/jobs/${jobId}`);
            }}
            getRowId={({ id }) => id}
          />
        </section>
      </div>
    </div>
  );
}
