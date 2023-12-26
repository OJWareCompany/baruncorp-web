import {
  CheckCircle2,
  Circle,
  CircleDashed,
  CircleDot,
  CircleEllipsis,
  LucideIcon,
  PauseCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";
import { z } from "zod";
import { ToastProps } from "@/components/ui/toast";

/**
 * Toast
 */
export const errorToastDescription =
  "Please try again in a few minutes. If the problem persists, please contact the Barun Corp Manager.";
export const defaultErrorToast: ToastProps & { description: string } = {
  title: "Something went wrong",
  description: errorToastDescription,
  variant: "destructive",
};
export const serverErrorToast: ToastProps & { description: string } = {
  title: "Server error",
  description: errorToastDescription,
  variant: "destructive",
};

export const orderedServiceStatuses: Record<
  OrderedServiceStatusEnum,
  {
    value: OrderedServiceStatusEnum;
    Icon: LucideIcon;
    color: string;
  }
> = {
  Pending: {
    value: "Pending",
    Icon: CircleEllipsis,
    color: "text-neutral-500",
  },
  Completed: {
    value: "Completed",
    Icon: CheckCircle2,
    color: "text-green-500",
  },
  Canceled: {
    value: "Canceled",
    Icon: XCircle,
    color: "text-red-500",
  },
};

export const jobStatuses: Record<
  JobStatusEnum,
  {
    value: JobStatusEnum;
    Icon: LucideIcon;
    color: string;
  }
> = {
  "Not Started": {
    value: "Not Started",
    Icon: CircleDot,
    color: "text-neutral-500",
  },
  "In Progress": {
    value: "In Progress",
    Icon: PlayCircle,
    color: "text-blue-500",
  },
  Completed: {
    value: "Completed",
    Icon: CheckCircle2,
    color: "text-green-500",
  },
  Canceled: {
    value: "Canceled",
    Icon: XCircle,
    color: "text-red-500",
  },
  "On Hold": {
    value: "On Hold",
    Icon: PauseCircle,
    color: "text-yellow-500",
  },
};

export const invoiceStatuses: Record<
  InvoiceStatusEnum,
  {
    value: InvoiceStatusEnum;
    Icon: LucideIcon;
    color: string;
  }
> = {
  Unissued: {
    value: "Unissued",
    Icon: CircleDashed,
    color: "text-neutral-500",
  },
  Issued: {
    value: "Issued",
    Icon: Circle,
    color: "text-neutral-500",
  },
  Paid: {
    value: "Paid",
    Icon: CheckCircle2,
    color: "text-green-500",
  },
};

/**
 * Transformer
 */

/* -------------------------------------------------------------------------- */

/**
 * "" => null
 * "  " => null
 * "  123  " => 123
 * "123" => 123
 */
export const transformStringIntoNullableNumber = z
  .string()
  .trim()
  .transform((v) => {
    if (v === "") {
      return null;
    }

    const number = Number(v);
    if (Number.isNaN(number)) {
      return 0;
    }

    return number;
  });

/**
 * "" => null
 * "  " => null
 * "  abc  " => "abc"
 * "abc" => "abc"
 */
export const transformStringIntoNullableString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v));

/**
 * undefined => ""
 * null => ""
 * 3 => "3"
 * "" => ""
 * "  " => ""
 * "  abc  " => "abc"
 * "abc" => "abc"
 */
export const transformNullishStringIntoString = z.coerce
  .string()
  .trim()
  .nullish()
  .transform((v) => v ?? "");

/* -------------------------------------------------------------------------- */

// "Residential" | "Commercial"
export const PropertyTypeEnum = z.enum(["Residential", "Commercial"], {
  errorMap: () => ({ message: "Property Type is required" }),
});
// "Residential" | "Commercial" | ""
export const PropertyTypeEnumWithEmptyString = PropertyTypeEnum.or(
  z.literal("")
);
// "Residential" | "Commercial" | "" => "Residential" | "Commercial" | null
export const transformPropertyTypeEnumWithEmptyStringIntoNullablePropertyTypeEnum =
  PropertyTypeEnumWithEmptyString.transform((v) => (v === "" ? null : v));
