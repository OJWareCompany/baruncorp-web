"use client";

import React, { useState, KeyboardEvent, MouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X, ChevronDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Command, CommandInput, CommandItem } from "@/components/ui/command";

interface Props {
  searchParamOptions: {
    jobNameSearchParamName: string;
    projectNumberSearchParamName: string;
    propertyOwnerSearchParamName: string;
  };
  pageIndexSearchParamName: string;
}

export default function GlobalSearch({
  searchParamOptions,
  pageIndexSearchParamName,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedOption, setSelectedOption] = useState<string>("Job Name");
  const [value, setValue] = useState("");

  const handleEnterKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const trimmedValue = value.trim();
      let searchParam = searchParamOptions.jobNameSearchParamName;
      if (selectedOption === "Job Name") {
        searchParam = searchParamOptions.jobNameSearchParamName;
      } else if (selectedOption === "Project Number") {
        searchParam = searchParamOptions.projectNumberSearchParamName;
      } else if (selectedOption === "Property Owner") {
        searchParam = searchParamOptions.propertyOwnerSearchParamName;
      }

      // URL 초기화
      const newSearchParams = new URLSearchParams();
      newSearchParams.set(encodeURIComponent(pageIndexSearchParamName), "0");
      router.push(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });

      // 검색 실행 로직
      if (trimmedValue !== "") {
        const searchParams = new URLSearchParams();
        searchParams.set(encodeURIComponent(searchParam), trimmedValue);
        searchParams.set(encodeURIComponent(pageIndexSearchParamName), "0");
        router.push(`${pathname}?${searchParams.toString()}`, {
          scroll: false,
        });
      }
    }
  };

  const clearInput = () => {
    setValue("");
    const newSearchParams = new URLSearchParams();
    newSearchParams.set(encodeURIComponent(pageIndexSearchParamName), "0");
    router.push(`${pathname}?${newSearchParams.toString()}`, {
      scroll: false,
    });
  };

  const handleInputChange = (newValue: string) => {
    setValue(newValue);
    if (newValue === "") {
      const newSearchParams = new URLSearchParams();
      newSearchParams.set(encodeURIComponent(pageIndexSearchParamName), "0");
      router.push(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    }
  };

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="flex items-start space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="h-12 w-auto min-w-[150px] text-center"
            variant={"outline"}
          >
            {selectedOption}
            <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" className="w-full p-1">
          {["Job Name", "Project Number", "Property Owner"].map((option) => (
            <div
              key={option}
              className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-200 focus:bg-accent focus:text-accent-foreground w-full`}
              onClick={() => setSelectedOption(option)}
            >
              <span className="flex items-center justify-center w-4 h-4 mr-2">
                {selectedOption === option && <Check className="h-4 w-4" />}
              </span>
              {option}
            </div>
          ))}
        </PopoverContent>
      </Popover>
      <Command shouldFilter={false} className="grid grid-cols-2 pb-2">
        <CommandInput
          value={value}
          onValueChange={handleInputChange}
          className="border col-span-1 pl-7 -ml-8"
          onKeyDown={handleEnterKeyPress}
          placeholder={`Search by ${selectedOption}`}
        />
        <CommandItem
          onSelect={clearInput}
          className="w-5 h-5 justify-center -ml-16 cursor-pointer p-0 mt-3"
          onClick={stopPropagation}
        >
          <X className="w-5 h-5 hover:bg-gray-100 hover:text-gray-700" />
        </CommandItem>
      </Command>
    </div>
  );
}
