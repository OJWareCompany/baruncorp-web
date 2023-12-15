// import { useQueryClient } from "@tanstack/react-query";
// import { CellContext, createColumnHelper } from "@tanstack/react-table";
// import { useEffect, useMemo } from "react";
// import {
//   Check,
//   ChevronDown,
//   ChevronsDown,
//   CornerDownRight,
//   Pencil,
// } from "lucide-react";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { AxiosError } from "axios";
// import {
//   AssignedTaskResponseFields,
//   OrderedServiceResponseFields,
// } from "@/api";
// import AssigneeCombobox from "@/components/combobox/AssigneeCombobox";
// import usePatchAssignedTaskMutation from "@/queries/usePatchAssignedTaskMutation";
// import {
//   SizeForRevisionEnum,
//   SizeForRevisionEnumWithEmptyString,
//   orderedServiceStatuses,
//   statuses,
//   transformNullishSizeForRevisionEnumIntoSizeForRevisionEnumWithEmptyString,
//   transformSizeForRevisionEnumWithEmptyStringIntoNullableSizeForRevisionEnum,
// } from "@/lib/constants";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import usePatchAssignedTaskCompleteMutation from "@/queries/usePatchAssignedTaskCompleteMutation";

// import usePatchOrderedServiceCancelMutation from "@/queries/usePatchOrderedServiceCancelMutation";
// import usePatchOrderedServiceReactivateMutation from "@/queries/usePatchOrderedServiceReactivateMutation";
// import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
// import CommonAlertDialogContent from "@/components/CommonAlertDialogContent";
// import ExpandableTable from "@/components/table/ExpandableTable";
// import { AffixInput } from "@/components/AffixInput";
// import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
// import usePatchOrderedServiceMutation from "@/queries/usePatchOrderedServiceMutation";
// import { useToast } from "@/components/ui/use-toast";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";

// interface RowData {
//   id: string;
//   name: string;
//   description: string | null;
//   status: string;
//   price: number | null;
//   priceOverride: number | null;
//   sizeForRevision: "Major" | "Minor" | null;
//   isRevision: boolean;
//   assigneeId: string | null;
//   serviceId: string | null;
//   subRows?: RowData[];
// }

// const columnHelper = createColumnHelper<RowData>();

// interface Props {
//   projectId: string;
//   jobId: string;
//   assignedTasks: AssignedTaskResponseFields[];
//   orderedServices: OrderedServiceResponseFields[];
// }

// export default function OrderedServicesTable({
//   orderedServices,
//   assignedTasks,
//   jobId,
//   projectId,
// }: Props) {
//   const data = useMemo(
//     () =>
//       orderedServices.map<RowData>((value) => {
//         const {
//           status,
//           description,
//           serviceName,
//           price,
//           orderedServiceId,
//           serviceId,
//           priceOverride,
//           sizeForRevision,
//           isRevision,
//         } = value;

//         return {
//           description,
//           id: orderedServiceId,
//           name: serviceName,
//           price,
//           priceOverride,
//           sizeForRevision,
//           isRevision,
//           status,
//           assigneeId: null,
//           serviceId,
//           subRows: assignedTasks
//             .filter((value) => value.orderedServiceId === orderedServiceId)
//             .map((value) => ({
//               assigneeId: value.assigneeId,
//               description: value.description,
//               id: value.assignTaskId,
//               name: value.taskName,
//               price: null,
//               priceOverride: null,
//               sizeForRevision: null,
//               status: value.status,
//               serviceId: null,
//               isRevision,
//             })),
//         };
//       }),
//     [assignedTasks, orderedServices]
//   );

//   const columns = useMemo(
//     () => [
//       columnHelper.display({
//         id: "expand",
//         header: ({ table }) => {
//           return (
//             <Button
//               variant={"ghost"}
//               size={"icon"}
//               className="w-9 h-9 [&[data-expand=open]>svg]:rotate-180"
//               onClick={table.getToggleAllRowsExpandedHandler()}
//               data-expand={table.getIsAllRowsExpanded() ? "open" : "closed"}
//             >
//               <ChevronsDown className="w-4 h-4 transition-transform duration-200" />
//             </Button>
//           );
//         },
//         size: 68,
//         cell: ({ row }) => {
//           if (row.depth > 0) {
//             return;
//           }

//           return (
//             <Button
//               variant={"ghost"}
//               size={"icon"}
//               className="w-9 h-9 [&[data-expand=open]>svg]:rotate-180"
//               onClick={row.getToggleExpandedHandler()}
//               data-expand={row.getIsExpanded() ? "open" : "closed"}
//             >
//               <ChevronDown className="w-4 h-4 transition-transform duration-200" />
//             </Button>
//           );
//         },
//       }),
//       columnHelper.accessor("isRevision", {
//         header: "Revision",
//         size: 110,
//         cell: ({ row, getValue }) => {
//           const isRevision = getValue();

