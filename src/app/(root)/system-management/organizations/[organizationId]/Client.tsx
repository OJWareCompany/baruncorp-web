"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { OrganizationResponseDto } from "@/api";
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
import Minimap from "@/components/Minimap";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import {
  MountingTypeEnum,
  MountingTypeEnumWithEmptyString,
  PropertyTypeEnum,
  PropertyTypeEnumWithEmptyString,
  transformNullishMountingTypeEnumIntoMountingTypeEnumWithEmptyString,
  transformNullishPropertyTypeEnumIntoPropertyTypeEnumWithEmptyString,
} from "@/lib/constants";
import PageHeader from "@/components/PageHeader";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  emailAddressToReceiveInvoice: z
    .string()
    .trim()
    .min(1, { message: "Email Address is required" })
    .email({
      message: "Format of Email Address is incorrect",
    }),
  phoneNumber: z.string().trim(),
  defaultPropertyType: PropertyTypeEnumWithEmptyString,
  defaultMountingType: MountingTypeEnumWithEmptyString,
  address: z
    .object({
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
      fullAddress: z
        .string()
        .trim()
        .min(1, { message: "Full Address is required" }),
      coordinates: z
        .array(z.number())
        .min(1, { message: "Coordinates is required" }),
    })
    .superRefine((value, ctx) => {
      if (value.fullAddress.length === 0) {
        // TODO: address required인지 체크
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Address is required",
        });
      }
    }),
});

type FieldValues = z.infer<typeof formSchema>;

function getFieldValues(
  organization: OrganizationResponseDto | null
): FieldValues {
  return {
    name: organization?.name ?? "",
    address: {
      city: organization?.address.city ?? "",
      coordinates: organization?.address.coordinates ?? [],
      fullAddress: organization?.address.fullAddress ?? "",
      postalCode: organization?.address.postalCode ?? "",
      street1: organization?.address.street1 ?? "",
      country: organization?.address.country ?? "",
      stateOrRegion: organization?.address.state ?? "",
      street2: organization?.address.street2 ?? "",
    },
    defaultMountingType:
      transformNullishMountingTypeEnumIntoMountingTypeEnumWithEmptyString.parse(
        organization?.mountingTypeDefaultValue
      ),
    defaultPropertyType:
      transformNullishPropertyTypeEnumIntoPropertyTypeEnumWithEmptyString.parse(
        organization?.projectPropertyTypeDefaultValue
      ),
    emailAddressToReceiveInvoice: organization?.email ?? "",
    phoneNumber: organization?.phoneNumber ?? "",
  };
}

interface Props {
  initialOrganization: OrganizationResponseDto | null;
}

export default function Client({ initialOrganization }: Props) {
  /**
   * Form
   */
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(initialOrganization),
  });

  /**
   * Query
   */
  const organizationId = initialOrganization?.id ?? "";
  const { data: organization } = useOrganizationQuery({
    organizationId,
    initialData: initialOrganization,
  });

  /**
   * useEffect
   */
  useEffect(() => {
    if (organization) {
      form.reset(getFieldValues(organization));
    }
  }, [form, organization]);

  async function onSubmit(values: FieldValues) {}

  const title = organization?.name ?? "";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/organizations", name: "Organizations" },
          {
            href: `/system-management/organizations/${organization?.id}`,
            name: title,
          },
        ]}
        title={title}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <RowItemsContainer>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailAddressToReceiveInvoice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    Email Address to Receive Invoice
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </RowItemsContainer>
          <RowItemsContainer>
            <FormField
              control={form.control}
              name="defaultPropertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Property Type</FormLabel>
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
            <FormField
              control={form.control}
              name="defaultMountingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Mounting Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger ref={field.ref}>
                        <SelectValue placeholder="Select a mounting Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {MountingTypeEnum.options.map((option) => (
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
                        ref={field.ref}
                        format="international"
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
          {/* <LoadingButton
              type="submit"
              className="w-full"
              isLoading={form.formState.isSubmitting}
            >
              Edit
            </LoadingButton> */}
        </form>
      </Form>
    </div>
  );
}
