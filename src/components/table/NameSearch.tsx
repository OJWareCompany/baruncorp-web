import React, { useState, KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { XIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Command, CommandInput, CommandItem } from "@/components/ui/command";

interface Props {
  searchParamName: string;
  pageIndexSearchParamName: string;
}

export default function NameSearch({
  searchParamName,
  pageIndexSearchParamName,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParam =
    searchParams.get(encodeURIComponent(searchParamName)) ?? "";
  const [value, setValue] = useState(searchParam);

  const handleEnterKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set(encodeURIComponent(searchParamName), value);
      newSearchParams.set(encodeURIComponent(pageIndexSearchParamName), "0");
      router.push(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Select disabled>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="jobName" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Searchable</SelectLabel>
            <SelectItem value="jobName" disabled>
              JobName
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
        />
        <CommandItem
          onSelect={() => {
            const newSearchParams = new URLSearchParams(
              searchParams.toString()
            );
            newSearchParams.delete(encodeURIComponent(searchParamName));
            newSearchParams.set(
              encodeURIComponent(pageIndexSearchParamName),
              "0"
            );
            router.push(`${pathname}?${newSearchParams.toString()}`, {
              scroll: false,
            });
          }}
          className="w-10 h-10 px-1 py-1 justify-center -ml-16 "
        >
          <XIcon className="w-5 h-5 hover:bg-gray-100 hover:text-gray-700" />
        </CommandItem>
      </Command>
    </div>
  );
}
