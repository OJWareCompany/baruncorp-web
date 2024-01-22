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
import usePtoTypesQuery from "@/queries/usePtoTypesQuery";

interface Props {
  ptoTypeId: string;
  amount: string;
  onAmountChange: (newAmount: string) => void;
  modal?: boolean;
}

const PtoTypeAmountsCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ amount, ptoTypeId, onAmountChange, modal = false }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { data: ptoTypes, isLoading: isPtoTypesQueryLoading } =
      usePtoTypesQuery({
        limit: Number.MAX_SAFE_INTEGER,
      });

    const placeholderText = "Select an amount";

    if (isPtoTypesQueryLoading || ptoTypes == null) {
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

    const target = ptoTypes.items.find((value) => value.id === ptoTypeId);

    if (ptoTypeId === "" || target == null) {
      return (
        <Button
          variant="outline"
          className="px-3 font-normal gap-2"
          ref={ref}
          disabled
        >
          <span className="flex-1 text-start">{placeholderText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      );
    }

    const isSelected = amount !== "";

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={modal}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="px-3 font-normal gap-2"
            ref={ref}
          >
            <span className="flex-1 text-start">
              {!isSelected ? placeholderText : amount}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            <CommandEmpty>No amount found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {target.availableValues.map(({ value }) => {
                  const valueAsString = String(value);

                  return (
                    <CommandItem
                      key={valueAsString}
                      value={valueAsString}
                      onSelect={() => {
                        onAmountChange(valueAsString);
                        setPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          amount === valueAsString ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {valueAsString}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
PtoTypeAmountsCombobox.displayName = "PtoTypeAmountsCombobox";

export default PtoTypeAmountsCombobox;
