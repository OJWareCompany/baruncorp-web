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
import { cn } from "@/lib/utils";
import useWorkersQuery from "@/queries/useWorkersQuery";

interface Props {
  userId: string;
  onUserIdChange: (newUserId: string) => void;
  modal?: boolean;
  filteringIds?: string[];
  disabled?: boolean;
}

const WorkersCombobox = forwardRef<HTMLButtonElement, Props>(
  (
    { userId, onUserIdChange, filteringIds, disabled = false, modal = false },
    ref
  ) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { data: workers, isLoading: isWorkersQueryLoading } =
      useWorkersQuery();

    const placeholderText = "Select a user";

    const items = useMemo(() => {
      if (workers == null) {
        return [];
      }

      if (filteringIds == null) {
        return workers.items;
      }

      return workers.items.filter(
        (value) => !filteringIds.includes(value.userId)
      );
    }, [filteringIds, workers]);

    if (isWorkersQueryLoading || workers == null) {
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

    const isSelected = userId !== "";
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
                : items.find((value) => value.userId === userId)?.userName ??
                  placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {isEmpty ? (
              <div className="py-6 text-center text-sm">No user found.</div>
            ) : (
              <>
                <CommandEmpty>No user found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {items.map((user) => (
                      <CommandItem
                        key={user.userId}
                        value={user.userName}
                        onSelect={() => {
                          onUserIdChange(user.userId);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            userId === user.userId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {user.userName}
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
WorkersCombobox.displayName = "WorkersCombobox";

export default WorkersCombobox;