// "Residential" | "Commercial" | null | undefined => "Residential" | "Commercial" | ""
export const transformNullishPropertyTypeEnumIntoPropertyTypeEnumWithEmptyString =
  PropertyTypeEnum.nullish().transform((v) => v ?? "");

/* -------------------------------------------------------------------------- */

// "Roof Mount" | "Ground Mount" | "Roof Mount & Ground Mount"
export const MountingTypeEnum = z.enum(
  [
    "Roof Mount",
    "Ground Mount",
    // "Roof Mount & Ground Mount",
  ],
  {
    errorMap: () => ({ message: "Mounting Type is required" }),
  }
);
// "Roof Mount" | "Ground Mount" | "Roof Mount & Ground Mount" | ""
export const MountingTypeEnumWithEmptyString = MountingTypeEnum.or(
  z.literal("")
);
// "Roof Mount" | "Ground Mount" | "Roof Mount & Ground Mount" | "" => "Roof Mount" | "Ground Mount" | "Roof Mount & Ground Mount" | null
export const transformMountingTypeEnumWithEmptyStringIntoNullableMountingTypeEnum =
  MountingTypeEnumWithEmptyString.transform((v) => (v === "" ? null : v));
// "Roof Mount" | "Ground Mount" | "Roof Mount & Ground Mount" | null | undefined => "Roof Mount" | "Ground Mount" | "Roof Mount & Ground Mount" | ""
export const transformNullishMountingTypeEnumIntoMountingTypeEnumWithEmptyString =
  MountingTypeEnum.nullish().transform((v) => v ?? "");

/* -------------------------------------------------------------------------- */

// "No" | "Yes" | "See Notes"
export const SelectOptionEnum = z.enum(["No", "Yes", "See Notes"], {
  errorMap: () => ({ message: "Select Option is required" }),
});
// "No" | "Yes" | "See Notes" | ""
export const SelectOptionEnumWithEmptyString = SelectOptionEnum.or(
  z.literal("")
);
// "No" | "Yes" | "See Notes" | "" => "No" | "Yes" | "See Notes" | null
export const transformSelectOptionWithEmptyStringIntoNullableSelectOption =
  SelectOptionEnumWithEmptyString.transform((v) => (v === "" ? null : v));
// "No" | "Yes" | "See Notes" | null | undefined => "No" | "Yes" | "See Notes" | ""
export const transformNullishSelectOptionIntoSelectOptionWithEmptyString =
  SelectOptionEnum.nullish().transform((v) => v ?? "");

/* -------------------------------------------------------------------------- */

// "See Notes" | "B" | "C" | "D"
export const WindExposureEnum = z.enum(["B", "C", "D", "See Notes"], {
  errorMap: () => ({ message: "Wind Exposure is required" }),
});
// "See Notes" | "B" | "C" | "D" | ""
export const WindExposureEnumWithEmptyString = WindExposureEnum.or(
  z.literal("")
);
// "See Notes" | "B" | "C" | "D" | "" => "See Notes" | "B" | "C" | "D" | null
export const transformWindExposureWithEmptyStringIntoNullableWindExposure =
  WindExposureEnumWithEmptyString.transform((v) => (v === "" ? null : v));
// "See Notes" | "B" | "C" | "D" | null | undefined => "See Notes" | "B" | "C" | "D" | ""
export const transformNullishWindExposureIntoWindExposureWithEmptyString =
  WindExposureEnum.nullish().transform((v) => v ?? "");

/* -------------------------------------------------------------------------- */

// "Certified" | "Signed"
export const DigitalSignatureTypeEnum = z.enum(["Certified", "Signed"], {
  errorMap: () => ({ message: "Digital Signature is required" }),
});
// "Certified" | "Signed" | ""
export const DigitalSignatureTypeEnumWithEmptyString =
  DigitalSignatureTypeEnum.or(z.literal(""));
// "Certified" | "Signed" | "" => "Certified" | "Signed" | null
export const transformDigitalSignatureTypeWithEmptyStringIntoNullableDigitalSignatureType =
  DigitalSignatureTypeEnumWithEmptyString.transform((v) =>
    v === "" ? null : v
  );
