"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import RowItemsContainer from "@/components/RowItemsContainer";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/LoadingButton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddressSearchButton from "@/components/AddressSearchButton";
import Minimap from "@/components/Minimap";
import usePostOrganizationMutation from "@/mutations/usePostOrganizationMutation";
import {
  MountingTypeEnum,
  MountingTypeEnumWithEmptyString,
  PropertyTypeEnum,
  PropertyTypeEnumWithEmptyString,
  digitRegExp,
  transformMountingTypeEnumWithEmptyStringIntoNullableMountingTypeEnum,
  transformPropertyTypeEnumWithEmptyStringIntoNullablePropertyTypeEnum,
  transformStringIntoNullableString,
} from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getOrganizationsQueryKey } from "@/queries/useOrganizationsQuery";

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
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Address is required",
          });
        }
      }),
    isSpecialRevisionPricing: z.boolean(),
    numberOfFreeRevisionCount: z.string().trim(),
    isVendor: z.boolean(),
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

export default function NewOrganizationSheet() {
  const { toast } = useToast();
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      emailAddressToReceiveInvoice: "",
      phoneNumber: "",
      defaultMountingType: "",
      defaultPropertyType: "",
      address: {
        street1: "",
        street2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        fullAddress: "",
        coordinates: [],
      },
      isSpecialRevisionPricing: false,
      numberOfFreeRevisionCount: "",
      isVendor: false,
    },
  });

  const { mutateAsync } = usePostOrganizationMutation();
  const queryClient = useQueryClient();

  const watchIsSpecialRevisionPricing = form.watch("isSpecialRevisionPricing");

  useEffect(() => {
    if (isSubmitSuccessful) {
      form.reset();
      setIsSubmitSuccessful(false);
    }
  }, [form, isSubmitSuccessful]);

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
      email: transformStringIntoNullableString.parse(
        values.emailAddressToReceiveInvoice
      ),
      name: values.name.trim(),
      projectPropertyTypeDefaultValue:
        transformPropertyTypeEnumWithEmptyStringIntoNullablePropertyTypeEnum.parse(
          values.defaultPropertyType
        ),
      mountingTypeDefaultValue:
        transformMountingTypeEnumWithEmptyStringIntoNullableMountingTypeEnum.parse(
          values.defaultMountingType
        ),
      phoneNumber: transformStringIntoNullableString.parse(values.phoneNumber),
      isSpecialRevisionPricing: values.isSpecialRevisionPricing,
      numberOfFreeRevisionCount: values.isSpecialRevisionPricing
        ? Number(values.numberOfFreeRevisionCount)
        : null,
      isVendor: values.isVendor,
    })
      .then(() => {
        setIsSubmitSuccessful(true);
        toast({
          title: "Success",
        });
        setOpen(false);
        queryClient.invalidateQueries({
          queryKey: getOrganizationsQueryKey({}),
        });

        /**
         * @TODO 삭제 예정
         * 파일 서버 - 공유 드라이브 생성 API 연동
         * 이 API는 추후 바른 서버 백엔드에서 재연동 되어야 한다
         */
        const organizationName = values.name.trim();
        axios
          .post(
            `${
              process.env.NEXT_PUBLIC_FILE_API_URL
            }/filesystem/${encodeURIComponent(organizationName)}`
          )
          .then(console.log)
          .catch(console.error);
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 409:
            if (error.response?.data.errorCode.includes("20001")) {
              form.setError(
                "name",
                {
                  message: `${values.name} is already existed`,
                },
                {
                  shouldFocus: true,
                }
              );
            }
            break;
        }
      });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <Plus className="mr-2 h-4 w-4" />
          New Organization
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New Organization</SheetTitle>
        </SheetHeader>
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
                name="defaultMountingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Mounting Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
                  <div className="grid grid-cols-3 gap-2">
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
            <LoadingButton
              type="submit"
              className="w-full"
              isLoading={form.formState.isSubmitting}
            >
              Submit
            </LoadingButton>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
