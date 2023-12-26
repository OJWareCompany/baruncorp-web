import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useCommandState } from "cmdk";
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
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface FilterCommandGroupProps {
  isFiltered: boolean;
  onResetButtonClick: () => void;
}

function FilterButton({
  isFiltered,
  onResetButtonClick,
}: FilterCommandGroupProps) {
  const search = useCommandState((state) => state.search);

  if (!isFiltered || search !== "") {
    return;
  }

  return (
    <>
      <CommandSeparator />
      <CommandGroup>
        <CommandItem
          onSelect={() => {
            onResetButtonClick();
          }}
          className="justify-center"
        >
          Reset
        </CommandItem>
      </CommandGroup>
    </>
  );
}

interface Props {
  buttonText: string;
  onItemButtonClick: (value: string) => void;
  onResetButtonClick: () => void;
  isFiltered: boolean;
  selectedValue: string;
  items: string[];
}

export default function EnumHeader({
  buttonText,
  onItemButtonClick,
  onResetButtonClick,
  isFiltered,
  selectedValue,
  items,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size={"sm"}
          variant={"ghost"}
          className={cn(
            "-ml-3 focus-visible:ring-0 whitespace-nowrap",
            isFiltered && "underline decoration-2 underline-offset-4"
          )}
        >
          {buttonText}
          <ChevronsUpDown className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="start">
        <Command>
          <CommandInput />
          <CommandEmpty>No {buttonText} found.</CommandEmpty>
          <CommandGroup>
            {items.map((value) => (
              <CommandItem
                key={value}
                value={value}
                onSelect={() => {
                  onItemButtonClick(value);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === selectedValue ? "opacity-100" : "opacity-0"
                  )}
                />
                {value}
              </CommandItem>
            ))}
          </CommandGroup>
          <FilterButton
            isFiltered={isFiltered}
            onResetButtonClick={onResetButtonClick}
          />
        </Command>
      </PopoverContent>
    </Popover>
  );
}