// "Certified" | "Signed" | null | undefined => "Certified" | "Signed" | ""
export const transformNullishDigitalSignatureTypeIntoDigitalSignatureTypeWithEmptyString =
  DigitalSignatureTypeEnum.nullish().transform((v) => v ?? "");

/* -------------------------------------------------------------------------- */

// "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)"
export const ANSIEnum = z.enum(
  [
    "ANSI A (8.5x11 INCH)",
    "ANSI B (11x17 INCH)",
    "ANSI D (22x34 INCH)",
    "ARCH D (24x36 INCH)",
    "See Notes",
  ],
  {
    errorMap: () => ({ message: "ANSI is required" }),
  }
);
// "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | ""
export const ANSIEnumWithEmptyString = ANSIEnum.or(z.literal(""));
// "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | ""
// => "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | null
export const transformANSIWithEmptyStringIntoNullableANSI =
  ANSIEnumWithEmptyString.transform((v) => (v === "" ? null : v));
// "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | null | undefined
// => "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | ""
export const transformNullishANSIIntoANSIWithEmptyString =
  ANSIEnum.nullish().transform((v) => v ?? "");

/* -------------------------------------------------------------------------- */

// "Not Started" | "In Progress" | "Completed" | "On Hold" | "Canceled"
export const JobStatusEnum = z.enum(
  ["Not Started", "In Progress", "Completed", "On Hold", "Canceled"],
  {
    errorMap: () => ({ message: "Job Status is required" }),
  }
);
// "Not Started" | "In Progress" | "Completed" | "On Hold" | "Canceled" | ""
export const JobStatusEnumWithEmptyString = JobStatusEnum.or(z.literal(""));
// "Not Started" | "In Progress" | "Completed" | "On Hold" | "Canceled" | "" => "Not Started" | "In Progress" | "Completed" | "On Hold" | "Canceled" | null
export const transformJobStatusEnumWithEmptyStringIntoNullableJobStatusEnum =
  JobStatusEnumWithEmptyString.transform((v) => (v === "" ? null : v));
// "Not Started" | "In Progress" | "Completed" | "On Hold" | "Canceled" | null | undefined => "Not Started" | "In Progress" | "Completed" | "On Hold" | "Canceled" | ""
export const transformNullishJobStatusEnumIntoJobStatusEnumWithEmptyString =
  JobStatusEnum.nullish().transform((v) => v ?? "");
export type JobStatusEnum = z.infer<typeof JobStatusEnum>;

/* -------------------------------------------------------------------------- */

// "Pending" | "Completed" | "Canceled"
export const OrderedServiceStatusEnum = z.enum([
  "Pending",
  "Completed",
  "Canceled",
]);
export type OrderedServiceStatusEnum = z.infer<typeof OrderedServiceStatusEnum>;

/* -------------------------------------------------------------------------- */

// "Unissued" | "Issued" | "Paid"
export const InvoiceStatusEnum = z.enum(["Unissued", "Issued", "Paid"]);
export type InvoiceStatusEnum = z.infer<typeof InvoiceStatusEnum>;

/* -------------------------------------------------------------------------- */

// "21" | "30"
export const TermsEnum = z.enum(["21", "30"], {
  errorMap: () => ({ message: "Terms is required" }),
});

/* -------------------------------------------------------------------------- */

// "Credit" | "Direct"
export const PaymentMethodEnum = z.enum(["Credit", "Direct"], {
  errorMap: () => ({ message: "Payment Method is required" }),
});

/* -------------------------------------------------------------------------- */

// "Major" | "Minor"
export const SizeForRevisionEnum = z.enum(["Major", "Minor"], {
  errorMap: () => ({ message: "Payment Method is required" }),
});
// "Major" | "Minor" | ""
export const SizeForRevisionEnumWithEmptyString = SizeForRevisionEnum.or(
  z.literal("")
);
// "Major" | "Minor" | "" => "Major" | "Minor" | null
export const transformSizeForRevisionEnumWithEmptyStringIntoNullableSizeForRevisionEnum =
  SizeForRevisionEnumWithEmptyString.transform((v) => (v === "" ? null : v));
// "Major" | "Minor" | null | undefined => "Major" | "Minor" | ""
export const transformNullishSizeForRevisionEnumIntoSizeForRevisionEnumWithEmptyString =
  SizeForRevisionEnum.nullish().transform((v) => v ?? "");

