"use client";
import { forwardRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import useVendorsToInvoiceQuery from "@/queries/useVendorsToInvoiceQuery";

interface Props {
  vendorId: string;
  onVendorIdChange: (newVendorId: string) => void;
}

const VendorsToInvoiceCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ vendorId, onVendorIdChange }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const { data: vendors, isLoading: isVendorsQueryLoading } =
      useVendorsToInvoiceQuery();

    const placeholderText = "Select an organization";

    if (isVendorsQueryLoading || vendors == null) {
      return (
        <Button
          variant="outline"
          className="px-3 font-normal gap-2"
          ref={ref}
          disabled
        >
          <span className="flex-1 text-start">{placeholderText}</span>
          <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
        </Button>
      );
    }

    const isSelected = vendorId !== "";
    const isEmpty = vendors.vendorsToInvoice.length === 0;

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="px-3 font-normal gap-2"
            ref={ref}
          >
            <span className="flex-1 text-start">
              {!isSelected
                ? placeholderText
                : vendors.vendorsToInvoice.find(
                    (value) => value.organizationId === vendorId
                  )?.organizationName ?? placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {isEmpty ? (
              <div className="py-6 text-center text-sm">
                No organization to issue vendor invoice.
              </div>
            ) : (
              <>
                <CommandEmpty>No organization found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {vendors.vendorsToInvoice.map((value) => (
                      <CommandItem
                        key={value.organizationId}
                        value={value.organizationName}
                        onSelect={() => {
                          onVendorIdChange(value.organizationId);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            vendorId === value.organizationId
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {value.organizationName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
VendorsToInvoiceCombobox.displayName = "VendorsToInvoiceCombobox";

export default VendorsToInvoiceCombobox;
