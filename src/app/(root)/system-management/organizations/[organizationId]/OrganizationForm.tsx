"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AxiosError } from "axios";
import { OrganizationResponseDto } from "@/api/api-spec";
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
import {
  MountingTypeEnum,
  MountingTypeEnumWithEmptyString,
  PropertyTypeEnum,
  PropertyTypeEnumWithEmptyString,
  digitRegExp,
  transformMountingTypeEnumWithEmptyStringIntoNullableMountingTypeEnum,
  transformNullishMountingTypeEnumIntoMountingTypeEnumWithEmptyString,
  transformNullishPropertyTypeEnumIntoPropertyTypeEnumWithEmptyString,
  transformNullishStringIntoString,
  transformPropertyTypeEnumWithEmptyStringIntoNullablePropertyTypeEnum,
  transformStringIntoNullableString,
} from "@/lib/constants";
import LoadingButton from "@/components/LoadingButton";
import usePatchOrganizationMutation from "@/mutations/usePatchOrganizationMutation";
import { Checkbox } from "@/components/ui/checkbox";
import { getOrganizationQueryKey } from "@/queries/useOrganizationQuery";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z
  .object({
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
        if (value.fullAddress.length === 0) {
          // TODO: address required인지 체크
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Address is required",
          });
        }
      }),
    isSpecialRevisionPricing: z.boolean(),
    numberOfFreeRevisionCount: z.string().trim(),
    isVendor: z.boolean(),
    isDelinquent: z.boolean(),
    isTierDiscount: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const { isSpecialRevisionPricing, numberOfFreeRevisionCount } = values;

    if (!isSpecialRevisionPricing) {
      return;
    }

    if (numberOfFreeRevisionCount.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Number of Free Revisions is required",
        path: ["numberOfFreeRevisionCount"],
      });
    }
  });

type FieldValues = z.infer<typeof formSchema>;

function getFieldValues(organization: OrganizationResponseDto): FieldValues {
  return {
    name: organization.name,
    address: {
      ...organization.address,
      country: transformNullishStringIntoString.parse(
        organization.address.country
      ),
      street2: transformNullishStringIntoString.parse(
        organization.address.street2
      ),
    },
    defaultMountingType:
      transformNullishMountingTypeEnumIntoMountingTypeEnumWithEmptyString.parse(
        organization.mountingTypeDefaultValue
      ),
    defaultPropertyType:
      transformNullishPropertyTypeEnumIntoPropertyTypeEnumWithEmptyString.parse(
        organization.projectPropertyTypeDefaultValue
      ),
    emailAddressToReceiveInvoice: transformNullishStringIntoString.parse(
      organization.invoiceRecipientEmail
    ),
    phoneNumber: transformNullishStringIntoString.parse(
      organization.phoneNumber
    ),
    isSpecialRevisionPricing: organization.isSpecialRevisionPricing,
    numberOfFreeRevisionCount: transformNullishStringIntoString.parse(
      organization.numberOfFreeRevisionCount
    ),
    isVendor: organization.isVendor,
    isDelinquent: organization.isDelinquent,
    isTierDiscount: organization.isTierDiscount,
  };
}

interface Props {
  organization: OrganizationResponseDto;
}

export default function OrganizationForm({ organization }: Props) {
  const { organizationId } = useParams() as { organizationId: string };
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(organization),
  });

  const watchIsSpecialRevisionPricing = form.watch("isSpecialRevisionPricing");

  const { mutateAsync } = usePatchOrganizationMutation(organizationId);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (organization) {
      form.reset(getFieldValues(organization));
    }
  }, [form, organization]);

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      address: {
        ...values.address,
        country: transformStringIntoNullableString.parse(
          values.address.country
        ),
        street2: transformStringIntoNullableString.parse(
          values.address.street2
        ),
      },
      invoiceRecipientEmail: transformStringIntoNullableString.parse(
        values.emailAddressToReceiveInvoice
      ),
      mountingTypeDefaultValue:
        transformMountingTypeEnumWithEmptyStringIntoNullableMountingTypeEnum.parse(
          values.defaultMountingType
        ),
      phoneNumber: transformStringIntoNullableString.parse(values.phoneNumber),
      projectPropertyTypeDefaultValue:
        transformPropertyTypeEnumWithEmptyStringIntoNullablePropertyTypeEnum.parse(
          values.defaultPropertyType
        ),
      isSpecialRevisionPricing: values.isSpecialRevisionPricing,
      numberOfFreeRevisionCount: values.isSpecialRevisionPricing
        ? Number(values.numberOfFreeRevisionCount)
        : null,
      isVendor: values.isVendor,
      isDelinquent: values.isDelinquent,
    })
      .then(() => {
        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getOrganizationQueryKey(organizationId),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
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

  return (
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
                  <Input {...field} disabled />
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
                <FormLabel required>Email Address to Receive Invoice</FormLabel>
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
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-2">
                  <FormItem>
                    <FormLabel required>Address</FormLabel>
                    <AddressSearchButton
                      ref={field.ref}
                      format="international"
                      onSelect={(value) => {
                        form.setValue(
                          "address",
                          {
                            ...value,
                            street2: "",
                          },
                          { shouldValidate: true, shouldDirty: true }
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
                <div className="col-span-1">
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
        <FormField
          control={form.control}
          name="isSpecialRevisionPricing"
          render={({ field }) => (
            <FormItem className="flex-row-reverse justify-end items-center gap-3">
              <FormLabel>Free Revision Pricing</FormLabel>
              <FormControl>
                <Checkbox
                  ref={field.ref}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchIsSpecialRevisionPricing && (
          <FormField
            control={form.control}
            name="numberOfFreeRevisionCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Number of Free Revisions</FormLabel>
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
        )}
        {organization.organizationType !== "administration" && (
          <FormField
            control={form.control}
            name="isVendor"
            render={({ field }) => (
              <FormItem className="flex-row-reverse justify-end items-center gap-3">
                <FormLabel>Vendor</FormLabel>
                <FormControl>
                  <Checkbox
                    ref={field.ref}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {organization.organizationType !== "administration" && (
          <FormField
            control={form.control}
            name="isDelinquent"
            render={({ field }) => (
              <FormItem className="flex-row-reverse justify-end items-center gap-3">
                <FormLabel>Delinquent</FormLabel>
                <FormControl>
                  <Checkbox
                    ref={field.ref}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {organization.organizationType !== "administration" && (
          <FormField
            control={form.control}
            name="isTierDiscount"
            render={({ field }) => (
              <FormItem className="flex-row-reverse justify-end items-center gap-3">
                <FormLabel>Tiered Discount</FormLabel>
                <FormControl>
                  <Checkbox
                    ref={field.ref}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <LoadingButton
          type="submit"
          className="w-full"
          isLoading={form.formState.isSubmitting}
          disabled={!form.formState.isDirty}
        >
          Save
        </LoadingButton>
      </form>
    </Form>
  );
}
