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
import useDepartmentsQuery from "@/queries/useDepartmentsQuery";
import { cn } from "@/lib/utils";

interface Props {
  departmentId: string;
  onDepartmentIdChange: (id: string) => void;
  modal?: boolean;
  disabled?: boolean;
}

const DepartmentsCombobox = forwardRef<HTMLButtonElement, Props>(
  (
    { departmentId, onDepartmentIdChange, modal = false, disabled = false },
    ref
  ) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { data: departments, isLoading: isDepartmentsQueryLoading } =
      useDepartmentsQuery({
        params: {
          limit: Number.MAX_SAFE_INTEGER,
        },
      });

    const placeholderText = "Select a department";

    if (isDepartmentsQueryLoading || departments == null) {
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

    const isSelected = departmentId !== "";
    const isEmpty = departments.items.length === 0;

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
                : departments.items.find((value) => value.id === departmentId)
                    ?.name ?? placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {isEmpty ? (
              <div className="py-6 text-center text-sm">
                No department found.
              </div>
            ) : (
              <>
                <CommandEmpty>No department found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {departments.items.map((department) => (
                      <CommandItem
                        key={department.id}
                        value={department.name}
                        onSelect={() => {
                          onDepartmentIdChange(department.id);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            departmentId === department.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {department.name}
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
DepartmentsCombobox.displayName = "DepartmentsCombobox";

export default DepartmentsCombobox;
