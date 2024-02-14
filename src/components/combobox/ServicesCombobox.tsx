"use client";
import { forwardRef, useMemo, useState } from "react";
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
import useServicesQuery from "@/queries/useServicesQuery";
import { cn } from "@/lib/utils";

interface Props {
  serviceId: string;
  onServiceIdChange: (newServiceId: string) => void;
  modal?: boolean;
  filteringIds?: string[];
}

const ServicesCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ serviceId, onServiceIdChange, modal = false, filteringIds }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { data: services, isLoading: isServicesQueryLoading } =
      useServicesQuery({
        limit: Number.MAX_SAFE_INTEGER,
      });

    const placeholderText = "Select a scope";

    const items = useMemo(() => {
      if (services == null) {
        return [];
      }

      if (filteringIds == null) {
        return services.items;
      }

      return services.items.filter((value) => !filteringIds.includes(value.id));
    }, [filteringIds, services]);

    if (isServicesQueryLoading || services == null) {
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
    const isEmpty = items.length === 0;

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
                : services.items.find((value) => value.id === serviceId)
                    ?.name ?? placeholderText}
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
                    {items.map((service) => (
                      <CommandItem
                        key={service.id}
                        value={service.name}
                        onSelect={() => {
                          onServiceIdChange(service.id);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            serviceId === service.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {service.name}
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
ServicesCombobox.displayName = "ServicesCombobox";

export default ServicesCombobox;