/* -------------------------------------------------------------------------- */

export const OTHER_SERVICE_ID = "2a2a256b-57a5-46f5-8cfb-1855cc29238a";
export const ELECTRICAL_WET_STAMP_SERVICE_ID =
  "e95483bd-16ea-4a4d-8d68-81d2fa10a384";
export const STRUCTURAL_WET_STAMP_SERVICE_ID =
  "0ce5a100-8b38-45fd-92a7-69e9aa7bd549";
export const ESS_ELECTRICAL_PE_STAMP_SERVICE_ID =
  "4728f174-933a-4974-8e9a-6917720bffce";
export const ELECTRICAL_LOAD_CALCULATION_SERVICE_ID =
  "a061c441-be8c-4bcc-9bcc-2460a01d5a16";
export const ELECTRICAL_LOAD_JUSTIFICATION_LETTER_SERVICE_ID =
  "d7e19772-e937-40fd-b94f-77f056169d34";
export const ELECTRICAL_PE_STAMP_SERVICE_ID =
  "5c29f1ae-d50b-4400-a6fb-b1a2c87126e9";
export const ELECTRICAL_POST_INSTALLED_LETTER_SERVICE_ID =
  "8d44cfe8-6c39-454f-8544-ede966943e6a";

export const STRUCTURAL_FEASIBILITY_SERVICE_ID =
  "0904b078-6c8a-4044-9323-4757d6ca8afa";
export const SPECIAL_INSPECTION_FORM_SERVICE_ID =
  "0ce4b659-601e-43c0-8420-a8ee6b95a385";
export const FL_STATUTE_LETTER_SERVICE_ID =
  "435c5ab0-7605-40cd-811f-9343872f641a";
export const STRUCTURAL_POST_INSTALLED_LETTER_SERVICE_ID =
  "81b11cd8-bbcb-47c7-a45f-af339a422555";
export const SHADING_REPORT_SERVICE_ID = "8a593d31-81ed-41b7-bec5-8d55f348cc05";
export const STRUCTURAL_PE_STAMP_SERVICE_ID =
  "99ff64ee-fe47-4235-a026-db197628d077";
export const ESS_STRUCTURAL_PE_STAMP_SERVICE_ID =
  "ab9cc5cf-62e4-4f27-8ffd-97488068f9fa";
export const PV_DESIGN_SERVICE_ID = "e5d81943-3fef-416d-a85b-addb8be296c0";

/* -------------------------------------------------------------------------- */

export const billingCodes = [
  { name: "ESS Electrical PE Stamp", code: "E6" },
  { name: "ESS Structural PE Stamp", code: "S6" },
  { name: "Electrical Load Calculation", code: "E2" },
  { name: "Electrical Load Justification Letter", code: "E5" },
  { name: "Electrical PE Stamp", code: "E3" },
  { name: "Electrical Post Installed Letter", code: "E4" },
  { name: "Electrical Wet Stamp", code: "WE" },
  { name: "FL Statute Letter", code: "FL" },
  { name: "PV Design", code: "PV" },
  { name: "Shading Report", code: "SR" },
  { name: "Special Inspection Form", code: "SI" },
  { name: "Structural Calculation (Letter)", code: "S3" },
  { name: "Structural Feasibility", code: "S1" },
  { name: "Structural PE Stamp", code: "S4" },
  { name: "Structural Post Installed Letter ", code: "S5" },
  { name: "Structural Wet Stamp", code: "WS" },
  { name: "Other", code: "O" },
];

/* -------------------------------------------------------------------------- */

// "Standard" | "Fixed"
export const ServicePricingTypeEnum = z.enum(["Standard", "Fixed"], {
  errorMap: () => ({ message: "Pricing Type is required" }),
});

/* -------------------------------------------------------------------------- */

// "Tier" | "Flat"
export const ResidentialNewPriceChargeTypeEnum = z.enum(["Tier", "Flat"], {
  errorMap: () => ({ message: "Charge Type is required" }),
});
// "Tier" | "Flat" | ""
export const ResidentialNewPriceChargeTypeEnumWithEmptyString =
  ResidentialNewPriceChargeTypeEnum.or(z.literal(""));
