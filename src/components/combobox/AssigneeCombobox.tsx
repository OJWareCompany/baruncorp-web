"use client";
import { forwardRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

interface Props {
  assignedTaskId: string;
  userId: string;
  onUserIdChange: (newUserId: string) => void;
  disabled?: boolean;
}

const AssigneeCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ assignedTaskId, userId, onUserIdChange, disabled = false }, ref) => {
    const [open, setOpen] = useState(false);

    // const {
    //   data: availableWorkers,
    //   isLoading: isAvailableWorkersQueryLoading,
    // } = useAvailableWorkersQuery(assignedTaskId);

    const placeholderText = "Select an assignee";

    // if (isAvailableWorkersQueryLoading || availableWorkers == null) {
    //   return (
    //     <Button
    //       variant="outline"
    //       className="w-full px-3 font-normal gap-2 whitespace-nowrap"
    //       ref={ref}
    //       disabled
    //     >
    //       <span className="flex-1 text-start">{placeholderText}</span>
    //       <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
    //     </Button>
    //   );
    // }

    /* -------------------------------------------------------------------------- */

    const availableWorkers: {
      id: string;
      name: string;
      position: string;
    }[] = [
      {
        id: "01680255-89c7-4c51-8e8c-2d8bebd353f2",
        name: "Yunwoo Ji",
        position: "Sr. Designer",
      },
      {
        id: "07ec8e89-6877-4fa1-a029-c58360b57f43",
        name: "John",
        position: "Sr. Designer",
      },
      {
        id: "08f39744-f617-48af-a101-efc7ce5d9b3c",
        name: "Jane",
        position: "Sr. Designer",
      },
      {
        id: "0df1ab9c-e644-42b2-88d7-77bfab7026b5",
        name: "A",
        position: "Jr. Designer",
      },
      {
        id: "161d1db4-14ff-4c1c-977f-861690745901",
        name: "B",
        position: "Jr. Designer",
      },
      {
        id: "1d052e7c-fc76-450c-bca5-110e63eadc8b",
        name: "C",
        position: "Jr. EIT",
      },
      {
        id: "26b4b95d-450d-426b-9f73-1a66adf11a30",
        name: "D",
        position: "Jr. EIT",
      },
    ];

    /* -------------------------------------------------------------------------- */

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
                  <DropdownMenuSubTrigger>{position}</DropdownMenuSubTrigger>
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
