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
import usePtoPerTenureQuery from "@/queries/usePtoPerTenureQuery";
import { cn } from "@/lib/utils";

interface Props {
  ptoTenurePolicyId: string;
  onPtoTenurePolicyIdChange: (newPtoTenurePolicyId: string) => void;
  modal?: boolean;
  disabled?: boolean;
}

const TenuresCombobox = forwardRef<HTMLButtonElement, Props>(
  (
    {
      ptoTenurePolicyId,
      onPtoTenurePolicyIdChange,
      modal = false,
      disabled = false,
    },
    ref
  ) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { data: ptoPerTenure, isLoading: isPtoPerTenureQueryLoading } =
      usePtoPerTenureQuery({
        limit: Number.MAX_SAFE_INTEGER,
      });

    const placeholderText = "Select a tenure";

    if (isPtoPerTenureQueryLoading || ptoPerTenure == null) {
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

    const isSelected = ptoTenurePolicyId !== "";
    const isEmpty = ptoPerTenure.items.length === 0;

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={modal}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="px-3 font-normal gap-2"
            ref={ref}
            disabled={disabled}
          >
            <span className="flex-1 text-start">
              {!isSelected
                ? placeholderText
                : ptoPerTenure.items.find(
                    (value) => value.id === ptoTenurePolicyId
                  )?.tenure ?? placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {isEmpty ? (
              <div className="py-6 text-center text-sm">No tenure found.</div>
            ) : (
              <>
                <CommandEmpty>No tenure found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {ptoPerTenure.items
                      .sort((a, b) => a.tenure - b.tenure)
                      .map((value) => (
                        <CommandItem
                          key={value.id}
                          value={String(value.tenure)}
                          onSelect={() => {
                            onPtoTenurePolicyIdChange(value.id);
                            setPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              ptoTenurePolicyId === value.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {value.tenure}
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
TenuresCombobox.displayName = "TenuresCombobox";

export default TenuresCombobox;