//           if (row.depth > 0 || !isRevision) {
//             return <p className="text-muted-foreground">-</p>;
//           }

//           return <Badge>Revision</Badge>;
//         },
//       }),
//       columnHelper.accessor("name", {
//         header: "Name",
//         size: 400,
//         cell: ({ getValue, row, column }) => {
//           const value = getValue();

//           if (row.depth === 0) {
//             return (
//               <p
//                 style={{ width: column.getSize() - 32 }}
//                 className={`whitespace-nowrap overflow-hidden text-ellipsis`}
//               >
//                 {value}
//               </p>
//             );
//           }

//           let name = value;
//           if (
//             row.original.description != null &&
//             row.original.description !== ""
//           ) {
//             name = row.original.description;
//           }

//           return (
//             <div className="flex gap-4 items-center">
//               <CornerDownRight className="h-4 w-4 text-muted-foreground" />
//               <p>{name}</p>
//             </div>
//           );
//         },
//       }),
//       columnHelper.accessor("sizeForRevision", {
//         header: "Major / Minor",
//         size: 200,
//         cell: (cellContext) => {
//           const { row } = cellContext;

//           if (row.depth > 0 || !row.original.isRevision) {
//             return <p className="text-muted-foreground">-</p>;
//           }

//           return <SizeForRevision cellContext={cellContext} jobId={jobId} />;
//         },
//       }),
//       columnHelper.accessor("price", {
//         header: "Price",
//         size: 200,
//         cell: (cellContext) => {
//           const { row } = cellContext;

//           if (row.depth > 0) {
//             return <p className="text-muted-foreground">-</p>;
//           }

//           return <Price cellContext={cellContext} jobId={jobId} />;
//         },
//       }),
//       columnHelper.accessor("status", {
//         header: "Status",
//         size: 200,
//         cell: ({ getValue, row }) => {
//           const value = getValue();
//           if (row.depth === 0) {
//             const status = orderedServiceStatuses.find(
//               (status) => status.value === value
//             );
//             if (status == null) {
//               return null;
//             }

//             return (
//               <div className="flex items-center">
//                 <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
//                 <span>{status.value}</span>
//               </div>
//             );
//           }

//           const status = statuses.find((status) => status.value === value);
//           if (status == null) {
//             return null;
//           }

//           return (
//             <div className="flex items-center">
//               <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
//               <span>{status.value}</span>
//             </div>
//           );
//         },
//       }),
//       columnHelper.accessor("assigneeId", {
//         header: "Action",
//         size: 300,
//         cell: (cellContext) => {
//           if (cellContext.row.depth === 0) {
//             return (
//               <Action
//                 cellContext={cellContext}
//                 projectId={projectId}
//                 jobId={jobId}
//               />
//             );
//           }

//           return (
//             <Assignee
//               cellContext={cellContext}
//               projectId={projectId}
//               jobId={jobId}
//             />
//           );
//         },
//       }),
//     ],
//     [jobId, projectId]
//   );

//   return <ExpandableTable columns={columns} data={data ?? []} />;
// }

// interface AssigneeProps {
//   cellContext: CellContext<RowData, string | null>;
//   jobId: string;
//   projectId: string;
// }

// function Assignee({
//   cellContext: { getValue, row, column },
//   jobId,
//   projectId,
// }: AssigneeProps) {
//   const assigneeId = getValue();

//   /**
//    * Query
//    */
//   const { mutateAsync: patchAssignedTaskMutateAsync } =
//     usePatchAssignedTaskMutation(row.original.id);
//   const { mutateAsync: patchAssignedTaskCompleteMutateAsync } =
//     usePatchAssignedTaskCompleteMutation(row.original.id);
//   const queryClient = useQueryClient();

//   const isInProgress = row.original.status === "In Progress";
//   const isCompleted = row.original.status === "Completed";
//   const isCanceled = row.original.status === "Canceled";
//   const isOnHold = row.original.status === "On Hold";

//   return (
//     <div
//       style={{ width: column.getSize() - 32 }}
//       className={cn("flex gap-2 w-full")}
//     >
//       <AssigneeCombobox
//         userId={assigneeId ?? ""}
//         onSelect={(newUserId) => {
//           patchAssignedTaskMutateAsync({
//             assigneeId: newUserId,
//           })
//             .then(() => {
//               queryClient.invalidateQueries({
//                 queryKey: ["jobs", "detail", { jobId }],
//               });
//               queryClient.invalidateQueries({
//                 queryKey: ["projects", "detail", { projectId }],
//               });
//             })
//             .catch(() => {});
//         }}
//         buttonClassName="flex-1 overflow-hidden"
//         buttonSize={"sm"}
//         disabled={isCompleted || isOnHold || isCanceled}
//       />
//       {isInProgress && (
//         <Button
//           size={"icon"}
//           variant={"outline"}
//           className="w-9 h-9 flex-shrink-0"
//           onClick={() => {
//             patchAssignedTaskCompleteMutateAsync()
//               .then(() => {
//                 queryClient.invalidateQueries({
//                   queryKey: ["jobs", "detail", { jobId }],
//                 });
//                 queryClient.invalidateQueries({
//                   queryKey: ["projects", "detail", { projectId }],
//                 });
//               })
//               .catch(() => {});
//           }}
//         >
//           <Check className="w-4 h-4 text-green-700" />
//         </Button>
//       )}
//     </div>
//   );
// }

