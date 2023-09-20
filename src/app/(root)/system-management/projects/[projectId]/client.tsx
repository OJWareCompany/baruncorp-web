"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import JobTable from "./components/JobTable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
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

interface PageHeaderProps {
  project?: ProjectResponseDto;
}

function PageHeader({ project }: PageHeaderProps) {
  if (project == null) {
    return null;
  }

  const { projectId, propertyAddress } = project;

  if (propertyAddress == null) {
    return null;
  }

  const { fullAddress } = propertyAddress;
  const title = fullAddress;

  return (
    <div className="py-2">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href="/system-management/projects">
            Projects
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink
            as={Link}
            href={`/system-management/projects/${projectId}`}
          >
            {title}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <div className="flex justify-between items-center h-9">
        <h3 className="h3">{title}</h3>
        {/* <Button asChild={true} size={"sm"}>
          <Link href={`/system-management/projects/${projectId}/ahj`}>
            View AHJ
          </Link>
        </Button> */}
      </div>
    </div>
  );
}

const formSchema = z.object({
  organization: z
    .string()
    .trim()
    .min(1, { message: "Organization is required" }),
  propertyType: z.enum(["Residential", "Commercial"]),
  propertyOwner: z.string(),
  projectNumber: z.string(),
  address: z.object({
    street1: z.string().trim().min(1, { message: "Street 1 is required" }),
    street2: z.string(),
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

interface Props {
  initialProject: ProjectResponseDto;
}

export default function Client({ initialProject }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization: initialProject.clientOrganization,
      propertyType: initialProject.propertyType,
      propertyOwner: initialProject.projectPropertyOwnerName ?? "",
      projectNumber: initialProject.projectNumber ?? "",
      address: {
        street1: initialProject.propertyAddress?.street1 ?? "",
        street2: initialProject.propertyAddress?.street2 ?? "",
        city: initialProject.propertyAddress?.city ?? "",
        stateOrRegion: initialProject.propertyAddress?.state ?? "",
        postalCode: initialProject.propertyAddress?.postalCode ?? "",
        country: initialProject.propertyAddress?.country ?? "",
        fullAddress: initialProject.propertyAddress?.fullAddress ?? "",
        coordinates: initialProject.propertyAddress?.coordinates ?? [],
      },
    },
  });
  const router = useRouter();

  /**
   * Query
   */
  const queryClient = useQueryClient();
  const { data: project } = useProjectQuery({
    projectId: initialProject.projectId,
    initialData: initialProject,
  });
  const { mutateAsync } = usePatchProjectMutation(initialProject.projectId);

  /**
   * useEffect
   */
  useEffect(() => {
    if (project) {
      form.reset({
        organization: project.clientOrganization,
        propertyType: project.propertyType,
        propertyOwner: project.projectPropertyOwnerName ?? "",
        projectNumber: project.projectNumber ?? "",
        address: {
          street1: project.propertyAddress?.street1 ?? "",
          street2: project.propertyAddress?.street2 ?? "",
          city: project.propertyAddress?.city ?? "",
          stateOrRegion: project.propertyAddress?.state ?? "",
          postalCode: project.propertyAddress?.postalCode ?? "",
          country: project.propertyAddress?.country ?? "",
          fullAddress: project.propertyAddress?.fullAddress ?? "",
          coordinates: project.propertyAddress?.coordinates ?? [],
        },
      });
    }
  }, [form, project]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const {
      address: {
        city,
        coordinates,
        country,
        fullAddress,
        postalCode,
        stateOrRegion,
        street1,
        street2,
      },
      projectNumber,
      propertyOwner,
      propertyType,
    } = values;

    await mutateAsync({
      projectNumber,
      projectPropertyOwner: propertyOwner,
      projectPropertyType: propertyType,
      projectPropertyAddress: {
        city,
        coordinates,
        country,
        fullAddress,
        postalCode,
        state: stateOrRegion,
        street1,
        street2,
      },
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["projects", "detail", initialProject.projectId],
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 409:
            if (error.response?.data.errorCode.includes("30002")) {
              form.setError("address", {
                message: `${values.address.fullAddress} is already existed`,
              });
            }
            if (error.response?.data.errorCode.includes("30003")) {
              form.setError("projectNumber", {
                message: `${values.projectNumber} is already existed`,
              });
            }
            break;
        }
      });
  }

  return (
    <>
      <PageHeader project={project} />
      <div className="py-4 space-y-4">
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
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Residential">
                              Residential
                            </SelectItem>
                            <SelectItem value="Commercial">
                              Commercial
                            </SelectItem>
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
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <FormItem>
                        <FormLabel required>Address</FormLabel>
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
        <JobTable jobs={project?.jobs ?? []} />
      </div>
    </>
  );
}
