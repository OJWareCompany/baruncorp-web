import { DialogProps } from "@radix-ui/react-dialog";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  ANSIEnumWithEmptyString,
  DigitalSignatureTypeEnumWithEmptyString,
  SelectOptionEnumWithEmptyString,
  WindExposureEnumWithEmptyString,
  schemaToConvertFromNullishANSIToANSIWithEmptyString,
  schemaToConvertFromNullishDigitalSignatureTypeToDigitalSignatureTypeWithEmptyString,
  schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString,
  schemaToConvertFromNullishStringToString,
  schemaToConvertFromNullishWindExposureToWindExposureWithEmptyString,
} from "../constants";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import useAhjHistoryQuery from "@/queries/useAhjHistoryQuery";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import FieldsRowContainer from "@/components/FieldsRowContainer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  // general
  general: z.object({
    name: z.string(),
    website: z.string(),
    specificFormRequired: SelectOptionEnumWithEmptyString, // select box
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
    pvMeterRequired: SelectOptionEnumWithEmptyString, // select box
    acDisconnectRequired: SelectOptionEnumWithEmptyString, // select box
    centerFed120Percent: SelectOptionEnumWithEmptyString, // select box
    deratedAmpacity: z.string(),
  }),

  // structural engineering
  engineering: z.object({
    engineeringNotes: z.string(),
    iebcAccepted: SelectOptionEnumWithEmptyString, // select box
    structuralObservationRequired: SelectOptionEnumWithEmptyString, // select box
    windUpliftCalculationRequired: SelectOptionEnumWithEmptyString, // select box
    wetStampsRequired: SelectOptionEnumWithEmptyString, // select box
    digitalSignatureType: DigitalSignatureTypeEnumWithEmptyString, // select box
    windExposure: WindExposureEnumWithEmptyString, // select box
    wetStampSize: ANSIEnumWithEmptyString, // select box
    windSpeed: z.string(),
    snowLoadGround: z.string(),
    snowLoadFlatRoof: z.string(),
    ofWetStamps: z.string(),
  }),

  // electrical engineering
  electricalEngineering: z.object({
    electricalNotes: z.string(),
  }),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props extends DialogProps {
  id?: string;
}

export default function AhjHistorySheet(props: Props) {
  const { data: ahjHistory, isSuccess: isAhjHistoryQuerySuccess } =
    useAhjHistoryQuery(props.id);
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
      engineering: {
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
        electricalNotes: "",
      },
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (!isAhjHistoryQuerySuccess) {
      return;
    }

    const general: FieldValues["general"] = {
      buildingCodes: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.general.buildingCodes
      ),
      generalNotes: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.general.generalNotes
      ),
      updatedAt: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.general.updatedAt
      ),
      updatedBy: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.general.updatedBy
      ),
      name: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.general.name
      ),
      specificFormRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahjHistory.general.specificFormRequired
        ),
      website: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.general.website
      ),
    };

    const design: FieldValues["design"] = {
      acDisconnectRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahjHistory.design.acDisconnectRequired
        ),
      centerFed120Percent:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahjHistory.design.centerFed120Percent
        ),
      pvMeterRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahjHistory.design.pvMeterRequired
        ),
      deratedAmpacity: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.design.deratedAmpacity
      ),
      designNotes: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.design.designNotes
      ),
      fireSetBack: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.design.fireSetBack
      ),
      utilityNotes: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.design.utilityNotes
      ),
    };

    const engineering: FieldValues["engineering"] = {
      iebcAccepted:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahjHistory.engineering.iebcAccepted
        ),
      windUpliftCalculationRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahjHistory.engineering.windUpliftCalculationRequired
        ),
      structuralObservationRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahjHistory.engineering.structuralObservationRequired
        ),
      wetStampsRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahjHistory.engineering.wetStampsRequired
        ),
      windExposure:
        schemaToConvertFromNullishWindExposureToWindExposureWithEmptyString.parse(
          ahjHistory.engineering.windExposure
        ),
      wetStampSize: schemaToConvertFromNullishANSIToANSIWithEmptyString.parse(
        ahjHistory.engineering.wetStampSize
      ),
      digitalSignatureType:
        schemaToConvertFromNullishDigitalSignatureTypeToDigitalSignatureTypeWithEmptyString.parse(
          ahjHistory.engineering.digitalSignatureType
        ),
      engineeringNotes: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.engineering.engineeringNotes
      ),
      ofWetStamps: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.engineering.ofWetStamps
      ),
      snowLoadFlatRoof: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.engineering.snowLoadFlatRoof
      ),
      snowLoadGround: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.engineering.snowLoadGround
      ),
      windSpeed: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.engineering.windSpeed
      ),
    };

    const electricalEngineering: FieldValues["electricalEngineering"] = {
      electricalNotes: schemaToConvertFromNullishStringToString.parse(
        ahjHistory.electricalEngineering.electricalNotes
      ),
    };

    reset({
      general,
      design,
      engineering,
      electricalEngineering,
    });
  }, [ahjHistory, reset, isAhjHistoryQuerySuccess]);

  return (
    <Sheet {...props}>
      <SheetContent className="w-full max-w-[1400px] sm:max-w-[1400px] overflow-y-auto">
        <h1 className="h3 mb-4">AHJ</h1>
        <Form {...form}>
          <form className="space-y-4 w-full">
            {/* General */}
            <h2 className="h4 mb-2">General</h2>
            <FieldsRowContainer>
              <FormField
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
            </FieldsRowContainer>

            <FieldsRowContainer>
              <FormField
                name="general.buildingCodes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building Codes</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="resize-none" readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="general.generalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>General Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="resize-none" readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FieldsRowContainer>

            {/* Design */}
            <h2 className="h4 mb-2">Design</h2>
            <FieldsRowContainer>
              <FormField
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
            </FieldsRowContainer>
            <FormField
              name="design.fireSetBack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fire Setback</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none" readOnly />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="design.utilityNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Utility Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none" readOnly />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="design.designNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Design Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none" readOnly />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Structural Engineering */}
            <h2 className="h4 mb-2">Structural Engineering</h2>
            <FieldsRowContainer>
              <FormField
                name="engineering.iebcAccepted"
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
                name="engineering.structuralObservationRequired"
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
                name="engineering.digitalSignatureType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Digital Signature Type</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FieldsRowContainer>
            <FieldsRowContainer>
              <FormField
                name="engineering.windUpliftCalculationRequired"
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
                name="engineering.windSpeed"
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
                name="engineering.windExposure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wind Exposure</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FieldsRowContainer>
            <FieldsRowContainer>
              <FormField
                name="engineering.snowLoadGround"
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
                name="engineering.snowLoadFlatRoof"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Snow Load Flat Roof (psf)</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FieldsRowContainer>
            <FieldsRowContainer>
              <FormField
                name="engineering.wetStampsRequired"
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
                name="engineering.ofWetStamps"
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
                name="engineering.wetStampSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wet Stamp Size</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FieldsRowContainer>
            <FormField
              name="engineering.engineeringNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Engineering Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none" readOnly />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Electrical Engineering */}
            <h2 className="h4 mb-2">Electrical Engineering</h2>
            <FormField
              name="electricalEngineering.electricalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Engineering Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none" readOnly />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Last Modified */}
            <h2 className="h4 mb-2">Last Modified</h2>
            <FieldsRowContainer>
              <FormField
                name="general.updatedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Modified By</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="general.updatedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Modified</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FieldsRowContainer>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
