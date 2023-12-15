"use client";
import { forwardRef, useState } from "react";
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
import useCreatableExpensePricingsQuery from "@/queries/useCreatableExpensePricingsQuery";

interface Props {
  organizationId: string;
  taskId: string;
  onTaskIdChange: (newTaskId: string) => void;
  modal?: boolean;
}

const CreatableExpensePricingCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ organizationId, taskId, onTaskIdChange, modal = false }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const {
      data: creatableExpensePricings,
      isLoading: isCreatableExpensePricingQueryLoading,
    } = useCreatableExpensePricingsQuery({ organizationId });

    const placeholderText = "Select a task";

    if (
      isCreatableExpensePricingQueryLoading ||
      creatableExpensePricings == null
    ) {
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

    const isSelected = taskId !== "";
    const isEmpty = creatableExpensePricings.length === 0;

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={modal}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="px-3 font-normal gap-2"
            ref={ref}
          >
            <span className="flex-1 text-start">
              {!isSelected
                ? placeholderText
                : creatableExpensePricings.find(
                    (value) => value.taskId === taskId
                  )?.taskName ?? placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {isEmpty ? (
              <div className="py-6 text-center text-sm">No task found.</div>
            ) : (
              <>
                <CommandEmpty>No task found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {creatableExpensePricings.map((task) => (
                      <CommandItem
                        key={task.taskId}
                        value={task.taskName}
                        onSelect={() => {
                          onTaskIdChange(task.taskId);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            taskId === task.taskId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {task.taskName}
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
CreatableExpensePricingCombobox.displayName = "CreatableExpensePricingCombobox";

export default CreatableExpensePricingCombobox;
