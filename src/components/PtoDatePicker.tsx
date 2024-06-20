"use client";
import { addDays, addHours, format, getDay, subDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange, SelectRangeEventHandler } from "react-day-picker";
import { forwardRef, useState } from "react";
import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
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

const PtoDatePicker = forwardRef<HTMLButtonElement, Props>(
  ({ value, onChange }, ref) => {
    const currentDate = new Date();
    const [isChanged, setIsChanged] = useState(false);
    const timeZone = "America/New_York";

    const zonedValue = value
      ? {
          from: value.from,
          to: value.to
            ? isChanged
              ? addHours(utcToZonedTime(value.to, timeZone), 13)
              : utcToZonedTime(value.to, timeZone)
            : undefined,
        }
      : undefined;

    const handleSelect: SelectRangeEventHandler = (
      range,
      selectedDay,
      e,
      activeModifiers
    ) => {
      console.log("Selected range:", range);
      setIsChanged(true);
      onChange(range, selectedDay, e, activeModifiers);
    };

    return (
      <div className="grid gap-2">
        <Popover modal>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-auto justify-start text-left font-normal",
                !zonedValue && "text-muted-foreground"
              )}
              ref={ref}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value?.from ? (
                value.to ? (
                  <>
                    {isChanged
                      ? `${format(value.from, "MM-dd-yyyy")}~ ${format(
                          value.to,
                          "MM-dd-yyyy"
                        )}`
                      : `${format(
                          value.from,
                          "MM-dd-yyyy"
                        )}~ ${formatInTimeZone(
                          value.to,
                          timeZone,
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
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={zonedValue?.from}
              selected={zonedValue}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={(date) => {
                const day = getDay(date);
                return day === 0 || day === 6;
              }}
              fromMonth={subDays(currentDate, 180)}
              toMonth={addDays(currentDate, 180)}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);
PtoDatePicker.displayName = "PtoDatePicker";

export default PtoDatePicker;
