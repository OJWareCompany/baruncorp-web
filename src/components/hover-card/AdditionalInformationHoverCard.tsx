import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

interface Props {
  value: string;
}

export default function AdditionalInformationHoverCard({ value }: Props) {
  return (
    <HoverCard openDelay={0} closeDelay={100}>
      <HoverCardTrigger className="underline">View Detail</HoverCardTrigger>
      <HoverCardContent className="w-[auto] cursor-default" side="top">
        {value}
      </HoverCardContent>
    </HoverCard>
  );
}
