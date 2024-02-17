"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import LoadingButton from "@/components/LoadingButton";
import { Input } from "@/components/ui/input";
import RowItemsContainer from "@/components/RowItemsContainer";
import {
  ServicePricingTypeEnum,
  digitRegExp,
  toOneDecimalRegExp,
  toTwoDecimalRegExp,
  transformNullishStringIntoString,
  transformStringIntoNullableNumber,
} from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AffixInput } from "@/components/AffixInput";
import { Button } from "@/components/ui/button";
import ItemsContainer from "@/components/ItemsContainer";
import { ServiceResponseDto } from "@/api/api-spec";
import usePatchServiceMutation from "@/mutations/usePatchServiceMutation";
import { getServiceQueryKey } from "@/queries/useServiceQuery";
import { useToast } from "@/components/ui/use-toast";
import CollapsibleSection from "@/components/CollapsibleSection";

interface Props {
  service: ServiceResponseDto;
}

export default function ServiceForm({ service }: Props) {
  const { serviceId } = useParams() as { serviceId: string };
  const [standardSectionExisting, setStandardSectionExisting] = useState<{
    isResiNewPriceExist: boolean;
    isResiRevPriceExist: boolean;
    isComNewPriceExist: boolean;
    isComRevPriceExist: boolean;
  }>(() => {
    if (service.pricingType === "Fixed") {
      return {
        isResiNewPriceExist: false,
        isResiRevPriceExist: false,
        isComNewPriceExist: false,
        isComRevPriceExist: false,
      };
    }

    return {
      isResiNewPriceExist:
        service.standardPricing?.residentialPrice != null ||
        service.standardPricing?.residentialGmPrice != null,
      isResiRevPriceExist:
        service.standardPricing?.residentialRevisionPrice != null ||
        service.standardPricing?.residentialRevisionGmPrice != null,
      isComNewPriceExist:
        service.standardPricing?.commercialNewServiceTiers != null &&
        service.standardPricing.commercialNewServiceTiers.length !== 0,
      isComRevPriceExist:
        service.standardPricing?.commercialRevisionCostPerUnit != null ||
        service.standardPricing?.commercialRevisionMinutesPerUnit != null,
    };
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const formSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().trim().min(1, { message: "Name is required" }),
          billingCode: z
            .string()
            .trim()
            .min(1, { message: "Billing Code is required" }),
          pricingType: ServicePricingTypeEnum,
          standardPricing: z.object({
            residentialPrice: z.string().trim(),
            residentialGmPrice: z.string().trim(),
            residentialRevisionPrice: z.string().trim(),
            residentialRevisionGmPrice: z.string().trim(),
            commercialRevisionMinutesPerUnit: z.string().trim(),
            commercialRevisionCostPerUnit: z.string().trim(),
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
          commercialNewEstimatedTaskDuration: z.string().trim(),
          commercialRevisionEstimatedTaskDuration: z.string().trim(),
          residentialNewEstimatedTaskDuration: z.string().trim(),
          residentialRevisionEstimatedTaskDuration: z.string().trim(),
        })
        .superRefine((values, ctx) => {
          if (values.pricingType === "Standard") {
            if (standardSectionExisting.isResiNewPriceExist) {
              if (values.standardPricing.residentialPrice.length === 0) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "New Price is required",
                  path: [`standardPricing.residentialPrice`],
                });
              }
              if (values.standardPricing.residentialGmPrice.length === 0) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "New GM Price is required",
                  path: [`standardPricing.residentialGmPrice`],
                });
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

            if (standardSectionExisting.isComRevPriceExist) {
              if (
                values.standardPricing.commercialRevisionMinutesPerUnit
                  .length === 0
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Minutes per Unit is required",
                  path: [`standardPricing.commercialRevisionMinutesPerUnit`],
                });
              }
              if (
                values.standardPricing.commercialRevisionCostPerUnit.length ===
                0
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Price per Unit is required",
                  path: [`standardPricing.commercialRevisionCostPerUnit`],
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
          if (
            values.pricingType === "Standard" &&
            standardSectionExisting.isComNewPriceExist
          ) {
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
    [standardSectionExisting]
  );

  const { mutateAsync } = usePatchServiceMutation(serviceId);

  type FieldValues = z.infer<typeof formSchema>;

  const getFieldValues = useCallback(
    (service: ServiceResponseDto): FieldValues => {
      return {
        name: service.name,
        billingCode: service.billingCode,
        pricingType: service.pricingType,
        fixedPrice: transformNullishStringIntoString.parse(service.fixedPrice),
        standardPricing: {
          commercialNewServiceTiers:
            service.standardPricing == null
              ? []
              : service.standardPricing.commercialNewServiceTiers.map<
                  FieldValues["standardPricing"]["commercialNewServiceTiers"][number]
                >((value) => ({
                  finishingPoint: String(value.finishingPoint),
                  startingPoint: String(value.startingPoint),
                  price: String(value.price),
                  gmPrice: String(value.gmPrice),
                })),
          commercialRevisionCostPerUnit: transformNullishStringIntoString.parse(
            service.standardPricing?.commercialRevisionCostPerUnit
          ),
          commercialRevisionMinutesPerUnit:
            transformNullishStringIntoString.parse(
              service.standardPricing?.commercialRevisionMinutesPerUnit
            ),
          residentialGmPrice: transformNullishStringIntoString.parse(
            service.standardPricing?.residentialGmPrice
          ),
          residentialPrice: transformNullishStringIntoString.parse(
            service.standardPricing?.residentialPrice
          ),
          residentialRevisionGmPrice: transformNullishStringIntoString.parse(
            service.standardPricing?.residentialRevisionGmPrice
          ),
          residentialRevisionPrice: transformNullishStringIntoString.parse(
            service.standardPricing?.residentialRevisionPrice
          ),
        },
        commercialNewEstimatedTaskDuration:
          transformNullishStringIntoString.parse(
            service.commercialNewEstimatedTaskDuration
          ),
        commercialRevisionEstimatedTaskDuration:
          transformNullishStringIntoString.parse(
            service.commercialRevisionEstimatedTaskDuration
          ),
        residentialNewEstimatedTaskDuration:
          transformNullishStringIntoString.parse(
            service.residentialNewEstimatedTaskDuration
          ),
        residentialRevisionEstimatedTaskDuration:
          transformNullishStringIntoString.parse(
            service.residentialRevisionEstimatedTaskDuration
          ),
      };
    },
    []
  );

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(service),
  });

  const watchPricingType = form.watch("pricingType");

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      name: values.name.trim(),
      billingCode: values.billingCode.trim(),
      pricingType: values.pricingType,
      fixedPrice: transformStringIntoNullableNumber.parse(values.fixedPrice),
      standardPricing: {
        commercialNewServiceTiers:
          values.standardPricing.commercialNewServiceTiers.map((value) => ({
            startingPoint: Number(value.startingPoint),
            finishingPoint: Number(value.finishingPoint),
            price: Number(value.price),
            gmPrice: Number(value.gmPrice),
          })),
        commercialRevisionCostPerUnit: transformStringIntoNullableNumber.parse(
          values.standardPricing.commercialRevisionCostPerUnit
        ),
        commercialRevisionMinutesPerUnit:
          transformStringIntoNullableNumber.parse(
            values.standardPricing.commercialRevisionMinutesPerUnit
          ),
        residentialGmPrice: transformStringIntoNullableNumber.parse(
          values.standardPricing.residentialGmPrice
        ),
        residentialPrice: transformStringIntoNullableNumber.parse(
          values.standardPricing.residentialPrice
        ),
        residentialRevisionGmPrice: transformStringIntoNullableNumber.parse(
          values.standardPricing.residentialRevisionGmPrice
        ),
        residentialRevisionPrice: transformStringIntoNullableNumber.parse(
          values.standardPricing.residentialRevisionPrice
        ),
      },
      commercialNewEstimatedTaskDuration:
        transformStringIntoNullableNumber.parse(
          values.commercialNewEstimatedTaskDuration
        ),
      commercialRevisionEstimatedTaskDuration:
        transformStringIntoNullableNumber.parse(
          values.commercialRevisionEstimatedTaskDuration
        ),
      residentialNewEstimatedTaskDuration:
        transformStringIntoNullableNumber.parse(
          values.residentialNewEstimatedTaskDuration
        ),
      residentialRevisionEstimatedTaskDuration:
        transformStringIntoNullableNumber.parse(
          values.residentialRevisionEstimatedTaskDuration
        ),
    })
      .then(() => {
        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getServiceQueryKey(serviceId),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        // TODO: estimated days에 10이상 담았을 때에 대한 에러 핸들링
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

  const {
    fields: commercialNewServiceTiersFields,
    append: appendCommercialNewServiceTiers,
    remove: removeCommercialNewServiceTiers,
  } = useFieldArray({
    control: form.control,
    name: "standardPricing.commercialNewServiceTiers",
  });

  useEffect(() => {
    form.reset(getFieldValues(service));
  }, [form, getFieldValues, service]);

  const common = (
    <>
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
          name="billingCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Billing Code</FormLabel>
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
          name="residentialNewEstimatedTaskDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Estimated Days to Complete (Residential New)
              </FormLabel>
              <FormControl>
                <AffixInput
                  placeholder="0"
                  suffixElement={
                    <span className="text-muted-foreground">Days</span>
                  }
                  {...field}
                  onChange={(event) => {
                    const { value } = event.target;
                    if (value === "" || toOneDecimalRegExp.test(value)) {
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
          name="residentialRevisionEstimatedTaskDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Estimated Days to Complete (Residential Rev)
              </FormLabel>
              <FormControl>
                <AffixInput
                  placeholder="0"
                  suffixElement={
                    <span className="text-muted-foreground">Days</span>
                  }
                  {...field}
                  onChange={(event) => {
                    const { value } = event.target;
                    if (value === "" || toOneDecimalRegExp.test(value)) {
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
          name="commercialNewEstimatedTaskDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Days to Complete (Commercial New)</FormLabel>
              <FormControl>
                <AffixInput
                  placeholder="0"
                  suffixElement={
                    <span className="text-muted-foreground">Days</span>
                  }
                  {...field}
                  onChange={(event) => {
                    const { value } = event.target;
                    if (value === "" || toOneDecimalRegExp.test(value)) {
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
          name="commercialRevisionEstimatedTaskDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Days to Complete (Commercial Rev)</FormLabel>
              <FormControl>
                <AffixInput
                  placeholder="0"
                  suffixElement={
                    <span className="text-muted-foreground">Days</span>
                  }
                  {...field}
                  onChange={(event) => {
                    const { value } = event.target;
                    if (value === "" || toOneDecimalRegExp.test(value)) {
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
      <FormField
        control={form.control}
        name="pricingType"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Pricing Type</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  form.clearErrors();
                }}
              >
                <SelectTrigger ref={field.ref}>
                  <SelectValue placeholder="Select a pricing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ServicePricingTypeEnum.options.map((option) => (
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
    </>
  );

  if (watchPricingType === "Standard") {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <section className="space-y-4">{common}</section>
          <div className="space-y-4">
            <div className="space-y-6">
              <CollapsibleSection
                title="Residential New Price"
                action={
                  standardSectionExisting.isResiNewPriceExist && (
                    <Button
                      variant={"outline"}
                      size={"sm"}
                      className="h-[28px] text-xs px-2"
                      onClick={() => {
                        setStandardSectionExisting((prev) => ({
                          ...prev,
                          isResiNewPriceExist: false,
                        }));
                        form.setValue("standardPricing.residentialPrice", "", {
                          shouldDirty: true,
                        });
                        form.setValue(
                          "standardPricing.residentialGmPrice",
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
                  )
                }
              >
                {standardSectionExisting.isResiNewPriceExist ? (
                  <RowItemsContainer>
                    <FormField
                      control={form.control}
                      name="standardPricing.residentialPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>New Price</FormLabel>
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
                    <FormField
                      control={form.control}
                      name="standardPricing.residentialGmPrice"
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
              </CollapsibleSection>
              <CollapsibleSection
                title="Residential Revision Price"
                action={
                  standardSectionExisting.isResiRevPriceExist && (
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
                  )
                }
              >
                {standardSectionExisting.isResiRevPriceExist ? (
                  <RowItemsContainer>
                    <FormField
                      control={form.control}
                      name="standardPricing.residentialRevisionPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Major Revision Price</FormLabel>
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
                    <FormField
                      control={form.control}
                      name="standardPricing.residentialRevisionGmPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>
                            Major Revision GM Price
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
              </CollapsibleSection>
              <CollapsibleSection
                title="Commercial New Price"
                action={
                  standardSectionExisting.isComNewPriceExist && (
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
                  )
                }
              >
                {standardSectionExisting.isComNewPriceExist ? (
                  <FormField
                    control={form.control}
                    name="standardPricing.commercialNewServiceTiers"
                    render={() => {
                      return (
                        <FormItem>
                          {commercialNewServiceTiersFields.map(
                            (field, index) => (
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
                                      commercialNewServiceTiersFields.length -
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
                                                    (
                                                      Number(value) + 0.01
                                                    ).toFixed(2)
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
                                  name={`standardPricing.commercialNewServiceTiers.${index}.price`}
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
                                  name={`standardPricing.commercialNewServiceTiers.${index}.gmPrice`}
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
                            )
                          )}
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
              </CollapsibleSection>
              <CollapsibleSection
                title="Commercial Revision Price"
                action={
                  standardSectionExisting.isComRevPriceExist && (
                    <Button
                      variant={"outline"}
                      size={"sm"}
                      className="h-[28px] text-xs px-2"
                      onClick={() => {
                        setStandardSectionExisting((prev) => ({
                          ...prev,
                          isComRevPriceExist: false,
                        }));
                        form.setValue(
                          "standardPricing.commercialRevisionMinutesPerUnit",
                          "",
                          {
                            shouldDirty: true,
                          }
                        );
                        form.setValue(
                          "standardPricing.commercialRevisionCostPerUnit",
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
                  )
                }
              >
                {standardSectionExisting.isComRevPriceExist ? (
                  <RowItemsContainer>
                    <FormField
                      control={form.control}
                      name="standardPricing.commercialRevisionMinutesPerUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Minutes per Unit</FormLabel>
                          <FormControl>
                            <AffixInput
                              suffixElement={
                                <span className="text-muted-foreground">
                                  min
                                </span>
                              }
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
                    <FormField
                      control={form.control}
                      name="standardPricing.commercialRevisionCostPerUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Price per Unit</FormLabel>
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
                        isComRevPriceExist: true,
                      }));
                    }}
                  >
                    Add Commercial Revision Price
                  </Button>
                )}
              </CollapsibleSection>
            </div>
            <LoadingButton
              type="submit"
              className="w-full"
              isLoading={form.formState.isSubmitting}
              disabled={!form.formState.isDirty}
            >
              Edit
            </LoadingButton>
          </div>
        </form>
      </Form>
    );
  } else {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ItemsContainer>
            {common}
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
