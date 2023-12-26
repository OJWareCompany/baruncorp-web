import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Infinity, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { CustomPricingResponseDto, OrganizationResponseDto, Tier } from "@/api";
import {
  ResidentialNewPriceChargeTypeEnum,
  ResidentialNewPriceChargeTypeEnumWithEmptyString,
  toTwoDecimalRegExp,
  transformNullishResidentialNewPriceChargeTypeEnumIntoResidentialNewPriceChargeTypeEnumWithEmptyString,
  transformNullishStringIntoString,
  transformResidentialNewPriceChargeTypeEnumWithEmptyStringIntoNullableResidentialNewPriceChargeTypeEnum,
  transformStringIntoNullableNumber,
} from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ItemsContainer from "@/components/ItemsContainer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RowItemsContainer from "@/components/RowItemsContainer";
import { AffixInput } from "@/components/AffixInput";
import LoadingButton from "@/components/LoadingButton";
import usePutCustomPricingMutation from "@/mutations/usePutCustomPricingMutation";
import { getCustomPricingQueryKey } from "@/queries/useCustomPricingQuery";

interface Props {
  customPricing: CustomPricingResponseDto;
  organization: OrganizationResponseDto;
}

export default function CustomPricingForm({
  customPricing,
  organization,
}: Props) {
  const [standardSectionExisting, setStandardSectionExisting] = useState(() => {
    if (customPricing.customPricingType === "Custom Fixed") {
      return {
        isResiNewPriceExist: false,
        isResiRevPriceExist: false,
        isComNewPriceExist: false,
      };
    }

    return {
      isResiNewPriceExist:
        customPricing.residentialNewServicePricingType != null,
      isResiRevPriceExist:
        customPricing.residentialRevisionPrice != null ||
        customPricing.residentialRevisionGmPrice,
      isComNewPriceExist: customPricing.commercialNewServiceTiers.length !== 0,
    };
  });

  const queryClient = useQueryClient();
  const { mutateAsync } = usePutCustomPricingMutation({
    organizationId: organization.id,
    serviceId: customPricing.serviceId,
  });

  const formSchema = useMemo(
    () =>
      z
        .object({
          standardPricing: z.object({
            residentialNewServicePricingType:
              ResidentialNewPriceChargeTypeEnumWithEmptyString,
            residentialNewServiceFlatGmPrice: z.string().trim(),
            residentialNewServiceFlatPrice: z.string().trim(),
            residentialNewServiceTiers: z.array(
              z.object({
                startingPoint: z
                  .string()
                  .trim()
                  .min(1, { message: "Starting Point is required" }),
                finishingPoint: z.string().trim(),
                price: z
                  .string()
                  .trim()
                  .min(1, { message: "New Price is required" }),
                gmPrice: z
                  .string()
                  .trim()
                  .min(1, { message: "New GM Price is required" }),
              })
            ),
            residentialRevisionPrice: z.string().trim(),
            residentialRevisionGmPrice: z.string().trim(),
            commercialNewServiceTiers: z.array(
              z.object({
                startingPoint: z
                  .string()
                  .trim()
                  .min(1, { message: "Starting Point is required" }),
                finishingPoint: z
                  .string()
                  .trim()
                  .min(1, { message: "Finishing Point is required" }),
                price: z
                  .string()
                  .trim()
                  .min(1, { message: "New Price is required" }),
                gmPrice: z
                  .string()
                  .trim()
                  .min(1, { message: "New GM Price is required" }),
              })
            ),
          }),
          fixedPrice: z.string(),
        })
        .superRefine((values, ctx) => {
          if (customPricing.customPricingType === "Custom Standard") {
            if (standardSectionExisting.isResiNewPriceExist) {
              if (
                values.standardPricing.residentialNewServicePricingType === ""
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Charge Type is required",
                  path: [`standardPricing.residentialNewServicePricingType`],
                });
              }

              if (
                values.standardPricing.residentialNewServicePricingType ===
                "Flat"
              ) {
                if (
                  values.standardPricing.residentialNewServiceFlatPrice
                    .length === 0
                ) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "New Price is required",
                    path: [`standardPricing.residentialNewServiceFlatPrice`],
                  });
                }
                if (
                  values.standardPricing.residentialNewServiceFlatGmPrice
                    .length === 0
                ) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "New GM Price is required",
                    path: [`standardPricing.residentialNewServiceFlatGmPrice`],
                  });
                }
              }
            }

            if (standardSectionExisting.isResiRevPriceExist) {
              if (
                values.standardPricing.residentialRevisionPrice.length === 0
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Major Revision Price is required",
                  path: [`standardPricing.residentialRevisionPrice`],
                });
              }
              if (
                values.standardPricing.residentialRevisionGmPrice.length === 0
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Major Revision GM Price is required",
                  path: [`standardPricing.residentialRevisionGmPrice`],
                });
              }
            }
          } else {
            if (values.fixedPrice.length === 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Price is required",
                path: [`fixedPrice`],
              });
            }
          }
        })
        .superRefine((values, ctx) => {
          if (customPricing.customPricingType !== "Custom Standard") {
            return;
          }

          if (
            standardSectionExisting.isResiNewPriceExist &&
            values.standardPricing.residentialNewServicePricingType === "Tier"
          ) {
            const { residentialNewServiceTiers } = values.standardPricing;

            for (let i = 0; i < residentialNewServiceTiers.length - 1; i++) {
              if (residentialNewServiceTiers[i].finishingPoint.length === 0) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `Finishing Point is required`,
                  path: [
                    `standardPricing.residentialNewServiceTiers.${i}.finishingPoint`,
                  ],
                });
              }
            }

            if (
              residentialNewServiceTiers.length > 1 &&
              Number(residentialNewServiceTiers[0].finishingPoint) <= 1
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Finishing Point should be greater than 1`,
                path: [
                  `standardPricing.residentialNewServiceTiers.0.finishingPoint`,
                ],
              });
            }

            for (let i = 1; i < residentialNewServiceTiers.length - 1; i++) {
              const current = Number(
                residentialNewServiceTiers[i].finishingPoint
              );
              for (let j = 0; j < i; j++) {
                const target = Number(
                  residentialNewServiceTiers[j].finishingPoint
                );
                if (current <= target) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Finishing Point should be in ascending order`,
                    path: [
                      `standardPricing.residentialNewServiceTiers.${i}.finishingPoint`,
                    ],
                  });
                  continue;
                }
              }
            }
          }

          if (standardSectionExisting.isComNewPriceExist) {
            const { commercialNewServiceTiers } = values.standardPricing;
            if (
              commercialNewServiceTiers.length !== 0 &&
              Number(commercialNewServiceTiers[0].finishingPoint) <= 0.01
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Finishing Point should be greater than 0.01`,
                path: [
                  `standardPricing.commercialNewServiceTiers.0.finishingPoint`,
                ],
              });
            }
            for (let i = 1; i < commercialNewServiceTiers.length; i++) {
              const current = Number(
                commercialNewServiceTiers[i].finishingPoint
              );
              for (let j = 0; j < i; j++) {
                const target = Number(
                  commercialNewServiceTiers[j].finishingPoint
                );
                if (current <= target) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Finishing Point should be in ascending order`,
                    path: [
                      `standardPricing.commercialNewServiceTiers.${i}.finishingPoint`,
                    ],
                  });
                  continue;
                }
              }
            }
          }
        }),
    [customPricing.customPricingType, standardSectionExisting]
  );

  type FieldValues = z.infer<typeof formSchema>;

  const getFieldValues = useCallback(
    (customPricing: CustomPricingResponseDto): FieldValues => {
      return {
        standardPricing: {
          residentialNewServiceFlatGmPrice:
            transformNullishStringIntoString.parse(
              customPricing.residentialNewServiceFlatGmPrice
            ),
          residentialNewServiceFlatPrice:
            transformNullishStringIntoString.parse(
              customPricing.residentialNewServiceFlatPrice
            ),
          residentialNewServicePricingType:
            transformNullishResidentialNewPriceChargeTypeEnumIntoResidentialNewPriceChargeTypeEnumWithEmptyString.parse(
              customPricing.residentialNewServicePricingType
            ),
          residentialRevisionPrice: transformNullishStringIntoString.parse(
            customPricing.residentialRevisionPrice
          ),
          residentialRevisionGmPrice: transformNullishStringIntoString.parse(
            customPricing.residentialRevisionGmPrice
          ),
          commercialNewServiceTiers:
            customPricing.commercialNewServiceTiers.map((value) => ({
              startingPoint: String(value.startingPoint),
              finishingPoint: String(value.finishingPoint),
              price: String(value.price),
              gmPrice: String(value.gmPrice),
            })),
          residentialNewServiceTiers:
            customPricing.residentialNewServiceTiers.map((value) => ({
              startingPoint: String(value.startingPoint),
              finishingPoint: String(value.finishingPoint),
              price: String(value.price),
              gmPrice: String(value.gmPrice),
            })),
        },
        fixedPrice: transformNullishStringIntoString.parse(
          customPricing.fixedPrice
        ),
      };
    },
    []
  );

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(customPricing),
  });

  const watchResidentialNewServicePricingType = form.watch(
    "standardPricing.residentialNewServicePricingType"
  );

  useEffect(() => {
    if (customPricing) {
      form.reset(getFieldValues(customPricing));
    }
  }, [customPricing, form, getFieldValues]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await mutateAsync({
      customPricingType: customPricing.customPricingType,
      fixedPrice: transformStringIntoNullableNumber.parse(values.fixedPrice),
      commercialNewServiceTiers:
        values.standardPricing.commercialNewServiceTiers.map((value) => ({
          startingPoint: Number(value.startingPoint),
          finishingPoint: Number(value.finishingPoint),
          price: Number(value.price),
          gmPrice: Number(value.gmPrice),
        })),
      residentialNewServiceTiers:
        values.standardPricing.residentialNewServiceTiers.map<Tier>(
          (value, index) => ({
            startingPoint: Number(value.startingPoint),
            finishingPoint:
              index ===
              values.standardPricing.residentialNewServiceTiers.length - 1
                ? null
                : transformStringIntoNullableNumber.parse(value.finishingPoint),
            price: Number(value.price),
            gmPrice: Number(value.gmPrice),
          })
        ),
      residentialRevisionPrice: transformStringIntoNullableNumber.parse(
        values.standardPricing.residentialRevisionPrice
      ),
      residentialRevisionGmPrice: transformStringIntoNullableNumber.parse(
        values.standardPricing.residentialRevisionGmPrice
      ),
      residentialNewServiceFlatGmPrice: transformStringIntoNullableNumber.parse(
        values.standardPricing.residentialNewServiceFlatGmPrice
      ),
      residentialNewServiceFlatPrice: transformStringIntoNullableNumber.parse(
        values.standardPricing.residentialNewServiceFlatPrice
      ),
      residentialNewServicePricingType:
        transformResidentialNewPriceChargeTypeEnumWithEmptyStringIntoNullableResidentialNewPriceChargeTypeEnum.parse(
          values.standardPricing.residentialNewServicePricingType
        ),
    })
      .then(() => {
        // toast({
        //   title: "Success",
        // });
        queryClient.invalidateQueries({
          queryKey: getCustomPricingQueryKey(
            organization.id,
            customPricing.serviceId
          ),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        // switch (error.response?.status) {
        //   case 409:
        //     serviceIdForm.setError(
        //       "serviceId",
        //       {
        //         message: `This Organization already has Custom Pricing for the ${service.name}`,
        //       },
        //       { shouldFocus: true }
        //     );
        //     // if (error.response?.data.errorCode.includes("20001")) {
        //     // form.setError(
        //     //   "",
        //     //   {
        //     //     message: `${name} is already existed`,
        //     //   },
        //     //   {
        //     //     shouldFocus: true,
        //     //   }
        //     // );
        //     // }
        //     break;
        // }
      });
  }

  const {
    fields: residentialNewServiceTiersFields,
    append: appendResidentialNewServiceTiers,
    remove: removeResidentialNewServiceTiers,
  } = useFieldArray({
    control: form.control,
    name: "standardPricing.residentialNewServiceTiers",
  });

  const {
    fields: commercialNewServiceTiersFields,
    append: appendCommercialNewServiceTiers,
    remove: removeCommercialNewServiceTiers,
  } = useFieldArray({
    control: form.control,
    name: "standardPricing.commercialNewServiceTiers",
  });

  if (customPricing.customPricingType === "Custom Standard") {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="h4">Residential New Price</h2>
              {standardSectionExisting.isResiNewPriceExist && (
                <Button
                  variant={"outline"}
                  size={"sm"}
                  className="h-[28px] text-xs px-2"
                  onClick={() => {
                    setStandardSectionExisting((prev) => ({
                      ...prev,
                      isResiNewPriceExist: false,
                    }));
                    form.setValue(
                      "standardPricing.residentialNewServicePricingType",
                      "",
                      {
                        shouldDirty: true,
                      }
                    );
                    form.setValue(
                      "standardPricing.residentialNewServiceFlatPrice",
                      "",
                      {
                        shouldDirty: true,
                      }
                    );
                    form.setValue(
                      "standardPricing.residentialNewServiceFlatGmPrice",
                      "",
                      {
                        shouldDirty: true,
                      }
                    );
                    form.setValue(
                      "standardPricing.residentialNewServiceTiers",
                      [],
                      {
                        shouldDirty: true,
                      }
                    );
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
            {standardSectionExisting.isResiNewPriceExist ? (
              <ItemsContainer>
                <FormField
                  control={form.control}
                  name="standardPricing.residentialNewServicePricingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Charge Type</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (
                              value ===
                              ResidentialNewPriceChargeTypeEnum.Values.Flat
                            ) {
                              form.setValue(
                                "standardPricing.residentialNewServiceFlatPrice",
                                "",
                                {
                                  shouldDirty: true,
                                }
                              );
                              form.setValue(
                                "standardPricing.residentialNewServiceFlatGmPrice",
                                "",
                                {
                                  shouldDirty: true,
                                }
                              );
                            } else {
                              form.setValue(
                                "standardPricing.residentialNewServiceTiers",
                                [
                                  {
                                    startingPoint: "1",
                                    finishingPoint: "",
                                    price: "",
                                    gmPrice: "",
                                  },
                                ],
                                { shouldDirty: true }
                              );
                            }
                          }}
                        >
                          <SelectTrigger ref={field.ref}>
                            <SelectValue placeholder="Select a charge type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {ResidentialNewPriceChargeTypeEnum.options.map(
                                (option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                )
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchResidentialNewServicePricingType === "Flat" && (
                  <RowItemsContainer>
                    <FormField
                      control={form.control}
                      name="standardPricing.residentialNewServiceFlatPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>New Price</FormLabel>
                          <FormControl>
                            <AffixInput
                              prefixElement={
                                <span className="text-muted-foreground">$</span>
                              }
                              value={field.value}
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
                    <FormField
                      control={form.control}
                      name="standardPricing.residentialNewServiceFlatGmPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>New GM Price</FormLabel>
                          <FormControl>
                            <AffixInput
                              prefixElement={
                                <span className="text-muted-foreground">$</span>
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
                  </RowItemsContainer>
                )}
                {watchResidentialNewServicePricingType === "Tier" && (
                  <FormField
                    control={form.control}
                    name="standardPricing.residentialNewServiceTiers"
                    render={() => {
                      return (
                        <FormItem>
                          {residentialNewServiceTiersFields.map(
                            (field, index) => (
                              <RowItemsContainer key={field.id}>
                                <FormField
                                  control={form.control}
                                  name={`standardPricing.residentialNewServiceTiers.${index}.startingPoint`}
                                  render={({ field }) => (
                                    <FormItem>
                                      {index === 0 && (
                                        <FormLabel required>
                                          Starting Point
                                        </FormLabel>
                                      )}
                                      <FormControl>
                                        <AffixInput
                                          suffixElement={
                                            <span className="text-muted-foreground">
                                              Volume
                                            </span>
                                          }
                                          disabled
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`standardPricing.residentialNewServiceTiers.${index}.finishingPoint`}
                                  render={({ field }) => {
                                    const isLast =
                                      residentialNewServiceTiersFields.length -
                                        1 ===
                                      index;

                                    return (
                                      <FormItem>
                                        {index === 0 && (
                                          <FormLabel required>
                                            Finishing Point
                                          </FormLabel>
                                        )}
                                        <FormControl>
                                          <AffixInput
                                            suffixElement={
                                              <span className="text-muted-foreground">
                                                Volume
                                              </span>
                                            }
                                            {...field}
                                            prefixElement={
                                              isLast ? (
                                                <Infinity className="w-4 h-4" />
                                              ) : null
                                            }
                                            disabled={isLast}
                                            value={isLast ? "" : field.value}
                                            onChange={(event) => {
                                              const { value } = event.target;
                                              if (isLast) {
                                                return;
                                              }

                                              if (
                                                value === "" ||
                                                toTwoDecimalRegExp.test(value)
                                              ) {
                                                field.onChange(event);
                                                form.setValue(
                                                  `standardPricing.residentialNewServiceTiers.${
                                                    index + 1
                                                  }.startingPoint`,
                                                  String(
                                                    (Number(value) + 1).toFixed(
                                                      0
                                                    )
                                                  ),
                                                  {
                                                    shouldValidate:
                                                      form.formState
                                                        .isSubmitted,
                                                  }
                                                );
                                              }
                                            }}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    );
                                  }}
                                />
                                <FormField
                                  control={form.control}
                                  name={`standardPricing.residentialNewServiceTiers.${index}.price`}
                                  render={({ field }) => (
                                    <FormItem>
                                      {index === 0 && (
                                        <FormLabel required>
                                          New Price
                                        </FormLabel>
                                      )}
                                      <FormControl>
                                        <AffixInput
                                          prefixElement={
                                            <span className="text-muted-foreground">
                                              $
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
                                <FormField
                                  control={form.control}
                                  name={`standardPricing.residentialNewServiceTiers.${index}.gmPrice`}
                                  render={({ field }) => (
                                    <FormItem>
                                      {index === 0 && (
                                        <FormLabel required>
                                          New GM Price
                                        </FormLabel>
                                      )}
                                      <div className="flex gap-2">
                                        <FormControl>
                                          <AffixInput
                                            prefixElement={
                                              <span className="text-muted-foreground">
                                                $
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
                                        {index !== 0 && (
                                          <Button
                                            size={"icon"}
                                            className="shrink-0"
                                            variant={"outline"}
                                            onClick={() => {
                                              removeResidentialNewServiceTiers(
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
                              </RowItemsContainer>
                            )
                          )}
                          <Button
                            variant={"outline"}
                            className="w-full"
                            onClick={() => {
                              const {
                                standardPricing: { residentialNewServiceTiers },
                              } = form.getValues();

                              form.setValue(
                                `standardPricing.residentialNewServiceTiers.${
                                  residentialNewServiceTiersFields.length - 1
                                }.finishingPoint`,
                                "",
                                {
                                  shouldValidate: form.formState.isSubmitted,
                                }
                              );

                              appendResidentialNewServiceTiers({
                                startingPoint: String(
                                  (
                                    Number(
                                      residentialNewServiceTiers[
                                        residentialNewServiceTiers.length - 1
                                      ]?.finishingPoint ?? 0
                                    ) + 1
                                  ).toFixed(0)
                                ),
                                finishingPoint: "",
                                price: "",
                                gmPrice: "",
                              });
                            }}
                          >
                            Add Tier
                          </Button>
                        </FormItem>
                      );
                    }}
                  />
                )}
              </ItemsContainer>
            ) : (
              <Button
                variant={"outline"}
                className="w-full"
                onClick={() => {
                  setStandardSectionExisting((prev) => ({
                    ...prev,
                    isResiNewPriceExist: true,
                  }));
                }}
              >
                Add Residential New Price
              </Button>
            )}
          </section>
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="h4">
                {organization.isSpecialRevisionPricing
                  ? "Residential Revision Price (After Free Revision)"
                  : "Residential Revision Price"}
              </h2>
              {standardSectionExisting.isResiRevPriceExist && (
                <Button
                  variant={"outline"}
                  size={"sm"}
                  className="h-[28px] text-xs px-2"
                  onClick={() => {
                    setStandardSectionExisting((prev) => ({
                      ...prev,
                      isResiRevPriceExist: false,
                    }));
                    form.setValue(
                      "standardPricing.residentialRevisionPrice",
                      "",
                      {
                        shouldDirty: true,
                      }
                    );
                    form.setValue(
                      "standardPricing.residentialRevisionGmPrice",
                      "",
                      {
                        shouldDirty: true,
                      }
                    );
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
            {standardSectionExisting.isResiRevPriceExist ? (
              <RowItemsContainer>
                <FormField
                  control={form.control}
                  name="standardPricing.residentialRevisionPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        {organization.isSpecialRevisionPricing
                          ? "Revision Price"
                          : "Major Revision Price"}
                      </FormLabel>
                      <FormControl>
                        <AffixInput
                          prefixElement={
                            <span className="text-muted-foreground">$</span>
                          }
                          value={field.value}
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
                <FormField
                  control={form.control}
                  name="standardPricing.residentialRevisionGmPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        {organization.isSpecialRevisionPricing
                          ? "Revision GM Price"
                          : "Major Revision GM Price"}
                      </FormLabel>
                      <FormControl>
                        <AffixInput
                          prefixElement={
                            <span className="text-muted-foreground">$</span>
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
              </RowItemsContainer>
            ) : (
              <Button
                variant={"outline"}
                className="w-full"
                onClick={() => {
                  setStandardSectionExisting((prev) => ({
                    ...prev,
                    isResiRevPriceExist: true,
                  }));
                }}
              >
                Add Residential Revision Price
              </Button>
            )}
          </section>
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="h4">Commercial New Price</h2>
              {standardSectionExisting.isComNewPriceExist && (
                <Button
                  variant={"outline"}
                  size={"sm"}
                  className="h-[28px] text-xs px-2"
                  onClick={() => {
                    setStandardSectionExisting((prev) => ({
                      ...prev,
                      isComNewPriceExist: false,
                    }));
                    form.setValue(
                      "standardPricing.commercialNewServiceTiers",
                      [],
                      {
                        shouldDirty: true,
                      }
                    );
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
            <ItemsContainer>
              {standardSectionExisting.isComNewPriceExist ? (
                <FormField
                  control={form.control}
                  name="standardPricing.commercialNewServiceTiers"
                  render={() => {
                    return (
                      <FormItem>
                        {commercialNewServiceTiersFields.map((field, index) => (
                          <RowItemsContainer key={field.id}>
                            <FormField
                              control={form.control}
                              name={`standardPricing.commercialNewServiceTiers.${index}.startingPoint`}
                              render={({ field }) => (
                                <FormItem>
                                  {index === 0 && (
                                    <FormLabel required>
                                      Starting Point
                                    </FormLabel>
                                  )}
                                  <FormControl>
                                    <AffixInput
                                      suffixElement={
                                        <span className="text-muted-foreground">
                                          kW
                                        </span>
                                      }
                                      disabled
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`standardPricing.commercialNewServiceTiers.${index}.finishingPoint`}
                              render={({ field }) => {
                                const isLast =
                                  commercialNewServiceTiersFields.length - 1 ===
                                  index;

                                return (
                                  <FormItem>
                                    {index === 0 && (
                                      <FormLabel required>
                                        Finishing Point
                                      </FormLabel>
                                    )}
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

                                            if (isLast) {
                                              return;
                                            }

                                            form.setValue(
                                              `standardPricing.commercialNewServiceTiers.${
                                                index + 1
                                              }.startingPoint`,
                                              String(
                                                (Number(value) + 0.01).toFixed(
                                                  2
                                                )
                                              ),
                                              {
                                                shouldValidate:
                                                  form.formState.isSubmitted,
                                              }
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                            <FormField
                              control={form.control}
                              name={`standardPricing.commercialNewServiceTiers.${index}.price`}
                              render={({ field }) => (
                                <FormItem>
                                  {index === 0 && (
                                    <FormLabel required>New Price</FormLabel>
                                  )}
                                  <FormControl>
                                    <AffixInput
                                      prefixElement={
                                        <span className="text-muted-foreground">
                                          $
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
                            <FormField
                              control={form.control}
                              name={`standardPricing.commercialNewServiceTiers.${index}.gmPrice`}
                              render={({ field }) => (
                                <FormItem>
                                  {index === 0 && (
                                    <FormLabel required>New GM Price</FormLabel>
                                  )}
                                  <div className="flex gap-2">
                                    <FormControl>
                                      <AffixInput
                                        prefixElement={
                                          <span className="text-muted-foreground">
                                            $
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
                                    {index !== 0 && (
                                      <Button
                                        size={"icon"}
                                        className="shrink-0"
                                        variant={"outline"}
                                        onClick={() => {
                                          removeCommercialNewServiceTiers(
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
                          </RowItemsContainer>
                        ))}
                        <Button
                          variant={"outline"}
                          className="w-full"
                          onClick={() => {
                            const {
                              standardPricing: { commercialNewServiceTiers },
                            } = form.getValues();

                            appendCommercialNewServiceTiers({
                              startingPoint: String(
                                (
                                  Number(
                                    commercialNewServiceTiers[
                                      commercialNewServiceTiers.length - 1
                                    ]?.finishingPoint ?? 0
                                  ) + 0.01
                                ).toFixed(2)
                              ),
                              finishingPoint: "",
                              price: "",
                              gmPrice: "",
                            });
                          }}
                        >
                          Add Tier
                        </Button>
                      </FormItem>
                    );
                  }}
                />
              ) : (
                <Button
                  variant={"outline"}
                  className="w-full"
                  onClick={() => {
                    setStandardSectionExisting((prev) => ({
                      ...prev,
                      isComNewPriceExist: true,
                    }));
                    form.setValue(
                      "standardPricing.commercialNewServiceTiers",
                      [
                        {
                          startingPoint: "0.01",
                          finishingPoint: "",
                          price: "",
                          gmPrice: "",
                        },
                      ],
                      { shouldDirty: true }
                    );
                  }}
                >
                  Add Commercial New Price
                </Button>
              )}
              <LoadingButton
                type="submit"
                className="w-full"
                isLoading={form.formState.isSubmitting}
                disabled={!form.formState.isDirty}
              >
                Edit
              </LoadingButton>
            </ItemsContainer>
          </section>
        </form>
      </Form>
    );
  } else {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
          <ItemsContainer>
            <FormField
              control={form.control}
              name="fixedPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Price</FormLabel>
                  <FormControl>
                    <AffixInput
                      prefixElement={
                        <span className="text-muted-foreground">$</span>
                      }
                      {...field}
                      onChange={(event) => {
                        const { value } = event.target;
                        if (value === "" || toTwoDecimalRegExp.test(value)) {
                          field.onChange(event);
                        }
                      }}
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
              disabled={!form.formState.isDirty}
            >
              Edit
            </LoadingButton>
          </ItemsContainer>
        </form>
      </Form>
    );
  }
}
