"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import JobsTable from "./JobsTable";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import OrganizationsToInvoiceCombobox from "@/components/combobox/OrganizationsToInvoiceCombobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn, getISOStringForStartOfDayInUTC } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import ServicePeriodMonthByOrganizationSelect from "@/components/combobox/ServicePeriodMonthByOrganizationSelect";
import { Textarea } from "@/components/ui/textarea";
import LoadingButton from "@/components/LoadingButton";
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
import useJobsForClientInvoiceQuery from "@/queries/useJobsForClientInvoiceQuery";
import { AffixInput } from "@/components/AffixInput";
import usePostInvoiceMutation from "@/mutations/usePostInvoiceMutation";
import { getOrganizationsToInvoiceQueryKey } from "@/queries/useOrganizationsToInvoiceQuery";
import { getClientInvoicesQueryKey } from "@/queries/useClientInvoicesQuery";

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
  notes: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

export default function NewClientInvoiceSheet() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: "",
      invoiceDate: new Date(),
      terms: "30",
      servicePeriodMonth: "",
      notes: "",
    },
  });
  const watchInvoiceDate = form.watch("invoiceDate");
  const watchOrganizationId = form.watch("organizationId");
  const watchTerms = form.watch("terms");
  const watchServicePeriodMonth = form.watch("servicePeriodMonth");

  const { data: jobs } = useJobsForClientInvoiceQuery(
    {
      clientOrganizationId: watchOrganizationId,
      serviceMonth:
        watchServicePeriodMonth !== ""
          ? format(new Date(watchServicePeriodMonth.slice(0, 7)), "yyyy-MM")
          : "",
    },
    true
  );
  const { mutateAsync } = usePostInvoiceMutation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isSubmitSuccessful) {
      form.reset();
      setIsSubmitSuccessful(false);
    }
  }, [form, isSubmitSuccessful]);

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      clientOrganizationId: values.organizationId,
      invoiceDate: getISOStringForStartOfDayInUTC(values.invoiceDate),
      notesToClient: transformStringIntoNullableString.parse(values.notes),
      serviceMonth: format(
        new Date(values.servicePeriodMonth.slice(0, 7)),
        "yyyy-MM"
      ),
      terms: Number(values.terms) as 21 | 30,
    })
      .then(() => {
        setIsSubmitSuccessful(true);
        toast({
          title: "Success",
        });
        queryClient.invalidateQueries({
          queryKey: getOrganizationsToInvoiceQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: getClientInvoicesQueryKey({}),
        });
        setOpen(false);
      })
      .catch(() => {});
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <Plus className="mr-2 h-4 w-4" />
          New Client Invoice
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New Client Invoice</SheetTitle>
        </SheetHeader>
        <div className="space-y-6">
          <section>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <RowItemsContainer>
                  <FormField
                    control={form.control}
                    name="organizationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Organization</FormLabel>
                        <FormControl>
                          <OrganizationsToInvoiceCombobox
                            organizationId={field.value}
                            onOrganizationIdChange={(organizationId) => {
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
                      disabled
                    />
                  </Item>
                </RowItemsContainer>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
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
          </section>
          {watchOrganizationId !== "" &&
            watchServicePeriodMonth !== "" &&
            jobs && (
              <section>
                <h2 className="h4 mb-2">Jobs</h2>
                <div className="flex flex-col gap-2">
                  <RowItemsContainer>
                    <Item>
                      <Label>Subtotal</Label>
                      <AffixInput
                        prefixElement={
                          <span className="text-muted-foreground">$</span>
                        }
                        value={jobs.subtotal}
                        disabled
                      />
                    </Item>
                    <Item>
                      <Label>Discount</Label>
                      <AffixInput
                        prefixElement={
                          <span className="text-muted-foreground">$</span>
                        }
                        value={jobs.discount}
                        disabled
                      />
                    </Item>
                    <Item>
                      <Label>Total</Label>
                      <AffixInput
                        prefixElement={
                          <span className="text-muted-foreground">$</span>
                        }
                        value={jobs.total}
                        disabled
                      />
                    </Item>
                  </RowItemsContainer>
                  <JobsTable jobs={jobs} />
                </div>
              </section>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
