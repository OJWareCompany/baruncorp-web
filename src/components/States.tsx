import { Check, Plus, X } from "lucide-react";
import React, { forwardRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { STATES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Props {
  abbreviations: string[];
  onAbbreviationsChange: (newAbbreviations: string[]) => void;
}

const States = forwardRef<HTMLButtonElement, Props>(
  ({ abbreviations, onAbbreviationsChange }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    return (
      <div className="flex gap-2 flex-wrap">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              size={"icon"}
              className="h-9 w-9"
              ref={ref}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto" align="start">
            <Command>
              <CommandInput placeholder="Search" />
              <CommandEmpty>No state found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {STATES.map((value) => {
                    const isIncluded = abbreviations.includes(
                      value.abbreviation
                    );

                    return (
                      <CommandItem
                        key={value.abbreviation}
                        value={value.stateName}
                        onSelect={() => {
                          if (isIncluded) {
                            onAbbreviationsChange(
                              abbreviations.filter(
                                (abbr) => abbr !== value.abbreviation
                              )
                            );
                            return;
                          }

                          onAbbreviationsChange([
                            ...abbreviations,
                            value.abbreviation,
                          ]);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isIncluded ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {value.stateName}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {abbreviations.map((abbreviation) => (
          <Button
            key={abbreviation}
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              onAbbreviationsChange(
                abbreviations.filter((abbr) => abbr !== abbreviation)
              );
            }}
          >
            {
              STATES.find((value) => value.abbreviation === abbreviation)
                ?.stateName
            }
            <X className="w-4 h-4 ml-2" />
          </Button>
        ))}
      </div>
    );
  }
);
States.displayName = "States";

export default States;
