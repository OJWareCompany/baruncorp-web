"use client";
import { forwardRef, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
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
import useUtilitiesQuery from "@/queries/useUtilitiesQuery";
import { Button } from "@/components/ui/button";
import { StateName, stateNameAbbreviationMap } from "@/lib/constants";
import { UtilityResponseDto } from "@/api/api-spec";

interface Props {
  state: string;
  utilityId: string;
  onUtilityChange: (newUtility: UtilityResponseDto) => void;
  disabled?: boolean;
  modal?: boolean;
}

const AllUtilitiesCombobox = forwardRef<HTMLButtonElement, Props>(
  (
    { state, utilityId, onUtilityChange, disabled = false, modal = false },
    ref
  ) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { data: utilities, isLoading: isUtilitiesQueryLoading } =
      useUtilitiesQuery({
        params: {
          limit: Number.MAX_SAFE_INTEGER,
        },
      });

    const placeholderText = `Select an utility from existing`;

    const items = useMemo(() => {
      if (utilities == null) {
        return [];
      }

      const abbr = stateNameAbbreviationMap[state.toUpperCase() as StateName];

      return utilities.items.filter(
        (value) => !value.stateAbbreviations.includes(abbr)
      );
    }, [state, utilities]);

    if (isUtilitiesQueryLoading || utilities == null) {
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

    const isSelected = utilityId !== "";
    const isEmpty = items.length === 0;

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
                : items.find((value) => value.id === utilityId)?.name ??
                  placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {isEmpty ? (
              <div className="py-6 text-center text-sm">No utility found.</div>
            ) : (
              <>
                <CommandEmpty>No utility found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {items.map((utility) => (
                      <CommandItem
                        key={utility.id}
                        value={utility.name}
                        onSelect={() => {
                          onUtilityChange(utility);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            utilityId === utility.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {utility.name}
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
AllUtilitiesCombobox.displayName = "AllUtilitiesCombobox";

export default AllUtilitiesCombobox;
