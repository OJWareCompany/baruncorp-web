// import React from "react";
// import { useCallback, useEffect, useMemo } from "react";
// import { DefaultValues, useFieldArray, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useQueryClient } from "@tanstack/react-query";
// import { X } from "lucide-react";
// import { AxiosError } from "axios";
// import { Value } from "@udecode/plate-common";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { JobResponseDto, ProjectResponseDto } from "@/api/api-spec";
// import { Input } from "@/components/ui/input";
// import AddressSearchButton from "@/components/AddressSearchButton";
// import LoadingButton from "@/components/LoadingButton";
// import Minimap from "@/components/Minimap";
// import ItemsContainer from "@/components/ItemsContainer";
// import { Button } from "@/components/ui/button";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Checkbox } from "@/components/ui/checkbox";
// import { AffixInput } from "@/components/AffixInput";
// import usePatchJobMutation from "@/mutations/usePatchJobMutation";
// import UsersByOrganizationCombobox from "@/components/combobox/UsersByOrganizationCombobox";
// import {
//   ELECTRICAL_WET_STAMP_SERVICE_ID,
//   INITIAL_EDITOR_VALUE,
//   MountingTypeEnum,
//   STRUCTURAL_WET_STAMP_SERVICE_ID,
//   digitRegExp,
//   toTwoDecimalRegExp,
// } from "@/lib/constants";
// import useUserQuery from "@/queries/useUserQuery";
// import { getJobQueryKey } from "@/queries/useJobQuery";
// import { getProjectQueryKey } from "@/queries/useProjectQuery";
// import { useToast } from "@/components/ui/use-toast";
// import { getEditorValue, isEditorValueEmpty } from "@/lib/plate-utils";
// import BasicEditor from "@/components/editor/BasicEditor";
// import DateTimePicker from "@/components/date-time-picker/DateTimePicker";

// interface Props {
//   project: ProjectResponseDto;
//   job: JobResponseDto;
// }

// export default function JobForm({ project, job }: Props) {
//   const { toast } = useToast();
//   const hasWetStamp = useMemo(
//     () =>
//       job &&
//       job.orderedServices.findIndex(
//         (value) =>
//           value.serviceId === ELECTRICAL_WET_STAMP_SERVICE_ID ||
//           value.serviceId === STRUCTURAL_WET_STAMP_SERVICE_ID
//       ) !== -1,
//     [job]
//   );

//   const formSchema = useMemo(
//     () =>
//       z
//         .object({
//           clientUser: z.object({
//             id: z
//               .string()
//               .trim()
//               .min(1, { message: "Client User Id is required" }),
//             emailAddressesToReceiveDeliverables: z.array(
//               z.object({
//                 email: z
//                   .string()
//                   .trim()
//                   .min(1, { message: "Email Address is required" })
//                   .email({ message: "Format of Email Address is incorrect" }),
//               })
//             ),
//           }),
//           additionalInformation: z.custom<Value>(),
//           mountingType: MountingTypeEnum,
//           dueDate: z.date().nullable(),
//           isExpedited: z.boolean(),
//           systemSize: z.string().trim(),
//           numberOfWetStamp: z.string().trim(),
//           mailingAddress: z.object({
//             street1: z.string().trim(),
//             street2: z.string().trim(),
//             city: z.string().trim(),
//             state: z.string().trim(),
//             postalCode: z.string().trim(),
//             country: z.string().trim(),
//             fullAddress: z.string().trim(),
//             coordinates: z.array(z.number()),
//           }),
//         })
//         .superRefine((value, ctx) => {
//           if (!hasWetStamp) {
//             return;
//           }

//           const { numberOfWetStamp } = value;

//           if (numberOfWetStamp.length === 0) {
//             ctx.addIssue({
//               code: z.ZodIssueCode.custom,
//               message: "Number of Wet Stamp is required",
//               path: [`numberOfWetStamp`],
//             });
//             return;
//           }
//         })
//         .superRefine((value, ctx) => {
//           if (!hasWetStamp) {
//             return;
//           }

//           const { mailingAddress } = value;

