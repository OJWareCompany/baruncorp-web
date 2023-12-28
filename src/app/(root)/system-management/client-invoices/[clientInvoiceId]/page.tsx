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

// interface Props {
//   params: {
//     invoiceId: string;
//   };
// }

// export default function Page({ params: { invoiceId } }: Props) {
//   const { toast } = useToast();
//   const router = useRouter();

//   /**
//    * Table
//    */
//   const lineItemTableExportData = useMemo(
//     () => getLineItemTableExportDataFromLineItem(invoice?.lineItems),
//     [invoice?.lineItems]
//   );

//   return (
//     <div className="flex flex-col gap-4">
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
"use client";
import { format } from "date-fns";
import React from "react";
import ClientInvoiceForm from "./ClientInvoiceForm";
import ClientInvoiceStatus from "./ClientInvoiceStatus";
import JobsTable from "./JobsTable";
import PageHeaderAction from "./PageHeaderAction";
import DownloadCSVButton from "./DownloadCSVButton";
import PaymentsTable from "./PaymentsTable";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import useClientInvoiceQuery from "@/queries/useClientInvoiceQuery";
import useNotFound from "@/hook/useNotFound";
import PageLoading from "@/components/PageLoading";
import PageHeader from "@/components/PageHeader";

interface Props {
  params: {
    clientInvoiceId: string;
  };
}

export default function Page({ params: { clientInvoiceId } }: Props) {
  const {
    data: clientInvoice,
    isLoading: isClientInvoiceQueryLoading,
    error: clientInvoiceQueryError,
  } = useClientInvoiceQuery(clientInvoiceId);
  const {
    data: organization,
    isLoading: isOrganizationQueryLoading,
    error: organizationQueryError,
  } = useOrganizationQuery(clientInvoice?.clientOrganization.id ?? "");
  useNotFound(clientInvoiceQueryError);
  useNotFound(organizationQueryError);

  if (
    isClientInvoiceQueryLoading ||
    clientInvoice == null ||
    isOrganizationQueryLoading ||
    organization == null
  ) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          {
            href: "/system-management/client-invoices",
            name: "Client Invoices",
          },
          {
            href: `/system-management/client-invoices/${clientInvoiceId}}`,
            name: `${clientInvoice.clientOrganization.name}, ${format(
              new Date(clientInvoice.servicePeriodDate.slice(0, 7)),
              "MMM yyyy"
            )}`,
          },
        ]}
        action={
          <PageHeaderAction
            clientInvoice={clientInvoice}
            organization={organization}
          />
        }
      />
      <div className="space-y-6">
        <section>
          <ClientInvoiceForm clientInvoice={clientInvoice} />
        </section>
        <section className="space-y-2">
          <h2 className="h4">Status</h2>
          <ClientInvoiceStatus
            organization={organization}
            clientInvoice={clientInvoice}
          />
        </section>
        {clientInvoice.status !== "Unissued" && (
          <section>
            <h4 className="h4 mb-2">Payments</h4>
            <PaymentsTable clientInvoice={clientInvoice} />
          </section>
        )}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="h4">Jobs</h2>
            <DownloadCSVButton clientInvoice={clientInvoice} />
          </div>
          <JobsTable clientInvoice={clientInvoice} />
        </section>
      </div>
    </div>
  );
}
