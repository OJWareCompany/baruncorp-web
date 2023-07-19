"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultValues, useForm } from "react-hook-form";
import { ReactNode, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAhjQuery } from "@/queries/useAhjQuery";
import { Textarea } from "@/components/ui/textarea";
import {
  Design,
  Engineering,
  General,
  CommonOption,
  DigitalSignatureType,
  WindExposure,
  WetStampSize,
} from "@/types/dto/ahjs";
import { usePutAhjMutation } from "@/queries/usePutAhjMutation";

function pickFields<T, K extends keyof T>(
  obj: T,
  textKeys: K[],
  selectKeys: K[]
): Pick<T, K> {
  const copy: { [P in keyof T]?: T[P] | "" } = {};
  textKeys.forEach((key) => (copy[key] = obj[key] ?? ""));
  selectKeys.forEach((key) => (copy[key] = obj[key] ?? undefined));
  return copy as Pick<T, K>;
}

// TODO 좀 더 명확한 함수명 생각해보기
const createFieldsObjectFromValues = (values: FieldValues, fields: string[]) =>
  fields.reduce((obj, item) => {
    // item 변수가 values 객체의 키 중 하나임을 타입스크립트에게 알려줌
    const v = values[item as keyof typeof values];
    if (v) {
      obj[item] = v;
    }
    return obj;
  }, {} as { [key: string]: string });

// TODO 타입 관련 리팩토링
const readonlyGeneralFields = [
  "name",
  "website",
  "specificFormRequired",
  "generalNotes",
  "buildingCodes",
] as const;
const generalFields = [...readonlyGeneralFields] as string[];
type GeneralField = (typeof readonlyGeneralFields)[number];
interface GeneralFieldObject extends Pick<General, GeneralField> {
  name: string;
  website: string;
  specificFormRequired?: CommonOption;
  generalNotes: string;
  buildingCodes: string;
}

const readonlyDesignFields = [
  "fireSetBack",
  "utilityNotes",
  "designNotes",
  "pvMeterRequired",
  "acDisconnectRequired",
  "centerFed120Percent",
  "deratedAmpacity",
] as const;
const designFields = [...readonlyDesignFields] as string[];
type DesignField = (typeof readonlyDesignFields)[number];
interface DesignFieldObject extends Pick<Design, DesignField> {
  fireSetBack: string;
  utilityNotes: string;
  designNotes: string;
  pvMeterRequired?: CommonOption;
  acDisconnectRequired?: CommonOption;
  centerFed120Percent?: CommonOption;
  deratedAmpacity: string;
}

const readonlyEngineeringFields = [
  "iebcAccepted",
  "structuralObservationRequired",
  "windUpliftCalculationRequired",
  "wetStampsRequired",
  "digitalSignatureType",
  "windExposure",
  "wetStampSize",
  "windSpeed",
  "snowLoadGround",
  "snowLoadFlatRoof",
  "ofWetStamps",
] as const;
const engineeringFields = [...readonlyEngineeringFields] as string[];
type EngineeringField = (typeof readonlyEngineeringFields)[number];
interface EngineeringFieldObject extends Pick<Engineering, EngineeringField> {
  engineeringNotes: string; // structural notes
  iebcAccepted?: CommonOption;
  structuralObservationRequired?: CommonOption;
  windUpliftCalculationRequired?: CommonOption;
  wetStampsRequired?: CommonOption;
  digitalSignatureType?: DigitalSignatureType;
  windExposure?: WindExposure;
  wetStampSize?: WetStampSize;
  windSpeed: string;
  snowLoadGround: string;
  snowLoadFlatRoof: string;
  ofWetStamps: string;
}

const readonlyElectricalEngineeringFields = ["electricalNotes"] as const;
const electricalEngineeringFields = [
  ...readonlyElectricalEngineeringFields,
] as string[];
interface ElectricalEngineeringFieldObject {
  electricalNotes: string;
}

const commonOptions = ["Yes", "No", "See Notes"];

/**
 * input, textarea는 defaultvalue 필요
 * select는 필요 없다
 */
