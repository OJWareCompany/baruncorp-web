"use client";
import { useEffect, useState } from "react";
import { CalendarIcon, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addDays, format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import TasksTable from "./TasksTable";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import RowItemsContainer from "@/components/RowItemsContainer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import VendorsToInvoiceCombobox from "@/components/combobox/VendorsToInvoiceCombobox";
import ServicePeriodMonthByVendorSelect from "@/components/combobox/ServicePeriodMonthByVendorSelect";
import { TermsEnum, transformStringIntoNullableString } from "@/lib/constants";
import {
  cn,
  formatInUTCAsYYYYMM,
  getISOStringForStartOfDayInUTC,
} from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LoadingButton from "@/components/LoadingButton";
import useJobsForVendorInvoiceQuery from "@/queries/useJobsForVendorInvoiceQuery";
import CollapsibleSection from "@/components/CollapsibleSection";
import usePostVendorInvoiceMutation from "@/mutations/usePostVendorInvoiceMutation";
import { getVendorsToInvoiceQueryKey } from "@/queries/useVendorsToInvoiceQuery";
import { getVendorInvoicesQueryKey } from "@/queries/useVendorInvoicesQuery";

const formSchema = z.object({
  vendorId: z.string().trim().min(1, { message: "Vendor is required" }),
  servicePeriodMonth: z
    .string()
    .datetime({ message: "Service Period Month is required" }),
  invoiceDate: z.date({
    required_error: "A date of birth is required.",
  }),
  terms: TermsEnum,
  notes: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

export default function NewVendorInvoiceSheet() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorId: "",
      servicePeriodMonth: "",
      invoiceDate: new Date(),
      terms: "30",
      notes: "",
    },
  });
  const watchVendorId = form.watch("vendorId");
  const watchInvoiceDate = form.watch("invoiceDate");
  const watchTerms = form.watch("terms");
  const watchServicePeriodMonth = form.watch("servicePeriodMonth");

  const { data: tasks } = useJobsForVendorInvoiceQuery(
    {
      clientOrganizationId: watchVendorId,
      serviceMonth:
        watchServicePeriodMonth !== ""
          ? formatInUTCAsYYYYMM(watchServicePeriodMonth)
          : "",
    },
    true
  );
  const usePostVendorInvoiceMutationResult = usePostVendorInvoiceMutation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (
      form.formState.isSubmitSuccessful &&
      usePostVendorInvoiceMutationResult.isSuccess
    ) {
      form.reset();
    }
  }, [
    form,
    form.formState.isSubmitSuccessful,
    usePostVendorInvoiceMutationResult.isSuccess,
  ]);

  async function onSubmit(values: FieldValues) {
    await usePostVendorInvoiceMutationResult
      .mutateAsync({
        organizationId: values.vendorId,
        note: transformStringIntoNullableString.parse(values.notes),
        terms: Number(values.terms) as 21 | 30 | 60,
        serviceMonth: formatInUTCAsYYYYMM(values.servicePeriodMonth),
        invoiceDate: getISOStringForStartOfDayInUTC(values.invoiceDate),
        invoiceNumber: "", // api-spec 상에는 필수값으로 되어있는데, 필요하지 않은 값이라고 함. 백엔드 쪽에서 빈 문자열로 보내달라고 요청함.
      })
      .then(() => {
        toast({
          title: "Success",
        });
        queryClient.invalidateQueries({
          queryKey: getVendorsToInvoiceQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: getVendorInvoicesQueryKey({}),
        });
        setOpen(false);
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className="text-white bg-slate-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Vendor Invoice
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New Vendor Invoice</SheetTitle>
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
                    name="vendorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Organization</FormLabel>
                        <FormControl>
                          <VendorsToInvoiceCombobox
                            vendorId={field.value}
                            onVendorIdChange={(vendorId) => {
                              field.onChange(vendorId);
                              form.setValue("servicePeriodMonth", "", {
                                shouldValidate: form.formState.isSubmitted,
                              });
                            }}
                            ref={field.ref}
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
                          <ServicePeriodMonthByVendorSelect
                            vendorId={watchVendorId}
                            servicePeriodMonth={field.value}
                            onServicePeriodMonthChange={field.onChange}
                            ref={field.ref}
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
          {watchVendorId !== "" && watchServicePeriodMonth !== "" && tasks && (
            <CollapsibleSection title="Tasks">
              <TasksTable tasks={tasks} />
            </CollapsibleSection>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
