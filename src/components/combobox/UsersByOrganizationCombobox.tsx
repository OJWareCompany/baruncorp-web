"use client";
import { forwardRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
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
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import useAllUsersByOrganizationIdQuery from "@/queries/useAllUsersByOrganizationIdQuery";

interface Props {
  organizationId: string;
  userId: string;
  onSelect: (newUserId: string) => void;
  onAdd: () => void;
  buttonClassName?: string;
}

const UsersByOrganizationCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ organizationId, userId, onSelect, onAdd, buttonClassName }, ref) => {
    /**
     * State
     */
    const [popoverOpen, setPopoverOpen] = useState(false);

    /**
     * Query
     */
    const { data: users, isLoading: isUsersQueryLoading } =
      useAllUsersByOrganizationIdQuery(organizationId);

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("px-3 font-normal gap-2", buttonClassName)}
            ref={ref}
            disabled={isUsersQueryLoading}
          >
            <span className="flex-1 text-start">
              {userId === ""
                ? "Select an user"
                : users?.find((item) => item.id === userId)?.fullName}
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
            {users && users.length !== 0 && (
              <CommandEmpty>No user found.</CommandEmpty>
            )}
            {users &&
              (users.length === 0 ? (
                <>
                  <div className="py-6 text-center text-sm">No user found.</div>
                  <CommandSeparator />
                </>
              ) : (
                <>
                  <CommandList>
                    <CommandGroup>
                      {users.map((user) => (
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
                  <CommandSeparator />
                </>
              ))}
            <CommandGroup>
              <CommandItem
                value="-1"
                onSelect={() => {
                  setPopoverOpen(false);
                  onAdd();
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>New User</span>
              </CommandItem>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
UsersByOrganizationCombobox.displayName = "UsersByOrganizationCombobox";

export default UsersByOrganizationCombobox;
