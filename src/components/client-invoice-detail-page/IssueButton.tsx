// import React, { useState } from "react";
// import { ArrowUp, Mail } from "lucide-react";
// import { usePDF } from "@react-pdf/renderer";
// import { useQueryClient } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import ClientInvoiceDocument from "./ClientInvoiceDocument";
// import {
//   AlertDialog,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import usePatchClientInvoiceIssueMutation from "@/mutations/usePatchClientInvoiceIssueMutation";
// import { getClientInvoiceQueryKey } from "@/queries/useClientInvoiceQuery";
// import { useToast } from "@/components/ui/use-toast";
// import {
//   InvoiceResponseDto,
//   OrganizationResponseDto,
//   ServicePaginatedResponseDto,
// } from "@/api/api-spec";
// import LoadingButton from "@/components/LoadingButton";

// interface Props {
//   clientInvoice: InvoiceResponseDto;
//   organization: OrganizationResponseDto;
//   services: ServicePaginatedResponseDto;
// }

// export default function IssueButton({
//   clientInvoice,
//   organization,
//   services,
// }: Props) {
//   const [open, setOpen] = useState(false);
//   const [instance] = usePDF({
//     document: (
//       <ClientInvoiceDocument
//         clientInvoice={clientInvoice}
//         organization={organization}
//         services={services}
//       />
//     ),
//   });
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const {
//     mutateAsync: patchClientInvoiceIssueMutateAsync,
//     isPending: isPatchClientInvoiceIssueMutationPending,
//   } = usePatchClientInvoiceIssueMutation(clientInvoice.id);

//   if (clientInvoice.status === "Paid") {
//     return;
//   }

//   return (
//     <>
//       <Button
//         onClick={() => {
//           setOpen(true);
//         }}
//         variant={"outline"}
//         size={"sm"}
//         className="h-[28px] text-xs px-2"
//       >
//         {clientInvoice.status === "Unissued" ? (
//           <ArrowUp className="mr-2 h-4 w-4" />
//         ) : (
//           <Mail className="mr-2 h-4 w-4" />
//         )}
//         {clientInvoice.status === "Unissued" ? "Issue" : "Remind"}
//       </Button>
//       <AlertDialog open={open} onOpenChange={setOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <LoadingButton
//               isLoading={isPatchClientInvoiceIssueMutationPending}
//               onClick={() => {
//                 const { blob } = instance;
//                 if (blob == null) {
//                   return;
//                 }

//                 const reader = new FileReader();
//                 reader.readAsArrayBuffer(blob);
//                 reader.onloadend = () => {
//                   const arrayBuffer = reader.result;
//                   if (arrayBuffer == null || typeof arrayBuffer === "string") {
//                     return;
//                   }

//                   const blob = new Blob([arrayBuffer]);
//                   const file = new File([blob], "invoice");

//                   patchClientInvoiceIssueMutateAsync({
//                     attachments: [file],
//                   })
//                     .then(() => {
//                       queryClient.invalidateQueries({
//                         queryKey: getClientInvoiceQueryKey(clientInvoice.id),
//                       });
//                       toast({
//                         title: "Success",
//                       });
//                       setOpen(false);
//                     })
//                     .catch((error: AxiosError<ErrorResponseData>) => {
//                       if (
//                         error.response &&
//                         error.response.data.errorCode.filter(
//                           (value) => value != null
//                         ).length !== 0
//                       ) {
//                         toast({
//                           title: error.response.data.message,
//                           variant: "destructive",
//                         });
//                         return;
//                       }
//                     });
//                 };
//               }}
//             >
//               Continue
//             </LoadingButton>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }

export {}; // TODO
