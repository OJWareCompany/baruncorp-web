"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import useAddressSearchQuery from "@/queries/useAddressSearchQuery";
import useDebounce from "@/hook/useDebounce";

interface Props {
  onSelect: (data: {
    street1: string;
    city?: string;
    stateOrRegion?: string;
    postalCode?: string;
    country?: string;
    fullAddress: string;
    coordinates: number[];
  }) => void;
  format: "international" | "us";
}

export default function AddressSearchButton({ onSelect, format }: Props) {
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

  function getAddressesElement() {
    if (inputState.value === "") {
      return <div className="py-6 text-center text-sm">No address found.</div>;
    }

    if (inputState.isTyping || isFetching || geocodeFeatures == null) {
      return (
        <div className="h-[68px] flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    if (geocodeFeatures.length === 0) {
      return <div className="py-6 text-center text-sm">No address found.</div>;
    }

    return (
      <div className="overflow-hidden p-1 text-foreground">
        {geocodeFeatures.map((geocodeFeature: GeocodeFeature) => {
          const [street1, ...rest] = geocodeFeature.place_name.split(",");

          return (
            <div
              key={geocodeFeature.id}
              onClick={() => {
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
                  city: place,
                  stateOrRegion: region,
                  postalCode: postcode,
                  country,
                  fullAddress: place_name,
                  coordinates,
                });
                setPopoverOpen(false);
              }}
              className="cursor-pointer rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
            >
              <div>
                <p className="font-medium">{street1}</p>
                <p className="text-xs text-muted-foreground">
                  {rest.join(",")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full">
          Search Address
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 w-[440px]">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            value={inputState.value}
            onChange={(event) => {
              setInputState({
                value: event.target.value,
                isTyping: true,
              });
            }}
          />
        </div>
        {getAddressesElement()}
      </PopoverContent>
    </Popover>
  );
}
