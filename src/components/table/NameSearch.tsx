import React, { useState, KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
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

  const clearInput = () => {
    setValue("");
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete(encodeURIComponent(searchParamName));
    newSearchParams.set(encodeURIComponent(pageIndexSearchParamName), "0");
    router.push(`${pathname}?${newSearchParams.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Command shouldFilter={false} className="grid grid-cols-2 pb-2">
        <CommandInput
          value={value}
          onValueChange={setValue}
          className="border col-span-1 pl-7 -ml-8"
          onKeyDown={handleEnterKeyPress}
          placeholder="Search by Job Name"
        />
        <CommandItem
          onSelect={clearInput}
          className="w-6 h-6 justify-center -ml-16 cursor-pointer p-0 mt-2"
        >
          <X className="w-5 h-5 hover:bg-gray-100 hover:text-gray-700" />
        </CommandItem>
      </Command>
    </div>
  );
}
