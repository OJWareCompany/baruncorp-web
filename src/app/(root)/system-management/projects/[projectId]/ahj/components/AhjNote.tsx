"use client";

import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  ANSIEnum,
  ANSIEnumWithEmptyString,
  DigitalSignatureTypeEnum,
  DigitalSignatureTypeEnumWithEmptyString,
  SelectOptionEnum,
  SelectOptionEnumWithEmptyString,
  WindExposureEnum,
  WindExposureEnumWithEmptyString,
  schemaToConvertFromANSIWithEmptyStringToNullableANSI,
  schemaToConvertFromDigitalSignatureTypeWithEmptyStringToNullableDigitalSignatureType,
  schemaToConvertFromNullishANSIToANSIWithEmptyString,
  schemaToConvertFromNullishDigitalSignatureTypeToDigitalSignatureTypeWithEmptyString,
  schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString,
  schemaToConvertFromNullishWindExposureToWindExposureWithEmptyString,
  schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption,
  schemaToConvertFromWindExposureWithEmptyStringToNullableWindExposure,
} from "./constants";
import AhjNoteHistoryTable from "./AhjNoteHistoryTable";
import useAhjNoteQuery from "@/queries/useAhjNoteQuery";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import RowItemsContainer from "@/components/RowItemsContainer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AhjNoteResponseDto, UpdateAhjNoteRequestDto } from "@/api";
import {
  schemaToConvertFromNullishStringToString,
  schemaToConvertFromStringToNullableString,
} from "@/lib/constants";
import LoadingButton from "@/components/LoadingButton";
import usePutAhjMutation from "@/queries/usePutAhjMutation";
import ItemsContainer from "@/components/ItemsContainer";

const formSchema = z.object({
  // general
  general: z.object({
    name: z.string(),
    website: z.string(),
    specificFormRequired: SelectOptionEnumWithEmptyString,
    generalNotes: z.string(),
    buildingCodes: z.string(),
    updatedBy: z.string(),
    updatedAt: z.string(),
  }),
  // design
  design: z.object({
    fireSetBack: z.string(),
    utilityNotes: z.string(),
    designNotes: z.string(),
    pvMeterRequired: SelectOptionEnumWithEmptyString,
    acDisconnectRequired: SelectOptionEnumWithEmptyString,
    centerFed120Percent: SelectOptionEnumWithEmptyString,
    deratedAmpacity: z.string(),
  }),
  // structural engineering
  structuralEngineering: z.object({
    iebcAccepted: SelectOptionEnumWithEmptyString,
    structuralObservationRequired: SelectOptionEnumWithEmptyString,
    digitalSignatureType: DigitalSignatureTypeEnumWithEmptyString,
    windUpliftCalculationRequired: SelectOptionEnumWithEmptyString,
    windSpeed: z.string(),
    windExposure: WindExposureEnumWithEmptyString,
    snowLoadGround: z.string(),
    snowLoadFlatRoof: z.string(),
    wetStampsRequired: SelectOptionEnumWithEmptyString,
    ofWetStamps: z.string(),
    wetStampSize: ANSIEnumWithEmptyString,
    engineeringNotes: z.string(),
  }),
  // electrical engineering
  electricalEngineering: z.object({
    engineeringNotes: z.string(),
  }),
});

type FieldValues = z.infer<typeof formSchema>;

export function getFieldValuesFromAhjNote(
  ahjNote: AhjNoteResponseDto
): FieldValues {
  const { design, electricalEngineering, engineering, general } = ahjNote;

  return {
    // general
    general: {
      name: general.name,
      website: schemaToConvertFromNullishStringToString.parse(general.website),
      specificFormRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          general.specificFormRequired
        ),
      buildingCodes: schemaToConvertFromNullishStringToString.parse(
        general.buildingCodes
      ),
      generalNotes: schemaToConvertFromNullishStringToString.parse(
        general.generalNotes
      ),
      updatedAt: schemaToConvertFromNullishStringToString.parse(
        general.updatedAt
      ),
      updatedBy: schemaToConvertFromNullishStringToString.parse(
        general.updatedBy
      ),
    },
    // design
    design: {
      fireSetBack: schemaToConvertFromNullishStringToString.parse(
        design.fireSetBack
      ),
      utilityNotes: schemaToConvertFromNullishStringToString.parse(
        design.utilityNotes
      ),
      designNotes: schemaToConvertFromNullishStringToString.parse(
        design.designNotes
      ),
      pvMeterRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          design.pvMeterRequired
        ),
      acDisconnectRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          design.acDisconnectRequired
        ),
      centerFed120Percent:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          design.centerFed120Percent
        ),
      deratedAmpacity: schemaToConvertFromNullishStringToString.parse(
        design.deratedAmpacity
      ),
    },
    // structural engineering
    structuralEngineering: {
      iebcAccepted:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          engineering.iebcAccepted
        ),
      structuralObservationRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          engineering.structuralObservationRequired
        ),
      digitalSignatureType:
        schemaToConvertFromNullishDigitalSignatureTypeToDigitalSignatureTypeWithEmptyString.parse(
          engineering.digitalSignatureType
        ),
      windUpliftCalculationRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          engineering.windUpliftCalculationRequired
        ),
      windSpeed: schemaToConvertFromNullishStringToString.parse(
        engineering.windSpeed
      ),
      windExposure:
        schemaToConvertFromNullishWindExposureToWindExposureWithEmptyString.parse(
          engineering.windExposure
        ),
      snowLoadGround: schemaToConvertFromNullishStringToString.parse(
        engineering.snowLoadGround
      ),
      snowLoadFlatRoof: schemaToConvertFromNullishStringToString.parse(
        engineering.snowLoadFlatRoof
      ),
      wetStampsRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          engineering.wetStampsRequired
        ),
      ofWetStamps: schemaToConvertFromNullishStringToString.parse(
        engineering.ofWetStamps
      ),
      wetStampSize: schemaToConvertFromNullishANSIToANSIWithEmptyString.parse(
        engineering.wetStampSize
      ),
      engineeringNotes: schemaToConvertFromNullishStringToString.parse(
        engineering.engineeringNotes
      ),
    },
    // electrical engineering
    electricalEngineering: {
      engineeringNotes: schemaToConvertFromNullishStringToString.parse(
        electricalEngineering.electricalNotes
      ),
    },
  };
}

