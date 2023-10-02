"use client";
import { forwardRef } from "react";




import { format } from "date-fns";
import useInvoiceOrganizationsQuery from "@/queries/useInvoiceOrganizationsQuery";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  organizationId: string;
  servicePeriodMonth: string;
  onServicePeriodMonthChange: (servicePeriodMonth: string) => void;
}

const ServicePeriodMonthByOrganizationSelect = forwardRef<
  HTMLButtonElement,
  Props
>(({ organizationId, servicePeriodMonth, onServicePeriodMonthChange }, ref) => {
  /**
   * Query
   */
  const { data: organizations, isLoading: isOrganizationsQueryLoading } =
    useInvoiceOrganizationsQuery();

  const organization = organizations?.clientToInvoices.find(
    (value) => value.id === organizationId
  );

  return (
    <Select
      value={servicePeriodMonth}
      onValueChange={onServicePeriodMonthChange}
    >
      <SelectTrigger
        ref={ref}
        disabled={isOrganizationsQueryLoading || organizationId === ""}
      >
        <SelectValue placeholder="Select a month" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {organization?.date
            .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
            .map((value) => (
              <SelectItem key={value} value={value}>
                {format(new Date(value), "MMMM yyyy")}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
    // <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
    //   <PopoverTrigger asChild>
    //     <Button
    //       variant="outline"
    //       className="px-3 font-normal gap-2"
    //       ref={ref}
    //       disabled={isOrganizationsQueryLoading || organizationId === ""}
    //     >
    //       <span className="flex-1 text-start">
    //         {organizationId === ""
    //           ? "Select an organization"
    //           : organizations?.clientToInvoices.find(
    //               (value) => value.id === organizationId
    //             )?.name}
    //       </span>
    //       {isOrganizationsQueryLoading ? (
    //         <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
    //       ) : (
    //         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    //       )}
    //     </Button>
    //   </PopoverTrigger>
    //   <PopoverContent className="p-0" align="start">
    //     <Command>
    //       <CommandInput placeholder="Search" />
    //       {organization && organization.date.length !== 0 && (
    //         <CommandEmpty>No organization found.</CommandEmpty>
    //       )}
    //       {}
    //     </Command>
    //   </PopoverContent>
    // </Popover>
  );
});
ServicePeriodMonthByOrganizationSelect.displayName =
  "ServicePeriodMonthByOrganizationSelect";

export default ServicePeriodMonthByOrganizationSelect;
// "use client";
// import { forwardRef, useState } from "react";
// import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
// import { Button } from "../ui/button";
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
// import useAllOrganizationsQuery from "@/queries/useAllOrganizationsQuery";
// import { cn } from "@/lib/utils";
// import useInvoiceOrganizationsQuery from "@/queries/useInvoiceOrganizationsQuery";
// import { format } from "date-fns";

// interface Props {
//   organizationId: string;
//   onSelect: (newOrganizationId: string) => void;
// }

// const ServicePeriodMonthByOrganizationCombobox = forwardRef<HTMLButtonElement, Props>(
//   ({ organizationId, onSelect }, ref) => {
//     /**
//      * State
//      */
//     const [popoverOpen, setPopoverOpen] = useState(false);

//     /**
//      * Query
//      */
//     const { data: organizations, isLoading: isOrganizationsQueryLoading } =
//       useInvoiceOrganizationsQuery();

//     const organization = organizations?.clientToInvoices.find(
//       (value) => value.id === organizationId
//     );

//     return (
//       <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
//         <PopoverTrigger asChild>
//           <Button
//             variant="outline"
//             className="px-3 font-normal gap-2"
//             ref={ref}
//             disabled={isOrganizationsQueryLoading || organizationId === ""}
//           >
//             <span className="flex-1 text-start">
//               {organizationId === ""
//                 ? "Select an organization"
//                 : organizations?.clientToInvoices.find(
//                     (value) => value.id === organizationId
//                   )?.name}
//             </span>
//             {isOrganizationsQueryLoading ? (
//               <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
//             ) : (
//               <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//             )}
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="p-0" align="start">
//           <Command>
//             <CommandInput placeholder="Search" />
//             {organization && organization.date.length !== 0 && (
//               <CommandEmpty>No organization found.</CommandEmpty>
//             )}
//             {organization &&
//               (organization.date.length === 0 ? (
//                 <div className="py-6 text-center text-sm">
//                   No organization found.
//                 </div>
//               ) : (
//                 <CommandList>
//                   <CommandGroup>
//                     {organization.date
//                       .sort((a, b) => {
//                         return a < b ? -1 : a > b ? 1 : 0;
//                       })
//                       .map((value) => {
//                         const test = format(new Date(value), "MMMM yyyy");

//                         return (
//                           <CommandItem
//                             key={test}
//                             value={test}
//                             // onSelect={() => {
//                             //   onSelect(organization.id);
//                             //   setPopoverOpen(false);
//                             // } }
//                           >
//                             {/* <Check
//                             className={cn(
//                               "mr-2 h-4 w-4",
//                               organizationId === organization.id
//                                 ? "opacity-100"
//                                 : "opacity-0"
//                             )} /> */}
//                             {test}
//                           </CommandItem>
//                         );
//                       })}
//                   </CommandGroup>
//                 </CommandList>
//               ))}
//           </Command>
//         </PopoverContent>
//       </Popover>
//     );
//   }
// );
// ServicePeriodMonthByOrganizationCombobox.displayName =
//   "ServicePeriodMonthByOrganizationCombobox";

// export default ServicePeriodMonthByOrganizationCombobox;
