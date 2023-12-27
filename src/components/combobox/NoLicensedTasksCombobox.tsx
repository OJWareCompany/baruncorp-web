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
import useTasksQuery from "@/queries/useTasksQuery";
import { cn } from "@/lib/utils";

interface Props {
  taskId: string;
  onTaskIdChange: (newTaskId: string) => void;
  modal?: boolean;
  filteringIds?: string[];
}

const NoLicensedTasksCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ taskId, onTaskIdChange, filteringIds, modal = false }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { data: tasks, isLoading: isTasksQueryLoading } = useTasksQuery({
      limit: Number.MAX_SAFE_INTEGER,
    });

    const placeholderText = "Select a task";

    const items = useMemo(() => {
      if (tasks == null) {
        return [];
      }

      if (filteringIds == null) {
        return tasks.items.filter((value) => value.licenseType === null);
      }

      return tasks.items.filter(
        (value) =>
          value.licenseType === null && !filteringIds.includes(value.id)
      );
    }, [filteringIds, tasks]);

    if (isTasksQueryLoading || tasks == null) {
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
    const isEmpty = tasks.items.length === 0;

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
                : tasks.items.find((value) => value.id === taskId)?.name ??
                  placeholderText}
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
                    {items.map((task) => (
                      <CommandItem
                        key={task.id}
                        value={task.name}
                        onSelect={() => {
                          onTaskIdChange(task.id);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            taskId === task.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {task.name}
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
NoLicensedTasksCombobox.displayName = "NoLicensedTasksCombobox";

export default NoLicensedTasksCombobox;
