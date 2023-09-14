"use client";

import { Check, ChevronsUpDown, Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useUsersByOrganizationIdQuery from "@/queries/useClientUsersByOrganizationIdQuery";

interface Props {
  selectedOrganizationId: string;
  userId: string;
  onChange: (newUserId: string) => void;
  onClickNew: () => void;
}

export default function ClientUsersCombobox({
  selectedOrganizationId,
  userId,
  onChange,
  onClickNew,
}: Props) {
  const [open, setOpen] = useState(false);

  const { data: users, isLoading } = useUsersByOrganizationIdQuery(
    selectedOrganizationId
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className="justify-between px-3 font-normal"
        >
          {userId === ""
            ? "Select a client user"
            : users?.find((user) => user.id === userId)?.fullName}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[326px]" align="start">
        <Command>
          <CommandInput placeholder="Search" />
          {isLoading && (
            <div className="h-[68px] flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {!isLoading && users && users.length === 0 ? (
            <div className="h-[68px] flex justify-center items-center text-sm">
              No client user found.
            </div>
          ) : (
            <>
              <CommandEmpty>No client user found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {users?.map((user) => (
                    <CommandItem
                      key={user.email}
                      value={`${user.fullName} ${user.email}`}
                      onSelect={() => {
                        onChange(user.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 flex-shrink-0",
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
            </>
          )}
          <div className="-mx-1 h-px bg-border" />
          <div className="p-1 text-foreground">
            <div
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setOpen(false);
                onClickNew();
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4 flex-shrink-0" />
              New Client User
            </div>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
