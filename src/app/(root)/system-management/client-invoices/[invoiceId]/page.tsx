// "use client";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { addDays, format } from "date-fns";
// import { ArrowDownToLine, CalendarIcon } from "lucide-react";
// import { useEffect, useMemo } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { usePDF } from "@react-pdf/renderer";
// import { useRouter } from "next/navigation";
// import PaymentDialog from "./PaymentDialog";
// import InvoiceDocument from "./InvoiceDocument";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import RowItemsContainer from "@/components/RowItemsContainer";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   TermsEnum,
//   invoiceStatuses,
//   transformNullishStringIntoString,
//   transformStringIntoNullableString,
// } from "@/lib/constants";
// import PageHeader from "@/components/PageHeader";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import { Calendar } from "@/components/ui/calendar";
// import Item from "@/components/Item";
// import { Label } from "@/components/ui/label";
// import BaseTable from "@/components/table/BaseTable";
// import {
//   getLineItemTableExportDataFromLineItem,
//   lineItemColumns,
// } from "@/columns/job";
// import { Textarea } from "@/components/ui/textarea";
// import LoadingButton from "@/components/LoadingButton";
// import useInvoiceQuery from "@/queries/useInvoiceQuery";
// import { InvoiceResponseDto } from "@/api";
// import PageLoading from "@/components/PageLoading";
// import usePatchInvoiceMutation from "@/queries/usePatchInvoiceMutation";
// import { paymentForInvoiceColumns } from "@/columns/payment";
// import CommonAlertDialogContent from "@/components/CommonAlertDialogContent";
// import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
// import usePatchInvoiceIssueMutation from "@/queries/usePatchInvoiceIssueMutation";

// import useOrganizationQuery from "@/queries/useOrganizationQuery";
// import { AffixInput } from "@/components/AffixInput";
// import { useToast } from "@/components/ui/use-toast";

// const formSchema = z.object({
//   organization: z
//     .string()
//     .trim()
//     .min(1, { message: "Organization is required" }),
//   invoiceDate: z.date({
//     required_error: "A date of birth is required.",
//   }),
//   terms: TermsEnum,
//   servicePeriodMonth: z
//     .string()
//     .datetime({ message: "Service Period Month is required" }),
//   notesToClient: z.string().trim(),
// });

// type FieldValues = z.infer<typeof formSchema>;

// function getFieldValues(invoice?: InvoiceResponseDto): FieldValues {
//   const currentDate = new Date();

//   return {
//     organization: invoice?.clientOrganization.name ?? "",
//     invoiceDate: invoice?.invoiceDate
//       ? new Date(invoice.invoiceDate)
//       : currentDate,
//     terms: invoice?.terms
//       ? (String(invoice.terms) as z.infer<typeof TermsEnum>)
//       : "30",
//     servicePeriodMonth: invoice?.servicePeriodDate ?? currentDate.toISOString(),
//     notesToClient: transformNullishStringIntoString.parse(
//       invoice?.notesToClient
//     ),
//   };
// }

// interface Props {
//   params: {
//     invoiceId: string;
//   };
// }

// export default function Page({ params: { invoiceId } }: Props) {
//   const { toast } = useToast();
//   const router = useRouter();

//   /**
//    * Form
//    */
//   const form = useForm<FieldValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: getFieldValues(),
//   });
//   const watchInvoiceDate = form.watch("invoiceDate");
//   const watchTerms = form.watch("terms");

//   /**
//    * Query
//    */
//   const { data: invoice, isLoading: isInvoiceQueryLoading } = useInvoiceQuery({
//     invoiceId,
//   });
//   const { data: organization } = useOrganizationQuery({
//     organizationId: invoice?.clientOrganization.id ?? "",
//   });
//   const { mutateAsync: patchInvoiceMutateAsync } =
//     usePatchInvoiceMutation(invoiceId);
//   const {
//     mutateAsync: patchInvoiceIssueMutateAsync,
//     isLoading: isPatchInvoiceIssueMutationLoading,
//   } = usePatchInvoiceIssueMutation(invoiceId);
//   const queryClient = useQueryClient();
//   const [instance, updateInstance] = usePDF({});

//   /**
//    * useEffect
//    */
//   useEffect(() => {
//     if (invoice) {
//       form.reset(getFieldValues(invoice));
//     }
//   }, [form, invoice, updateInstance]);

