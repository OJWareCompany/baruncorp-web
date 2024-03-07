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
import usePositionsQuery from "@/queries/usePositionsQuery";
import { cn } from "@/lib/utils";

interface Props {
  positionId: string;
  onPositionChange: (newPosition: { id: string; name: string }) => void;
  modal?: boolean;
  disabled?: boolean;
  filteringIds?: string[];
}

const PositionsCombobox = forwardRef<HTMLButtonElement, Props>(
  (
    {
      positionId,
      onPositionChange,
      filteringIds,
      modal = false,
      disabled = false,
    },
    ref
  ) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { data: positions, isLoading: isPositionsQueryLoading } =
      usePositionsQuery({
        limit: Number.MAX_SAFE_INTEGER,
      });

    const placeholderText = "Select a position";

    const items = useMemo(() => {
      if (positions == null) {
        return [];
      }

      if (filteringIds == null) {
        return positions.items;
      }

      return positions.items.filter(
        (value) => !filteringIds.includes(value.id)
      );
    }, [filteringIds, positions]);

    if (isPositionsQueryLoading || positions == null) {
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

    const isSelected = positionId !== "";
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
                : items.find((value) => value.id === positionId)?.name ??
                  placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {isEmpty ? (
              <div className="py-6 text-center text-sm">No position found.</div>
            ) : (
              <>
                <CommandEmpty>No position found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {items.map((position) => (
                      <CommandItem
                        key={position.id}
                        value={position.name}
                        onSelect={() => {
                          onPositionChange({
                            id: position.id,
                            name: position.name,
                          });
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            positionId === position.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {position.name}
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
PositionsCombobox.displayName = "PositionsCombobox";

export default PositionsCombobox;
