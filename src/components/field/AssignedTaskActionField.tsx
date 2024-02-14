// import React, { useState } from "react";
// import { MoreHorizontal } from "lucide-react";
// import { useQueryClient } from "@tanstack/react-query";
// import ReasonForm from "../../app/(root)/workspace/jobs/[jobId]/ReasonForm";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { JobStatusEnum } from "@/lib/constants";
// import { Button } from "@/components/ui/button";
// import usePatchAssignedTaskCompleteMutation from "@/mutations/usePatchAssignedTaskCompleteMutation";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { getJobQueryKey } from "@/queries/useJobQuery";
// import { getProjectQueryKey } from "@/queries/useProjectQuery";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import usePatchAssignedTaskUnassignMutation from "@/mutations/usePatchAssignedTaskUnassignMutation";

// interface Props {
//   assignedTaskId: string;
//   status: JobStatusEnum;
//   jobId: string;
//   projectId: string;
//   page: "WORKSPACE" | "SYSTEM_MANAGEMENT";
//   disabled?: boolean;
// }

// export default function AssignedTaskActionField({
//   assignedTaskId,
//   status,
//   jobId,
//   projectId,
//   page,
//   disabled = false,
// }: Props) {
//   const [alertDialogState, setAlertDialogState] = useState<
//     { open: false } | { open: true; type: "Complete" | "Unassign" }
//   >({ open: false });
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const queryClient = useQueryClient();
//   const { mutateAsync: patchAssignedTaskCompleteMutateAsync } =
//     usePatchAssignedTaskCompleteMutation(assignedTaskId);
//   const { mutateAsync: patchAssignedTaskUnassignMutateAsync } =
//     usePatchAssignedTaskUnassignMutation(assignedTaskId);

//   const isInProgress = status === JobStatusEnum.Values["In Progress"];

//   if (disabled) {
//     return;
//   }

//   if (isInProgress) {
//     return (
//       <div className="text-right">
//         <div
//           className="inline-flex"
//           onClick={(event) => {
//             event.stopPropagation();
//           }}
//         >
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant={"ghost"} size={"icon"} className="h-9 w-9">
//                 <MoreHorizontal className="w-4 h-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem
//                 onClick={() => {
//                   setAlertDialogState({ open: true, type: "Complete" });
//                 }}
//               >
//                 Complete
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               {page === "WORKSPACE" && (
//                 <DropdownMenuItem
//                   onClick={() => {
//                     setDialogOpen(true);
//                   }}
//                   className="text-destructive focus:text-destructive"
//                 >
//                   Reject
//                 </DropdownMenuItem>
//               )}
//               {page === "SYSTEM_MANAGEMENT" && (
//                 <DropdownMenuItem
//                   onClick={() => {
//                     setAlertDialogState({ open: true, type: "Unassign" });
//                   }}
//                   className="text-destructive focus:text-destructive"
//                 >
//                   Unassign
//                 </DropdownMenuItem>
//               )}
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <AlertDialog
//             open={alertDialogState.open}
//             onOpenChange={(newOpen) => {
//               if (!newOpen) {
//                 setAlertDialogState({ open: false });
//                 return;
//               }
//             }}
//           >
//             <AlertDialogContent>
//               <AlertDialogHeader>
//                 <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//               </AlertDialogHeader>
//               <AlertDialogFooter>
//                 <AlertDialogCancel>Cancel</AlertDialogCancel>
//                 <AlertDialogAction
//                   onClick={() => {
//                     if (!alertDialogState.open) {
//                       return;
//                     }

//                     if (alertDialogState.type === "Complete") {
//                       patchAssignedTaskCompleteMutateAsync()
//                         .then(() => {
//                           queryClient.invalidateQueries({
//                             queryKey: getJobQueryKey(jobId),
//                           });
//                           queryClient.invalidateQueries({
//                             queryKey: getProjectQueryKey(projectId),
//                           });
//                         })
//                         .catch(() => {
//                           // TODO: error handling
//                         });
//                       return;
//                     }

//                     if (alertDialogState.type === "Unassign") {
//                       patchAssignedTaskUnassignMutateAsync()
//                         .then(() => {
//                           queryClient.invalidateQueries({
//                             queryKey: getJobQueryKey(jobId),
//                           });
//                           queryClient.invalidateQueries({
//                             queryKey: getProjectQueryKey(projectId),
//                           });
//                         })
//                         .catch(() => {
//                           // TODO: error handling
//                         });
//                       return;
//                     }
//                   }}
//                 >
//                   Continue
//                 </AlertDialogAction>
//               </AlertDialogFooter>
//             </AlertDialogContent>
//           </AlertDialog>
//           <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Reason for rejection</DialogTitle>
//               </DialogHeader>
//               <ReasonForm
//                 assignedTaskId={assignedTaskId}
//                 onSuccess={() => {
//                   setDialogOpen(false);
//                   queryClient.invalidateQueries({
//                     queryKey: getJobQueryKey(jobId),
//                   });
//                   queryClient.invalidateQueries({
//                     queryKey: getProjectQueryKey(projectId),
//                   });
//                 }}
//               />
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>
//     );
//   }
// }

// /**
//  * unassign
//  * - assignee가 있을 때 (매니저가)
//  * reject
//  * - assignee가 있을 때 (본인이)
//  * duration
//  * - 항상
//  * cost
//  * - assignee가 contractor일 때 (매니저가)
//  * complete
//  * - assignee가 있을 때 (매니저, 본인이)
//  */

export {};
