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
import useCouriersQuery from "@/queries/useCouriersQuery";
import { cn } from "@/lib/utils";

interface Props {
  courierId: string;
  onCourierIdChange: (newCourierId: string) => void;
  modal?: boolean;
}

const CouriersCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ courierId, onCourierIdChange, modal = false }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { data: couriers, isLoading: isCouriersQueryLoading } =
      useCouriersQuery({
        limit: Number.MAX_SAFE_INTEGER,
      });

    const placeholderText = "Select a courier";

    if (isCouriersQueryLoading || couriers == null) {
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

    const isSelected = courierId !== "";
    const isEmpty = couriers.items.length === 0;

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
                : couriers.items.find((value) => value.id === courierId)
                    ?.name ?? placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {isEmpty ? (
              <div className="py-6 text-center text-sm">No courier found.</div>
            ) : (
              <>
                <CommandEmpty>No courier found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {couriers.items.map((value) => (
                      <CommandItem
                        key={value.id}
                        value={value.name}
                        onSelect={() => {
                          onCourierIdChange(value.id);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            courierId === value.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {value.name}
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
CouriersCombobox.displayName = "CouriersCombobox";

export default CouriersCombobox;
