import { addDays, addHours, subDays } from "date-fns";
import { ChevronsUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";
import { cn } from "@udecode/cn";
import { zonedTimeToUtc } from "date-fns-tz";
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
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>();
  const [isFiltered, setIsFiltered] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParam =
    searchParams.get(
      encodeURIComponent(
        searchParamOptions.dateSentToClientEndSearchParamName &&
          searchParamOptions.dateSentToClientStartSearchParamName
      )
    ) ?? "";

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const fromDate = urlSearchParams.get(
      searchParamOptions.dateSentToClientStartSearchParamName
    );
    const toDate = urlSearchParams.get(
      searchParamOptions.dateSentToClientEndSearchParamName
    );
    if (fromDate && toDate) {
      setSelectedDates({
        from: new Date(fromDate),
        to: new Date(toDate),
      });
      setIsFiltered(true);
    }
  }, []);

  const handleDateSelect = (dates: DateRange | undefined) => {
    setSelectedDates(dates);
    setIsFiltered(Boolean(dates));
    if (!dates || !dates.to) return;
    const newSearchParams = new URLSearchParams(searchParams.toString());

    const {
      dateSentToClientStartSearchParamName,
      dateSentToClientEndSearchParamName,
    } = searchParamOptions;

    if (dates) {
      const fromDate = dates.from
        ? zonedTimeToUtc(addHours(new Date(dates.from), 4), "UTC").toISOString()
        : "";
      const toDate = dates.to
        ? zonedTimeToUtc(
            new Date(dates.to.setHours(27, 59, 59)),
            "UTC"
          ).toISOString()
        : "";
      newSearchParams.set(
        encodeURIComponent(dateSentToClientStartSearchParamName),
        fromDate
      );
      newSearchParams.set(
        encodeURIComponent(dateSentToClientEndSearchParamName),
        toDate
      );
      newSearchParams.set(encodeURIComponent(pageIndexSearchParamName), "0");

      console.log(
        dates.from
          ? zonedTimeToUtc(
              addHours(new Date(dates.from), 4),
              "UTC"
            ).toISOString()
          : ""
      );
    }
    router.push(`${pathname}?${newSearchParams.toString()}`, {
      scroll: false,
    });
  };

  const handleReset = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    newSearchParams.delete(
      encodeURIComponent(
        searchParamOptions.dateSentToClientStartSearchParamName
      )
    );
    newSearchParams.delete(
      encodeURIComponent(searchParamOptions.dateSentToClientEndSearchParamName)
    );
    newSearchParams.set(encodeURIComponent(pageIndexSearchParamName), "0");

    router.push(`${pathname}?${newSearchParams.toString()}`, {
      scroll: false,
    });
    setSelectedDates(undefined);
    setIsFiltered(false);
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          size={"sm"}
          variant={"ghost"}
          className={cn(
            "-ml-2 focus-visible:ring-0 whitespace-nowrap text-xs h-8 px-2",
            isFiltered && "underline decoration-2 underline-offset-2"
          )}
        >
          {buttonText}
          <ChevronsUpDown className="h-3 w-3 ml-1.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="end">
        <Calendar
          mode="range"
          selected={selectedDates}
          onSelect={handleDateSelect}
          numberOfMonths={2}
          fromMonth={subDays(new Date(), 180)}
          toMonth={addDays(new Date(), 180)}
        />
        {isFiltered && (
          <Button onClick={handleReset} className="justify-center">
            Reset
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
