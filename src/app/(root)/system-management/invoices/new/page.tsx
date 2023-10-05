"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { TermsEnum, transformStringIntoNullableString } from "@/lib/constants";
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
import { lineItemColumns } from "@/columns/job";
import { Textarea } from "@/components/ui/textarea";
import LoadingButton from "@/components/LoadingButton";
import usePostInvoiceMutation from "@/queries/usePostInvoiceMutation";
import { useToast } from "@/components/ui/use-toast";
import { AffixInput } from "@/components/AffixInput";

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
    .datetime({ message: "Service Period Month is required" }),
  notesToClient: z.string().trim(),
});

const title = "New Invoice";

type FieldValues = z.infer<typeof formSchema>;

export default function Page() {
  const { toast } = useToast();
  /**
   * Form
   */
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: "",
      invoiceDate: new Date(),
      terms: "30",
      servicePeriodMonth: "",
      notesToClient: "",
    },
  });
  const watchInvoiceDate = form.watch("invoiceDate");
  const watchOrganizationId = form.watch("organizationId");
  const watchTerms = form.watch("terms");
  const watchServicePeriodMonth = form.watch("servicePeriodMonth");
  const { isSubmitSuccessful } = form.formState;

  /**
   * Query
   */
  const { data: jobsToInvoice } = useJobsToInvoiceQuery({
    organizationId: watchOrganizationId,
    servicePeriodMonth: watchServicePeriodMonth,
  });
  const { mutateAsync } = usePostInvoiceMutation();
  const queryClient = useQueryClient();

  /**
   * useEffect
   */
  useEffect(() => {
    if (isSubmitSuccessful) {
      form.reset();
    }
  }, [form, isSubmitSuccessful]);

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      clientOrganizationId: values.organizationId,
      invoiceDate: values.invoiceDate.toISOString(),
      notesToClient: transformStringIntoNullableString.parse(
        values.notesToClient
      ),
      serviceMonth: format(
        new Date(values.servicePeriodMonth.slice(0, 7)),
        "yyyy-MM"
      ),
      terms: Number(values.terms) as 21 | 30,
    })
      .then(() => {
        toast({
          title: "Success",
        });
        queryClient.invalidateQueries({
          queryKey: ["organizations-to-invoice", "list"],
        });
      })
      .catch(() => {});
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
      <div className="space-y-6">
        <section>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <RowItemsContainer>
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
              </RowItemsContainer>
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
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
                  <Label>Due Date</Label>
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
                name="notesToClient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes to Client</FormLabel>
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
                Create
              </LoadingButton>
            </form>
          </Form>
        </section>
        {jobsToInvoice && (
          <section>
            <h4 className="h4 mb-2">Jobs</h4>
            <div className="flex flex-col gap-2">
              <RowItemsContainer>
                <Item>
                  <Label>Subtotal</Label>
                  <AffixInput
                    prefixElement={
                      <span className="text-muted-foreground">$</span>
                    }
                    value={jobsToInvoice.subtotal}
                    readOnly
                  />
                </Item>
                <Item>
                  <Label>Discount</Label>
                  <AffixInput
                    prefixElement={
                      <span className="text-muted-foreground">$</span>
                    }
                    value={jobsToInvoice.discount}
                    readOnly
                  />
                </Item>
                <Item>
                  <Label>Total</Label>
                  <AffixInput
                    prefixElement={
                      <span className="text-muted-foreground">$</span>
                    }
                    value={jobsToInvoice.total}
                    readOnly
                  />
                </Item>
              </RowItemsContainer>
              <BaseTable
                columns={lineItemColumns}
                data={jobsToInvoice.items ?? []}
                getRowId={({ description }) => description}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
