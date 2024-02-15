"use client";
import { forwardRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { Button } from "../ui/button";
import NewUserByOrganizationSheetForCombobox from "./NewUserByOrganizationSheetForCombobox";
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
import useExcludeInactiveUsersQuery from "@/queries/useExcludeInactiveUsersQuery";

interface Props {
  organizationId: string;
  userId: string;
  onUserIdChange: (newUserId: string) => void;
  disabled?: boolean;
  modal?: boolean;
}

const UsersByOrganizationCombobox = forwardRef<HTMLButtonElement, Props>(
  (
    { organizationId, userId, onUserIdChange, disabled = false, modal = false },
    ref
  ) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    const { data, isPending } = useExcludeInactiveUsersQuery(organizationId);

    const placeholderText = "Select an user";

    if (data == null || isPending) {
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
    const isEmpty = data.length === 0;

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
                  : data.find((item) => item.id === userId)?.fullName ??
                    placeholderText}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
              {isEmpty ? (
                <div className="py-6 flex flex-col gap-2 items-center">
                  <span className="text-sm">No user found.</span>
                  <Button
                    className="h-[28px] text-xs px-2"
                    variant={"outline"}
                    size={"sm"}
                    onClick={() => {
                      setPopoverOpen(false);
                      setSheetOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>New User</span>
                  </Button>
                </div>
              ) : (
                <>
                  <CommandEmpty className="py-6 flex flex-col gap-2 items-center">
                    <span className="text-sm">No user found.</span>
                    <Button
                      className="h-[28px] text-xs px-2"
                      variant={"outline"}
                      size={"sm"}
                      onClick={() => {
                        setPopoverOpen(false);
                        setSheetOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span>New User</span>
                    </Button>
                  </CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {data.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={`${user.fullName} ${user.email}`}
                          onSelect={() => {
                            onUserIdChange(user.id);
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
                  <CommandGroup>
                    <CommandItem
                      value="-1"
                      onSelect={() => {
                        setPopoverOpen(false);
                        setSheetOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span>New User</span>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </Command>
          </PopoverContent>
        </Popover>
        <NewUserByOrganizationSheetForCombobox
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          organizationId={organizationId}
          onUserIdChange={onUserIdChange}
        />
      </>
    );
  }
);
UsersByOrganizationCombobox.displayName = "UsersByOrganizationCombobox";

export default UsersByOrganizationCombobox;