//   useEffect(() => {
//     if (invoice && organization) {
//       updateInstance(
//         <InvoiceDocument invoice={invoice} organization={organization} />
//       );
//     }
//   }, [invoice, organization, updateInstance]);

//   async function onSubmit(values: FieldValues) {
//     await patchInvoiceMutateAsync({
//       invoiceDate: values.invoiceDate.toISOString(),
//       notesToClient: transformStringIntoNullableString.parse(
//         values.notesToClient
//       ),
//       terms: Number(values.terms) as 21 | 30,
//     })
//       .then(() => {
//         queryClient.invalidateQueries({
//           queryKey: ["invoices", "detail", { invoiceId }],
//         });
//       })
//       .catch(() => {});
//   }

//   /**
//    * Table
//    */
//   const lineItemTableExportData = useMemo(
//     () => getLineItemTableExportDataFromLineItem(invoice?.lineItems),
//     [invoice?.lineItems]
//   );

//   if (isInvoiceQueryLoading || invoice == null) {
//     return <PageLoading />;
//   }

//   const status = invoiceStatuses.find(
//     (value) => value.value === invoice?.status
//   );

//   return (
//     <div className="flex flex-col gap-4">
//       <PageHeader
//         items={[
//           { href: "/system-management/client-invoices", name: "Client Invoices" },
//           {
//             href: `/system-management/client-invoices/${invoice?.id}`,
//             name: invoice.invoiceName,
//           },
//         ]}
//         action={
//           <Button
//             size={"sm"}
//             disabled={
//               instance.loading || instance.error != null || instance.url == null
//             }
//             variant={"outline"}
//           >
//             <a
//               className="flex items-center"
//               href={instance.url!}
//               download={"test.pdf"}
//             >
//               <ArrowDownToLine className="mr-2 h-4 w-4" />
//               <span>Download PDF</span>
//             </a>
//           </Button>
//         }
//       />
//       <div className="space-y-6">
//         <section>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <RowItemsContainer>
//                 <FormField
//                   control={form.control}
//                   name="organization"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel required>Organization</FormLabel>
//                       <FormControl>
//                         <Input value={field.value} readOnly />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="servicePeriodMonth"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel required>Service Period Month</FormLabel>
//                       <FormControl>
//                         <Input
//                           value={format(
//                             new Date(field.value.slice(0, 7)),
//                             "MMM yyyy"
//                           )}
//                           readOnly
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </RowItemsContainer>
//               <RowItemsContainer>
//                 <FormField
//                   control={form.control}
//                   name="invoiceDate"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-col">
//                       <FormLabel required>Invoice Date</FormLabel>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <FormControl>
//                             <Button
//                               variant={"outline"}
//                               className={cn(
//                                 "pl-3 text-left font-normal",
//                                 !field.value && "text-muted-foreground"
//                               )}
//                             >
//                               {field.value ? (
//                                 format(field.value, "MM-dd-yyyy")
//                               ) : (
//                                 <span>Pick a date</span>
//                               )}
//                               <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                             </Button>
//                           </FormControl>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0" align="start">
//                           <Calendar
//                             mode="single"
//                             selected={field.value}
//                             onSelect={(day) => {
//                               if (day == null) {
//                                 return;
//                               }