interface Props {
  geoId: string;
  initialAhjNote: AhjNoteResponseDto;
}

export default function AhjNote({ geoId, initialAhjNote }: Props) {
  /**
   * Form
   */
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValuesFromAhjNote(initialAhjNote),
  });

  /**
   * Query
   */
  const { data: ahjNote } = useAhjNoteQuery({
    geoId,
    initialData: initialAhjNote,
  });
  const { mutateAsync } = usePutAhjMutation(geoId);
  const queryClient = useQueryClient();

  /**
   * useEffect
   */
  useEffect(() => {
    if (ahjNote) {
      form.reset(getFieldValuesFromAhjNote(ahjNote));
    }
  }, [ahjNote, form]);

  async function onSubmit(values: FieldValues) {
    const general: UpdateAhjNoteRequestDto["general"] = {
      buildingCodes: schemaToConvertFromStringToNullableString.parse(
        values.general.buildingCodes
      ),
      generalNotes: schemaToConvertFromStringToNullableString.parse(
        values.general.generalNotes
      ),
      website: schemaToConvertFromStringToNullableString.parse(
        values.general.website
      ),
      specificFormRequired:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.general.specificFormRequired
        ),
    };
    const design: UpdateAhjNoteRequestDto["design"] = {
      deratedAmpacity: schemaToConvertFromStringToNullableString.parse(
        values.design.deratedAmpacity
      ),
      designNotes: schemaToConvertFromStringToNullableString.parse(
        values.design.designNotes
      ),
      fireSetBack: schemaToConvertFromStringToNullableString.parse(
        values.design.fireSetBack
      ),
      utilityNotes: schemaToConvertFromStringToNullableString.parse(
        values.design.utilityNotes
      ),
      pvMeterRequired:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.design.pvMeterRequired
        ),
      acDisconnectRequired:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.design.acDisconnectRequired
        ),
      centerFed120Percent:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.design.centerFed120Percent
        ),
    };
    const engineering: UpdateAhjNoteRequestDto["engineering"] = {
      iebcAccepted:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.structuralEngineering.iebcAccepted
        ),
      structuralObservationRequired:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.structuralEngineering.structuralObservationRequired
        ),
      windUpliftCalculationRequired:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.structuralEngineering.windUpliftCalculationRequired
        ),
      wetStampsRequired:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.structuralEngineering.wetStampsRequired
        ),
      digitalSignatureType:
        schemaToConvertFromDigitalSignatureTypeWithEmptyStringToNullableDigitalSignatureType.parse(
          values.structuralEngineering.digitalSignatureType
        ),
      windExposure:
        schemaToConvertFromWindExposureWithEmptyStringToNullableWindExposure.parse(
          values.structuralEngineering.windExposure
        ),
      wetStampSize: schemaToConvertFromANSIWithEmptyStringToNullableANSI.parse(
        values.structuralEngineering.wetStampSize
      ),
      engineeringNotes: schemaToConvertFromStringToNullableString.parse(
        values.structuralEngineering.engineeringNotes
      ),
      ofWetStamps: schemaToConvertFromStringToNullableString.parse(
        values.structuralEngineering.ofWetStamps
      ),
      snowLoadFlatRoof: schemaToConvertFromStringToNullableString.parse(
        values.structuralEngineering.snowLoadFlatRoof
      ),
      snowLoadGround: schemaToConvertFromStringToNullableString.parse(
        values.structuralEngineering.snowLoadGround
      ),
      windSpeed: schemaToConvertFromStringToNullableString.parse(
        values.structuralEngineering.windSpeed
      ),
    };
    const electricalEngineering: UpdateAhjNoteRequestDto["electricalEngineering"] =
      {
        electricalNotes: schemaToConvertFromStringToNullableString.parse(
          values.electricalEngineering.engineeringNotes
        ),
      };
    await mutateAsync({
      general,
      design,
      engineering,
      electricalEngineering,
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["ahjNotes", "detail", geoId],
        });
        queryClient.invalidateQueries({
          queryKey: ["ahjNoteHistories", "list"],
        });
      })
      .catch(() => {});
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <section>
          <h2 className="h4 mb-2">General</h2>
          <div className="flex flex-col gap-4">
            <RowItemsContainer>
              <FormField
                control={form.control}
                name="general.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="general.website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="general.specificFormRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Form Required?</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {SelectOptionEnum.options.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </RowItemsContainer>
            <RowItemsContainer>
              <FormField
                control={form.control}
                name="general.buildingCodes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building Codes</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="resize-none" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="general.generalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>General Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="resize-none" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </RowItemsContainer>
          </div>
        </section>
        <section>
          <h2 className="h4 mb-2">Design</h2>
          <div className="flex flex-col gap-4">
            <RowItemsContainer>
              <FormField
                control={form.control}
                name="design.pvMeterRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PV Meter Required?</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {SelectOptionEnum.options.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="design.acDisconnectRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AC Disconnect Required?</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {SelectOptionEnum.options.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="design.centerFed120Percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Center Fed 120%</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {SelectOptionEnum.options.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="design.deratedAmpacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Derated Ampacity</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </RowItemsContainer>
            <FormField
              control={form.control}
              name="design.fireSetBack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fire Setback</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="design.utilityNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Utility Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="design.designNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Design Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </section>
        <section>
          <h2 className="h4 mb-2">Structural Engineering</h2>
          <div className="flex flex-col gap-4">
            <RowItemsContainer>
              <FormField
                control={form.control}
                name="structuralEngineering.iebcAccepted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IEBC Accepted?</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {SelectOptionEnum.options.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="structuralEngineering.structuralObservationRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Structural Observation Required?</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {SelectOptionEnum.options.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="structuralEngineering.digitalSignatureType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Digital Signature Type</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an digital signature type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {DigitalSignatureTypeEnum.options.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </RowItemsContainer>
            <RowItemsContainer>
              <FormField
                control={form.control}
                name="structuralEngineering.windUpliftCalculationRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wind Uplift Calculation Required?</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {SelectOptionEnum.options.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="structuralEngineering.windSpeed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wind Speed (mph)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="structuralEngineering.windExposure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wind Exposure</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an wind exposure" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {WindExposureEnum.options.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </RowItemsContainer>
            <RowItemsContainer>
              <FormField
                control={form.control}
                name="structuralEngineering.snowLoadGround"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Snow Load Ground (psf)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="structuralEngineering.snowLoadFlatRoof"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Snow Load Flat Roof (psf)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </RowItemsContainer>
            <RowItemsContainer>
              <FormField
                control={form.control}
                name="structuralEngineering.wetStampsRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wet Stamp Required?</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {SelectOptionEnum.options.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="structuralEngineering.ofWetStamps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel># of Wet Stamps</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="structuralEngineering.wetStampSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wet Stamp Size</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an wet stamp size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {ANSIEnum.options.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </RowItemsContainer>
            <FormField
              control={form.control}
              name="structuralEngineering.engineeringNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Engineering Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </section>
        <section>
          <h2 className="h4 mb-2">Electrical Engineering</h2>
          <FormField
            control={form.control}
            name="electricalEngineering.engineeringNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Engineering Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} className="resize-none" />
                </FormControl>
              </FormItem>
            )}
          />
        </section>
        <LoadingButton
          type="submit"
          disabled={!form.formState.isDirty}
          isLoading={form.formState.isSubmitting}
          className="w-full"
        >
          Edit
        </LoadingButton>
        <section>
          <h2 className="h4 mb-2">History</h2>
          <ItemsContainer>
            <RowItemsContainer>
              <FormField
                control={form.control}
                name="general.updatedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Modified By</FormLabel>
                    <FormControl>
                      <Input value={field.value ?? "System"} readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="general.updatedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Modified</FormLabel>
                    <FormControl>
                      <Input
                        value={
                          field.value === ""
                            ? "-"
                            : new Intl.DateTimeFormat("en-US", {
                                dateStyle: "short",
                                timeStyle: "short",
                              }).format(new Date(field.value))
                        }
                        readOnly
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </RowItemsContainer>
            <AhjNoteHistoryTable geoId={geoId} />
          </ItemsContainer>
        </section>
      </form>
    </Form>
  );
}
