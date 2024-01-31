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
import useCreatableCustomPricingsQuery from "@/queries/useCreatableCustomPricingsQuery";

interface Props {
  organizationId: string;
  serviceId: string;
  onServiceIdChange: (newServiceId: string) => void;
  modal?: boolean;
}

const CreatableCustomPricingCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ organizationId, serviceId, onServiceIdChange, modal = false }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const {
      data: creatableCustomPricings,
      isLoading: isCreatableCustomPricingQueryLoading,
    } = useCreatableCustomPricingsQuery({ organizationId });

    const placeholderText = "Select a scope";

    if (
      isCreatableCustomPricingQueryLoading ||
      creatableCustomPricings == null
    ) {
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

    const isSelected = serviceId !== "";
    const isEmpty = creatableCustomPricings.length === 0;

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={modal}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="px-3 font-normal gap-2"
            ref={ref}
          >
            <span className="flex-1 text-start">
              {!isSelected
                ? placeholderText
                : creatableCustomPricings.find(
                    (value) => value.serviceId === serviceId
                  )?.serviceName ?? placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {isEmpty ? (
              <div className="py-6 text-center text-sm">No scope found.</div>
            ) : (
              <>
                <CommandEmpty>No scope found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {creatableCustomPricings.map((service) => (
                      <CommandItem
                        key={service.serviceId}
                        value={service.serviceName}
                        onSelect={() => {
                          onServiceIdChange(service.serviceId);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            serviceId === service.serviceId
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {service.serviceName}
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
CreatableCustomPricingCombobox.displayName = "CreatableCustomPricingCombobox";

export default CreatableCustomPricingCombobox;
