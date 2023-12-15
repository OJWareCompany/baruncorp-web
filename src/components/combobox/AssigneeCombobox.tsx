"use client";
import { forwardRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button, ButtonProps } from "../ui/button";
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
import useUsersQuery from "@/queries/useUsersQuery";

interface Props {
  userId: string;
  onSelect: (newUserId: string) => void;
  buttonClassName?: ButtonProps["className"];
  buttonSize?: ButtonProps["size"];
  disabled?: boolean;
}

const AssigneeCombobox = forwardRef<HTMLButtonElement, Props>(
  (
    { userId, onSelect, buttonClassName, buttonSize, disabled = false },
    ref
  ) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { data: users, isLoading: isUsersQueryLoading } = useUsersQuery({
      organizationId: "asda",
      limit: Number.MAX_SAFE_INTEGER,
    });

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("px-3 font-normal gap-2", buttonClassName)}
            ref={ref}
            disabled={isUsersQueryLoading || disabled}
            size={buttonSize}
          >
            <span className="flex-1 text-start text-ellipsis overflow-hidden whitespace-nowrap">
              {userId === ""
                ? "Select an assignee"
                : users?.items.find((value) => value.id === userId)?.fullName}
            </span>
            {isUsersQueryLoading ? (
              <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command
            filter={(value, search) => {
              if (value === "-1") {
                return 0;
              }

              if (value.includes(search)) {
                return 1;
              }

              return 0;
            }}
          >
            <CommandInput placeholder="Search" />
            {users && users.items.length !== 0 && (
              <CommandEmpty>No user found.</CommandEmpty>
            )}
            {users &&
              (users.items.length === 0 ? (
                <div className="py-6 text-center text-sm">No user found.</div>
              ) : (
                <CommandList>
                  <CommandGroup>
                    {users.items.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={`${user.fullName} ${user.email}`}
                        onSelect={() => {
                          onSelect(user.id);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            userId === user.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              ))}
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
AssigneeCombobox.displayName = "AssigneeCombobox";

export default AssigneeCombobox;
