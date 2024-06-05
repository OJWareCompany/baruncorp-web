import React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useCommandState } from "cmdk";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EnumValues, ZodEnum } from "zod";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface FilterCommandGroupProps {
  isFiltered: boolean;
  onResetButtonClick: () => void;
}

function FilterButton({
  isFiltered,
  onResetButtonClick,
}: FilterCommandGroupProps) {
  const search = useCommandState((state) => state.search);

  if (!isFiltered || search !== "") {
    return;
  }

  return (
    <>
      <CommandSeparator />
      <CommandGroup>
        <CommandItem
          onSelect={() => {
            onResetButtonClick();
          }}
          className="justify-center"
        >
          Reset
        </CommandItem>
      </CommandGroup>
    </>
  );
}

interface Props<T extends EnumValues> {
  buttonText: string;
  isLoading: boolean | undefined;
  searchParamName: string;
  pageIndexSearchParamName: string;
  zodEnum: ZodEnum<T>;
  defaultValue?: T[number] | null;
}

export default function EnumHeader<T extends EnumValues>({
  buttonText,
  isLoading = false,
  searchParamName,
  pageIndexSearchParamName,
  zodEnum,
  defaultValue,
}: Props<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParam =
    searchParams.get(encodeURIComponent(searchParamName)) ?? "";
  const searchParamParseResult = zodEnum.safeParse(searchParam);
  const data = searchParamParseResult.success
    ? searchParamParseResult.data
    : defaultValue ?? "";

  const isFiltered = data !== "";

  return (
    <Popover>
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger>
            <PopoverTrigger asChild>
              <Button
                size={"sm"}
                variant={"ghost"}
                className={cn(
                  buttonText == "Priority" && "px-1 w-24",
                  "-ml-2 focus-visible:ring-0 whitespace-nowrap text-xs h-8 px-1",
                  isFiltered && "underline decoration-2 underline-offset-4"
                )}
              >
                {buttonText}
                {isLoading ? (
                  <Loader2 className="h-3 w-3 ml-1.5 animate-spin" />
                ) : (
                  <ChevronsUpDown className="h-3 w-3 ml-1.5" />
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Enumeration Search</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="p-0 w-auto" align="start">
          <Command>
            <CommandInput />
            <CommandEmpty>No {buttonText} found.</CommandEmpty>
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
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === data ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {value}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <FilterButton
              isFiltered={isFiltered}
              onResetButtonClick={() => {
                const newSearchParams = new URLSearchParams(
                  searchParams.toString()
                );
                newSearchParams.delete(encodeURIComponent(searchParamName));
                newSearchParams.set(
                  encodeURIComponent(pageIndexSearchParamName),
                  "0"
                );
                router.replace(`${pathname}?${newSearchParams.toString()}`, {
                  scroll: false,
                });
              }}
            />
          </Command>
        </PopoverContent>
      </TooltipProvider>
    </Popover>
  );
}