// interface ActionProps {
//   cellContext: CellContext<RowData, string | null>;
//   jobId: string;
//   projectId: string;
// }

// function Action({
//   cellContext: { row, column },
//   jobId,
//   projectId,
// }: ActionProps) {
//   const isCanceled = row.original.status === "Canceled";
//   const isCompleted = row.original.status === "Completed";

//   /**
//    * Query
//    */
//   const { mutateAsync: patchOrderedServiceCancelMutateAsync } =
//     usePatchOrderedServiceCancelMutation(row.original.id);
//   const { mutateAsync: patchOrderedServiceReactivateMutateAsync } =
//     usePatchOrderedServiceReactivateMutation(row.original.id);
//   const queryClient = useQueryClient();

//   if (!isCanceled) {
//     return (
//       <AlertDialog>
//         <AlertDialogTrigger asChild>
//           <Button
//             size={"sm"}
//             variant={"outline"}
//             className="text-destructive hover:text-destructive"
//             disabled={isCompleted}
//             style={{ width: column.getSize() - 32 }}
//           >
//             Cancel
//           </Button>
//         </AlertDialogTrigger>
//         <CommonAlertDialogContent
//           onContinue={() => {
//             patchOrderedServiceCancelMutateAsync()
//               .then(() => {
//                 queryClient.invalidateQueries({
//                   queryKey: ["jobs", "detail", { jobId }],
//                 });
//                 queryClient.invalidateQueries({
//                   queryKey: ["projects", "detail", { projectId }],
//                 });
//               })
//               .catch(() => {});
//           }}
//         />
//       </AlertDialog>
//     );
//   }

//   return (
//     <AlertDialog>
//       <AlertDialogTrigger asChild>
//         <Button
//           size={"sm"}
//           variant={"outline"}
//           style={{ width: column.getSize() - 32 }}
//         >
//           Reactivate
//         </Button>
//       </AlertDialogTrigger>
//       <CommonAlertDialogContent
//         onContinue={() => {
//           patchOrderedServiceReactivateMutateAsync()
//             .then(() => {
//               queryClient.invalidateQueries({
//                 queryKey: ["jobs", "detail", { jobId }],
//               });
//               queryClient.invalidateQueries({
//                 queryKey: ["projects", "detail", { projectId }],
//               });
//             })
//             .catch(() => {});
//         }}
//       />
//     </AlertDialog>
//   );
// }

// interface PriceProps {
//   cellContext: CellContext<RowData, number | null>;
//   jobId: string;
// }

// const priceFormSchema = z.object({
//   price: z.string().trim(),
// });

// type PriceFormFieldValues = z.infer<typeof priceFormSchema>;

// function Price({ cellContext: { column, getValue, row }, jobId }: PriceProps) {
//   const price = getValue();
//   const { priceOverride } = row.original;
//   const { toast } = useToast();

//   /**
//    * Form
//    */
//   const form = useForm<PriceFormFieldValues>({
//     resolver: zodResolver(priceFormSchema),
//     defaultValues: {
//       price:
//         priceOverride != null
//           ? String(priceOverride)
//           : price == null
//           ? "0"
//           : String(price),
//     },
//   });

//   /**
//    * Query
//    */
//   const { mutateAsync } = usePatchOrderedServiceMutation(row.original.id);
//   const queryClient = useQueryClient();

//   useEffect(() => {
//     form.reset({
//       price:
//         priceOverride != null
//           ? String(priceOverride)
//           : price == null
//           ? "0"
//           : String(price),
//     });
//   }, [form, price, priceOverride]);

//   async function onSubmit(values: PriceFormFieldValues) {
//     const { price } = values;
//     if (price.length === 0) {
//       toast({
//         title: "Price is required",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/.test(price)) {
//       toast({
//         title: "Price should be a number",
//         variant: "destructive",
//       });
//       return;
//     }

