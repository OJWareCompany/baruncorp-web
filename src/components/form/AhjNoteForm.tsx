import { useEffect } from "react";
import { DefaultValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import InputEditor from "../editor/InputEditor";
import BasicEditor from "../editor/BasicEditor";
import CollapsibleSection from "../CollapsibleSection";
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
import {
  ANSIEnum,
  DigitalSignatureTypeEnum,
  SelectOptionEnum,
  WindExposureEnum,
} from "@/lib/constants";
import ItemsContainer from "@/components/ItemsContainer";
import usePutAhjMutation from "@/mutations/usePutAhjMutation";
import {
  FieldValues,
  formSchema,
  getFieldValuesFromAhjNote,
  getUpdateAhjNoteRequestDtoFromFieldValues,
} from "@/lib/ahj";
import { AhjNoteResponseDto } from "@/api";
import { getAhjNoteQueryKey } from "@/queries/useAhjNoteQuery";
import { getAhjNoteHistoriesQueryKey } from "@/queries/useAhjNoteHistoriesQuery";

interface Props {
  ahjNote: AhjNoteResponseDto;
  geoId: string;
}

export default function AhjNoteForm({ ahjNote, geoId }: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValuesFromAhjNote(
      ahjNote
    ) as DefaultValues<FieldValues>, // editor value의 deep partial 문제로 typescript가 error를 발생시키나, 실제로는 문제 없음
  });

  const queryClient = useQueryClient();
  const { mutateAsync } = usePutAhjMutation(geoId);

  useEffect(() => {
    if (ahjNote) {
      form.reset(getFieldValuesFromAhjNote(ahjNote));
    }
  }, [ahjNote, form]);

  async function onSubmit(values: FieldValues) {
    await mutateAsync(getUpdateAhjNoteRequestDtoFromFieldValues(values))
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: getAhjNoteQueryKey(geoId),
        });
        queryClient.invalidateQueries({
          queryKey: getAhjNoteHistoriesQueryKey({ geoId }),
        });
      })
      .catch(() => {});
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="space-y-6">
          <CollapsibleSection title="General">
            <ItemsContainer>
              <RowItemsContainer>
                <FormField
                  control={form.control}
                  name="general.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
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
                        <InputEditor {...field} />
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
                        <BasicEditor {...field} />
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
                        <BasicEditor {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </RowItemsContainer>
            </ItemsContainer>
          </CollapsibleSection>
          <CollapsibleSection title="Design">
            <ItemsContainer>
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
                      <BasicEditor {...field} />
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
                      <BasicEditor {...field} />
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
                      <BasicEditor {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </ItemsContainer>
          </CollapsibleSection>
          <CollapsibleSection title="Structural Engineering">
            <ItemsContainer>
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
                      <BasicEditor {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </ItemsContainer>
          </CollapsibleSection>
          <CollapsibleSection title="Electrical Engineering">
            <ItemsContainer>
              <FormField
                control={form.control}
                name="electricalEngineering.engineeringNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engineering Notes</FormLabel>
                    <FormControl>
                      <BasicEditor {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </ItemsContainer>
          </CollapsibleSection>
        </div>
        <LoadingButton
          type="submit"
          disabled={!form.formState.isDirty}
          isLoading={form.formState.isSubmitting}
          className="w-full"
        >
          Edit
        </LoadingButton>
      </form>
    </Form>
  );
}