//           if (mailingAddress.fullAddress.length === 0) {
//             ctx.addIssue({
//               code: z.ZodIssueCode.custom,
//               message: "Mailing Address is required",
//               path: [`mailingAddress`],
//             });
//             return;
//           }
//         })
//         .superRefine((values, ctx) => {
//           if (project?.propertyType === "Commercial") {
//             const { systemSize } = values;

//             if (systemSize.length === 0) {
//               ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 message: "System Size is required",
//                 path: ["systemSize"],
//               });
//               return;
//             }
//           }
//         }),
//     [hasWetStamp, project?.propertyType]
//   );

//   type FieldValues = z.infer<typeof formSchema>;

//   const getFieldValues = useCallback((job: JobResponseDto): FieldValues => {
//     return {
//       clientUser: {
//         id: job.clientInfo.clientUserId,
//         emailAddressesToReceiveDeliverables:
//           job.clientInfo.deliverablesEmails.map((email) => ({
//             email,
//           })),
//       },
//       additionalInformation:
//         job.additionalInformationFromClient == null
//           ? INITIAL_EDITOR_VALUE
//           : getEditorValue(job.additionalInformationFromClient),
//       mountingType: job.mountingType as z.infer<typeof MountingTypeEnum>,
//       dueDate: job.dueDate == null ? null : new Date(job.dueDate),
//       isExpedited: job.isExpedited,
//       systemSize: job.systemSize == null ? "" : String(job.systemSize),
//       numberOfWetStamp:
//         job.numberOfWetStamp == null ? "" : String(job.numberOfWetStamp),
//       mailingAddress: {
//         city: job.mailingAddressForWetStamp?.city ?? "",
//         coordinates: job.mailingAddressForWetStamp?.coordinates ?? [],
//         country: job.mailingAddressForWetStamp?.country ?? "",
//         fullAddress: job.mailingAddressForWetStamp?.fullAddress ?? "",
//         postalCode: job.mailingAddressForWetStamp?.postalCode ?? "",
//         state: job.mailingAddressForWetStamp?.state ?? "",
//         street1: job.mailingAddressForWetStamp?.street1 ?? "",
//         street2: job.mailingAddressForWetStamp?.street2 ?? "",
//       },
//     };
//   }, []);

//   const form = useForm<FieldValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: getFieldValues(job) as DefaultValues<FieldValues>, // editor value의 deep partial 문제로 typescript가 error를 발생시키나, 실제로는 문제 없음
//   });

//   const watchUserId = form.watch("clientUser.id");
//   const queryClient = useQueryClient();
//   const { data: user } = useUserQuery(watchUserId);
//   const { mutateAsync: patchJobMutateAsync } = usePatchJobMutation(job.id);

//   useEffect(() => {
//     if (job) {
//       form.reset(getFieldValues(job));
//     }
//   }, [form, getFieldValues, job]);

//   useEffect(() => {
//     if (user) {
//       form.setValue(
//         "clientUser.emailAddressesToReceiveDeliverables",
//         user.deliverablesEmails.map((email) => ({
//           email,
//         })),
//         {
//           shouldValidate: true,
//         }
//       );
//     }
//   }, [form, user]);

//   const {
//     fields: emailAddressesToReceiveDeliverablesFields,
//     append: appendEmailAddressToReceiveDeliverables,
//     remove: removeEmailAddressToReceiveDeliverables,
//   } = useFieldArray({
//     control: form.control,
//     name: "clientUser.emailAddressesToReceiveDeliverables",
//   });

//   async function onSubmit(values: FieldValues) {
//     await patchJobMutateAsync({
//       additionalInformationFromClient: isEditorValueEmpty(
//         values.additionalInformation
//       )
//         ? null
//         : JSON.stringify(values.additionalInformation),
//       clientUserId: values.clientUser.id,
//       deliverablesEmails:
//         values.clientUser.emailAddressesToReceiveDeliverables.map(
//           ({ email }) => email
//         ),
//       systemSize:
//         project.propertyType === "Commercial"
//           ? Number(values.systemSize)
//           : null,
//       mountingType: values.mountingType,
//       numberOfWetStamp: hasWetStamp ? Number(values.numberOfWetStamp) : null,
//       mailingAddressForWetStamp: hasWetStamp ? values.mailingAddress : null,
//       isExpedited: values.isExpedited,
//       dueDate: values.dueDate == null ? null : values.dueDate.toISOString(),
//     })
//       .then(() => {
//         queryClient.invalidateQueries({
//           queryKey: getJobQueryKey(job.id),
//         });
//         queryClient.invalidateQueries({
//           queryKey: getProjectQueryKey(project.projectId),
//         });
//       })
//       .catch((error: AxiosError<ErrorResponseData>) => {
//         switch (error.response?.status) {
//           case 400:
//             if (error.response?.data.errorCode.includes("40007")) {
//               form.setError(
//                 "systemSize",
//                 {
//                   message: `System Size should be less than 99999999`,
//                 },
//                 { shouldFocus: true }
//               );
//               return;
//             }

