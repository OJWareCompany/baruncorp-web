"use client";
import { Plus } from "lucide-react";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";

import { TermsEnum } from "@/lib/constants";

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

type FieldValues = z.infer<typeof formSchema>;

export default function NewVendorInvoiceSheet() {
  // const { toast } = useToast();
  // const router = useRouter();

  // /**
  //  * State
  //  */
  // const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  // /**
  //  * Form
  //  */
  // const form = useForm<FieldValues>({
  //   resolver: zodResolver(formSchema),
  //   defaultValues: {
  //     organizationId: "",
  //     invoiceDate: new Date(),
  //     terms: "30",
  //     servicePeriodMonth: "",
  //     notesToClient: "",
  //   },
  // });
  // const watchInvoiceDate = form.watch("invoiceDate");
  // const watchOrganizationId = form.watch("organizationId");
  // const watchTerms = form.watch("terms");
  // const watchServicePeriodMonth = form.watch("servicePeriodMonth");

  // /**
  //  * Query
  //  */
  // const { data: jobsToInvoice } = useJobsToInvoiceQuery({
  //   organizationId: watchOrganizationId,
  //   servicePeriodMonth: watchServicePeriodMonth,
  // });
  // const { mutateAsync } = usePostInvoiceMutation();
  // const queryClient = useQueryClient();

  // /**
  //  * useEffect
  //  */
  // useEffect(() => {
  //   if (isSubmitSuccessful) {
  //     form.reset();
  //     setIsSubmitSuccessful(false);
  //   }
  // }, [form, isSubmitSuccessful]);

  // async function onSubmit(values: FieldValues) {
  //   await mutateAsync({
  //     clientOrganizationId: values.organizationId,
  //     invoiceDate: values.invoiceDate.toISOString(),
  //     notesToClient: transformStringIntoNullableString.parse(
  //       values.notesToClient
  //     ),
  //     serviceMonth: format(
  //       new Date(values.servicePeriodMonth.slice(0, 7)),
  //       "yyyy-MM"
  //     ),
  //     terms: Number(values.terms) as 21 | 30,
  //   })
  //     .then(() => {
  //       setIsSubmitSuccessful(true);
  //       toast({
  //         title: "Success",
  //       });
  //       queryClient.invalidateQueries({
  //         queryKey: ["organizations-to-invoice", "list"],
  //       });
  //     })
  //     .catch(() => {});
  // }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <Plus className="mr-2 h-4 w-4" />
          New Vendor Invoice
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New Vendor Invoice</SheetTitle>
        </SheetHeader>
        {/* <div className="space-y-6">
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
                  getRowId={({ jobId }) => jobId}
                  onRowClick={(id) => {
                    router.push(`/system-management/jobs/${id}`);
                  }}
                />
              </div>
            </section>
          )}
        </div> */}
      </SheetContent>
    </Sheet>
  );
}
