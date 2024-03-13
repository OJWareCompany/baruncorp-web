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
import { ClientUserRoleEnum } from "@/lib/constants";

interface Props {
  clientUserRole: ClientUserRoleEnum;
  onRoleChange: (newRole: ClientUserRoleEnum) => void;
  modal?: boolean;
  disabled?: boolean;
}

const ClientUserRolesCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ clientUserRole, onRoleChange, modal = false, disabled = false }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={modal}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="px-3 font-normal gap-2"
            ref={ref}
            disabled={disabled}
          >
            <span className="flex-1 text-start">{clientUserRole}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            <CommandEmpty>No position found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {ClientUserRoleEnum.options.map((value) => (
                  <CommandItem
                    key={value}
                    value={value}
                    onSelect={() => {
                      onRoleChange(value);
                      setPopoverOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === clientUserRole ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {value}
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
ClientUserRolesCombobox.displayName = "ClientUserRolesCombobox";

export default ClientUserRolesCombobox;