//     await mutateAsync({
//       description: row.original.description,
//       priceOverride: Number(price),
//       sizeForRevision: row.original.sizeForRevision,
//     })
//       .then(() => {
//         queryClient.invalidateQueries({
//           queryKey: ["jobs", "detail", { jobId }],
//         });
//         toast({
//           title: "Success",
//         });
//       })
//       .catch((error: AxiosError<ErrorResponseData>) => {
//         switch (error.response?.status) {
//           case 400:
//             if (error.response?.data.errorCode.includes("40002")) {
//               toast({
//                 title: "Job can not be updated after invoice is issued",
//                 variant: "destructive",
//               });
//             } else {
//               toast({
//                 title: "Price is invalid",
//                 variant: "destructive",
//               });
//             }
//             break;
//         }
//       });
//   }

//   return (
//     <Form {...form}>
//       <form
//         style={{ width: column.getSize() - 32 }}
//         className="flex gap-2"
//         onSubmit={form.handleSubmit(onSubmit)}
//       >
//         <FormField
//           control={form.control}
//           name="price"
//           render={({ field }) => (
//             <FormItem className="flex-row">
//               <FormControl>
//                 <AffixInput
//                   prefixElement={
//                     <span className="text-muted-foreground">$</span>
//                   }
//                   {...field}
//                   className="h-9"
//                 />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <Button
//           size={"icon"}
//           variant={"outline"}
//           className="w-9 h-9 flex-shrink-0"
//           type="submit"
//           disabled={!form.formState.isDirty}
//         >
//           <Pencil className="w-4 h-4" />
//         </Button>
//       </form>
//     </Form>
//   );
// }

// const sizeForRevisionFormSchema = z.object({
//   sizeForRevision: SizeForRevisionEnumWithEmptyString,
// });

// type SizeForRevisionFormFieldValues = z.infer<typeof sizeForRevisionFormSchema>;

// interface SizeForRevisionProps {
//   cellContext: CellContext<RowData, "Major" | "Minor" | null>;
//   jobId: string;
// }

// function SizeForRevision({ cellContext, jobId }: SizeForRevisionProps) {
//   const { getValue, row, column } = cellContext;
//   const sizeForRevision = getValue();
//   const { toast } = useToast();

//   /**
//    * Form
//    */
//   const form = useForm<SizeForRevisionFormFieldValues>({
//     resolver: zodResolver(sizeForRevisionFormSchema),
//     defaultValues: {
//       sizeForRevision: "",
//     },
//   });

//   /**
//    * Query
//    */
//   const { mutateAsync } = usePatchOrderedServiceMutation(row.original.id);
//   const queryClient = useQueryClient();

//   useEffect(() => {
//     form.reset({
//       sizeForRevision:
//         transformNullishSizeForRevisionEnumIntoSizeForRevisionEnumWithEmptyString.parse(
//           sizeForRevision
//         ),
//     });
//   }, [form, sizeForRevision]);

//   async function onSubmit(values: SizeForRevisionFormFieldValues) {
//     await mutateAsync({
//       description: row.original.description,
//       priceOverride:
//         row.original.priceOverride != null
//           ? Number(row.original.priceOverride)
//           : row.original.price != null
//           ? Number(row.original.price)
//           : 0,
//       sizeForRevision:
//         transformSizeForRevisionEnumWithEmptyStringIntoNullableSizeForRevisionEnum.parse(
//           values.sizeForRevision
//         ),
//     })
//       .then(() => {
//         queryClient.invalidateQueries({
//           queryKey: ["jobs", "detail", { jobId }],
//         });
//         toast({
//           title: "Success",
//         });
//       })
//       .catch((error: AxiosError<ErrorResponseData>) => {
//         switch (error.response?.status) {
//           case 400:
//             if (error.response?.data.errorCode.includes("40002")) {
//               toast({
//                 title: "Job can not be updated after invoice is issued",
//                 variant: "destructive",
//               });
//             }
//             break;
//         }
//       });
//   }

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         style={{ width: column.getSize() - 32 }}
//         className="flex gap-2"
//       >
//         <FormField
//           control={form.control}
//           name="sizeForRevision"
//           render={({ field }) => (
//             <FormItem className="flex-row flex-1">
//               <FormControl>
//                 <Select value={field.value} onValueChange={field.onChange}>
//                   <SelectTrigger ref={field.ref} className="h-9">
//                     <SelectValue placeholder="Select" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectGroup>
//                       {SizeForRevisionEnum.options.map((option) => (
//                         <SelectItem key={option} value={option}>
//                           {option}
//                         </SelectItem>
//                       ))}
//                     </SelectGroup>
//                   </SelectContent>
//                 </Select>
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <Button
//           size={"icon"}
//           variant={"outline"}
//           className="w-9 h-9 flex-shrink-0"
//           type="submit"
//           disabled={!form.formState.isDirty}
//         >
//           <Pencil className="w-4 h-4" />
//         </Button>
//       </form>
//     </Form>
//   );
// }

import React from "react";

export default function OrderedServicesTable() {
  return <div>OrderedServicesTable</div>;
}
