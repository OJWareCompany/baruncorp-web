"use client";

import * as z from "zod";
import { DefaultValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { DialogProps } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import usePostProjectMutation from "@/queries/usePostProjectMutation";
import {
  PropertyTypeEnum,
  transformStringIntoNullableString,
} from "@/lib/constants";
import LoadingButton from "@/components/LoadingButton";
import useOrganizationQuery from "@/queries/useOrganizationQuery";

const formSchema = z.object({
  propertyType: PropertyTypeEnum,
  propertyOwner: z.string().trim(),
  projectNumber: z.string().trim(),
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
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Address is required",
        });
      }
    }),
});

type FieldValues = z.infer<typeof formSchema>;

const defaultValues: DefaultValues<FieldValues> = {
  propertyType: "Residential",
  propertyOwner: "",
  projectNumber: "",
  address: {
    street1: "",
    street2: "",
    city: "",
    stateOrRegion: "",
    postalCode: "",
    country: "",
    fullAddress: "",
    coordinates: [],
  },
};

interface Props extends DialogProps {
  organizationId: string;
  onSelect: (newProjectId: string) => void;
}

// TODO: 주소 수정은 언제 가능해야 하는지? 주소는 중요한 키라서 수정하도록 하는 것은 영향이 끼칠 수 있다. draggable?
// TODO: default property type을 org마다 설정할 수 있도록 해서, 그 값이 new project의 기본값으로 들어갈 수 있게
export default function NewProjectSheet({
  organizationId,
  onSelect,
  ...dialogProps
}: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const { mutateAsync } = usePostProjectMutation();
  const queryClient = useQueryClient();
  const { data: organization } = useOrganizationQuery({ organizationId });

  useEffect(() => {
    if (organization && organization.projectPropertyTypeDefaultValue) {
      form.reset({
        ...defaultValues,
        propertyType: organization.projectPropertyTypeDefaultValue as z.infer<
          typeof PropertyTypeEnum
        >,
      });
    }
  }, [form, organization]);

  useEffect(() => {
    form.reset();
  }, [form, organizationId]);

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      clientOrganizationId: organizationId,
      projectPropertyOwner: transformStringIntoNullableString.parse(
        values.propertyOwner
      ),
      projectNumber: transformStringIntoNullableString.parse(
        values.projectNumber
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
      .then(({ id }) => {
        dialogProps.onOpenChange?.(false);
        onSelect(id);
        form.reset();
        queryClient.invalidateQueries({
          queryKey: ["projects", "list", "all", { organizationId }],
        });

        axios
          .post(
            `${
              process.env.NEXT_PUBLIC_NAS_API_URL
            }/filesystem/${encodeURIComponent(
              organization?.name ?? ""
            )}/${encodeURIComponent(values.address.fullAddress)}`
          )
          .then((value) => {
            console.log(value);
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
    <Sheet {...dialogProps}>
      <SheetContent className="sm:max-w-[1400px] w-full overflow-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>New Project</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            >
              Create
            </LoadingButton>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