// "Tier" | "Flat" | "" => "Tier" | "Flat" | null
export const transformResidentialNewPriceChargeTypeEnumWithEmptyStringIntoNullableResidentialNewPriceChargeTypeEnum =
  ResidentialNewPriceChargeTypeEnumWithEmptyString.transform((v) =>
    v === "" ? null : v
  );
// "Tier" | "Flat" | null | undefined => "Tier" | "Flat" | ""
export const transformNullishResidentialNewPriceChargeTypeEnumIntoResidentialNewPriceChargeTypeEnumWithEmptyString =
  ResidentialNewPriceChargeTypeEnum.nullish().transform((v) => v ?? "");

/* -------------------------------------------------------------------------- */

// "Fixed" | "Percentage"
export const ExpenseTypeEnum = z.enum(["Fixed", "Percentage"], {
  errorMap: () => ({ message: "Expense Type is required" }),
});
// "Fixed" | "Percentage" | ""
export const ExpenseTypeEnumWithEmptyString = ExpenseTypeEnum.or(z.literal(""));
// "Fixed" | "Percentage" | "" => "Fixed" | "Percentage" | null
export const transformExpenseTypeEnumWithEmptyStringIntoNullableExpenseTypeEnum =
  ExpenseTypeEnumWithEmptyString.transform((v) => (v === "" ? null : v));

export type ExpenseTypeEnum = z.infer<typeof ExpenseTypeEnum>;

/* -------------------------------------------------------------------------- */

// "Structural" | "Electrical"
export const LicenseTypeEnum = z.enum(["Structural", "Electrical"], {
  errorMap: () => ({ message: "License Type is required" }),
});
// "Structural" | "Electrical" | ""
export const LicenseTypeEnumWithEmptyString = LicenseTypeEnum.or(z.literal(""));
// "Structural" | "Electrical" | "" => "Structural" | "Electrical" | null
export const transformLicenseTypeEnumWithEmptyStringIntoNullableLicenseTypeEnum =
  LicenseTypeEnumWithEmptyString.transform((v) => (v === "" ? null : v));
// "Structural" | "Electrical" | null | undefined => "Structural" | "Electrical" | ""
export const transformNullishLicenseTypeEnumIntoLicenseTypeEnumWithEmptyString =
  LicenseTypeEnum.nullish().transform((v) => v ?? "");

export type LicenseTypeEnum = z.infer<typeof LicenseTypeEnum>;

/* -------------------------------------------------------------------------- */

// "None" | "Residential" | "Commercial" | "Residential / Commercial"
export const AutoAssignmentPropertyTypeEnum = z.enum(
  ["None", "Residential", "Commercial", "Residential / Commercial"],
  {
    errorMap: () => ({ message: "Auto Assignment Property Type is required" }),
  }
);
// "None" | "Residential" | "Commercial" | "Residential / Commercial" | ""
export const AutoAssignmentPropertyTypeEnumWithEmptyString =
  AutoAssignmentPropertyTypeEnum.or(z.literal(""));

export type AutoAssignmentPropertyTypeEnum = z.infer<
  typeof AutoAssignmentPropertyTypeEnum
>;

/* -------------------------------------------------------------------------- */

/**
 * 1
 * 11
 * 11.
 * 11.1
 * 11.11
 * .1
 * .11
 */
export const toTwoDecimalRegExp = new RegExp(/^\d+(\.\d{0,2})?$/);
export const digitRegExp = new RegExp(/^\d+$/);

/* -------------------------------------------------------------------------- */

export const BARUNCORP_ORGANIZATION_ID = "asda";

/* -------------------------------------------------------------------------- */

// "Yes" | "No"
export const YesOrNoEnum = z.enum(["Yes", "No"]);

// "Yes" | "No" | null => true | false | null
export const transformNullableYesOrNoEnumIntoNullableBoolean =
  YesOrNoEnum.nullable().transform((v) => {
    if (v == null) {
      return null;
    }

    if (v === "Yes") {
      return true;
    }

    return false;
  });

/* -------------------------------------------------------------------------- */

