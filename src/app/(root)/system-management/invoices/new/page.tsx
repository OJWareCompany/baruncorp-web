"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addDays, format, lastDayOfMonth, setDate } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { TermsEnum } from "@/lib/constants";
import PageHeader from "@/components/PageHeader";
import InvoiceOrganizationsCombobox from "@/components/combobox/OrganizationsForInvoiceCombobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import ServicePeriodMonthByOrganizationSelect from "@/components/combobox/ServicePeriodMonthByOrganizationSelect";
import useJobsToInvoiceQuery from "@/queries/useJobsToInvoiceQuery";
import BaseTable from "@/components/table/BaseTable";
import { jobToInvoiceColumns } from "@/columns/job";
import { Textarea } from "@/components/ui/textarea";
import LoadingButton from "@/components/LoadingButton";

const formSchema = z.object({
  organizationId: z
    .string()
    .trim()
    .min(1, { message: "Organization is required" }),
  invoiceDate: z.date({
    required_error: "A date of birth is required.",
  }),
  terms: TermsEnum,
  servicePeriodMonth: z
    .string()
    .trim()
    .min(1, { message: "Service Month is required" }),
  notesToClient: z.string().trim(),
  //   emailAddressToReceiveInvoice: z
  //     .string()
  //     .trim()
  //     .min(1, { message: "Email Address is required" })
  //     .email({
  //       message: "Format of Email Address is incorrect",
  //     }),
  //   phoneNumber: z.string().trim(),
  //   defaultPropertyType: PropertyTypeEnumWithEmptyString,
  //   defaultMountingType: MountingTypeEnumWithEmptyString,
  //   address: z
  //     .object({
  //       street1: z.string().trim().min(1, { message: "Street 1 is required" }),
  //       street2: z.string().trim(),
  //       city: z.string().trim().min(1, { message: "City required" }),
  //       stateOrRegion: z
  //         .string()
  //         .trim()
  //         .min(1, { message: "State / Region is required" }),
  //       postalCode: z
  //         .string()
  //         .trim()
  //         .min(1, { message: "Postal Code is required" }),
  //       country: z.string().trim().min(1, { message: "Country is required" }),
  //       fullAddress: z
  //         .string()
  //         .trim()
  //         .min(1, { message: "Full Address is required" }),
  //       coordinates: z
  //         .array(z.number())
  //         .min(1, { message: "Coordinates is required" }),
  //     })
  //     .superRefine((value, ctx) => {
  //       if (value.fullAddress.length === 0) {
  //         // TODO: address required인지 체크
  //         ctx.addIssue({
  //           code: z.ZodIssueCode.custom,
  //           message: "Address is required",
  //         });
  //       }
  //     }),
});

const title = "New Invoice";

export default function Page() {
  /**
   * Form
   */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: "",
      invoiceDate: new Date(),
      terms: "30",
      servicePeriodMonth: "",
      notesToClient: "",
      //   emailAddressToReceiveInvoice: "",
      //   phoneNumber: "",
      //   defaultMountingType: "",
      //   defaultPropertyType: "",
      //   address: {
      //     street1: "",
      //     street2: "",
      //     city: "",
      //     stateOrRegion: "",
      //     postalCode: "",
      //     country: "",
      //     fullAddress: "",
      //     coordinates: [],
      //   },
    },
  });
  const watchInvoiceDate = form.watch("invoiceDate");
  const watchOrganizationId = form.watch("organizationId");
  const watchTerms = form.watch("terms");
  const watchServicePeriodMonth = form.watch("servicePeriodMonth");

  //   const { isSubmitSuccessful } = form.formState;

  let servicePeriodDate = "";
  if (watchServicePeriodMonth !== "") {
    const firstServicePeriodDate = format(
      setDate(new Date(watchServicePeriodMonth), 1),
      "MM-dd-yyyy"
    );
    const lastServicePeriodDate = format(
      lastDayOfMonth(new Date(watchServicePeriodMonth)),
      "MM-dd-yyyy"
    );

    servicePeriodDate = `${firstServicePeriodDate} - ${lastServicePeriodDate}`;
  }

  /**
   * Query
   */
  const { data: jobsToInvoice } = useJobsToInvoiceQuery({
    organizationId: watchOrganizationId,
    servicePeriodMonth: watchServicePeriodMonth,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // const {
    //   address,
    //   defaultMountingType,
    //   defaultPropertyType,
    //   emailAddressToReceiveInvoice,
    //   name,
    //   phoneNumber,
    // } = values;
    // await mutateAsync({
    //   address: {
    //     ...address,
    //     state: address.stateOrRegion,
    //   },
    //   description: null, // TODO: check
    //   email: emailAddressToReceiveInvoice, // TODO: invoice를 위한 email인 것을 효민님께 알리기
    //   name,
    //   projectPropertyTypeDefaultValue:
    //     transformPropertyTypeEnumWithEmptyStringIntoNullablePropertyTypeEnum.parse(
    //       defaultPropertyType
    //     ),
    //   mountingTypeDefaultValue:
    //     transformMountingTypeEnumWithEmptyStringIntoNullableMountingTypeEnum.parse(
    //       defaultMountingType
    //     ),
    //   organizationType: "client", // TODO: check
    //   phoneNumber,
    // })
    //   .then(() => {
    //     toast({
    //       title: "Success",
    //     });
    //   })
    //   .catch((error: AxiosError<ErrorResponseData>) => {
    //     switch (error.response?.status) {
    //       case 409:
    //         if (error.response?.data.errorCode.includes("20001")) {
    //           form.setError(
    //             "name",
    //             {
    //               message: `${name} is already existed`,
    //             },
    //             {
    //               shouldFocus: true,
    //             }
    //           );
    //         }
    //         break;
    //     }
    //   });
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/invoices", name: "Invoices" },
          { href: "/system-management/invoices/new", name: title },
        ]}
        title={title}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Organization</FormLabel>
                <FormControl>
                  <InvoiceOrganizationsCombobox
                    organizationId={field.value}
                    onSelect={(organizationId) => {
                      field.onChange(organizationId);
                      form.setValue("servicePeriodMonth", "", {
                        shouldValidate: form.formState.isSubmitted,
                      });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <RowItemsContainer>
            <FormField
              control={form.control}
              name="invoiceDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel required>Invoice Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "MM-dd-yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(day) => {
                          if (day == null) {
                            return;
                          }

                          field.onChange(day);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Terms</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger ref={field.ref}>
                        <SelectValue placeholder="Select a property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {TermsEnum.options.map((option) => (
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
            <Item>
              <Label>Date Due</Label>
              <Input
                value={format(
                  addDays(watchInvoiceDate, Number(watchTerms)),
                  "MM-dd-yyyy"
                )}
                readOnly
              />
            </Item>
          </RowItemsContainer>
          <FormField
            control={form.control}
            name="servicePeriodMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Service Period Month</FormLabel>
                <FormControl>
                  <ServicePeriodMonthByOrganizationSelect
                    organizationId={watchOrganizationId}
                    servicePeriodMonth={field.value}
                    onServicePeriodMonthChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notesToClient"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Notes to Client</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton
            type="submit"
            isLoading={form.formState.isSubmitting}
            className="w-full"
          >
            Submit
          </LoadingButton>
        </form>
      </Form>
      <BaseTable
        columns={jobToInvoiceColumns}
        data={jobsToInvoice ?? []}
        getRowId={({ description }) => description} // TODO: replace
      />
    </div>
  );
}
