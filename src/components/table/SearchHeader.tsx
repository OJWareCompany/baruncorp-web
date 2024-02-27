import { useState } from "react";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Props {
  buttonText: string;
  isLoading: boolean | undefined;
  searchParamName: string;
  pageIndexSearchParamName: string;
}

export default function SearchHeader({
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
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size={"sm"}
          variant={"ghost"}
          className={cn(
            "-ml-2 focus-visible:ring-0 whitespace-nowrap text-xs h-8 px-2",
            isFiltered && "underline decoration-2 underline-offset-2"
          )}
        >
          {buttonText}
          {isLoading ? (
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
          ) : (
            <ChevronsUpDown className="h-4 w-4 ml-2" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="start">
        <Command shouldFilter={false}>
          <CommandInput value={value} onValueChange={setValue} />
          <CommandGroup>
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
              className="justify-center"
            >
              Search
            </CommandItem>
          </CommandGroup>
          {isFiltered && (
            <CommandGroup className="border-t">
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
                className="justify-center"
              >
                Reset
              </CommandItem>
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
