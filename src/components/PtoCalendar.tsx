import React from "react";
import {
  CustomComponents,
  DayPicker,
  MonthChangeEventHandler,
} from "react-day-picker";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  getDay,
  isWithinInterval,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { Button } from "./ui/button";

interface Props {
  month: Date;
  onMonthChange: MonthChangeEventHandler;
  isFetching?: boolean;
  DayContent: CustomComponents["DayContent"];
}

export default function PtoCalendar({
  isFetching = false,
  month,
  onMonthChange,
  DayContent,
}: Props) {
  const currentDate = new Date();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="h4">{format(month, "LLLL yyyy")}</h2>
        <div className="flex items-center gap-1">
          {isFetching && (
            <div className="h-9 w-9 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <Button
            onClick={() => {
              onMonthChange(subMonths(month, 1));
            }}
            variant={"outline"}
            size={"icon"}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              onMonthChange(addMonths(month, 1));
            }}
            variant={"outline"}
            size={"icon"}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <DayPicker
        month={month}
        onMonthChange={onMonthChange}
        classNames={{
          months: "w-full overflow-auto",
          month: "space-y-2",
          caption: "hidden",
          table: "w-full border-collapse space-y-1 block",
          head: "block",
          head_row: "flex justify-between mb-1",
          head_cell:
            "flex-1 p-0 text-sm text-muted-foreground font-normal text-left px-2",
          tbody: "block border rounded-md",
          row: "flex w-full justify-between border-b last:border-none",
          cell: "min-w-0 p-0 flex-1 h-[150px] border-r last:border-none",
          day: "h-full w-full",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
        }}
        components={{
          DayContent,
        }}
        disabled={(date) => {
          const day = getDay(date);
          return (
            !isWithinInterval(date, {
              start: startOfMonth(subDays(currentDate, 180)),
              end: endOfMonth(addDays(currentDate, 180)),
            }) ||
            day === 0 ||
            day === 6
          );
        }}
        formatters={{
          formatWeekdayName: (date) => format(date, "E"),
        }}
      />
    </div>
  );
}
