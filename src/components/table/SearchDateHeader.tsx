"use client";
import { addDays, getDay, subDays } from "date-fns";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  buttonText: string;
  searchParamOptions: {
    dateSentToClientStartSearchParamName: string;
    dateSentToClientEndSearchParamName: string;
  };
  pageIndexSearchParamName: string;
}

export default function SearchDateHeader({
  buttonText,
  searchParamOptions,
  pageIndexSearchParamName,
}: Props) {
  const [selectedDates, setSelectedDates] = useState<any>([]);
  const router = useRouter();
  const pathname = usePathname();

  const handleDateSelect = (dates: any) => {
    setSelectedDates(dates);
    if (!dates || !dates.to) return;
    const newSearchParams = new URLSearchParams();

    const {
      dateSentToClientStartSearchParamName,
      dateSentToClientEndSearchParamName,
    } = searchParamOptions;

    if (dates) {
      const fromDate = new Date(dates.from).toISOString();
      const toDate = new Date(dates.to).toISOString();
      newSearchParams.set(
        encodeURIComponent(dateSentToClientStartSearchParamName),
        fromDate
      );
      newSearchParams.set(
        encodeURIComponent(dateSentToClientEndSearchParamName),
        toDate
      );
      newSearchParams.set(encodeURIComponent(pageIndexSearchParamName), "0");
    }
    // 새로운 URL로 이동합니다.
    router.push(`${pathname}?${newSearchParams.toString()}`, {
      scroll: false,
    });
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          size={"sm"}
          variant={"ghost"}
          className={
            "-ml-2 focus-visible:ring-0 whitespace-nowrap text-xs h-8 px-2"
          }
        >
          {buttonText}
          <ChevronsUpDown className="h-3 w-3 ml-1.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="start">
        <Calendar
          initialFocus
          mode="range"
          selected={selectedDates}
          onSelect={handleDateSelect}
          numberOfMonths={2}
          disabled={(date) => {
            const day = getDay(date);
            return day === 0 || day === 6;
          }}
          fromMonth={subDays(new Date(), 180)}
          toMonth={addDays(new Date(), 180)}
        />
      </PopoverContent>
    </Popover>
  );
}
