import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EnumValues, ZodEnum } from "zod";
import { Button } from "../ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
interface Props<T extends EnumValues> {
  searchParamName: string;
  pageIndexSearchParamName: string;
  zodEnum: ZodEnum<T>;
  reset: boolean;
  onResetComplete: () => void;
}

export default function SortFieldSelectButton<T extends EnumValues>({
  searchParamName,
  pageIndexSearchParamName,
  zodEnum,
  reset,
  onResetComplete,
}: Props<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedOption, setSelectedOption] = useState<string>("");

  useEffect(() => {
    if (reset) {
      setSelectedOption("");
      onResetComplete();
    }
  }, [reset, onResetComplete]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"sm"} variant={"outline"}>
          {selectedOption === ""
            ? "Select Field"
            : selectedOption === "dateSentToClient"
            ? "Date Sent To Client"
            : selectedOption === "completedCancelledDate"
            ? "Completed/Cancelled Date"
            : selectedOption === "dueDate"
            ? "Due Date"
            : selectedOption === "createdAt"
            ? "Date Received"
            : selectedOption}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="start">
        <Command onValueChange={setSelectedOption}>
          <CommandList>
            <CommandGroup>
              {zodEnum.options.map((value) => (
                <CommandItem
                  key={value}
                  value={value}
                  onSelect={() => {
                    const newSearchParams = new URLSearchParams(
                      searchParams.toString()
                    );
                    newSearchParams.set(
                      encodeURIComponent(searchParamName),
                      value
                    );
                    newSearchParams.set(
                      encodeURIComponent(pageIndexSearchParamName),
                      "0"
                    );
                    router.push(`${pathname}?${newSearchParams.toString()}`, {
                      scroll: false,
                    });
                    setSelectedOption(value);
                  }}
                >
                  {value === "dateSentToClient"
                    ? "Date Sent To Client"
                    : value === "completedCancelledDate"
                    ? "Completed/Cancelled Date"
                    : value === "dueDate"
                    ? "Due Date"
                    : value === "createdAt"
                    ? "Date Received"
                    : value}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
