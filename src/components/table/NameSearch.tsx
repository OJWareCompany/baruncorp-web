import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

interface Props {
  buttonText: string;
  isLoading: boolean | undefined;
  searchParamName: string;
  pageIndexSearchParamName: string;
}

export default function NameSearch({
  buttonText,
  isLoading = false,
  searchParamName,
  pageIndexSearchParamName,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParam =
    searchParams.get(encodeURIComponent(searchParamName)) ?? "";
  const [value, setValue] = useState(searchParam);

  const isFiltered = searchParam !== "";

  return (
    <Command shouldFilter={false} className="grid grid-cols-2 pb-2">
      <CommandInput
        value={value}
        onValueChange={setValue}
        className="border col-span-1 text-indent-6 pl-6 -ml-8"
      />
      <CommandGroup className="grid-item col-start-2 w-1/4">
        <CommandItem
          onSelect={() => {
            const newSearchParams = new URLSearchParams(
              searchParams.toString()
            );
            newSearchParams.set(encodeURIComponent(searchParamName), value);
            newSearchParams.set(
              encodeURIComponent(pageIndexSearchParamName),
              "0"
            );
            router.push(`${pathname}?${newSearchParams.toString()}`, {
              scroll: false,
            });
          }}
          className="justify-center border "
        >
          Search
        </CommandItem>
        {isFiltered && (
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
            className="justify-center border"
          >
            Reset
          </CommandItem>
        )}
      </CommandGroup>
    </Command>
  );
}
