// "use client";
// import { DialogProps } from "@radix-ui/react-dialog";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import { Progress } from "@/components/ui/progress";
// import useJobQuery from "@/queries/useJobQuery";
// import { errorToastDescription } from "@/lib/constants";
// import useUploadJobFilesMutation from "@/mutations/useUploadJobFilesMutation";
// import { toast } from "@/components/ui/use-toast";
// import useUploadJobNoteFilesMutation from "@/mutations/useUploadJobNoteFilesMutation";
// import usePostJobNoteMutation from "@/mutations/usePostJobNoteMutation";
// import { DialogState } from "./JobNoteForm";
// import useTest from "@/mutations/useTest";
// import { AxiosError } from "axios";

// interface Props extends DialogProps {
//   onOpenChange: (open: boolean) => void;
//   state: DialogState;
// }

// export default function JobNoteResultDialog({ state, ...dialogProps }: Props) {
//   // const {
//   //   mutationResult: { mutateAsync },
//   //   // progressState,
//   // } = useUploadJobNoteFilesMutation();
//   const [progressState, setProgressState] = useState({
//     value: 0,
//     error: false,
//   });
//   const { mutateAsync: postJobNoteMutateAsync } = usePostJobNoteMutation({
//     onUploadProgress: (axiosProgressEvent) => {
//       console.log(
//         "🚀 ~ JobNoteResultDialog ~ axiosProgressEvent:",
//         axiosProgressEvent
//       );
//       setProgressState({
//         value: (axiosProgressEvent?.progress ?? 0) * 100,
//         error: false,
//       });
//     },
//   });

//   useEffect(() => {
//     if (!state.open) {
//       return;
//     }

//     postJobNoteMutateAsync(state.requestData)
//       .then((value) => {
//         console.log("id", value);
//       })
//       .catch((error: AxiosError<ErrorResponseData>) => {
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
//     // if (state.requestData.type === "RFI") {
//     // }

//     // mutateAsync({
//     //   files,
//     //   jobNoteId,
//     //   jobNoteNumber,
//     //   jobNotesFolderId,
//     // }).catch(() => {
//     //   toast({
//     //     title: "Upload failed",
//     //     description: errorToastDescription,
//     //     variant: "destructive",
//     //   });
//     // });
//   }, [postJobNoteMutateAsync, state]);

//   return (
//     <Dialog
//       {...dialogProps}
//       onOpenChange={(newOpen) => {
//         // TODO
//         // if (files.length !== 0 && progressState.value !== 100) {
//         //   return;
//         // }

//         dialogProps.onOpenChange(newOpen);
//       }}
//       open={state.open}
//     >
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Todo</DialogTitle>
//           {/* <DialogDescription>
//             You can place more orders or go to the details page for your order
//             details.
//           </DialogDescription> */}
//         </DialogHeader>
//         <div className="flex flex-col gap-1">
//           <Progress value={progressState.value} />
//           <p
//             className={cn(
//               "text-xs text-muted-foreground text-center",
//               progressState.error && "text-destructive"
//             )}
//           >
//             {progressState.value !== 100
//               ? "Please wait for upload..."
//               : progressState.error
//               ? "Upload failed"
//               : "Upload completed"}
//           </p>
//         </div>
//         {/* {files.length !== 0 && (
//         )} */}
//         {/* <DialogFooter>
//           <Button
//             variant={"outline"}
//             onClick={() => {
//               dialogProps.onOpenChange(false);
//             }}
//             disabled={files.length !== 0 && progressState.value !== 100}
//           >
//             Order More
//           </Button>
//           <Button
//             onClick={() => {
//               if (jobId == null) {
//                 return;
//               }

//             }}
//             disabled={files.length !== 0 && progressState.value !== 100}
//           >
//             View Detail
//           </Button>
//         </DialogFooter> */}
//       </DialogContent>
//     </Dialog>
//   );
// }

import React from "react";

export default function JobNoteResultDialog() {
  return <div>JobNoteResultDialog</div>;
}
