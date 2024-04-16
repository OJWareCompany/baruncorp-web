"use client";

import React, { useState, KeyboardEvent, MouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
  const [selectedOption, setSelectedOption] = useState<string>("JobName");
  const [value, setValue] = useState("");

  const handleEnterKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const trimmedValue = value.trim();
      let searchParam = "";
      if (selectedOption === "JobName") {
        searchParam = searchParamOptions.jobNameSearchParamName;
      } else if (selectedOption === "ProjectNumber") {
        searchParam = searchParamOptions.projectNumberSearchParamName;
      } else if (selectedOption === "PropertyOwner") {
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
      <Select onValueChange={setSelectedOption}>
        <SelectTrigger className="w-[180px] mb-1 h-11 focus-visible:ring-0">
          <SelectValue placeholder={selectedOption} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="JobName">Job Name</SelectItem>
            <SelectItem value="ProjectNumber">Project Number</SelectItem>
            <SelectItem value="PropertyOwner">Property Owner</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
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
