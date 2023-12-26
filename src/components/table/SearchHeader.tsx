import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Props {
  buttonText: string;
  onFilterButtonClick: (inputValue: string) => void;
  onResetButtonClick: () => void;
  isFiltered: boolean;
  initialValue: string;
}

export default function SearchHeader({
  buttonText,
  onFilterButtonClick,
  onResetButtonClick,
  isFiltered,
  initialValue,
}: Props) {
  const [value, setValue] = useState(initialValue);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size={"sm"}
          variant={"ghost"}
          className={cn(
            "-ml-3 focus-visible:ring-0 whitespace-nowrap",
            isFiltered && "underline decoration-2 underline-offset-2"
          )}
        >
          {buttonText}
          <ChevronsUpDown className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="start">
        <Command shouldFilter={false}>
          <CommandInput value={value} onValueChange={setValue} />
          <CommandGroup>
            <CommandItem
              onSelect={() => {
                onFilterButtonClick(value);
              }}
              className="justify-center"
            >
              Search
            </CommandItem>
          </CommandGroup>
          {isFiltered && (
            <CommandGroup className="border-t">
              <CommandItem
                onSelect={() => {
                  onResetButtonClick();
                }}
                className="justify-center"
              >
                Reset
              </CommandItem>
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
