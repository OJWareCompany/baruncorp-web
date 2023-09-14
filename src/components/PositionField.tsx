// "use client";

// import React, { useState } from "react";
// import { Plus, X } from "lucide-react";
// import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Label } from "@/components/ui/label";
// import usePositionsQuery from "@/queries/usePositionsQuery";
// import usePostMemberPositionMutation from "@/queries/usePostMemberPositionMutation";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import useDeleteMemberPositionMutation from "@/queries/useDeleteMemberPositionMutation";
// import useProfileByUserIdQuery from "@/queries/useProfileByUserIdQuery";

// interface Props {
//   userId: string;
// }

// export default function PositionField({ userId }: Props) {
//   const { data: profile } = useProfileByUserIdQuery(userId);
//   const { data: positions } = usePositionsQuery();
//   const [popoverOpen, setPopoverOpen] = useState(false);
//   const { mutate: postMemberPositionMutate } =
//     usePostMemberPositionMutation(userId);
//   const { mutate: deleteMemberPositionMutate } =
//     useDeleteMemberPositionMutation(userId);

//   return (
//     <div className="space-y-2">
//       <Label>Position</Label>
//       <div className="flex gap-2 flex-wrap">
//         <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
//           <PopoverTrigger asChild>
//             <Button
//               disabled={profile?.position != null}
//               variant={"outline"}
//               className="h-8 w-8 p-0"
//             >
//               <Plus className="h-4 w-4" />
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="p-0" align="start">
//             <Command>
//               <CommandInput placeholder="Search for position" />
//               <CommandEmpty>No position found.</CommandEmpty>
//               <CommandList>
//                 <CommandGroup>
//                   {positions?.map((position) => (
//                     <CommandItem
//                       key={position.id}
//                       value={position.id}
//                       onSelect={() => {
//                         postMemberPositionMutate(position.id);
//                         setPopoverOpen(false);
//                       }}
//                     >
//                       {position.name}
//                     </CommandItem>
//                   ))}
//                 </CommandGroup>
//               </CommandList>
//             </Command>
//           </PopoverContent>
//         </Popover>
//         {profile?.position && (
//           <AlertDialog>
//             <AlertDialogTrigger asChild>
//               <Badge
//                 variant={"secondary"}
//                 className="gap-1 cursor-pointer h-8 rounded-md pr-2"
//               >
//                 {profile.position.name}
//                 <X className="h-4 w-4 text-muted-foreground" />
//               </Badge>
//             </AlertDialogTrigger>
//             <AlertDialogContent className="max-w-xs">
//               <AlertDialogHeader>
//                 <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//               </AlertDialogHeader>
//               <AlertDialogFooter>
//                 <AlertDialogCancel>Cancel</AlertDialogCancel>
//                 <AlertDialogAction
//                   onClick={() => {
//                     deleteMemberPositionMutate(profile?.position?.id ?? null);
//                   }}
//                 >
//                   Continue
//                 </AlertDialogAction>
//               </AlertDialogFooter>
//             </AlertDialogContent>
//           </AlertDialog>
//         )}
//       </div>
//     </div>
//   );
// }

import React from "react";

export default function PositionField() {
  return <div>PositionField</div>;
}
