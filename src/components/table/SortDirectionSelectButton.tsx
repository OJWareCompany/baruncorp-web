import React, { useState } from "react";
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
}

export default function SortDirectionSelectButton<T extends EnumValues>({
  searchParamName,
  pageIndexSearchParamName,
  zodEnum,
}: Props<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedOption, setSelectedOption] = useState<string>("");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"sm"} variant={"outline"}>
          {selectedOption === "" ? "Select Direction" : selectedOption}
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
                    router.replace(
                      `${pathname}?${newSearchParams.toString()}`,
                      {
                        scroll: false,
                      }
                    );
                    setSelectedOption(value);
                  }}
                >
                  {value}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