//             if (error.response?.data.errorCode.includes("40004")) {
//               form.setError(
//                 "numberOfWetStamp",
//                 {
//                   message: `Number of Wet Stamp should be less than 256`,
//                 },
//                 { shouldFocus: true }
//               );
//               return;
//             }

//             if (error.response?.data.errorCode.includes("40006")) {
//               toast({
//                 title: "Completed jobs cannot be modified",
//                 variant: "destructive",
//               });
//               return;
//             }

//             if (error.response?.data.errorCode.includes("40002")) {
//               toast({
//                 title: "Job cannot be updated after invoice is issued",
//                 variant: "destructive",
//               });
//               return;
//             }
//         }

//         if (
//           error.response &&
//           error.response.data.errorCode.filter((value) => value != null)
//             .length !== 0
//         ) {
//           toast({
//             title: error.response.data.message,
//             variant: "destructive",
//           });
//           return;
//         }
//       });
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)}>
//         <ItemsContainer>
//           <FormField
//             control={form.control}
//             name="clientUser.id"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel required>Client User</FormLabel>
//                 <FormControl>
//                   <UsersByOrganizationCombobox
//                     organizationId={job.clientInfo.clientOrganizationId}
//                     userId={field.value}
//                     onUserIdChange={field.onChange}
//                     ref={field.ref}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="clientUser.emailAddressesToReceiveDeliverables"
//             render={() => {
//               return (
//                 <FormItem>
//                   <FormLabel required>
//                     Email Addresses to Receive Deliverables
//                   </FormLabel>
//                   {emailAddressesToReceiveDeliverablesFields.map(
//                     (field, index) => (
//                       <FormField
//                         key={field.id}
//                         control={form.control}
//                         name={`clientUser.emailAddressesToReceiveDeliverables.${index}.email`}
//                         render={({ field }) => (
//                           <FormItem>
//                             <div className="flex flex-row gap-2">
//                               <FormControl>
//                                 <Input {...field} />
//                               </FormControl>
//                               {index !== 0 && (
//                                 <Button
//                                   variant={"outline"}
//                                   size={"icon"}
//                                   className="flex-shrink-0"
//                                   onClick={() => {
//                                     removeEmailAddressToReceiveDeliverables(
//                                       index
//                                     );
//                                   }}
//                                 >
//                                   <X className="h-4 w-4" />
//                                 </Button>
//                               )}
//                             </div>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     )
//                   )}
//                   <Button
//                     variant={"outline"}
//                     className="w-full"
//                     onClick={() => {
//                       appendEmailAddressToReceiveDeliverables({
//                         email: "",
//                       });
//                     }}
//                   >
//                     Add Email Address
//                   </Button>
//                 </FormItem>
//               );
//             }}
//           />
//           {project?.propertyType === "Commercial" && (
//             <div className="grid grid-cols-3 gap-2">
//               <FormField
//                 control={form.control}
//                 name="systemSize"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel required>System Size</FormLabel>
//                     <FormControl>
//                       <AffixInput
//                         suffixElement={
//                           <span className="text-muted-foreground">kW</span>
//                         }
//                         {...field}
//                         onChange={(event) => {
//                           const { value } = event.target;
//                           if (value === "" || toTwoDecimalRegExp.test(value)) {
//                             field.onChange(event);
//                           }
//                         }}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//           )}
//           <FormField
//             control={form.control}
//             name="mountingType"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel required>Mounting Type</FormLabel>
//                 <FormControl>
//                   <RadioGroup
//                     ref={field.ref}
//                     value={field.value}
//                     onValueChange={field.onChange}
//                   >
//                     {MountingTypeEnum.options.map((value) => (
//                       <FormItem
//                         key={value}
//                         className="flex-row gap-3 items-center"
//                       >
//                         <FormControl>
//                           <RadioGroupItem value={value} />
//                         </FormControl>
//                         <FormLabel className="font-normal">{value}</FormLabel>
//                       </FormItem>
//                     ))}
//                   </RadioGroup>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           {hasWetStamp && (
//             <>
//               <div className="grid grid-cols-3 gap-2">
//                 <FormField
//                   control={form.control}
//                   name="numberOfWetStamp"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel required>Number of Wet Stamp</FormLabel>
//                       <FormControl>
//                         <Input
//                           {...field}
//                           onChange={(event) => {
//                             const { value } = event.target;
//                             if (value === "" || digitRegExp.test(value)) {
//                               field.onChange(event);
//                             }
//                           }}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <FormField
//                 control={form.control}
//                 name="mailingAddress"
//                 render={({ field }) => (
//                   <div>
//                     <div className="grid grid-cols-3 gap-2">
//                       <div className="flex flex-col gap-2">
//                         <FormItem>
//                           <FormLabel required>Mailing Address</FormLabel>
//                           <AddressSearchButton
//                             ref={field.ref}
//                             format="us"
//                             onSelect={(value) => {
//                               form.setValue(
//                                 "mailingAddress",
//                                 {
//                                   ...value,
//                                   street2: "",
//                                 },
//                                 {
//                                   shouldValidate: true,
//                                   shouldDirty: true,
//                                 }
//                               );
//                             }}
//                           />
//                           <Input
//                             value={field.value.street1}
//                             disabled
//                             placeholder="Street 1"
//                           />
//                           <Input
//                             value={field.value.street2}
//                             onChange={(event) => {
//                               field.onChange({
//                                 ...field.value,
//                                 street2: event.target.value,
//                               });
//                             }}
//                             placeholder="Street 2"
//                           />
//                           <Input
//                             value={field.value.city}
//                             disabled
//                             placeholder="City"
//                           />
//                           <Input
//                             value={field.value.state}
//                             disabled
//                             placeholder="State Or Region"
//                           />
//                           <Input
//                             value={field.value.postalCode}
//                             disabled
//                             placeholder="Postal Code"
//                           />
//                           <Input
//                             value={field.value.country}
//                             disabled
//                             placeholder="Country"
//                           />
//                         </FormItem>
//                       </div>
//                       <div className="col-span-2">
//                         <Minimap
//                           longitude={field.value.coordinates[0]}
//                           latitude={field.value.coordinates[1]}
//                         />
//                       </div>
//                     </div>
//                     <FormMessage className="mt-2" />
//                   </div>
//                 )}
//               />
//             </>
//           )}
//           <FormField
//             control={form.control}
//             name="additionalInformation"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Additional Information</FormLabel>
//                 <FormControl>
//                   <BasicEditor {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="dueDate"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Date Due (EST)</FormLabel>
//                 <FormControl>
//                   <DateTimePicker
//                     value={field.value}
//                     onChange={(...args) => {
//                       const newValue = args[0];
//                       // https://react-hook-form.com/docs/usecontroller/controller
//                       // field.onChange에 undefined를 담을 수 없음
//                       field.onChange(newValue === undefined ? null : newValue);
//                     }}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="isExpedited"
//             render={({ field }) => (
//               <FormItem className="flex-row-reverse justify-end items-center gap-3">
//                 <FormLabel>Expedite</FormLabel>
//                 <FormControl>
//                   <Checkbox
//                     ref={field.ref}
//                     checked={field.value}
//                     onCheckedChange={(newChecked) => {
//                       field.onChange(newChecked);
//                     }}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <LoadingButton
//             type="submit"
//             disabled={!form.formState.isDirty}
//             isLoading={form.formState.isSubmitting}
//           >
//             Edit
//           </LoadingButton>
//         </ItemsContainer>
//       </form>
//     </Form>
//   );
// }

import React from "react";

export default function JobForm() {
  return <div>JobForm</div>;
}
