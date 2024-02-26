"use client";
import React from "react";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAlertDialogDataDispatch } from "./AlertDialogDataProvider";
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
import { Button } from "@/components/ui/button";
import {
  OrderedServiceStatusEnum,
  jobStatuses,
  orderedServiceStatuses,
} from "@/lib/constants";

interface Props {
  status: OrderedServiceStatusEnum;
  orderedServiceId: string;
  jobId: string;
  projectId: string;
  disabled?: boolean;
}

export default function OrderedServiceStatusField({
  status,
  orderedServiceId,
  jobId,
  projectId,
  disabled = false,
}: Props) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const currentStatus = orderedServiceStatuses[status];
  const dispatch = useAlertDialogDataDispatch();
  const { data: session } = useSession();

  const isBarunCorpMember = session?.isBarunCorpMember ?? false;

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="px-3 font-normal -ml-[13px]"
          disabled={disabled}
        >
          <div className="flex gap-2 items-center">
            <currentStatus.Icon className={`w-4 h-4 ${currentStatus.color}`} />
            <span className="whitespace-nowrap">{currentStatus.value}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="start">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandEmpty>No status found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {OrderedServiceStatusEnum.options.map((value) => {
                const status = jobStatuses[value];
                const isSelected = status.value === currentStatus.value;

                return (
                  <CommandItem
                    key={value}
                    value={value}
                    onSelect={() => {
                      if (isSelected) {
                        return;
                      }

                      dispatch({
                        type: "UPDATE_ORDERED_SERVICE_STATUS",
                        jobId,
                        orderedServiceId,
                        projectId,
                        status: value,
                      });
                      setPopoverOpen(false);
                    }}
                    disabled={value === "On Hold"}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex gap-2 items-center">
                      <status.Icon className={`w-4 h-4 ${status.color}`} />
                      <span>{status.value}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
