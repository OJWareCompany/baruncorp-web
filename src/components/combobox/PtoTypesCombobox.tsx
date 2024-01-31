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
import usePtoTypesQuery from "@/queries/usePtoTypesQuery";
import { cn } from "@/lib/utils";
import { PtoTypeResponseDto } from "@/api/api-spec";

interface Props {
  ptoTypeId: string;
  onPtoTypeChange: (newPtoType: PtoTypeResponseDto) => void;
  modal?: boolean;
}

const PtoTypesCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ ptoTypeId, onPtoTypeChange, modal = false }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { data: ptoTypes, isLoading: isPtoTypesQueryLoading } =
      usePtoTypesQuery({
        limit: Number.MAX_SAFE_INTEGER,
      });

    const placeholderText = "Select a type";

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

    const isSelected = ptoTypeId !== "";
    const isEmpty = ptoTypes.items.length === 0;

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
                : ptoTypes.items.find((value) => value.id === ptoTypeId)
                    ?.name ?? placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {isEmpty ? (
              <div className="py-6 text-center text-sm">No ptoType found.</div>
            ) : (
              <>
                <CommandEmpty>No ptoType found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {ptoTypes.items.map((ptoType) => (
                      <CommandItem
                        key={ptoType.id}
                        value={ptoType.name}
                        onSelect={() => {
                          onPtoTypeChange(ptoType);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            ptoTypeId === ptoType.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {ptoType.name}
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
PtoTypesCombobox.displayName = "PtoTypesCombobox";

export default PtoTypesCombobox;
