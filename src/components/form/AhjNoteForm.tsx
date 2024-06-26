import { useEffect } from "react";
import { DefaultValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import InputEditor from "../editor/InputEditor";
import BasicEditor from "../editor/BasicEditor";
import CollapsibleSection from "../CollapsibleSection";
import { useToast } from "../ui/use-toast";
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
} from "@/lib/constants";
import ItemsContainer from "@/components/ItemsContainer";
import usePutAhjMutation from "@/mutations/usePutAhjMutation";
import {
  FieldValues,
  formSchema,
  getFieldValuesFromAhjNote,
  getUpdateAhjNoteRequestDtoFromFieldValues,
} from "@/lib/ahj";
import { AhjNoteResponseDto } from "@/api/api-spec";
import { getAhjNoteQueryKey } from "@/queries/useAhjNoteQuery";
import { getAhjNoteHistoriesQueryKey } from "@/queries/useAhjNoteHistoriesQuery";

interface Props {
  ahjNote: AhjNoteResponseDto;
  geoId: string;
  disabled?: boolean;
}

export default function AhjNoteForm({
  ahjNote,
  geoId,
  disabled = false,
}: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValuesFromAhjNote(
      ahjNote
    ) as DefaultValues<FieldValues>, // editor value의 deep partial 문제로 typescript가 error를 발생시키나, 실제로는 문제 없음
  });
  const { toast } = useToast();

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
        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getAhjNoteQueryKey(geoId),
        });
        queryClient.invalidateQueries({
          queryKey: getAhjNoteHistoriesQueryKey({ geoId }),
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="space-y-6">
          <CollapsibleSection title="General">
            <ItemsContainer>
              <RowItemsContainer>
                <FormField
                  control={form.control}
                  // name="general.name"
                  name="general.fullAhjName"
                  render={({ field }) => (
                    <FormItem>
                      {/* <FormLabel>Name</FormLabel> */}
                      <FormLabel>Full AHJ Name</FormLabel>
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
                        <InputEditor {...field} disabled={disabled} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </RowItemsContainer>
              <RowItemsContainer>
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
                          disabled={disabled}
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
                  name="general.structuralStampRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Structural Stamp Required?</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={disabled}
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
                  name="general.electricalStampRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Electrical Stamp Required?</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={disabled}
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
                  name="general.wetStampRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wet Stamp Required?</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={disabled}
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
                        <BasicEditor {...field} disabled={disabled} />
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
                        <BasicEditor {...field} disabled={disabled} />
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
                          disabled={disabled}
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
                          disabled={disabled}
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
                          disabled={disabled}
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
                        <Input {...field} disabled={disabled} />
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
                      <BasicEditor {...field} disabled={disabled} />
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
                      <BasicEditor {...field} disabled={disabled} />
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
                      <BasicEditor {...field} disabled={disabled} />
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
                          disabled={disabled}
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
                          disabled={disabled}
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
                          disabled={disabled}
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
                          disabled={disabled}
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
                  name="structuralEngineering.windSpeedRiskCatFirst"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wind Speed Risk Cat I (mph)</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={disabled} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="structuralEngineering.windSpeedRiskCatSecond"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wind Speed Risk Cat II (mph)</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={disabled} />
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
                        <Input {...field} disabled={disabled} />
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
                        <Input {...field} disabled={disabled} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </RowItemsContainer>
              <RowItemsContainer>
                <FormField
                  control={form.control}
                  name="structuralEngineering.ofWetStamps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel># of Wet Stamps</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={disabled} />
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
                          disabled={disabled}
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
                      <BasicEditor {...field} disabled={disabled} />
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
                      <BasicEditor {...field} disabled={disabled} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </ItemsContainer>
          </CollapsibleSection>
        </div>
        {!disabled && (
          <LoadingButton
            type="submit"
            disabled={!form.formState.isDirty}
            isLoading={form.formState.isSubmitting}
            className="w-full"
          >
            Save
          </LoadingButton>
        )}
      </form>
    </Form>
  );
}
