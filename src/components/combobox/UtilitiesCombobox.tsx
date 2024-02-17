"use client";
import { forwardRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import NewUtilityDialogForCombobox from "./NewUtilityDialogForCombobox";
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
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import useUtilitiesQuery from "@/queries/useUtilitiesQuery";
import { Button } from "@/components/ui/button";
import { StateName, stateNameAbbreviationMap } from "@/lib/constants";

interface Props {
  utilityId: string;
  onUtilityIdChange: (newUtilityId: string) => void;
  state: string;
  disabled?: boolean;
  modal?: boolean;
}

const UtilitiesCombobox = forwardRef<HTMLButtonElement, Props>(
  (
    { utilityId, onUtilityIdChange, state, disabled = false, modal = false },
    ref
  ) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: utilities, isLoading: isUtilitiesQueryLoading } =
      useUtilitiesQuery({
        params: {
          limit: Number.MAX_SAFE_INTEGER,
          stateAbbreviation:
            state !== ""
              ? stateNameAbbreviationMap[state.toUpperCase() as StateName]
              : undefined,
        },
        enabled: state !== "",
      });

    const placeholderText =
      state === "" ? `Select an utility` : `Select an utility in ${state}`;

    if (isUtilitiesQueryLoading || utilities == null) {
      return (
        <Button
          variant="outline"
          className="px-3 font-normal gap-2"
          ref={ref}
          disabled
        >
          <span className="flex-1 text-start">{placeholderText}</span>
          {state !== "" && (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
          )}
        </Button>
      );
    }

    const isSelected = utilityId !== "";
    const isEmpty = utilities.items.length === 0;

    return (
      <>
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
                  : utilities.items.find((value) => value.id === utilityId)
                      ?.name ?? placeholderText}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput placeholder="Search" />
              {isEmpty ? (
                <div className="flex flex-col">
                  <div className="border-b py-6 text-center">
                    <span className="text-sm">No utility found.</span>
                  </div>
                  <div className="p-1 w-full">
                    <Button
                      className="font-normal w-full justify-start px-2 h-8 focus-visible:ring-0"
                      variant={"ghost"}
                      size={"sm"}
                      onClick={() => {
                        setPopoverOpen(false);
                        setDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span>New Utility</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <CommandEmpty className="flex flex-col">
                    <div className="border-b py-6 text-center">
                      <span className="text-sm">No utility found.</span>
                    </div>
                    <div className="p-1 w-full">
                      <Button
                        className="font-normal w-full justify-start px-2 h-8 focus-visible:ring-0"
                        variant={"ghost"}
                        size={"sm"}
                        onClick={() => {
                          setPopoverOpen(false);
                          setDialogOpen(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>New Utility</span>
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {utilities.items.map((utility) => (
                        <CommandItem
                          key={utility.id}
                          value={utility.name}
                          onSelect={() => {
                            onUtilityIdChange(utility.id);
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
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      value="-1"
                      onSelect={() => {
                        setPopoverOpen(false);
                        setDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span>New Utility</span>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </Command>
          </PopoverContent>
        </Popover>
        <NewUtilityDialogForCombobox
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          state={state}
          onUtilityIdChange={onUtilityIdChange}
        />
      </>
    );
  }
);
UtilitiesCombobox.displayName = "UtilitiesCombobox";

export default UtilitiesCombobox;
