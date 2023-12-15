import { useState } from "react";
import { ChevronsUpDown, RotateCw } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialValue);

  return (
    <div className="flex">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size={"sm"}
            variant={"ghost"}
            className="-ml-3 focus-visible:ring-0 whitespace-nowrap"
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
                  setOpen(false);
                }}
                className="justify-center"
              >
                Search
              </CommandItem>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {isFiltered && (
        <Button
          size={"icon"}
          variant={"ghost"}
          className="h-9 w-9"
          onClick={() => {
            onResetButtonClick();
          }}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
