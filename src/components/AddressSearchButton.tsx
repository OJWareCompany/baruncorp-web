"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import useAddressSearchQuery from "@/queries/useAddressSearchQuery";
import useDebounce from "@/hook/useDebounce";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Props {
  onSelect: (data: {
    street1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    fullAddress: string;
    coordinates: number[];
  }) => void;
  format: "international" | "us";
}

const AddressSearchButton = React.forwardRef<HTMLButtonElement, Props>(
  ({ format, onSelect }, ref) => {
    const [inputState, setInputState] = useState({
      value: "",
      isTyping: false,
    });
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { debouncedValue, isDebouncing } = useDebounce(
      inputState.value,
      popoverOpen
    );
    const { data: geocodeFeatures, isFetching } = useAddressSearchQuery(
      debouncedValue,
      { format }
    );

    useEffect(() => {
      if (isDebouncing) {
        return;
      }

      setInputState((prev) => ({ ...prev, isTyping: false }));
    }, [isDebouncing]);

    useEffect(() => {
      // popover가 닫힐 때 값을 초기화 시켜주면, transition 때문에 flickering 현상이 발생한다.
      // popover를 열 때 값을 초기화 시켜주는 것으로 이 문제를 해결한다.
      if (popoverOpen) {
        setInputState({ value: "", isTyping: false });
      }
    }, [popoverOpen]);

    function getResult() {
      if (inputState.value === "") {
        return (
          <div className="py-6 text-center text-sm">No address found.</div>
        );
      }

      if (inputState.isTyping || isFetching || geocodeFeatures == null) {
        return (
          <div className="h-[68px] flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        );
      }

      if (geocodeFeatures.length === 0) {
        return (
          <div className="py-6 text-center text-sm">No address found.</div>
        );
      }

      return (
        <CommandList>
          <CommandGroup>
            {geocodeFeatures?.map((geocodeFeature: GeocodeFeature) => {
              const [street1, ...rest] = geocodeFeature.place_name.split(",");

              return (
                <CommandItem
                  key={geocodeFeature.id}
                  onSelect={() => {
                    const {
                      text,
                      address,
                      place_name,
                      geometry: { coordinates },
                    } = geocodeFeature;
                    const { country, place, postcode, region } =
                      geocodeFeature.context.reduce<{
                        place?: string;
                        region?: string;
                        postcode?: string;
                        country?: string;
                      }>((prev, cur) => {
                        const placeType = cur.id.split(".")[0]; // place, region, postcode, country
                        return { ...prev, [placeType]: cur.text };
                      }, {});

                    let street1 = text;
                    if (address) {
                      street1 = `${address} ${text}`;
                    }

                    onSelect({
                      street1,
                      city: place ?? "",
                      state: region ?? "",
                      postalCode: postcode ?? "",
                      country: country ?? "",
                      fullAddress: place_name,
                      coordinates,
                    });
                    setPopoverOpen(false);
                  }}
                >
                  <div>
                    <p className="font-medium">{street1}</p>
                    <p className="text-xs text-muted-foreground">
                      {rest.join(",")}
                    </p>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      );
    }

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full" ref={ref}>
            Search Address
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0 w-[445px]">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search"
              value={inputState.value}
              onValueChange={(newValue) => {
                setInputState({
                  value: newValue,
                  isTyping: true,
                });
              }}
            />
            {getResult()}
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
AddressSearchButton.displayName = "AddressSearchButton";

export default AddressSearchButton;
