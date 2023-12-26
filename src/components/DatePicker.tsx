import React, { forwardRef } from "react";
import { CalendarIcon } from "lucide-react";
import { addYears, format, subYears } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
}

const DatePicker = forwardRef<HTMLButtonElement, Props>(
  ({ value, onChange }, ref) => {
    const currentDate = new Date();

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className="pl-3 text-left font-normal"
            ref={ref}
          >
            {value ? format(value, "MM-dd-yyyy") : "Pick a date"}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="top">
          <Calendar
            classNames={{
              caption_label: "hidden",
              caption_dropdowns: "flex w-full",
            }}
            mode="single"
            selected={value}
            onSelect={(day) => {
              onChange(day);
            }}
            captionLayout="dropdown"
            fromYear={subYears(currentDate, 5).getFullYear()}
            toYear={addYears(currentDate, 5).getFullYear()}
            defaultMonth={
              new Date(
                value?.getFullYear() ?? currentDate.getFullYear(),
                value?.getMonth() ?? currentDate.getMonth(),
                1
              )
            }
          />
        </PopoverContent>
      </Popover>
    );
  }
);
DatePicker.displayName = "DatePicker";

export default DatePicker;
