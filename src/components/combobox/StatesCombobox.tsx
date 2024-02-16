"use client";
import { forwardRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { STATES, STATES_KV_OBJ } from "@/lib/constants";

interface Props {
  abbreviation: string;
  onAbbreviationChange: (newAbbreviation: string) => void;
  modal?: boolean;
  disabled?: boolean;
}

const StatesCombobox = forwardRef<HTMLButtonElement, Props>(
  (
    { abbreviation, onAbbreviationChange, modal = false, disabled = false },
    ref
  ) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const placeholderText = "Select a state";

    const isSelected = abbreviation !== "";

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
                : STATES_KV_OBJ[abbreviation] ?? placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            <CommandEmpty>No state found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {STATES.map((value) => (
                  <CommandItem
                    key={value.abbreviation}
                    value={value.stateName}
                    onSelect={() => {
                      onAbbreviationChange(value.abbreviation);
                      setPopoverOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        abbreviation === value.abbreviation
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {value.stateName}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
StatesCombobox.displayName = "StatesCombobox";

export default StatesCombobox;
