"use client";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange, SelectRangeEventHandler } from "react-day-picker";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  value: DateRange | undefined;
  onChange: SelectRangeEventHandler;
}

const TasksCompletedDatePicker = forwardRef<HTMLButtonElement, Props>(
  ({ value, onChange }, ref) => {
    return (
      <div className="grid gap-2">
        <Popover modal>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-auto justify-start text-left font-normal h-[28px] text-xs px-2",
                !value && "text-muted-foreground"
              )}
              ref={ref}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value?.from ? (
                value.to ? (
                  <>
                    {`${format(value.from, "MM-dd-yyyy")} ~ ${format(
                      value.to,
                      "MM-dd-yyyy"
                    )}`}
                  </>
                ) : (
                  format(value.from, "MM-dd-yyyy")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={onChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);
TasksCompletedDatePicker.displayName = "TasksCompletedDatePicker";

export default TasksCompletedDatePicker;
