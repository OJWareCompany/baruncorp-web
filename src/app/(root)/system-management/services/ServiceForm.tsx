import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
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
  toTwoDecimalRegExp,
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
import usePostServiceMutation from "@/mutations/usePostServiceMutation";
import { getServicesQueryKey } from "@/queries/useServicesQuery";

interface Props {
  onSuccess?: () => void;
}

export default function ServiceForm({ onSuccess }: Props) {
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const [standardSectionExisting, setStandardSectionExisting] = useState({
    isResiNewPriceExist: false,
    isResiRevPriceExist: false,
    isComNewPriceExist: false,
    isComRevPriceExist: false,
  });
  const queryClient = useQueryClient();

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

  const { mutateAsync } = usePostServiceMutation();

  type FieldValues = z.infer<typeof formSchema>;

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      billingCode: "",
      fixedPrice: "",
      standardPricing: {
        commercialNewServiceTiers: [],
        commercialRevisionCostPerUnit: "",
        commercialRevisionMinutesPerUnit: "",
        residentialGmPrice: "",
        residentialPrice: "",
        residentialRevisionGmPrice: "",
        residentialRevisionPrice: "",
      },
    },
  });

  const watchPricingType = form.watch("pricingType");

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      name: values.name,
      billingCode: values.billingCode,
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
    })
      .then(() => {
        setIsSubmitSuccessful(true);
        queryClient.invalidateQueries({
          queryKey: getServicesQueryKey({
            limit: Number.MAX_SAFE_INTEGER,
          }),
        });
        onSuccess?.();
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 409:
            if (error.response?.data.errorCode.includes("40100")) {
              form.setError(
                "name",
                {
                  message: `${values.name} is already existed`,
                },
                { shouldFocus: true }
              );
            }
            if (error.response?.data.errorCode.includes("40101")) {
              form.setError(
                "billingCode",
                {
                  message: `${values.billingCode} is already existed`,
                },
                { shouldFocus: true }
              );
            }
            break;
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
    if (isSubmitSuccessful) {
      form.reset();
      setIsSubmitSuccessful(false);
    }
  }, [form, isSubmitSuccessful]);

  if (watchPricingType === "Standard") {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <section>
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
              </RowItemsContainer>
            </section>
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
                      form.setValue("standardPricing.residentialPrice", "", {
                        shouldDirty: true,
                      });
                      form.setValue("standardPricing.residentialGmPrice", "", {
                        shouldDirty: true,
                      });
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
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
            </section>
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="h4">Residential Revision Price</h2>
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
                        <FormLabel required>Major Revision GM Price</FormLabel>
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
            </section>
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="h4">Commercial Revision Price</h2>
                {standardSectionExisting.isComRevPriceExist && (
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
                )}
              </div>
              <ItemsContainer>
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
                <LoadingButton
                  type="submit"
                  className="w-full"
                  isLoading={form.formState.isSubmitting}
                >
                  Submit
                </LoadingButton>
              </ItemsContainer>
            </section>
          </div>
        </form>
      </Form>
    );
  } else if (watchPricingType === "Fixed") {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ItemsContainer>
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
            </RowItemsContainer>
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
            >
              Submit
            </LoadingButton>
          </ItemsContainer>
        </form>
      </Form>
    );
  } else {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
          </RowItemsContainer>
        </form>
      </Form>
    );
  }
}