const formSchema = z.object({
  // general
  name: z.string(),
  website: z.string(),
  specificFormRequired: z.string(), // select box
  generalNotes: z.string(),
  buildingCodes: z.string(),

  // design
  fireSetBack: z.string(),
  utilityNotes: z.string(),
  designNotes: z.string(),
  pvMeterRequired: z.string(), // select box
  acDisconnectRequired: z.string(), // select box
  centerFed120Percent: z.string(), // select box
  deratedAmpacity: z.string(),

  // structural engineering
  engineeringNotes: z.string(),
  iebcAccepted: z.string(), // select box
  structuralObservationRequired: z.string(), // select box
  windUpliftCalculationRequired: z.string(), // select box
  wetStampsRequired: z.string(), // select box
  digitalSignatureType: z.string(), // select box
  windExposure: z.string(), // select box
  wetStampSize: z.string(), // select box
  windSpeed: z.string(),
  snowLoadGround: z.string(),
  snowLoadFlatRoof: z.string(),
  ofWetStamps: z.string(),

  // electrical engineering
  electricalNotes: z.string(),

  // last modified
  modifiedBy: z.string(), // readonly
  modifiedAt: z.string(), // readonly
});

type FieldValues = z.infer<typeof formSchema>;

let defaultValues: DefaultValues<FieldValues> = {
  // general
  name: "",
  website: "",
  specificFormRequired: "",
  generalNotes: "",
  buildingCodes: "",
  // design
  fireSetBack: "",
  utilityNotes: "",
  designNotes: "",
  pvMeterRequired: "",
  acDisconnectRequired: "",
  centerFed120Percent: "",
  deratedAmpacity: "",
  // structural engineering
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
  // electrical engineering
  electricalNotes: "",
  // last modified
  modifiedBy: "",
  modifiedAt: "",
};
if (process.env.NODE_ENV === "development") {
}

