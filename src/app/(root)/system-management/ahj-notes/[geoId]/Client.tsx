"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import LoadingButton from "@/components/LoadingButton";
import useAhjNoteQuery from "@/queries/useAhjNoteQuery";
import { AhjNoteResponseDto } from "@/api";
import {
  ANSIEnum,
  DigitalSignatureTypeEnum,
  SelectOptionEnum,
  WindExposureEnum,
} from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";
import ItemsContainer from "@/components/ItemsContainer";
import usePutAhjMutation from "@/queries/usePutAhjMutation";
import {
  FieldValues,
  formSchema,
  getFieldValuesFromAhjNote,
  getUpdateAhjNoteRequestDtoFromFieldValues,
} from "@/lib/ahj";
import AhjNoteHistory from "@/components/ahj/AhjNoteHistory";
import PageHeader from "@/components/PageHeader";
import { formatDateTime } from "@/lib/utils";

interface Props {
  geoId: string;
  initialAhjNote: AhjNoteResponseDto | null;
}

export default function Client({ geoId, initialAhjNote }: Props) {
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
  const queryClient = useQueryClient();
  const { mutateAsync } = usePutAhjMutation(geoId);

  /**
   * useEffect
   */
  useEffect(() => {
    if (ahjNote) {
      form.reset(getFieldValuesFromAhjNote(ahjNote));
    }
  }, [ahjNote, form]);

  async function onSubmit(values: FieldValues) {
    await mutateAsync(getUpdateAhjNoteRequestDtoFromFieldValues(values))
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

  const title = ahjNote?.general.name ?? "";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/ahj-notes", name: "AHJ Notes" },
          { href: `/system-management/ahj-notes/${geoId}`, name: title },
        ]}
        title={title}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full"
        >
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger ref={field.ref}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {SelectOptionEnum.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                        <Textarea {...field} />
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
                        <Textarea {...field} />
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger ref={field.ref}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {SelectOptionEnum.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger ref={field.ref}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {SelectOptionEnum.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger ref={field.ref}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {SelectOptionEnum.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                      <Textarea {...field} />
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
                      <Textarea {...field} />
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
                      <Textarea {...field} />
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger ref={field.ref}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {SelectOptionEnum.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger ref={field.ref}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {SelectOptionEnum.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger ref={field.ref}>
                            <SelectValue placeholder="Select an digital signature type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {DigitalSignatureTypeEnum.options.map(
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger ref={field.ref}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {SelectOptionEnum.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger ref={field.ref}>
                            <SelectValue placeholder="Select an wind exposure" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {WindExposureEnum.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger ref={field.ref}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {SelectOptionEnum.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger ref={field.ref}>
                            <SelectValue placeholder="Select an wet stamp size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {ANSIEnum.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                      <Textarea {...field} />
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
                    <Textarea {...field} />
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
                              : formatDateTime(field.value)
                          }
                          readOnly
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </RowItemsContainer>
              <AhjNoteHistory geoId={geoId} />
            </ItemsContainer>
          </section>
        </form>
      </Form>
    </div>
  );
}