//                               field.onChange(day);
//                             }}
//                             initialFocus
//                           />
//                         </PopoverContent>
//                       </Popover>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="terms"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel required>Terms</FormLabel>
//                       <FormControl>
//                         <Select
//                           value={field.value}
//                           onValueChange={field.onChange}
//                         >
//                           <SelectTrigger ref={field.ref}>
//                             <SelectValue placeholder="Select a property type" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectGroup>
//                               {TermsEnum.options.map((option) => (
//                                 <SelectItem key={option} value={option}>
//                                   {option}
//                                 </SelectItem>
//                               ))}
//                             </SelectGroup>
//                           </SelectContent>
//                         </Select>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <Item>
//                   <Label>Due Date</Label>
//                   <Input
//                     value={format(
//                       addDays(watchInvoiceDate, Number(watchTerms)),
//                       "MM-dd-yyyy"
//                     )}
//                     readOnly
//                   />
//                 </Item>
//               </RowItemsContainer>
//               <FormField
//                 control={form.control}
//                 name="notesToClient"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Notes to Client</FormLabel>
//                     <FormControl>
//                       <Textarea {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <LoadingButton
//                 type="submit"
//                 isLoading={form.formState.isSubmitting}
//                 className="w-full"
//                 disabled={!form.formState.isDirty}
//               >
//                 Edit
//               </LoadingButton>
//             </form>
//           </Form>
//         </section>
//         <section>
//           <h4 className="h4 mb-2">Status</h4>
//           <div className="flex flex-col gap-2">
//             <div className="flex h-10 px-3 py-2 rounded-md text-sm border border-input bg-background">
//               {status && (
//                 <div className="flex items-center flex-1 gap-2">
//                   <status.Icon className={`w-4 h-4 ${status.color}`} />
//                   <span>{status.value}</span>
//                 </div>
//               )}
//             </div>
//             <AlertDialog>
//               <AlertDialogTrigger asChild>
//                 <LoadingButton
//                   variant={"outline"}
//                   disabled={invoice?.status !== "Unissued"}
//                   isLoading={isPatchInvoiceIssueMutationLoading}
//                 >
//                   Issue
//                 </LoadingButton>
//               </AlertDialogTrigger>
//               <CommonAlertDialogContent
//                 onContinue={() => {
//                   const { blob } = instance;

//                   if (blob == null) {
//                     return;
//                   }

//                   const reader = new FileReader();
//                   reader.readAsDataURL(blob);
//                   reader.onloadend = () => {
//                     const base64 = reader.result;
//                     if (base64 == null || typeof base64 !== "string") {
//                       return;
//                     }

//                     patchInvoiceIssueMutateAsync({
//                       attachments: [
//                         {
//                           path: base64,
//                         },
//                       ],
//                     })
//                       .then(() => {
//                         queryClient.invalidateQueries({
//                           queryKey: ["invoices", "detail", { invoiceId }],
//                         });
//                         toast({
//                           title: "Success",
//                         });
//                       })
//                       .catch(() => {});
//                   };
//                 }}
//               />
//             </AlertDialog>
//           </div>
//         </section>
//         {invoice?.status !== "Unissued" && (
//           <section>
//             <h4 className="h4 mb-2">Payments</h4>
//             <div className="flex flex-col gap-2">
//               <Item>
//                 <Label>Total</Label>
//                 <AffixInput
//                   prefixElement={
//                     <span className="text-muted-foreground">$</span>
//                   }
//                   value={invoice?.totalOfPayment}
//                   readOnly
//                 />
//               </Item>
//               <BaseTable
//                 columns={paymentForInvoiceColumns}
//                 data={invoice?.payments ?? []}
//                 getRowId={({ id }) => id}
//               />
//               <PaymentDialog invoiceId={invoiceId} />
//             </div>
//           </section>
//         )}
//         <section>
//           <h4 className="h4 mb-2">Jobs</h4>
//           <div className="flex flex-col gap-2">
//             <RowItemsContainer>
//               <Item>
//                 <Label>Subtotal</Label>
//                 <AffixInput
//                   prefixElement={
//                     <span className="text-muted-foreground">$</span>
//                   }
//                   value={invoice?.subtotal ?? ""}
//                   readOnly
//                 />
//               </Item>
//               <Item>
//                 <Label>Discount</Label>
//                 <AffixInput
//                   prefixElement={
//                     <span className="text-muted-foreground">$</span>
//                   }
//                   value={invoice?.discount ?? ""}
//                   readOnly
//                 />
//               </Item>
//               <Item>
//                 <Label>Total</Label>
//                 <AffixInput
//                   prefixElement={
//                     <span className="text-muted-foreground">$</span>
//                   }
//                   value={invoice?.total ?? ""}
//                   readOnly
//                 />
//               </Item>
//             </RowItemsContainer>
//             <BaseTable
//               columns={lineItemColumns}
//               data={invoice?.lineItems ?? []}
//               getRowId={({ jobId }) => jobId}
//               exportData={lineItemTableExportData ?? []}
//               exportFileName={invoice?.invoiceName ?? "Jobs on Invoice"}
//               onRowClick={(id) => {
//                 router.push(`/system-management/jobs/${id}`);
//               }}
//             />
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

import React from "react";

export default function Page() {
  return <div>Page</div>;
}
