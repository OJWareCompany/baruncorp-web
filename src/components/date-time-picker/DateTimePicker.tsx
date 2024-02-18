"use client";
import React, { forwardRef } from "react";
import { CalendarIcon } from "lucide-react";
import { useDatePickerState } from "react-stately";
import {
  fromDate,
  toCalendarDate,
  getLocalTimeZone,
} from "@internationalized/date";
import { Calendar } from "../ui/calendar";
import TimeField from "./TimeField";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatInEST, getDiffHoursFromLocalToEST } from "@/lib/utils";

interface Props {
  value: Date | null | undefined;
  onChange: (value: Date | null | undefined) => void;
  disabled?: boolean;
}

const DateTimePicker = forwardRef<HTMLButtonElement, Props>(
  ({ value, onChange, disabled }, ref) => {
    const state = useDatePickerState({
      value: value == null ? null : fromDate(value, "America/New_York"),
      onChange: (newValue) => {
        if (newValue == null) {
          onChange(null);
          return;
        }

        onChange(newValue.toDate());
      },
    });

    const diffHours = getDiffHoursFromLocalToEST();
    const currentDate = new Date();

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className="pl-3 text-left font-normal"
            ref={ref}
            disabled={disabled}
          >
            {value ? formatInEST(value) : "Pick a date"}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-3 space-y-3"
          align="start"
          side="top"
        >
          <Calendar
            className="p-0"
            mode="single"
            selected={
              state.value == null
                ? undefined
                : state.value
                    .subtract({ hours: diffHours })
                    .toDate(getLocalTimeZone())
            }
            onSelect={(day) => {
              if (day == null) {
                state.setValue(null);
                return;
              }

              if (state.value == null) {
                state.setValue(
                  fromDate(day, "America/New_York").add({ hours: diffHours })
                );
                return;
              }

              state.setDateValue(
                toCalendarDate(
                  fromDate(day, "America/New_York").add({ hours: diffHours })
                )
              );
            }}
            fromDate={currentDate}
            defaultMonth={
              new Date(
                value?.getFullYear() ?? currentDate.getFullYear(),
                value?.getMonth() ?? currentDate.getMonth(),
                1
              )
            }
          />
          <TimeField
            value={state.timeValue}
            onChange={state.setTimeValue}
            isDisabled={state.value == null}
          />
        </PopoverContent>
      </Popover>
    );
  }
);
DateTimePicker.displayName = "DateTimePicker";

export default DateTimePicker;