export default function Page() {
  const { geoId } = useParams() as { geoId: string };
  const { data: ahj, isSuccess: isAhjQuerySuccess } = useAhjQuery(geoId);
  const { mutateAsync } = usePutAhjMutation(geoId);

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const {
    control,
    formState: { isSubmitting, isDirty, dirtyFields },
    reset,
  } = form;

  useEffect(() => {
    if (!isAhjQuerySuccess) {
      return;
    }

    // TODO as 사용안하도록 리팩토링
    const generalFieldObject = pickFields(
      ahj.general,
      ["name", "website", "generalNotes", "buildingCodes"],
      ["specificFormRequired"]
    ) as GeneralFieldObject;

    const designFieldObject = pickFields(
      ahj.design,
      ["fireSetBack", "utilityNotes", "designNotes", "deratedAmpacity"],
      ["pvMeterRequired", "acDisconnectRequired", "centerFed120Percent"]
    ) as DesignFieldObject;

    const engineeringFieldObject = pickFields(
      ahj.engineering,
      ["windSpeed", "snowLoadGround", "snowLoadFlatRoof", "ofWetStamps"],
      [
        "iebcAccepted",
        "structuralObservationRequired",
        "windUpliftCalculationRequired",
        "wetStampsRequired",
        "digitalSignatureType",
        "windExposure",
        "wetStampSize",
      ]
    ) as EngineeringFieldObject;
    engineeringFieldObject.engineeringNotes =
      ahj.engineering.engineeringNotes ?? "";

    const electricalEngineeringFieldObject = {
      electricalNotes: ahj.electricalEngineering.electricalNotes ?? "",
    } as ElectricalEngineeringFieldObject;

    const defaultValues = {
      ...generalFieldObject,
      ...designFieldObject,
      ...engineeringFieldObject,
      ...electricalEngineeringFieldObject,
    };

    reset(defaultValues);
  }, [isAhjQuerySuccess, ahj, reset]);

  async function onSubmit(values: FieldValues) {
    const modifiedFields = Object.keys(dirtyFields);

    const fieldsMap = {
      general: modifiedFields.filter((item) => generalFields.includes(item)),
      design: modifiedFields.filter((item) => designFields.includes(item)),
      engineering: modifiedFields.filter(
        (item) =>
          engineeringFields.includes(item) || item === "engineeringNotes"
      ),
      electricalEngineering: modifiedFields.filter((item) =>
        electricalEngineeringFields.includes(item)
      ),
    };

    const general = createFieldsObjectFromValues(values, fieldsMap.general);
    const design = createFieldsObjectFromValues(values, fieldsMap.design);
    const engineering = createFieldsObjectFromValues(
      values,
      fieldsMap.engineering
    );
    const electricalEngineering = createFieldsObjectFromValues(
      values,
      fieldsMap.electricalEngineering
    );

    const data = {
      general,
      design,
      engineering,
      electricalEngineering,
    };

    await mutateAsync(data);
  }

  return (
    <Form {...form}>
      <h1 className="h3 mb-4">AHJ</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        {/* General */}
        <h1 className="h4 mb-2">General</h1>
        <FieldsRowWrapper>
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="website"
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
            control={control}
            name="specificFormRequired"
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
                        {commonOptions.map((item) => (
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
        </FieldsRowWrapper>

        <FieldsRowWrapper>
          <FormField
            control={control}
            name="buildingCodes"
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
            control={control}
            name="generalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>General Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} className="resize-none" />
                </FormControl>
              </FormItem>
            )}
          />
        </FieldsRowWrapper>

        {/* Design */}
        <h1 className="h4 mb-2">Design</h1>
        <FieldsRowWrapper>
          <FormField
            control={control}
            name="pvMeterRequired"
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
                        {commonOptions.map((item) => (
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
            control={control}
            name="acDisconnectRequired"
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
                        {commonOptions.map((item) => (
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
            control={control}
            name="centerFed120Percent"
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
                        {commonOptions.map((item) => (
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
            control={control}
            name="deratedAmpacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Derated Ampacity</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </FieldsRowWrapper>
        <FormField
          control={control}
          name="fireSetBack"
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
          control={control}
          name="utilityNotes"
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
          control={control}
          name="designNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Design Notes</FormLabel>
              <FormControl>
                <Textarea {...field} className="resize-none" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Structural Engineering */}
        <h1 className="h4 mb-2">Structural Engineering</h1>
        <FieldsRowWrapper>
          <FormField
            control={control}
            name="iebcAccepted"
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
                        {commonOptions.map((item) => (
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
            control={control}
            name="structuralObservationRequired"
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
                        {commonOptions.map((item) => (
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
            control={control}
            name="digitalSignatureType"
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
                        {["Certified", "Signed"].map((item) => (
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
        </FieldsRowWrapper>
        <FieldsRowWrapper>
          <FormField
            control={control}
            name="windUpliftCalculationRequired"
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
                        {commonOptions.map((item) => (
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
            control={control}
            name="windSpeed"
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
            control={control}
            name="windExposure"
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
                        {["B", "C", "D", "See Notes"].map((item) => (
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
        </FieldsRowWrapper>
        <FieldsRowWrapper>
          <FormField
            control={control}
            name="snowLoadGround"
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
            control={control}
            name="snowLoadFlatRoof"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Snow Load Flat Roof (psf)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </FieldsRowWrapper>
        <FieldsRowWrapper>
          <FormField
            control={control}
            name="wetStampsRequired"
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
                        {commonOptions.map((item) => (
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
            control={control}
            name="ofWetStamps"
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
            control={control}
            name="wetStampSize"
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
                        {[
                          "ANSI A (8.5x11 INCH)",
                          "ANSI B (11x17 INCH)",
                          "ANSI C (22x34 INCH)",
                          "ANSI D (24x36 INCH)",
                          "See Notes",
                        ].map((item) => (
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
        </FieldsRowWrapper>
        <FormField
          control={control}
          name="engineeringNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engineering Notes</FormLabel>
              <FormControl>
                <Textarea {...field} className="resize-none" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Electrical Engineering */}
        <h1 className="h4 mb-2">Electrical Engineering</h1>
        <FormField
          control={control}
          name="electricalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engineering Notes</FormLabel>
              <FormControl>
                <Textarea {...field} className="resize-none" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Last Modified */}
        <h1 className="h4 mb-2">Last Modified</h1>
        <FieldsRowWrapper>
          <FormField
            control={control}
            name="modifiedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Modified By</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="modifiedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Modified</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
              </FormItem>
            )}
          />
        </FieldsRowWrapper>

        <Button
          type="submit"
          fullWidth
          disabled={!isDirty}
          loading={isSubmitting}
        >
          Save
        </Button>
      </form>
    </Form>
  );
}

function FieldsRowWrapper({ children }: { children: ReactNode }) {
  return <div className="flex space-x-4 [&>*]:w-full">{children}</div>;
}