export const STATES = [
  {
    stateName: "ALABAMA",
    abbreviation: "AL",
  },
  {
    stateName: "ALASKA",
    abbreviation: "AK",
  },
  {
    stateName: "ARIZONA",
    abbreviation: "AZ",
  },
  {
    stateName: "ARKANSAS",
    abbreviation: "AR",
  },
  {
    stateName: "CALIFORNIA",
    abbreviation: "CA",
  },
  {
    stateName: "COLORADO",
    abbreviation: "CO",
  },
  {
    stateName: "CONNECTICUT",
    abbreviation: "CT",
  },
  {
    stateName: "DELAWARE",
    abbreviation: "DE",
  },
  {
    stateName: "DISTRICT OF COLUMBIA",
    abbreviation: "DC",
  },
  {
    stateName: "FLORIDA",
    abbreviation: "FL",
  },
  {
    stateName: "GEORGIA",
    abbreviation: "GA",
  },
  {
    stateName: "HAWAII",
    abbreviation: "HI",
  },
  {
    stateName: "IDAHO",
    abbreviation: "ID",
  },
  {
    stateName: "ILLINOIS",
    abbreviation: "IL",
  },
  {
    stateName: "INDIANA",
    abbreviation: "IN",
  },
  {
    stateName: "IOWA",
    abbreviation: "IA",
  },
  {
    stateName: "KANSAS",
    abbreviation: "KS",
  },
  {
    stateName: "KENTUCKY",
    abbreviation: "KY",
  },
  {
    stateName: "LOUISIANA",
    abbreviation: "LA",
  },
  {
    stateName: "MAINE",
    abbreviation: "ME",
  },
  {
    stateName: "MARYLAND",
    abbreviation: "MD",
  },
  {
    stateName: "MASSACHUSETTS",
    abbreviation: "MA",
  },
  {
    stateName: "MICHIGAN",
    abbreviation: "MI",
  },
  {
    stateName: "MINNESOTA",
    abbreviation: "MN",
  },
  {
    stateName: "MISSISSIPPI",
    abbreviation: "MS",
  },
  {
    stateName: "MISSOURI",
    abbreviation: "MO",
  },
  {
    stateName: "MONTANA",
    abbreviation: "MT",
  },
  {
    stateName: "NEBRASKA",
    abbreviation: "NE",
  },
  {
    stateName: "NEVADA",
    abbreviation: "NV",
  },
  {
    stateName: "NEW HAMPSHIRE",
    abbreviation: "NH",
  },
  {
    stateName: "NEW JERSEY",
    abbreviation: "NJ",
  },
  {
    stateName: "NEW MEXICO",
    abbreviation: "NM",
  },
  {
    stateName: "NEW YORK",
    abbreviation: "NY",
  },
  {
    stateName: "NORTH CAROLINA",
    abbreviation: "NC",
  },
  {
    stateName: "NORTH DAKOTA",
    abbreviation: "ND",
  },
  {
    stateName: "OHIO",
    abbreviation: "OH",
  },
  {
    stateName: "OKLAHOMA",
    abbreviation: "OK",
  },
  {
    stateName: "OREGON",
    abbreviation: "OR",
  },
  {
    stateName: "PENNSYLVANIA",
    abbreviation: "PA",
  },
  {
    stateName: "PUERTO RICO",
    abbreviation: "PR",
  },
  {
    stateName: "RHODE ISLAND",
    abbreviation: "RI",
  },
  {
    stateName: "SOUTH CAROLINA",
    abbreviation: "SC",
  },
  {
    stateName: "SOUTH DAKOTA",
    abbreviation: "SD",
  },
  {
    stateName: "TENNESSEE",
    abbreviation: "TN",
  },
  {
    stateName: "TEXAS",
    abbreviation: "TX",
  },
  {
    stateName: "UTAH",
    abbreviation: "UT",
  },
  {
    stateName: "VERMONT",
    abbreviation: "VT",
  },
  {
    stateName: "VIRGINIA",
    abbreviation: "VA",
  },
  {
    stateName: "WASHINGTON",
    abbreviation: "WA",
  },
  {
    stateName: "WEST VIRGINIA",
    abbreviation: "WV",
  },
  {
    stateName: "WISCONSIN",
    abbreviation: "WI",
  },
  {
    stateName: "WYOMING",
    abbreviation: "WY",
  },
];
