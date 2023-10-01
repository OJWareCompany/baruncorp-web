import { DialogProps } from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import useAhjNoteHistoryQuery from "@/queries/useAhjNoteHistoryQuery";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RowItemsContainer from "@/components/RowItemsContainer";
import { FieldValues, formSchema, getFieldValuesFromAhjNote } from "@/lib/ahj";
import { formatDateTime } from "@/lib/utils";

interface Props extends DialogProps {
  id?: string;
}

export default function AhjNoteHistorySheet({ id, ...dialogProps }: Props) {
  const { data: ahjNoteHistory } = useAhjNoteHistoryQuery(id);
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // general
      general: {
        name: "",
        website: "",
        specificFormRequired: "",
        generalNotes: "",
        buildingCodes: "",
        updatedBy: "",
        updatedAt: "",
      },
      // design
      design: {
        fireSetBack: "",
        utilityNotes: "",
        designNotes: "",
        pvMeterRequired: "",
        acDisconnectRequired: "",
        centerFed120Percent: "",
        deratedAmpacity: "",
      },
      // structural engineering
      structuralEngineering: {
        engineeringNotes: "",
        iebcAccepted: "",
        structuralObservationRequired: "",
        windUpliftCalculationRequired: "",
        wetStampsRequired: "",
        digitalSignatureType: "",
        windExposure: "",
        wetStampSize: "",
        windSpeed: "",
        snowLoadGround: "",
        snowLoadFlatRoof: "",
        ofWetStamps: "",
      },
      // electrical engineering
      electricalEngineering: {
        engineeringNotes: "",
      },
    },
  });

  useEffect(() => {
    if (ahjNoteHistory) {
      form.reset(getFieldValuesFromAhjNote(ahjNoteHistory));
    }
  }, [ahjNoteHistory, form]);

  return (
    <Sheet {...dialogProps}>
      <SheetContent className="w-full max-w-[1400px] sm:max-w-[1400px] overflow-y-auto">
        <Form {...form}>
          <form className="space-y-6 w-full">
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
                          <Input {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                          <Textarea {...field} readOnly />
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
                          <Textarea {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                        <Textarea {...field} readOnly />
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
                        <Textarea {...field} readOnly />
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
                        <Textarea {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                          <Input {...field} readOnly />
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
                        <Textarea {...field} readOnly />
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
                      <Textarea {...field} readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />
            </section>
            <section>
              <h2 className="h4 mb-2">History</h2>
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
            </section>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
