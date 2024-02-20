"use client";
import { forwardRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import useAvailableWorkersQuery from "@/queries/useAvailableWorkersQuery";

interface Props {
  assignedTaskId: string;
  userId: string;
  onUserIdChange: (newUserId: string) => void;
  disabled?: boolean;
}

const AssigneeCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ assignedTaskId, userId, onUserIdChange, disabled = false }, ref) => {
    const [open, setOpen] = useState(false);

    const {
      data: availableWorkers,
      isLoading: isAvailableWorkersQueryLoading,
    } = useAvailableWorkersQuery(assignedTaskId);

    const placeholderText = disabled ? "-" : "Select an assignee";

    if (isAvailableWorkersQueryLoading || availableWorkers == null) {
      return (
        <Button
          variant="outline"
          className="w-full px-3 font-normal gap-2 whitespace-nowrap"
          ref={ref}
          disabled
        >
          <span className="flex-1 text-start">{placeholderText}</span>
          <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
        </Button>
      );
    }

    const isSelected = userId !== "";
    const isEmpty = availableWorkers.length === 0;

    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full px-3 font-normal gap-2 whitespace-nowrap"
            ref={ref}
            disabled={disabled}
          >
            <span className="flex-1 text-start">
              {!isSelected
                ? placeholderText
                : availableWorkers.find((value) => value.id === userId)?.name ??
                  placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuGroup>
            {isEmpty ? (
              <DropdownMenuItem disabled className="w-full justify-center">
                No available worker
              </DropdownMenuItem>
            ) : (
              Array.from(
                new Set(availableWorkers.map((value) => value.position))
              ).map((position) => (
                <DropdownMenuSub key={position}>
                  <DropdownMenuSubTrigger>
                    {position ?? "No Position"}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Search" autoFocus={true} />
                      <CommandEmpty>No available worker found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {availableWorkers
                            .filter((value) => value.position === position)
                            .map((value) => (
                              <CommandItem
                                key={value.id}
                                value={value.name}
                                onSelect={() => {
                                  if (value.id === userId) {
                                    return;
                                  }

                                  onUserIdChange(value.id);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    userId === value.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {value.name}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);
AssigneeCombobox.displayName = "AssigneeCombobox";

export default AssigneeCombobox;
