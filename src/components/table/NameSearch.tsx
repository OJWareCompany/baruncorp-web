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

export default function NameSearch({
  searchParamOptions,
  pageIndexSearchParamName,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedOption, setSelectedOption] = useState<string>("jobName");
  const [value, setValue] = useState("");

  const handleOptionChange = (selectedValue: string) => {
    setSelectedOption(selectedValue);
    clearInput();
  };

  const handleEnterKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const trimmedValue = value.trim();
      const searchParamName =
        selectedOption === "Job Name"
          ? searchParamOptions.jobNameSearchParamName
          : selectedOption === "Project Number"
          ? searchParamOptions.projectNumberSearchParamName
          : searchParamOptions.propertyOwnerSearchParamName;
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set(encodeURIComponent(searchParamName), trimmedValue);
      newSearchParams.set(encodeURIComponent(pageIndexSearchParamName), "0");
      router.push(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    }
  };

  const clearInput = () => {
    setValue("");
    setSelectedOption("Job Name");
    const searchParamName =
      selectedOption === "Job Name"
        ? searchParamOptions.jobNameSearchParamName
        : selectedOption === "Project Number"
        ? searchParamOptions.projectNumberSearchParamName
        : searchParamOptions.propertyOwnerSearchParamName;

    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete(encodeURIComponent(searchParamName));
    newSearchParams.set(encodeURIComponent(pageIndexSearchParamName), "0");
    console.log("New Search Params:", newSearchParams.toString());
    router.push(`${pathname}?${newSearchParams.toString()}`, {
      scroll: false,
    });
  };

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="flex items-center space-x-2">
      <Select>
        <SelectTrigger className="w-[180px] mb-1 h-11 focus-visible:ring-0">
          <SelectValue placeholder={selectedOption} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              value="jobName"
              onClick={() => handleOptionChange("jobName")}
            >
              Job Name
            </SelectItem>
            <SelectItem
              value="projectNumber"
              onClick={() => handleOptionChange("projectNumber")}
            >
              Project Number
            </SelectItem>
            <SelectItem
              value="propertyOwner"
              onClick={() => handleOptionChange("propertyOwner")}
            >
              Property Owner
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Command shouldFilter={false} className="grid grid-cols-2 pb-2">
        <CommandInput
          value={value}
          onValueChange={setValue}
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
