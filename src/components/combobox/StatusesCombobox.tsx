// "use client";
// import { forwardRef, useState } from "react";
// import { Check, ChevronsUpDown } from "lucide-react";
// import { Button, ButtonProps } from "../ui/button";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import { cn } from "@/lib/utils";

// interface Props {
//   statusValue: string;
//   onSelect: (newStatusValue: string) => void;
//   buttonClassName?: ButtonProps["className"];
//   buttonSize?: ButtonProps["size"];
// }

// const StatusesCombobox = forwardRef<HTMLButtonElement, Props>(
//   ({ statusValue, onSelect, buttonClassName, buttonSize }, ref) => {
//     /**
//      * State
//      */
//     const [popoverOpen, setPopoverOpen] = useState(false);

//     const status = statuses.find((status) => status.value === statusValue);

//     return (
//       <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
//         <PopoverTrigger asChild>
//           <Button
//             variant="outline"
//             className={cn("px-3 font-normal gap-2", buttonClassName)}
//             ref={ref}
//             size={buttonSize}
//           >
//             {status ? (
//               <div className="flex items-center flex-1 gap-2">
//                 <status.Icon className={`w-4 h-4 ${status.color}`} />
//                 <span>{status.value}</span>
//               </div>
//             ) : (
//               <span className="flex-1 text-start">Select a status</span>
//             )}
//             <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="p-0" align="start">
//           <Command>
//             <CommandInput placeholder="Search" />
//             <CommandEmpty>No status found.</CommandEmpty>
//             <CommandList>
//               <CommandGroup>
//                 {statuses.map((status) => (
//                   <CommandItem
//                     key={status.value}
//                     value={status.value}
//                     onSelect={() => {
//                       onSelect(status.value);
//                       setPopoverOpen(false);
//                     }}
//                   >
//                     <Check
//                       className={cn(
//                         "mr-2 h-4 w-4 flex-shrink-0",
//                         statusValue === status.value
//                           ? "opacity-100"
//                           : "opacity-0"
//                       )}
//                     />
//                     <div className="flex items-center">
//                       <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
//                       <span>{status.value}</span>
//                     </div>
//                   </CommandItem>
//                 ))}
//               </CommandGroup>
//             </CommandList>
//           </Command>
//         </PopoverContent>
//       </Popover>
//     );
//   }
// );
// StatusesCombobox.displayName = "StatusesCombobox";

// export default StatusesCombobox;

import React from "react";

export default function StatusesCombobox() {
  return <div>StatusesCombobox</div>;
}
